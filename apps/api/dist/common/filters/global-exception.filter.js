"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
/**
 * GlobalExceptionFilter — Menangkap SEMUA error yang tidak tertangani.
 *
 * Fungsi:
 * 1. Format response error yang konsisten untuk client
 * 2. Log error detail untuk debugging (tapi jangan expose ke client)
 * 3. Cegah stack trace bocor ke production
 */
let GlobalExceptionFilter = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger("ExceptionFilter");
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Terjadi kesalahan internal server.";
        let error = "Internal Server Error";
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === "string") {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
                const resp = exceptionResponse;
                message = resp.message || message;
                error = resp.error || error;
                // class-validator mengembalikan array pesan
                if (Array.isArray(resp.message)) {
                    message = resp.message.join(", ");
                }
            }
        }
        else if (exception instanceof Error) {
            // Error biasa (bukan HttpException) — jangan expose detail ke client
            this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
        }
        // Log semua error 5xx
        if (status >= 500) {
            this.logger.error(`[${request.method}] ${request.url} → ${status}`, exception instanceof Error ? exception.stack : String(exception));
        }
        response.status(status).json({
            success: false,
            statusCode: status,
            error,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map