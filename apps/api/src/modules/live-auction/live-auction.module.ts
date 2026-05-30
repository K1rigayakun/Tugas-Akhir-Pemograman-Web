import { Module } from "@nestjs/common";
import { LiveAuctionController } from "./live-auction.controller";
import { LiveAuctionService } from "./live-auction.service";
import { LiveAuctionGateway } from "./live-auction.gateway";
import { AuditService } from "../audit/audit.service";

@Module({
  controllers: [LiveAuctionController],
  providers: [LiveAuctionService, LiveAuctionGateway, AuditService],
  exports: [LiveAuctionService, LiveAuctionGateway],
})
export class LiveAuctionModule {}
