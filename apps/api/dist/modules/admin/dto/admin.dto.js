"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationDto = exports.CreateEventDto = exports.CurateMuseumDto = exports.RejectKYCDto = exports.CancelAuctionDto = exports.BanUserDto = exports.SuspendUserDto = exports.WarnUserDto = exports.CreateAuctionDto = void 0;
const class_validator_1 = require("class-validator");
// ============================================================
// Admin DTOs — Validasi input untuk semua admin endpoints
// ============================================================
// Export CreateAuctionDto dari file terpisah
var create_auction_dto_1 = require("./create-auction.dto");
Object.defineProperty(exports, "CreateAuctionDto", { enumerable: true, get: function () { return create_auction_dto_1.CreateAuctionDto; } });
/** POST /admin/users/:id/warn */
class WarnUserDto {
}
exports.WarnUserDto = WarnUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Alasan peringatan wajib diisi." }),
    (0, class_validator_1.MinLength)(10, { message: "Alasan minimal 10 karakter." }),
    (0, class_validator_1.MaxLength)(500, { message: "Alasan maksimal 500 karakter." }),
    __metadata("design:type", String)
], WarnUserDto.prototype, "reason", void 0);
/** POST /admin/users/:id/suspend */
class SuspendUserDto {
}
exports.SuspendUserDto = SuspendUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Alasan suspend wajib diisi." }),
    (0, class_validator_1.MinLength)(10, { message: "Alasan minimal 10 karakter." }),
    __metadata("design:type", String)
], SuspendUserDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: "Durasi minimal 1 hari." }),
    (0, class_validator_1.Max)(365, { message: "Durasi maksimal 365 hari." }),
    __metadata("design:type", Number)
], SuspendUserDto.prototype, "durationDays", void 0);
/** POST /admin/users/:id/ban-auction, /ban-permanent */
class BanUserDto {
}
exports.BanUserDto = BanUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Alasan ban wajib diisi." }),
    (0, class_validator_1.MinLength)(10, { message: "Alasan minimal 10 karakter." }),
    __metadata("design:type", String)
], BanUserDto.prototype, "reason", void 0);
/** POST /admin/auctions/:id/cancel */
class CancelAuctionDto {
}
exports.CancelAuctionDto = CancelAuctionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Alasan pembatalan wajib diisi." }),
    (0, class_validator_1.MinLength)(10, { message: "Alasan minimal 10 karakter." }),
    __metadata("design:type", String)
], CancelAuctionDto.prototype, "reason", void 0);
/** POST /admin/kyc/:id/reject */
class RejectKYCDto {
}
exports.RejectKYCDto = RejectKYCDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Catatan penolakan wajib diisi." }),
    (0, class_validator_1.MinLength)(10, { message: "Catatan minimal 10 karakter." }),
    __metadata("design:type", String)
], RejectKYCDto.prototype, "notes", void 0);
/** POST /admin/museum/items/:auctionId */
class CurateMuseumDto {
}
exports.CurateMuseumDto = CurateMuseumDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Teks editorial wajib diisi." }),
    (0, class_validator_1.MinLength)(20, { message: "Editorial minimal 20 karakter." }),
    (0, class_validator_1.MaxLength)(2000, { message: "Editorial maksimal 2000 karakter." }),
    __metadata("design:type", String)
], CurateMuseumDto.prototype, "editorial", void 0);
/** POST /admin/events */
class CreateEventDto {
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "theme", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "backgroundMode", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateEventDto.prototype, "accentColors", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateEventDto.prototype, "expMultiplier", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "endTime", void 0);
// ============================================================
// Pagination DTO
// ============================================================
class PaginationDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PaginationDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PaginationDto.prototype, "limit", void 0);
//# sourceMappingURL=admin.dto.js.map