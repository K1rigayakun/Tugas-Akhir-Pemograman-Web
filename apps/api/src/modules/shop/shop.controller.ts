import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../common/auth/auth.guard";
import { ShopService } from "./shop.service";

@Controller("shop")
export class ShopController {
  constructor(private readonly service: ShopService) {}

  @Get("items")
  items(@Query("type") type?: string) {
    return this.service.list(type);
  }

  @Get("items/flash-sale")
  flashSales() {
    return this.service.flashSales();
  }

  @Get("items/limited")
  limited() {
    return this.service.limited();
  }

  @Post("purchase/:itemId")
  @UseGuards(AuthGuard)
  purchase(@Req() req: any, @Param("itemId") itemId: string, @Body() body: { idempotencyKey: string }) {
    return this.service.purchase(req.user.id, itemId, body.idempotencyKey);
  }
}
