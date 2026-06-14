"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const payment_service_1 = require("./payment.service");
const auth_guard_1 = require("../../common/auth/auth.guard");
const payment_dto_1 = require("./payment.dto");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    // ═══════════════════════════════════════════════════════════
    //  USER ENDPOINTS
    // ═══════════════════════════════════════════════════════════
    /**
     * POST /payment/initiate - Create new payment
     * Validates Requirements 2.1, 2.2
     */
    async initiatePayment(req, dto) {
        return this.paymentService.initiatePayment(req.user.id, dto.amount, dto.fiatAmount, dto.method, { bank: dto.bank, walletType: dto.walletType });
    }
    /**
     * GET /payment/methods - List currently available payment methods
     */
    async getPaymentMethods() {
        return this.paymentService.getAvailablePaymentMethods();
    }
    /**
     * POST /payment/:id/complete-test - Complete test payment
     * Validates Requirements 3.5
     */
    async completeTestPayment(req, id) {
        return this.paymentService.completeTestPayment(id, req.user.id);
    }
    /**
     * POST /payment/:id/upload-proof - Upload payment proof image
     * Validates Requirements 10.1, 10.2, 10.3
     */
    async uploadProof(req, id, file) {
        if (!file) {
            throw new common_1.BadRequestException('File bukti pembayaran wajib diupload');
        }
        const imageUrl = await this.paymentService.uploadProofImage(id, req.user.id, file);
        return { proofImageUrl: imageUrl };
    }
    /**
     * GET /payment/user/history - Get user's payment history
     * Validates Requirements 12.1, 12.2, 12.3
     */
    async getUserHistory(req, page, limit) {
        return this.paymentService.getUserPaymentHistory(req.user.id, page, limit);
    }
    // ═══════════════════════════════════════════════════════════
    //  WEBHOOK ENDPOINTS
    // ═══════════════════════════════════════════════════════════
    /**
     * POST /payment/webhook - Stripe webhook
     */
    async handleStripeWebhook(signature, req) {
        if (!signature || !req.rawBody) {
            return { received: false };
        }
        return this.paymentService.handleStripeWebhook(signature, req.rawBody);
    }
    /**
     * POST /payment/webhook/:provider - Provider webhook
     * Validates Requirements 5.1
     */
    async handleProviderWebhook(provider, signature, payload) {
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
    async getAdminPaymentList(req, status, method, dateFrom, dateTo, page, limit) {
        if (!req.user?.adminRole)
            throw new common_1.BadRequestException('Forbidden: Admin access required');
        return this.paymentService.getAdminPaymentList(status, method, dateFrom, dateTo, page, limit);
    }
    /**
     * POST /payment/admin/:id/approve - Approve payment
     * Validates Requirements 6.3, 6.5
     */
    async approvePayment(req, id, dto) {
        if (!req.user?.adminRole)
            throw new common_1.BadRequestException('Forbidden: Admin access required');
        return this.paymentService.approveTopUpRequest(id, req.user.id, dto.notes);
    }
    /**
     * POST /payment/admin/:id/reject - Reject payment
     * Validates Requirements 6.4, 6.7
     */
    async rejectPayment(req, id, dto) {
        if (!req.user?.adminRole)
            throw new common_1.BadRequestException('Forbidden: Admin access required');
        return this.paymentService.rejectTopUpRequest(id, req.user.id, dto.notes);
    }
    // ═══════════════════════════════════════════════════════════
    //  LEGACY ENDPOINTS (backward compatibility)
    // ═══════════════════════════════════════════════════════════
    async createCheckout(req, body) {
        return this.paymentService.createCheckoutSession(req.user.id, body.amount, body.ccAmount);
    }
    async createManualTopup(req, body) {
        return this.paymentService.createManualTopup(req.user.id, body);
    }
    async getPendingTopups(req) {
        if (!req.user?.adminRole)
            throw new common_1.BadRequestException('Forbidden');
        return this.paymentService.getPendingTopups();
    }
    async approveTopup(req, id, body) {
        if (!req.user?.adminRole)
            throw new common_1.BadRequestException('Forbidden');
        return this.paymentService.approveTopup(req.user.id, id, body.approve);
    }
    /**
     * GET /payment/:id - Get payment details
     * Keep this after all static GET routes so /user/history and /admin/list
     * are not interpreted as payment IDs.
     */
    async getPayment(req, id) {
        const userId = req.user.adminRole ? undefined : req.user.id;
        return this.paymentService.getPaymentById(id, userId);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('initiate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.InitiatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Get)('methods'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPaymentMethods", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(':id/complete-test'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "completeTestPayment", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(':id/upload-proof'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('proof', {
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "uploadProof", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('user/history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getUserHistory", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, common_1.Post)('webhook/:provider'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Headers)('x-signature')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleProviderWebhook", null);
__decorate([
    (0, common_1.Get)('admin/list'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('method')),
    __param(3, (0, common_1.Query)('dateFrom')),
    __param(4, (0, common_1.Query)('dateTo')),
    __param(5, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(6, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getAdminPaymentList", null);
__decorate([
    (0, common_1.Post)('admin/:id/approve'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, payment_dto_1.ApprovePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "approvePayment", null);
__decorate([
    (0, common_1.Post)('admin/:id/reject'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, payment_dto_1.RejectPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "rejectPayment", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createManualTopup", null);
__decorate([
    (0, common_1.Get)('admin/pending'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPendingTopups", null);
__decorate([
    (0, common_1.Post)('admin/approve/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "approveTopup", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPayment", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map