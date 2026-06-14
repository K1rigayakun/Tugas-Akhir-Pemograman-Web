import { Controller, Get, Param, Query } from "@nestjs/common";
import { DiscoveryService } from "./discovery.service";

@Controller()
export class DiscoveryController {
  constructor(private readonly service: DiscoveryService) {}

  @Get("leaderboard/:category")
  leaderboard(@Param("category") category: string, @Query("limit") limit?: string) {
    return this.service.leaderboard(category, Number(limit) || 50);
  }

  @Get("museum/items")
  museumItems(@Query("limit") limit?: string, @Query("rarity") rarity?: string) {
    return this.service.museumItems(Number(limit) || 20, rarity);
  }

  @Get("museum/items/:id")
  museumItem(@Param("id") id: string) {
    return this.service.museumItem(id);
  }

  @Get("museum/records")
  records() {
    return this.service.museumRecords();
  }

  @Get("museum/first-emperor")
  firstEmperor() {
    return this.service.firstEmperor();
  }

  @Get("museum/event-highlights")
  highlights() {
    return this.service.eventHighlights();
  }

  @Get("events")
  events() {
    return this.service.events();
  }

  @Get("events/:id")
  event(@Param("id") id: string) {
    return this.service.event(id);
  }
}
