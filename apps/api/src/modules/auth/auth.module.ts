import { Module, Global } from "@nestjs/common";
import { JwtService } from "../../common/auth/jwt.service";
import { PasswordService } from "../../common/auth/password.service";
import { AuthGuard } from "../../common/auth/auth.guard";

/**
 * AuthModule — Menyediakan JWT dan Password hashing ke seluruh app.
 *
 * Global module — semua module bisa inject JwtService, PasswordService,
 * dan AuthGuard tanpa import AuthModule.
 *
 * Catatan: Login/register endpoint sendiri adalah domain Peter.
 * Michael hanya menyediakan infrastructure (JWT, Argon2, Guard).
 */
@Global()
@Module({
  providers: [JwtService, PasswordService, AuthGuard],
  exports: [JwtService, PasswordService, AuthGuard],
})
export class AuthModule {}
