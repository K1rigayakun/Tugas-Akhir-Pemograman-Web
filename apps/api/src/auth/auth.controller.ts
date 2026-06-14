import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { TwoFactorService } from "./two-factor.service";
import { JwtService } from "../common/auth/jwt.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { AuthGuard } from "../common/auth/auth.guard";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
    private readonly jwtService: JwtService,
  ) {}

  @Post("register")
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  @ApiOperation({ summary: "Daftarkan akun dan kirim OTP" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  @ApiOperation({ summary: "Verifikasi email menggunakan OTP" })
  verifyEmail(@Body() dto: VerifyEmailDto, @Req() request: Request) {
    return this.authService.verifyEmail(
      dto,
      this.clientIp(request),
      request.headers["user-agent"] || "unknown",
    );
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  @ApiOperation({ summary: "Login user" })
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(
      dto,
      this.clientIp(request),
      request.headers["user-agent"] || "unknown",
    );
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 300_000 } })
  @ApiOperation({ summary: "Rotasi refresh token" })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Nonaktifkan sesi login" })
  async logout(@Req() request: Request & { user: { id: string } }) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    try {
      // Update all active sessions for the user to inactive
      await this.authService.logoutAllSessions(request.user.id);
    } catch (error) {
      // Log error but don't fail the request
      console.log('Logout error (non-critical):', error);
    }
    
    // Always return 200 status with success message
    return { success: true, message: 'Logged out successfully' };
  }

  @Post("2fa/setup")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Setup 2FA dan dapatkan token penuh" })
  async setup2fa(
    @Body() dto: { tempToken: string; code: string },
    @Req() request: Request,
  ) {
    try {
      const payload = this.jwtService.verify(dto.tempToken);
      if (!payload || payload.type !== "2fa_setup") throw new UnauthorizedException("Token tidak valid.");
      
      const userId = payload.sub as string;
      const success = await this.twoFactorService.enableTwoFactor({ id: userId }, dto.code);
      if (!success) throw new UnauthorizedException("Kode 2FA tidak valid.");

      return this.authService.finalizeLogin(
        userId,
        this.clientIp(request),
        request.headers["user-agent"] || "unknown",
      );
    } catch (e) {
      throw new UnauthorizedException("Token 2FA atau kode tidak valid.");
    }
  }

  @Post("2fa/verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verifikasi 2FA saat login" })
  async verify2fa(
    @Body() dto: { tempToken: string; code: string },
    @Req() request: Request,
  ) {
    try {
      const payload = this.jwtService.verify(dto.tempToken);
      if (!payload || payload.type !== "2fa_verify") throw new UnauthorizedException("Token tidak valid.");
      
      const userId = payload.sub as string;
      const success = await this.twoFactorService.verifyTwoFactorCode({ id: userId }, dto.code);
      if (!success) throw new UnauthorizedException("Kode 2FA tidak valid.");

      return this.authService.finalizeLogin(
        userId,
        this.clientIp(request),
        request.headers["user-agent"] || "unknown",
      );
    } catch (e) {
      throw new UnauthorizedException("Token 2FA atau kode tidak valid.");
    }
  }

  @Get("sessions")
  @UseGuards(AuthGuard)
  sessions(@Req() request: Request & { user: { id: string } }) {
    return this.authService.listSessions(request.user.id);
  }

  @Delete("sessions/:id")
  @UseGuards(AuthGuard)
  revokeSession(
    @Req() request: Request & { user: { id: string } },
    @Param("id") sessionId: string,
  ) {
    return this.authService.revokeSession(request.user.id, sessionId);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@Req() request: Request & { user: { id: string } }) {
    return this.authService.getProfile(request.user.id);
  }

  @Get("me/cosmetics")
  @UseGuards(AuthGuard)
  myCosmetics(@Req() request: Request & { user: { id: string } }) {
    return this.authService.myCosmetics(request.user.id);
  }

  @Post("me/change-username")
  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 3, ttl: 600_000 } }) // max 3 tries per 10 mins
  @ApiOperation({ summary: "Ganti username dengan memotong 500 CC" })
  changeUsername(
    @Req() request: Request & { user: { id: string } },
    @Body() dto: { newUsername: string }
  ) {
    if (!dto.newUsername) throw new UnauthorizedException("newUsername harus diisi.");
    return this.authService.changeUsername(request.user.id, dto.newUsername);
  }

  @Post("me/change-avatar")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Ubah foto profil" })
  changeAvatar(
    @Req() request: Request & { user: { id: string } },
    @Body() dto: { avatarUrl: string }
  ) {
    if (!dto.avatarUrl) throw new UnauthorizedException("avatarUrl harus diisi.");
    return this.authService.changeAvatar(request.user.id, dto.avatarUrl);
  }

  private clientIp(request: Request): string {
    const forwarded = request.headers["x-forwarded-for"];
    if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
    if (Array.isArray(forwarded)) return forwarded[0] || "unknown";
    return request.socket.remoteAddress || "unknown";
  }
}
