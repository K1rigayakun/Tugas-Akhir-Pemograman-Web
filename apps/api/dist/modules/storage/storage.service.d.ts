export declare class StorageService {
    private readonly logger;
    private s3Client;
    private bucketName;
    private publicUrl;
    constructor();
    uploadFile(file: Express.Multer.File, folder?: string): Promise<string>;
}
//# sourceMappingURL=storage.service.d.ts.map