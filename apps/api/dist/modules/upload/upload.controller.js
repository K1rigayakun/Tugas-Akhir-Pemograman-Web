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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const auth_guard_1 = require("../../common/auth/auth.guard");
const storage_service_1 = require("../storage/storage.service");
let UploadController = class UploadController {
    constructor(storage) {
        this.storage = storage;
    }
    avatar(file) {
        return this.upload(file, "avatars", ["image/jpeg", "image/png", "image/webp"], 5);
    }
    document(file) {
        return this.upload(file, "kyc/documents", ["image/jpeg", "image/png", "application/pdf"], 10);
    }
    auctionImage(file) {
        return this.upload(file, "auctions/images", ["image/jpeg", "image/png", "image/webp"], 10);
    }
    async upload(file, folder, allowed, maxMb) {
        if (!file || !allowed.includes(file.mimetype) || file.size > maxMb * 1024 * 1024) {
            throw new common_1.BadRequestException(`File tidak valid atau melebihi ${maxMb}MB.`);
        }
        const url = await this.storage.uploadFile(file, folder);
        return { url, key: url };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)("avatar"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "avatar", null);
__decorate([
    (0, common_1.Post)("kyc-document"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "document", null);
__decorate([
    (0, common_1.Post)("auction-image"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "auctionImage", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)("upload"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map