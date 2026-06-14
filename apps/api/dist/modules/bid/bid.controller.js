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
exports.BidController = void 0;
const common_1 = require("@nestjs/common");
const bid_service_1 = require("./bid.service");
const place_bid_dto_1 = require("./dto/place-bid.dto");
const auth_guard_1 = require("../../common/auth/auth.guard");
let BidController = class BidController {
    constructor(bidService) {
        this.bidService = bidService;
    }
    /**
     * Mengajukan penawaran bid normal pada lelang tertentu
     */
    async placeBid(auctionId, req, dto) {
        return this.bidService.placeBid(auctionId, req.user.id, dto.amount, dto.idempotencyKey);
    }
    /**
     * Memasang Phantom Bid (Shadow Pledge) - auto-bid otomatis hingga batas maksimum
     */
    async placePhantomBid(auctionId, req, body) {
        return this.bidService.placePhantomBid(auctionId, req.user.id, body.maxAmount, body.idempotencyKey);
    }
};
exports.BidController = BidController;
__decorate([
    (0, common_1.Post)(':id/bids'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, place_bid_dto_1.PlaceBidDto]),
    __metadata("design:returntype", Promise)
], BidController.prototype, "placeBid", null);
__decorate([
    (0, common_1.Post)(':id/phantom-bid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BidController.prototype, "placePhantomBid", null);
exports.BidController = BidController = __decorate([
    (0, common_1.Controller)("auctions"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [bid_service_1.BidService])
], BidController);
//# sourceMappingURL=bid.controller.js.map