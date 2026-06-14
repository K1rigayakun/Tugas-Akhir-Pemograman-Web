import { StorageService } from "../storage/storage.service";
export declare class UploadController {
    private readonly storage;
    constructor(storage: StorageService);
    avatar(file?: Express.Multer.File): Promise<{
        url: string;
        key: string;
    }>;
    document(file?: Express.Multer.File): Promise<{
        url: string;
        key: string;
    }>;
    auctionImage(file?: Express.Multer.File): Promise<{
        url: string;
        key: string;
    }>;
    private upload;
}
//# sourceMappingURL=upload.controller.d.ts.map