"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const encryption_service_1 = require("../../common/encryption/encryption.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
let KycService = class KycService {
    constructor(prisma, encryption, storage) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.storage = storage;
    }
    async savePersonal(userId, body) {
        const nationalId = body.nationalId?.replace(/\D/g, "");
        if (!body.fullName || !/^\d{16}$/.test(nationalId) || !body.phoneNumber) {
            throw new common_1.BadRequestException("Nama, NIK 16 digit, dan nomor telepon wajib valid.");
        }
        const birthDate = new Date(body.dateOfBirth);
        if (Number.isNaN(birthDate.getTime()) || this.age(birthDate) < 18) {
            throw new common_1.BadRequestException("KYC hanya tersedia untuk pengguna berusia minimal 18 tahun.");
        }
        const nationalIdHash = this.encryption.hash(nationalId);
        const duplicate = await this.prisma.userKYC.findFirst({
            where: { nationalIdHash, userId: { not: userId } },
            select: { id: true },
        });
        if (duplicate)
            throw new common_1.ConflictException("NIK sudah digunakan oleh akun lain.");
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
    async saveAddress(userId, body) {
        if (!body.streetAddress || !body.city || !body.province || !/^\d{5}$/.test(body.postalCode)) {
            throw new common_1.BadRequestException("Alamat lengkap dan kode pos 5 digit wajib diisi.");
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
            throw new common_1.NotFoundException("Selesaikan langkah data pribadi terlebih dahulu.");
        });
        return { success: true, step: 2 };
    }
    async saveDocuments(userId, idDocument, selfie) {
        this.validateFile(idDocument);
        this.validateFile(selfie);
        const [idDocumentKey, selfieKey] = await Promise.all([
            this.storage.uploadFile(idDocument, "kyc/documents"),
            this.storage.uploadFile(selfie, "kyc/selfies"),
        ]);
        await this.prisma.userKYC.update({
            where: { userId },
            data: { idDocumentKey, selfieKey },
        }).catch(() => {
            throw new common_1.NotFoundException("Selesaikan langkah data pribadi terlebih dahulu.");
        });
        return { success: true, step: 3 };
    }
    async submit(userId, body) {
        if (!body.agreedToTerms || !body.agreedToPrivacy || !body.confirmedAge) {
            throw new common_1.BadRequestException("Semua persetujuan wajib diberikan.");
        }
        const draft = await this.prisma.userKYC.findUnique({ where: { userId } });
        if (!draft?.fullName || !draft.nationalId || !draft.dateOfBirth || !draft.phoneNumber ||
            !draft.streetAddress || !draft.city || !draft.province || !draft.postalCode ||
            !draft.idDocumentKey || !draft.selfieKey) {
            throw new common_1.BadRequestException("Semua langkah KYC harus diselesaikan sebelum submit.");
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
    async getStatus(userId) {
        const kyc = await this.prisma.userKYC.findUnique({ where: { userId } });
        if (!kyc)
            return { status: "NONE", completedSteps: [] };
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
    async resubmit(userId) {
        const kyc = await this.prisma.userKYC.findUnique({ where: { userId } });
        if (!kyc || kyc.kycStatus !== "REJECTED") {
            throw new common_1.BadRequestException("Hanya KYC yang ditolak yang dapat diajukan ulang.");
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
    validateFile(file) {
        if (!file)
            throw new common_1.BadRequestException("Dokumen dan selfie wajib diupload.");
        const allowed = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowed.includes(file.mimetype) || file.size > 10 * 1024 * 1024) {
            throw new common_1.BadRequestException("File harus JPG, PNG, atau PDF dan maksimal 10MB.");
        }
    }
    age(birthDate) {
        const now = new Date();
        let age = now.getFullYear() - birthDate.getFullYear();
        const month = now.getMonth() - birthDate.getMonth();
        if (month < 0 || (month === 0 && now.getDate() < birthDate.getDate()))
            age -= 1;
        return age;
    }
};
exports.KycService = KycService;
exports.KycService = KycService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        storage_service_1.StorageService])
], KycService);
//# sourceMappingURL=kyc.service.js.map