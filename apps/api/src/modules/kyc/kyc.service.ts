import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EncryptionService } from "../../common/encryption/encryption.service";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly storage: StorageService,
  ) {}

  async savePersonal(
    userId: string,
    body: {
      fullName: string;
      nationalId: string;
      dateOfBirth: string;
      phoneNumber: string;
    },
  ) {
    const nationalId = body.nationalId?.replace(/\D/g, "");
    if (!body.fullName || !/^\d{16}$/.test(nationalId) || !body.phoneNumber) {
      throw new BadRequestException("Nama, NIK 16 digit, dan nomor telepon wajib valid.");
    }
    const birthDate = new Date(body.dateOfBirth);
    if (Number.isNaN(birthDate.getTime()) || this.age(birthDate) < 18) {
      throw new BadRequestException("KYC hanya tersedia untuk pengguna berusia minimal 18 tahun.");
    }

    const nationalIdHash = this.encryption.hash(nationalId);
    const duplicate = await this.prisma.userKYC.findFirst({
      where: { nationalIdHash, userId: { not: userId } },
      select: { id: true },
    });
    if (duplicate) throw new ConflictException("NIK sudah digunakan oleh akun lain.");

    await this.prisma.userKYC.upsert({
      where: { userId },
      update: {
        fullName: this.encryption.encrypt(body.fullName.trim()),
        nationalId: this.encryption.encrypt(nationalId),
        nationalIdHash,
        dateOfBirth: this.encryption.encrypt(body.dateOfBirth),
        phoneNumber: this.encryption.encrypt(body.phoneNumber.trim()),
        kycStatus: "NONE",
      },
      create: {
        userId,
        fullName: this.encryption.encrypt(body.fullName.trim()),
        nationalId: this.encryption.encrypt(nationalId),
        nationalIdHash,
        dateOfBirth: this.encryption.encrypt(body.dateOfBirth),
        phoneNumber: this.encryption.encrypt(body.phoneNumber.trim()),
      },
    });
    return { success: true, step: 1 };
  }

  async saveAddress(
    userId: string,
    body: { streetAddress: string; city: string; province: string; postalCode: string },
  ) {
    if (!body.streetAddress || !body.city || !body.province || !/^\d{5}$/.test(body.postalCode)) {
      throw new BadRequestException("Alamat lengkap dan kode pos 5 digit wajib diisi.");
    }
    await this.prisma.userKYC.update({
      where: { userId },
      data: {
        streetAddress: this.encryption.encrypt(body.streetAddress.trim()),
        city: body.city.trim(),
        province: body.province.trim(),
        postalCode: body.postalCode,
      },
    }).catch(() => {
      throw new NotFoundException("Selesaikan langkah data pribadi terlebih dahulu.");
    });
    return { success: true, step: 2 };
  }

  async saveDocuments(
    userId: string,
    idDocument?: Express.Multer.File,
    selfie?: Express.Multer.File,
  ) {
    this.validateFile(idDocument);
    this.validateFile(selfie);
    const [idDocumentKey, selfieKey] = await Promise.all([
      this.storage.uploadFile(idDocument!, "kyc/documents"),
      this.storage.uploadFile(selfie!, "kyc/selfies"),
    ]);
    await this.prisma.userKYC.update({
      where: { userId },
      data: { idDocumentKey, selfieKey },
    }).catch(() => {
      throw new NotFoundException("Selesaikan langkah data pribadi terlebih dahulu.");
    });
    return { success: true, step: 3 };
  }

  async submit(
    userId: string,
    body: { agreedToTerms: boolean; agreedToPrivacy: boolean; confirmedAge: boolean },
  ) {
    if (!body.agreedToTerms || !body.agreedToPrivacy || !body.confirmedAge) {
      throw new BadRequestException("Semua persetujuan wajib diberikan.");
    }
    const draft = await this.prisma.userKYC.findUnique({ where: { userId } });
    if (
      !draft?.fullName || !draft.nationalId || !draft.dateOfBirth || !draft.phoneNumber ||
      !draft.streetAddress || !draft.city || !draft.province || !draft.postalCode ||
      !draft.idDocumentKey || !draft.selfieKey
    ) {
      throw new BadRequestException("Semua langkah KYC harus diselesaikan sebelum submit.");
    }

    await this.prisma.$transaction([
      this.prisma.userKYC.update({
        where: { userId },
        data: { kycStatus: "PENDING", submittedAt: new Date(), reviewNotes: null },
      }),
      this.prisma.user.update({ where: { id: userId }, data: { kycStatus: "PENDING" } }),
      this.prisma.notification.create({
        data: {
          userId,
          type: "KYC_STATUS",
          payload: { status: "PENDING", message: "Pengajuan KYC sedang direview." },
        },
      }),
    ]);
    return { success: true, status: "PENDING" };
  }

  async getStatus(userId: string) {
    const kyc = await this.prisma.userKYC.findUnique({ where: { userId } });
    if (!kyc) return { status: "NONE", completedSteps: [] };
    const completedSteps = [
      kyc.fullName && kyc.nationalId && kyc.dateOfBirth && kyc.phoneNumber ? 1 : null,
      kyc.streetAddress && kyc.city && kyc.province && kyc.postalCode ? 2 : null,
      kyc.idDocumentKey && kyc.selfieKey ? 3 : null,
      kyc.kycStatus !== "NONE" ? 4 : null,
    ].filter(Boolean);
    return {
      status: kyc.kycStatus,
      completedSteps,
      reviewNotes: kyc.reviewNotes,
      submittedAt: kyc.submittedAt,
    };
  }

  async resubmit(userId: string) {
    const kyc = await this.prisma.userKYC.findUnique({ where: { userId } });
    if (!kyc || kyc.kycStatus !== "REJECTED") {
      throw new BadRequestException("Hanya KYC yang ditolak yang dapat diajukan ulang.");
    }
    await this.prisma.$transaction([
      this.prisma.userKYC.update({
        where: { userId },
        data: { kycStatus: "NONE", reviewNotes: null, reviewedAt: null, reviewedBy: null },
      }),
      this.prisma.user.update({ where: { id: userId }, data: { kycStatus: "NONE" } }),
    ]);
    return { success: true, status: "NONE" };
  }

  private validateFile(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("Dokumen dan selfie wajib diupload.");
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.mimetype) || file.size > 10 * 1024 * 1024) {
      throw new BadRequestException("File harus JPG, PNG, atau PDF dan maksimal 10MB.");
    }
  }

  private age(birthDate: Date): number {
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const month = now.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && now.getDate() < birthDate.getDate())) age -= 1;
    return age;
  }
}
