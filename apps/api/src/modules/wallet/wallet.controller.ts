import { Controller, Get, Post, Body, Req, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../../common/auth/auth.guard';

@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Get current wallet balance - optimized for quick response
   * Returns just the balance field, handling null wallets by returning 0
   * Uses indexed query for < 200ms response time
   */
  @Get('balance')
  @UseGuards(AuthGuard)
  async getBalance(@Req() req: any) {
    return this.walletService.getSimpleBalance(req.user.id);
  }

  /**
   * Get detailed wallet information (total, hold, available)
   * Legacy endpoint for backward compatibility
   */
  @Get('balance/detailed')
  @UseGuards(AuthGuard)
  async getDetailedBalance(@Req() req: any) {
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

  /**
   * Endpoint Dummy Top Up untuk testing (Instan nambah saldo)
   */
  @Post('dummy-topup')
  @UseGuards(AuthGuard)
  async dummyTopUp(@Req() req: any, @Body() body: { amount: number }) {
    const orderId = `dummy_${req.user.id}_${Date.now()}`;
    await this.walletService.addBalance(
      req.user.id,
      body.amount,
      'TOP_UP',
      orderId,
      orderId
    );
    return { success: true, message: `Berhasil menambahkan ${body.amount} CC` };
  }
}
