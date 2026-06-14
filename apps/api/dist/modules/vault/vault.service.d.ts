export declare class VaultService {
    submitItem(userId: string, data: {
        title: string;
        description: string;
        rarity: string;
        startingPrice: number;
        imageUrls: string[];
    }): Promise<{
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
    getMySubmissions(userId: string): Promise<{
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
//# sourceMappingURL=vault.service.d.ts.map