import {
  Body, Controller, Get, Post, Req, UploadedFiles, UseGuards, UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../../common/auth/auth.guard";
import { KycService } from "./kyc.service";

@Controller("kyc")
@UseGuards(AuthGuard)
export class KycController {
  constructor(private readonly service: KycService) {}

  @Post("step-1")
  step1(@Req() req: any, @Body() body: any) {
    return this.service.savePersonal(req.user.id, body);
  }

  @Post("step-2")
  step2(@Req() req: any, @Body() body: any) {
    return this.service.saveAddress(req.user.id, body);
  }

  @Post("step-3")
  @UseInterceptors(FileFieldsInterceptor([
    { name: "idDocument", maxCount: 1 },
    { name: "selfieWithDocument", maxCount: 1 },
  ]))
  step3(
    @Req() req: any,
    @UploadedFiles() files: {
      idDocument?: Express.Multer.File[];
      selfieWithDocument?: Express.Multer.File[];
    },
  ) {
    return this.service.saveDocuments(
      req.user.id,
      files?.idDocument?.[0],
      files?.selfieWithDocument?.[0],
    );
  }

  @Post("submit")
  submit(@Req() req: any, @Body() body: any) {
    return this.service.submit(req.user.id, body);
  }

  @Get("status")
  status(@Req() req: any) {
    return this.service.getStatus(req.user.id);
  }

  @Post("resubmit")
  resubmit(@Req() req: any) {
    return this.service.resubmit(req.user.id);
  }
}
