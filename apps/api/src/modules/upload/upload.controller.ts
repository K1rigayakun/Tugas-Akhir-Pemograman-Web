import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../../common/auth/auth.guard";
import { StorageService } from "../storage/storage.service";

@Controller("upload")
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private readonly storage: StorageService) {}

  @Post("avatar")
  @UseInterceptors(FileInterceptor("file"))
  avatar(@UploadedFile() file?: Express.Multer.File) {
    return this.upload(file, "avatars", ["image/jpeg", "image/png", "image/webp"], 5);
  }

  @Post("kyc-document")
  @UseInterceptors(FileInterceptor("file"))
  document(@UploadedFile() file?: Express.Multer.File) {
    return this.upload(file, "kyc/documents", ["image/jpeg", "image/png", "application/pdf"], 10);
  }

  @Post("auction-image")
  @UseInterceptors(FileInterceptor("file"))
  auctionImage(@UploadedFile() file?: Express.Multer.File) {
    return this.upload(file, "auctions/images", ["image/jpeg", "image/png", "image/webp"], 10);
  }

  private async upload(
    file: Express.Multer.File | undefined,
    folder: string,
    allowed: string[],
    maxMb: number,
  ) {
    if (!file || !allowed.includes(file.mimetype) || file.size > maxMb * 1024 * 1024) {
      throw new BadRequestException(`File tidak valid atau melebihi ${maxMb}MB.`);
    }
    const url = await this.storage.uploadFile(file, folder);
    return { url, key: url };
  }
}
