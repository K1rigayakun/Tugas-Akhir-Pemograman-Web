import { JwtService } from "../../common/auth/jwt.service";
import { PasswordService } from "../../common/auth/password.service";
export declare class AdminAuthController {
    private jwtService;
    private passwordService;
    constructor(jwtService: JwtService, passwordService: PasswordService);
    login(body: any): Promise<{
        success: boolean;
        accessToken: string;
        user: {
            id: string;
            email: string;
            username: string;
            adminRole: import(".prisma/client").$Enums.AdminRole;
        };
    }>;
}
//# sourceMappingURL=admin.auth.controller.d.ts.map