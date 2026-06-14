import { Module } from '@nestjs/common';
import { MuseumController } from './museum.controller';
import { MuseumService } from './museum.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MuseumController],
  providers: [MuseumService],
})
export class MuseumModule {}
