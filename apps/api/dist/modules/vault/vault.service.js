"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("@emerald-kingdom/db");
let VaultService = class VaultService {
    async submitItem(userId, data) {
        if (!data.title || !data.description || !data.startingPrice || !data.imageUrls?.length) {
            throw new common_1.BadRequestException("Data pengajuan tidak lengkap.");
        }
        return db_1.prisma.vaultSubmission.create({
            data: {
                userId,
                title: data.title,
                description: data.description,
                rarity: data.rarity || 'COMMON',
                startingPrice: data.startingPrice,
                imageUrls: data.imageUrls,
                status: 'PENDING'
            }
        });
    }
    async getMySubmissions(userId) {
        return db_1.prisma.vaultSubmission.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.VaultService = VaultService;
exports.VaultService = VaultService = __decorate([
    (0, common_1.Injectable)()
], VaultService);
//# sourceMappingURL=vault.service.js.map