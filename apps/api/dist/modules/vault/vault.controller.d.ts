import { VaultService } from './vault.service';
export declare class VaultController {
    private readonly vaultService;
    constructor(vaultService: VaultService);
    submitItem(req: any, body: any): Promise<{
        id: string;
        userId: string;
        title: string;
        description: string;
        rarity: string;
        startingPrice: number;
        imageUrls: string[];
        status: string;
        adminNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getStatus(req: any): Promise<{
        id: string;
        userId: string;
        title: string;
        description: string;
        rarity: string;
        startingPrice: number;
        imageUrls: string[];
        status: string;
        adminNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
//# sourceMappingURL=vault.controller.d.ts.map