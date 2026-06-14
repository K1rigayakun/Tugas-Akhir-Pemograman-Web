import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TwoFactorService } from "./two-factor.service";

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, TwoFactorService],
  exports: [AuthService, TwoFactorService],
})
export class UserAuthModule {}
