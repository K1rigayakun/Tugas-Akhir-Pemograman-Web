import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
/**
 * RolesGuard — Memeriksa apakah user yang login punya role yang diperlukan.
 *
 * Cara kerja:
 * 1. Ambil role yang dibutuhkan dari decorator @Roles()
 * 2. Ambil user dari request (sudah di-set oleh AuthGuard sebelumnya)
 * 3. Cek apakah user punya salah satu role yang dibutuhkan
 * 4. SUPER_ADMIN selalu punya akses ke semua endpoint
 */
export declare class RolesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=roles.guard.d.ts.map