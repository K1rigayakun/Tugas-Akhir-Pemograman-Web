import { Controller, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('museum/:id/story')
  async getMuseumStory(@Param('id') id: string) {
    const story = await this.aiService.generateMuseumStory(id);
    return { success: true, story };
  }
}
