import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug"],
  });

  // Global prefix untuk semua endpoint
  app.setGlobalPrefix("api/v1");

  // Global exception filter — tangkap semua error
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Validasi input otomatis
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

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
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Emerald Kingdom API")
    .setDescription(
      "API documentation untuk platform lelang online Emerald Kingdom.\n\n" +
      "## Authentication\n" +
      "Semua endpoint yang dilindungi memerlukan header:\n" +
      "```\nAuthorization: Bearer <access_token>\n```\n\n" +
      "## Rate Limiting\n" +
      "Semua endpoint terlindungi rate limiter: 100 request/menit per IP.",
    )
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Masukkan access token dari login",
      },
      "JWT-auth",
    )
    .addTag("Health", "Health check dan readiness probe")
    .addTag("Admin", "Endpoint admin panel (RBAC protected)")
    .addTag("Live Auction", "Real-time auction endpoints + Agora token")
    .addTag("Audit", "Audit log (read-only, append-only)")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
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

  const logger = new Logger("Bootstrap");
  logger.log(`Emerald Kingdom API running on port ${port}`);
  logger.log(`Health check: http://localhost:${port}/api/v1/health`);
  logger.log(`API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
