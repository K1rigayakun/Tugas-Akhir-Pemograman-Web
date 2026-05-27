import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() decorator — Menandai endpoint sebagai publik (tidak butuh auth).
 *
 * Penggunaan:
 * @Public()
 * @Post('register')
 * register() { ... }
 *
 * Endpoint Auth (register, verify-email, login) akan menggunakan decorator ini
 * karena endpoint tersebut memang harus bisa diakses tanpa token.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
