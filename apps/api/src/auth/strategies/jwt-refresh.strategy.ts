import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth.service';

/**
 * JwtRefreshStrategy — Memvalidasi Refresh Token di endpoint /auth/refresh.
 *
 * Refresh Token diterima dari Authorization header (Bearer) atau body request.
 * Berbeda dengan Access Strategy, di sini kita perlu:
 * 1. Verifikasi JWT signature dengan JWT_REFRESH_SECRET
 * 2. Cek apakah sesi (session) masih valid di database
 * 3. Verifikasi hash refresh token di database (mencegah token reuse setelah logout)
 *
 * Teknik ini disebut "Refresh Token Rotation" — setiap kali refresh,
 * token lama di-invalidasi dan token baru di-generate.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true, // Kita butuh req untuk mengambil raw token
    });
  }

  async validate(
    req: Request,
    payload: { sub: string; type: string; sessionId: string },
  ) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Ambil raw refresh token dari Authorization header
    const refreshToken = req
      .get('Authorization')
      ?.replace('Bearer', '')
      .trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Cari sesi aktif di database berdasarkan sessionId dari payload
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          select: { id: true, email: true, role: true, isActive: true },
        },
      },
    });

    if (!session || !session.isActive || !session.user.isActive) {
      throw new UnauthorizedException('Session not found or expired');
    }

    // Verifikasi apakah refresh token cocok dengan hash yang tersimpan
    const isTokenValid = await this.authService.verifyRefreshTokenHash(
      session.refreshTokenHash,
      refreshToken,
    );

    if (!isTokenValid) {
      // Kemungkinan token reuse attack — invalidasi SEMUA sesi user ini
      await this.prisma.session.updateMany({
        where: { userId: session.userId },
        data: { isActive: false },
      });
      throw new UnauthorizedException(
        'Token reuse detected. All sessions terminated.',
      );
    }

    return { ...session.user, sessionId: session.id };
  }
}
