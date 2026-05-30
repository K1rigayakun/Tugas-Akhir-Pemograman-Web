import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
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

  const port = process.env.PORT || 3001;
  await app.listen(port);

  const logger = new Logger("Bootstrap");
  logger.log(`Emerald Kingdom API running on port ${port}`);
  logger.log(`Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();
