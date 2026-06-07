import { Global, Module } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";

@Global()
@Module({
  controllers: [WalletController],
  providers: [WalletService, PrismaService],
  exports: [WalletService],
})
export class WalletModule {}
