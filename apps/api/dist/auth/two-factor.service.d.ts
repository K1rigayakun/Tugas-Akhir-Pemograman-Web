import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/auth/password.service';
export declare class TwoFactorService {
    private readonly prisma;
    private readonly passwordService;
    constructor(prisma: PrismaService, passwordService: PasswordService);
    generateTwoFactorSecret(user: {
        id: string;
        email: string;
    }): Promise<{
        secret: string;
        qrCodeUrl: string;
    }>;
    verifyTwoFactorCode(user: {
        id: string;
    }, code: string): Promise<boolean>;
    enableTwoFactor(user: {
        id: string;
    }, code: string): Promise<boolean>;
}
//# sourceMappingURL=two-factor.service.d.ts.map