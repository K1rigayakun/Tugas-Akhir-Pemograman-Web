import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY, AdminRole } from "../decorators/roles.decorator";

/**
 * RolesGuard — Memeriksa apakah user yang login punya role yang diperlukan.
 *
 * Cara kerja:
 * 1. Ambil role yang dibutuhkan dari decorator @Roles()
 * 2. Ambil user dari request (sudah di-set oleh AuthGuard sebelumnya)
 * 3. Cek apakah user punya salah satu role yang dibutuhkan
 * 4. SUPER_ADMIN selalu punya akses ke semua endpoint
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Kalau tidak ada @Roles() decorator, endpoint terbuka
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Akses ditolak — silakan login terlebih dahulu.");
    }

    // SUPER_ADMIN selalu punya akses penuh
    if (user.adminRole === AdminRole.SUPER_ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.adminRole === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Akses ditolak — role ${user.adminRole || "tidak ada"} tidak memiliki izin untuk aksi ini.`,
      );
    }

    return true;
  }
}
