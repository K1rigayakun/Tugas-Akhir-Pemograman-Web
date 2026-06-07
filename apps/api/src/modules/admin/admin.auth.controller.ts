import { Controller, Post, Body, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "../../common/auth/jwt.service";
import { PasswordService } from "../../common/auth/password.service";
import { prisma } from "@emerald-kingdom/db";

@Controller("admin/auth")
export class AdminAuthController {
  constructor(
    private jwtService: JwtService,
    private passwordService: PasswordService,
  ) {}

  @Post("login")
  async login(@Body() body: any) {
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Email atau password tidak valid");
    }

    if (!user.adminRole) {
      throw new ForbiddenException("Akses ditolak: Bukan akun admin");
    }

    const isPasswordValid = await this.passwordService.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email atau password tidak valid");
    }

    const token = this.jwtService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.adminRole,
      adminRole: user.adminRole,
    });

    return {
      success: true,
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        adminRole: user.adminRole,
      }
    };
  }
}
