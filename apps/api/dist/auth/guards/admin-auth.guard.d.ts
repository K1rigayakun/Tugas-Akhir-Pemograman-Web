import { CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "../../common/auth/jwt.service";
/**
 * AdminAuthGuard — Verifies JWT token and checks user has valid admin role.
 *
 * How it works:
 * 1. Extract token from Authorization header: `Authorization: Bearer <token>`
 * 2. Verify JWT signature and expiry
 * 3. Check user has valid adminRole field (SUPER_ADMIN, AUCTION_MANAGER, KYC_OFFICER, CONTENT_MANAGER, SUPPORT_OFFICER)
 * 4. Throw UnauthorizedException if token invalid or user lacks admin role
 * 5. Set validated user object to req.user for use in controllers
 *
 * Usage:
 * @UseGuards(AdminAuthGuard)
 * @Controller('admin')
 * export class AdminController { ... }
 */
export declare class AdminAuthGuard implements CanActivate {
    private jwtService;
    constructor(jwtService: JwtService);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=admin-auth.guard.d.ts.map