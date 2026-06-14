import { SetMetadata } from "@nestjs/common";

/**
 * Daftar role admin yang tersedia.
 * Dipakai dengan decorator @Roles() untuk membatasi akses endpoint.
 */
export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  AUCTION_MANAGER = "AUCTION_MANAGER",
  KYC_OFFICER = "KYC_OFFICER",
  CONTENT_MANAGER = "CONTENT_MANAGER",
  SUPPORT_OFFICER = "SUPPORT_OFFICER",
}

export const ROLES_KEY = "roles";

/**
 * Decorator untuk membatasi akses endpoint berdasarkan role admin.
 *
 * @example
 * @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
 * @Get('auctions')
 * getAuctions() { ... }
 */
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
