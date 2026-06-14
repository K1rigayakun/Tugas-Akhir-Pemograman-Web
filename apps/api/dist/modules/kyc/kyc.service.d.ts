import { EncryptionService } from "../../common/encryption/encryption.service";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
export declare class KycService {
    private readonly prisma;
    private readonly encryption;
    private readonly storage;
    constructor(prisma: PrismaService, encryption: EncryptionService, storage: StorageService);
    savePersonal(userId: string, body: {
        fullName: string;
        nationalId: string;
        dateOfBirth: string;
        phoneNumber: string;
    }): Promise<{
        success: boolean;
        step: number;
    }>;
    saveAddress(userId: string, body: {
        streetAddress: string;
        city: string;
        province: string;
        postalCode: string;
    }): Promise<{
        success: boolean;
        step: number;
    }>;
    saveDocuments(userId: string, idDocument?: Express.Multer.File, selfie?: Express.Multer.File): Promise<{
        success: boolean;
        step: number;
    }>;
    submit(userId: string, body: {
        agreedToTerms: boolean;
        agreedToPrivacy: boolean;
        confirmedAge: boolean;
    }): Promise<{
        success: boolean;
        status: string;
    }>;
    getStatus(userId: string): Promise<{
        status: string;
        completedSteps: never[];
        reviewNotes?: undefined;
        submittedAt?: undefined;
    } | {
        status: import(".prisma/client").$Enums.KYCStatus;
        completedSteps: (number | null)[];
        reviewNotes: string | null;
        submittedAt: Date;
    }>;
    resubmit(userId: string): Promise<{
        success: boolean;
        status: string;
    }>;
    private validateFile;
    private age;
}
//# sourceMappingURL=kyc.service.d.ts.map