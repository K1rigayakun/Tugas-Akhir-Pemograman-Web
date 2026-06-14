import {
  Controller, Post, Get, Body, Req, Headers, UseGuards,
  RawBodyRequest, Param, Query, UseInterceptors, UploadedFile,
  ParseIntPipe, DefaultValuePipe, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../../common/auth/auth.guard';
import { InitiatePaymentDto, ApprovePaymentDto, RejectPaymentDto } from './payment.dto';
import { PaymentMethod } from './interfaces/payment-method.enum';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ═══════════════════════════════════════════════════════════
  //  USER ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /payment/initiate - Create new payment
   * Validates Requirements 2.1, 2.2
   */
  @UseGuards(AuthGuard)
  @Post('initiate')
  async initiatePayment(
    @Req() req: any,
    @Body() dto: InitiatePaymentDto
  ) {
    return this.paymentService.initiatePayment(
      req.user.id,
      dto.amount,
      dto.fiatAmount,
      dto.method as unknown as PaymentMethod,
      { bank: dto.bank, walletType: dto.walletType }
    );
  }

  /**
   * GET /payment/methods - List currently available payment methods
   */
  @Get('methods')
  async getPaymentMethods() {
    return this.paymentService.getAvailablePaymentMethods();
  }

  /**
   * POST /payment/:id/complete-test - Complete test payment
   * Validates Requirements 3.5
   */
  @UseGuards(AuthGuard)
  @Post(':id/complete-test')
  async completeTestPayment(
    @Req() req: any,
    @Param('id') id: string
  ) {
    return this.paymentService.completeTestPayment(id, req.user.id);
  }

  /**
   * POST /payment/:id/upload-proof - Upload payment proof image
   * Validates Requirements 10.1, 10.2, 10.3
   */
  @UseGuards(AuthGuard)
  @Post(':id/upload-proof')
  @UseInterceptors(FileInterceptor('proof', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  }))
  async uploadProof(
    @Req() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('File bukti pembayaran wajib diupload');
    }
    const imageUrl = await this.paymentService.uploadProofImage(id, req.user.id, file);
    return { proofImageUrl: imageUrl };
  }

  /**
   * GET /payment/user/history - Get user's payment history
   * Validates Requirements 12.1, 12.2, 12.3
   */
  @UseGuards(AuthGuard)
  @Get('user/history')
  async getUserHistory(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number
  ) {
    return this.paymentService.getUserPaymentHistory(req.user.id, page, limit);
  }

  // ═══════════════════════════════════════════════════════════
  //  WEBHOOK ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /payment/webhook - Stripe webhook
   */
  @Post('webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature || !req.rawBody) {
      return { received: false };
    }
    return this.paymentService.handleStripeWebhook(signature, req.rawBody);
  }

  /**
   * POST /payment/webhook/:provider - Provider webhook
   * Validates Requirements 5.1
   */
  @Post('webhook/:provider')
  async handleProviderWebhook(
    @Param('provider') provider: string,
    @Headers('x-signature') signature: string,
    @Body() payload: any,
  ) {
    if (!signature) {
      return { received: false, error: 'Missing signature' };
    }
    await this.paymentService.handleWebhook(provider, payload, signature);
    return { received: true };
  }

  // ═══════════════════════════════════════════════════════════
  //  ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /payment/admin/list - List payments for admin
   * Validates Requirements 6.1, 6.2
   */
  @Get('admin/list')
  @UseGuards(AuthGuard)
  async getAdminPaymentList(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number
  ) {
    if (!req.user?.adminRole) throw new BadRequestException('Forbidden: Admin access required');
    return this.paymentService.getAdminPaymentList(status, method, dateFrom, dateTo, page, limit);
  }

  /**
   * POST /payment/admin/:id/approve - Approve payment
   * Validates Requirements 6.3, 6.5
   */
  @Post('admin/:id/approve')
  @UseGuards(AuthGuard)
  async approvePayment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ApprovePaymentDto
  ) {
    if (!req.user?.adminRole) throw new BadRequestException('Forbidden: Admin access required');
    return this.paymentService.approveTopUpRequest(id, req.user.id, dto.notes);
  }

  /**
   * POST /payment/admin/:id/reject - Reject payment
   * Validates Requirements 6.4, 6.7
   */
  @Post('admin/:id/reject')
  @UseGuards(AuthGuard)
  async rejectPayment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto
  ) {
    if (!req.user?.adminRole) throw new BadRequestException('Forbidden: Admin access required');
    return this.paymentService.rejectTopUpRequest(id, req.user.id, dto.notes);
  }

  // ═══════════════════════════════════════════════════════════
  //  LEGACY ENDPOINTS (backward compatibility)
  // ═══════════════════════════════════════════════════════════

  @UseGuards(AuthGuard)
  @Post('checkout')
  async createCheckout(
    @Req() req: any,
    @Body() body: { amount: number; ccAmount: number }
  ) {
    return this.paymentService.createCheckoutSession(req.user.id, body.amount, body.ccAmount);
  }

  @Post('manual')
  @UseGuards(AuthGuard)
  async createManualTopup(
    @Req() req: any,
    @Body() body: { amount: number; fiatAmount: number; method: string; provider?: string }
  ) {
    return this.paymentService.createManualTopup(req.user.id, body);
  }

  @Get('admin/pending')
  @UseGuards(AuthGuard)
  async getPendingTopups(@Req() req: any) {
    if (!req.user?.adminRole) throw new BadRequestException('Forbidden');
    return this.paymentService.getPendingTopups();
  }

  @Post('admin/approve/:id')
  @UseGuards(AuthGuard)
  async approveTopup(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { approve: boolean }
  ) {
    if (!req.user?.adminRole) throw new BadRequestException('Forbidden');
    return this.paymentService.approveTopup(req.user.id, id, body.approve);
  }

  /**
   * GET /payment/:id - Get payment details
   * Keep this after all static GET routes so /user/history and /admin/list
   * are not interpreted as payment IDs.
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  async getPayment(
    @Req() req: any,
    @Param('id') id: string
  ) {
    const userId = req.user.adminRole ? undefined : req.user.id;
    return this.paymentService.getPaymentById(id, userId);
  }
}
