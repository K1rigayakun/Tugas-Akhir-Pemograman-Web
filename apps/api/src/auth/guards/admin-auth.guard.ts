import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
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
@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Check Authorization header exists and has Bearer format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Token tidak ditemukan. Silakan login sebagai admin.",
      );
    }

    // Extract token from header
    const token = authHeader.split(" ")[1];
    
    // Verify JWT token
    const payload = this.jwtService.verify(token);

    if (!payload) {
      throw new UnauthorizedException(
        "Token tidak valid atau sudah expired. Silakan login ulang.",
      );
    }

    // Check token type is access token
    if (payload.type !== "access") {
      throw new UnauthorizedException(
        "Token type tidak valid. Gunakan access token.",
      );
    }

    // Check user has admin role
    const validAdminRoles = [
      "SUPER_ADMIN",
      "AUCTION_MANAGER",
      "KYC_OFFICER",
      "CONTENT_MANAGER",
      "SUPPORT_OFFICER",
    ];

    if (!payload.adminRole || !validAdminRoles.includes(payload.adminRole as string)) {
      throw new UnauthorizedException(
        "Akses ditolak. Hanya admin yang dapat mengakses resource ini.",
      );
    }

    // Set user to request for use in controllers
    request.user = {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      adminRole: payload.adminRole as string,
    };

    return true;
  }
}
