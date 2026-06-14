import { CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "./jwt.service";
/**
 * AuthGuard — Memverifikasi JWT token dari header Authorization.
 *
 * Cara kerja:
 * 1. Ambil token dari header: `Authorization: Bearer <token>`
 * 2. Verifikasi signature dan expiry
 * 3. Decode payload dan set ke `req.user`
 * 4. Endpoint yang pakai @UseGuards(AuthGuard) akan terlindungi
 *
 * req.user berisi: { id, email, role, adminRole }
 */
export declare class AuthGuard implements CanActivate {
    private jwtService;
    constructor(jwtService: JwtService);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=auth.guard.d.ts.map