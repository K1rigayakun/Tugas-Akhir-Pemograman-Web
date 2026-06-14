"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.ROLES_KEY = exports.AdminRole = void 0;
const common_1 = require("@nestjs/common");
/**
 * Daftar role admin yang tersedia.
 * Dipakai dengan decorator @Roles() untuk membatasi akses endpoint.
 */
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["AUCTION_MANAGER"] = "AUCTION_MANAGER";
    AdminRole["KYC_OFFICER"] = "KYC_OFFICER";
    AdminRole["CONTENT_MANAGER"] = "CONTENT_MANAGER";
    AdminRole["SUPPORT_OFFICER"] = "SUPPORT_OFFICER";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
exports.ROLES_KEY = "roles";
/**
 * Decorator untuk membatasi akses endpoint berdasarkan role admin.
 *
 * @example
 * @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
 * @Get('auctions')
 * getAuctions() { ... }
 */
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
//# sourceMappingURL=roles.decorator.js.map