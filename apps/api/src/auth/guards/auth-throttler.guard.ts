import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

/**
 * AuthThrottlerGuard — Rate limiting khusus untuk endpoint Auth.
 *
 * Konfigurasi (sesuai plan):
 * - Maks 5 percobaan gagal dalam window 5 menit (300 detik)
 * - Jika limit terlampaui, blokir selama 15 menit (900 detik)
 *
 * ThrottlerGuard NestJS menggunakan key berbasis IP secara default.
 * Untuk keamanan extra, kita bisa override generateKey() untuk
 * menggabungkan IP + email jika dibutuhkan di Step 2/4.
 *
 * CATATAN: Konfigurasi limit "5 percobaan dalam 5 menit" diatur di
 * ThrottlerModule di app.module.ts menggunakan named throttler 'auth'.
 * Guard ini hanya perlu meng-apply throttler tersebut.
 */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit.',
    );
  }
}
