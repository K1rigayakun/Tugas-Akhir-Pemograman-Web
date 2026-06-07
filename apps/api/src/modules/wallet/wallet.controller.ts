import { Controller, Get, Post, Body, Req, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../../common/auth/auth.guard';

@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Mendapatkan saldo saat ini (total, hold, dan tersedia)
   * Mengasumsikan request sudah melewati AuthGuard dan memasukkan user ke req.user
   */
  @Get('balance')
  @UseGuards(AuthGuard)
  async getBalance(@Req() req: any) {
    return this.walletService.getBalance(req.user.id);
  }

  /**
   * Riwayat transaksi dompet (paginated)
   */
  @Get('transactions')
  @UseGuards(AuthGuard)
  async getTransactions(
    @Req() req: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.walletService.getTransactions(req.user.id, pageNum, limitNum);
  }

  @Post('top-up')
  @UseGuards(AuthGuard)
  async initiateTopUp(@Req() req: any, @Body() body: { amount: number }) {
    return this.walletService.initiateTopUp(req.user.id, body.amount);
  }

  /**
   * Webhook Callback dari Midtrans Sandbox
   */
  @Post('top-up/callback')
  @HttpCode(HttpStatus.OK)
  async handleCallback(@Body() payload: any) {
    return this.walletService.handleMidtransCallback(payload);
  }
}
