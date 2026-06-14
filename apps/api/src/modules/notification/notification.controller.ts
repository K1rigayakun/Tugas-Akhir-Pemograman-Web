import { Body, Controller, Get, Param, Put, Query, Req, UseGuards } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthGuard } from "../../common/auth/auth.guard";
import { NotificationService } from "./notification.service";

@Controller()
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get("notifications")
  list(@Req() req: any, @Query("page") page?: string, @Query("limit") limit?: string, @Query("unread") unread?: string) {
    return this.service.list(req.user.id, Number(page) || 1, Number(limit) || 20, unread === "true");
  }

  @Put("notifications/read-all")
  readAll(@Req() req: any) {
    return this.service.markAllRead(req.user.id);
  }

  @Put("notifications/:id/read")
  read(@Req() req: any, @Param("id") id: string) {
    return this.service.markRead(req.user.id, id);
  }

  @Get("notifications/unread-count")
  unread(@Req() req: any) {
    return this.service.unreadCount(req.user.id);
  }

  @Get("notification-preferences")
  preferences(@Req() req: any) {
    return this.service.getPreferences(req.user.id);
  }

  @Put("notification-preferences")
  updatePreferences(@Req() req: any, @Body() body: Record<string, unknown>) {
    return this.service.updatePreferences(req.user.id, body as Prisma.InputJsonObject);
  }
}
