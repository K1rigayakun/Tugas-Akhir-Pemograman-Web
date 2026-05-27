import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload, TokenPair, RegisterResponse, OtpContext } from './interfaces/auth.interface';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    private readonly argon2Options;
    private readonly resend;
    private readonly OTP_TTL_MS;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<RegisterResponse>;
    generateOtp(): Promise<OtpContext>;
    verifyOtp(plainOtp: string, otpHash: string): Promise<boolean>;
    sendOtpEmail(toEmail: string, otp: string): Promise<void>;
    sendSecurityAlertEmail(toEmail: string, ipAddress: string, userAgent: string): Promise<void>;
    private buildOtpEmailHtml;
    private buildOtpEmailText;
    private buildSecurityAlertHtml;
    private buildSecurityAlertText;
    hashPassword(plainPassword: string): Promise<string>;
    verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean>;
    generateTokenPair(userId: string, email: string, role: string, sessionId: string): Promise<TokenPair>;
    verifyAccessToken(token: string): Promise<JwtPayload>;
    verifyRefreshToken(token: string): Promise<Pick<JwtPayload, 'sub' | 'type'> & {
        sessionId: string;
    }>;
    hashRefreshToken(refreshToken: string): Promise<string>;
    verifyRefreshTokenHash(hashedToken: string, plainToken: string): Promise<boolean>;
}
