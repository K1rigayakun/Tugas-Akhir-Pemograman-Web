import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JwtAccessGuard — Guard utama untuk melindungi endpoint terproteksi.
 *
 * Cara penggunaan:
 * - Global (di app.module) → semua route terproteksi secara default
 * - Gunakan @Public() decorator di endpoint yang tidak butuh auth
 *
 * Guard ini menggunakan 'jwt-access' strategy yang sudah kita definisikan.
 */
@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Cek apakah endpoint memiliki @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip auth untuk public endpoint
    }

    return super.canActivate(context);
  }
}

/**
 * JwtRefreshGuard — Khusus untuk endpoint /auth/refresh.
 * Menggunakan 'jwt-refresh' strategy.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
