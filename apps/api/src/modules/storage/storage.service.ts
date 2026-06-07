import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || 'emerald-kingdom';
    this.publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-xxxxxx.r2.dev'; // Configure in env
    
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    if (!process.env.R2_ACCOUNT_ID) {
      // Mock upload for local dev if R2 is not configured
      this.logger.warn('R2 is not configured. Returning dummy URL.');
      return `https://dummyimage.com/400x400/1a1a25/ffd700&text=${file.originalname}`;
    }

    const extension = file.originalname.split('.').pop();
    const key = `${folder}/${randomUUID()}.${extension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );
      
      return `${this.publicUrl}/${key}`;
    } catch (error) {
      this.logger.error('Error uploading file to R2', error);
      throw new Error('Gagal mengupload file ke storage.');
    }
  }
}
