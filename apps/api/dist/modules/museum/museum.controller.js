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
exports.MuseumController = void 0;
const common_1 = require("@nestjs/common");
const museum_service_1 = require("./museum.service");
let MuseumController = class MuseumController {
    constructor(museumService) {
        this.museumService = museumService;
    }
    // New endpoint for homepage featured items
    async getFeaturedItems() {
        try {
            const data = await this.museumService.getFeaturedItems();
            return {
                data,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('Museum fetch error:', error);
            throw new common_1.HttpException('Failed to fetch museum data', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMuseumItems(limitStr) {
        const limit = limitStr ? parseInt(limitStr, 10) : 50;
        return this.museumService.getMuseumItems(limit);
    }
};
exports.MuseumController = MuseumController;
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MuseumController.prototype, "getFeaturedItems", null);
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MuseumController.prototype, "getMuseumItems", null);
exports.MuseumController = MuseumController = __decorate([
    (0, common_1.Controller)('museum'),
    __metadata("design:paramtypes", [museum_service_1.MuseumService])
], MuseumController);
//# sourceMappingURL=museum.controller.js.map