"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env file
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ["error", "warn", "log", "debug"],
        rawBody: true, // required for Stripe webhook signature verification
    });
    // Security headers
    app.use((0, helmet_1.default)());
    // Global prefix untuk semua endpoint
    app.setGlobalPrefix("api/v1");
    // Global exception filter — tangkap semua error
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    // Validasi input otomatis
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // CORS
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL || "http://localhost:3000",
            process.env.ADMIN_URL || "http://localhost:3002",
        ],
        credentials: true,
    });
    // ============================================================
    // Swagger / OpenAPI Documentation
    // ============================================================
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("Emerald Kingdom API")
        .setDescription("API documentation untuk platform lelang online Emerald Kingdom.\n\n" +
        "## Authentication\n" +
        "Semua endpoint yang dilindungi memerlukan header:\n" +
        "```\nAuthorization: Bearer <access_token>\n```\n\n" +
        "## Rate Limiting\n" +
        "Semua endpoint terlindungi rate limiter: 100 request/menit per IP.")
        .setVersion("1.0.0")
        .addBearerAuth({
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Masukkan access token dari login",
    }, "JWT-auth")
        .addTag("Health", "Health check dan readiness probe")
        .addTag("Admin", "Endpoint admin panel (RBAC protected)")
        .addTag("Live Auction", "Real-time auction endpoints + Agora token")
        .addTag("Audit", "Audit log (read-only, append-only)")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup("api/docs", app, document, {
        customSiteTitle: "Emerald Kingdom API Docs",
        customCss: `
      .swagger-ui .topbar { background-color: #0a2620; }
      .swagger-ui .topbar-wrapper .link { color: #c9a84c; }
    `,
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: "list",
            filter: true,
        },
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    const logger = new common_1.Logger("Bootstrap");
    logger.log(`Emerald Kingdom API running on port ${port}`);
    logger.log(`Health check: http://localhost:${port}/api/v1/health`);
    logger.log(`API Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map