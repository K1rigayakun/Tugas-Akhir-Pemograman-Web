import { Controller, Get, Put, Body, Param, UseGuards, Request, Patch, ForbiddenException } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { AuthGuard } from '../../common/auth/auth.guard';


@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @UseGuards(AuthGuard)
  @Get('address')
  async getMyAddress(@Request() req: any) {
    const address = await this.deliveryService.getUserAddress(req.user.id);
    return { address };
  }

  @UseGuards(AuthGuard)
  @Put('address')
  async updateMyAddress(
    @Request() req: any,
    @Body() body: { recipient: string; phoneNumber: string; address: string; city: string; province: string; postalCode: string }
  ) {
    const address = await this.deliveryService.upsertUserAddress(req.user.id, body);
    return { address, message: 'Address updated successfully' };
  }

  @UseGuards(AuthGuard)
  @Get('my-deliveries')
  async getMyDeliveries(@Request() req: any) {
    const deliveries = await this.deliveryService.getDeliveriesByUser(req.user.id);
    return deliveries;
  }

  // --- ADMIN ENDPOINTS ---
  
  @UseGuards(AuthGuard)
  @Get('admin/all')
  async getAllDeliveries(@Request() req: any) {
    if (!req.user.adminRole) {
      throw new ForbiddenException("Forbidden");
    }
    return this.deliveryService.getAllDeliveries();
  }

  @UseGuards(AuthGuard)
  @Patch('admin/:id/status')
  async updateDeliveryStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { status: string; trackingResi?: string; courier?: string }
  ) {
    if (!req.user.adminRole) {
      throw new ForbiddenException("Forbidden");
    }
    const updated = await this.deliveryService.updateDeliveryStatus(id, req.user.id, body.status, body.trackingResi, body.courier);
    return { delivery: updated, message: 'Delivery updated successfully' };
  }
}
