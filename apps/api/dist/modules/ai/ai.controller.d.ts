import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    getMuseumStory(id: string): Promise<{
        success: boolean;
        story: string;
    }>;
}
//# sourceMappingURL=ai.controller.d.ts.map