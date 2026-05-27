import { ThrottlerGuard } from '@nestjs/throttler';
export declare class AuthThrottlerGuard extends ThrottlerGuard {
    protected throwThrottlingException(): Promise<void>;
}
