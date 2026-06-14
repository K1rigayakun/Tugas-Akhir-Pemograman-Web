import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/auth/password.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {
    authenticator.options = { window: 1 }; // Allow 1 step before/after
  }

  async generateTwoFactorSecret(user: { id: string; email: string }) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'Aurum Imperium', secret);

    // Save the secret temporarily or update user
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret }, // Note: In production, encrypt this
    });

    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    return { secret, qrCodeUrl };
  }

  async verifyTwoFactorCode(user: { id: string }, code: string): Promise<boolean> {
    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true },
    });

    if (!userRecord || !userRecord.twoFactorSecret) {
      return false;
    }

    return authenticator.verify({
      token: code,
      secret: userRecord.twoFactorSecret,
    });
  }

  async enableTwoFactor(user: { id: string }, code: string): Promise<boolean> {
    const isValid = await this.verifyTwoFactorCode(user, code);
    if (!isValid) return false;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    return true;
  }
}
