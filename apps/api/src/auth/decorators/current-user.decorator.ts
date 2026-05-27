import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser() decorator — Mengekstrak user dari request object.
 *
 * Disiapkan oleh JwtAccessStrategy.validate() dan di-attach ke req.user.
 *
 * Penggunaan:
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserFromToken) {
 *   return user;
 * }
 *
 * Atau ambil field spesifik:
 * @Get('profile')
 * getProfile(@CurrentUser('id') userId: string) {
 *   return userId;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
