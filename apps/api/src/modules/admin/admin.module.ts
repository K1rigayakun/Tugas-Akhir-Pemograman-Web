import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminAuthController } from "./admin.auth.controller";
import { AdminService } from "./admin.service";
import { AuditService } from "../audit/audit.service";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [StorageModule],
  controllers: [AdminController, AdminAuthController],
  providers: [AdminService, AuditService],
  exports: [AdminService],
})
export class AdminModule {}
