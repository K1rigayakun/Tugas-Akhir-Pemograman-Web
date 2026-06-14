import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { VaultService } from './vault.service';

@Module({
  imports: [],
  controllers: [VaultController],
  providers: [VaultService],
})
export class VaultModule {}
