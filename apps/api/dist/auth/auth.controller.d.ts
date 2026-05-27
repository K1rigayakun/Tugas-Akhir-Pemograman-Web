import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponse } from './interfaces/auth.interface';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailResponse } from './interfaces/auth.interface';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/auth.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenResponse, LogoutResponse } from './interfaces/auth.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<RegisterResponse>;
    verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResponse>;
    login(dto: LoginDto, req: Request): Promise<LoginResponse>;
    refresh(dto: RefreshTokenDto): Promise<RefreshTokenResponse>;
    logout(dto: RefreshTokenDto): Promise<LogoutResponse>;
}
