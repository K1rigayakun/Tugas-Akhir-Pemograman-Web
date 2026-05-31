import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
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
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Token tidak ditemukan. Silakan login terlebih dahulu.",
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = this.jwtService.verify(token);

    if (!payload) {
      throw new UnauthorizedException(
        "Token tidak valid atau sudah expired. Silakan login ulang.",
      );
    }

    if (payload.type !== "access") {
      throw new UnauthorizedException(
        "Token type tidak valid. Gunakan access token.",
      );
    }

    // Set user ke request — dipakai oleh RolesGuard dan controller
    request.user = {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      adminRole: payload.adminRole as string | undefined,
    };

    return true;
  }
}
