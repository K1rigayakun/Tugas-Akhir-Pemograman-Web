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
exports.DiscoveryController = void 0;
const common_1 = require("@nestjs/common");
const discovery_service_1 = require("./discovery.service");
let DiscoveryController = class DiscoveryController {
    constructor(service) {
        this.service = service;
    }
    leaderboard(category, limit) {
        return this.service.leaderboard(category, Number(limit) || 50);
    }
    museumItems(limit, rarity) {
        return this.service.museumItems(Number(limit) || 20, rarity);
    }
    museumItem(id) {
        return this.service.museumItem(id);
    }
    records() {
        return this.service.museumRecords();
    }
    firstEmperor() {
        return this.service.firstEmperor();
    }
    highlights() {
        return this.service.eventHighlights();
    }
    events() {
        return this.service.events();
    }
    event(id) {
        return this.service.event(id);
    }
};
exports.DiscoveryController = DiscoveryController;
__decorate([
    (0, common_1.Get)("leaderboard/:category"),
    __param(0, (0, common_1.Param)("category")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "leaderboard", null);
__decorate([
    (0, common_1.Get)("museum/items"),
    __param(0, (0, common_1.Query)("limit")),
    __param(1, (0, common_1.Query)("rarity")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "museumItems", null);
__decorate([
    (0, common_1.Get)("museum/items/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "museumItem", null);
__decorate([
    (0, common_1.Get)("museum/records"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "records", null);
__decorate([
    (0, common_1.Get)("museum/first-emperor"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "firstEmperor", null);
__decorate([
    (0, common_1.Get)("museum/event-highlights"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "highlights", null);
__decorate([
    (0, common_1.Get)("events"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "events", null);
__decorate([
    (0, common_1.Get)("events/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "event", null);
exports.DiscoveryController = DiscoveryController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [discovery_service_1.DiscoveryService])
], DiscoveryController);
//# sourceMappingURL=discovery.controller.js.map