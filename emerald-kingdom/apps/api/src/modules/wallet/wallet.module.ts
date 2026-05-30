import { Module, Global } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Global() // Di-set global agar WalletService bisa digunakan di module lain tanpa import berulang
@Module({
  controllers: [WalletController],
  providers: [WalletService, PrismaService],
  exports: [WalletService],
})
export class WalletModule {}
