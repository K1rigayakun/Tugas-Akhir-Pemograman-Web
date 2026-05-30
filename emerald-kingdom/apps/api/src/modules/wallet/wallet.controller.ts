import { Controller, Get, Post, Body, Req, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('api/v1/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Mendapatkan saldo saat ini (total, hold, dan tersedia)
   * Mengasumsikan request sudah melewati AuthGuard dan memasukkan user ke req.user
   */
  @Get('balance')
  async getBalance(@Req() req: any) {
    // Fallback ke dummy userId jika Auth belum terintegrasi untuk testing
    const userId = req.user?.id || 'dummy-user-id';
    return this.walletService.getBalance(userId);
  }

  /**
   * Riwayat transaksi dompet (paginated)
   */
  @Get('transactions')
  async getTransactions(
    @Req() req: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const userId = req.user?.id || 'dummy-user-id';
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.walletService.getTransactions(userId, pageNum, limitNum);
  }

  @Post('top-up')
  async initiateTopUp(@Req() req: any, @Body() body: { amount: number }) {
    const userId = req.user?.id || 'dummy-user-id';
    return this.walletService.initiateTopUp(userId, body.amount);
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
