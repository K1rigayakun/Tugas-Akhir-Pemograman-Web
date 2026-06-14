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
exports.CreateAuctionDto = exports.IsAfterStartTimeConstraint = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
/**
 * Custom validator untuk memastikan endTime > startTime
 * Requirement 2.3: Validate date ranges (endTime > startTime)
 */
let IsAfterStartTimeConstraint = class IsAfterStartTimeConstraint {
    validate(endTime, args) {
        const obj = args.object;
        if (!obj.startTime || !endTime) {
            return false;
        }
        const start = new Date(obj.startTime);
        const end = new Date(endTime);
        return end > start;
    }
    defaultMessage(args) {
        return "Waktu berakhir lelang harus setelah waktu mulai lelang.";
    }
};
exports.IsAfterStartTimeConstraint = IsAfterStartTimeConstraint;
exports.IsAfterStartTimeConstraint = IsAfterStartTimeConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: "IsAfterStartTime", async: false })
], IsAfterStartTimeConstraint);
/**
 * DTO untuk membuat lelang baru melalui admin panel.
 *
 * Validates: Requirements 2.3, 2.6
 *
 * Handles optional fields based on auctionType:
 * - DESCENDING: requires minimumPrice, decrementAmount
 * - RANK_EXCL: requires minimumRank
 * - SEALED_CHEST: requires isSealed
 */
class CreateAuctionDto {
}
exports.CreateAuctionDto = CreateAuctionDto;
__decorate([
    (0, class_validator_1.IsString)({ message: "Judul lelang harus berupa teks." }),
    (0, class_validator_1.IsNotEmpty)({ message: "Judul lelang wajib diisi." }),
    (0, class_validator_1.MinLength)(5, { message: "Judul lelang minimal 5 karakter." }),
    (0, class_validator_1.MaxLength)(200, { message: "Judul lelang maksimal 200 karakter." }),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Deskripsi lelang harus berupa teks." }),
    (0, class_validator_1.IsNotEmpty)({ message: "Deskripsi lelang wajib diisi." }),
    (0, class_validator_1.MinLength)(20, { message: "Deskripsi lelang minimal 20 karakter." }),
    (0, class_validator_1.MaxLength)(5000, { message: "Deskripsi lelang maksimal 5000 karakter." }),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Kategori harus berupa teks." }),
    (0, class_validator_1.IsNotEmpty)({ message: "Kategori wajib diisi." }),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ItemRarity, { message: "Rarity harus salah satu dari: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, TRANSCENDENT." }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "rarity", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AuctionType, { message: "Tipe lelang harus salah satu dari: STANDARD, SCHEDULED, LIVE, RANK_EXCL, SEALED_CHEST, DESCENDING." }),
    (0, class_validator_1.IsNotEmpty)({ message: "Tipe lelang wajib diisi." }),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "auctionType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "Harga awal harus berupa angka." }),
    (0, class_validator_1.Min)(1, { message: "Harga awal minimal 1." }),
    (0, class_validator_1.IsNotEmpty)({ message: "Harga awal wajib diisi." }),
    __metadata("design:type", Number)
], CreateAuctionDto.prototype, "startingPrice", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "Increment minimum harus berupa angka." }),
    (0, class_validator_1.Min)(1, { message: "Increment minimum minimal 1." }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuctionDto.prototype, "minimumIncrement", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "Harga minimum harus berupa angka." }),
    (0, class_validator_1.Min)(1, { message: "Harga minimum minimal 1." }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuctionDto.prototype, "minimumPrice", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "Jumlah decrement harus berupa angka." }),
    (0, class_validator_1.Min)(1, { message: "Jumlah decrement minimal 1." }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuctionDto.prototype, "decrementAmount", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: "Waktu mulai harus berupa tanggal ISO 8601 yang valid." }),
    (0, class_validator_1.IsNotEmpty)({ message: "Waktu mulai lelang wajib diisi." }),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: "Waktu berakhir harus berupa tanggal ISO 8601 yang valid." }),
    (0, class_validator_1.IsNotEmpty)({ message: "Waktu berakhir lelang wajib diisi." }),
    (0, class_validator_1.Validate)(IsAfterStartTimeConstraint),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Rank, { message: "Rank minimum harus salah satu dari: CIVIS, MERCHANT, KNIGHT, BARON, VISCOUNT, EARL, MARQUIS, DUKE, SOVEREIGN, EMPEROR." }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "minimumRank", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "ID achievement harus berupa teks." }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "requiredAchievementId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: "isSealed harus berupa boolean (true/false)." }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateAuctionDto.prototype, "isSealed", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: "imageUrls harus berupa array." }),
    (0, class_validator_1.IsString)({ each: true, message: "Setiap URL gambar harus berupa teks." }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateAuctionDto.prototype, "imageUrls", void 0);
//# sourceMappingURL=create-auction.dto.js.map