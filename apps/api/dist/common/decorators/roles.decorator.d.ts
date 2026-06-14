/**
 * Daftar role admin yang tersedia.
 * Dipakai dengan decorator @Roles() untuk membatasi akses endpoint.
 */
export declare enum AdminRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    AUCTION_MANAGER = "AUCTION_MANAGER",
    KYC_OFFICER = "KYC_OFFICER",
    CONTENT_MANAGER = "CONTENT_MANAGER",
    SUPPORT_OFFICER = "SUPPORT_OFFICER"
}
export declare const ROLES_KEY = "roles";
/**
 * Decorator untuk membatasi akses endpoint berdasarkan role admin.
 *
 * @example
 * @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
 * @Get('auctions')
 * getAuctions() { ... }
 */
export declare const Roles: (...roles: AdminRole[]) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=roles.decorator.d.ts.map