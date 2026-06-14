"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveAuctionModule = void 0;
const common_1 = require("@nestjs/common");
const live_auction_controller_1 = require("./live-auction.controller");
const live_auction_service_1 = require("./live-auction.service");
const live_auction_gateway_1 = require("./live-auction.gateway");
const audit_service_1 = require("../audit/audit.service");
const rank_module_1 = require("../rank/rank.module");
let LiveAuctionModule = class LiveAuctionModule {
};
exports.LiveAuctionModule = LiveAuctionModule;
exports.LiveAuctionModule = LiveAuctionModule = __decorate([
    (0, common_1.Module)({
        imports: [rank_module_1.RankModule],
        controllers: [live_auction_controller_1.LiveAuctionController],
        providers: [live_auction_service_1.LiveAuctionService, live_auction_gateway_1.LiveAuctionGateway, audit_service_1.AuditService],
        exports: [live_auction_service_1.LiveAuctionService, live_auction_gateway_1.LiveAuctionGateway],
    })
], LiveAuctionModule);
//# sourceMappingURL=live-auction.module.js.map