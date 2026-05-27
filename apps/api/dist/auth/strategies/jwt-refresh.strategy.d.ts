import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth.service';
declare const JwtRefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private readonly prisma;
    private readonly authService;
    constructor(configService: ConfigService, prisma: PrismaService, authService: AuthService);
    validate(req: Request, payload: {
        sub: string;
        type: string;
        sessionId: string;
    }): Promise<{
        sessionId: string;
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
}
export {};
