import { ExceptionFilter, ArgumentsHost } from "@nestjs/common";
/**
 * GlobalExceptionFilter — Menangkap SEMUA error yang tidak tertangani.
 *
 * Fungsi:
 * 1. Format response error yang konsisten untuk client
 * 2. Log error detail untuk debugging (tapi jangan expose ke client)
 * 3. Cegah stack trace bocor ke production
 */
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
//# sourceMappingURL=global-exception.filter.d.ts.map