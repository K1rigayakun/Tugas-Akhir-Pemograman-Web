import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponse } from './interfaces/auth.interface';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailResponse } from './interfaces/auth.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<RegisterResponse>;
    verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResponse>;
}
