import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { VaultService } from './vault.service';
import { AuthGuard } from '../../common/auth/auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('vault-offering')
@Controller('vault-offering')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post()
  async submitItem(@Req() req: any, @Body() body: any) {
    return this.vaultService.submitItem(req.user.id, body);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('status')
  async getStatus(@Req() req: any) {
    return this.vaultService.getMySubmissions(req.user.id);
  }
}
