import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/auth.interface';

/**
 * JwtAccessStrategy — Memvalidasi Access Token di setiap request terproteksi.
 *
 * Token diambil dari Authorization header dengan format: "Bearer <token>"
 * Strategy ini dipanggil secara otomatis oleh @UseGuards(JwtAccessGuard).
 *
 * Proses validasi:
 * 1. Passport mengekstrak token dari header.
 * 2. passport-jwt memverifikasi signature & expiry menggunakan secret.
 * 3. Method validate() dipanggil dengan payload yang sudah ter-decode.
 * 4. Return value dari validate() akan di-attach ke req.user.
 */
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      issuer: 'emerald-kingdom',
      audience: 'emerald-kingdom-client',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Verifikasi user masih exist dan aktif di database
    // Ini penting: jika user di-ban/hapus, token lama tetap invalid
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user; // Akan tersedia sebagai req.user
  }
}
