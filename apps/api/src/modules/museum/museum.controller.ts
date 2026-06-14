import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { MuseumService } from './museum.service';

@Controller('museum')
export class MuseumController {
  constructor(private museumService: MuseumService) {}

  // New endpoint for homepage featured items
  @Get('featured')
  async getFeaturedItems() {
    try {
      const data = await this.museumService.getFeaturedItems();
      return {
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Museum fetch error:', error);
      throw new HttpException(
        'Failed to fetch museum data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('items')
  async getMuseumItems(@Query('limit') limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.museumService.getMuseumItems(limit);
  }
}
