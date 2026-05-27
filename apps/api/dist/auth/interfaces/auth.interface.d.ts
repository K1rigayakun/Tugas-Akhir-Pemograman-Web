export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    type: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface UserFromToken {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
}
export interface RegisterResponse {
    message: string;
    userId: string;
    email: string;
}
export interface OtpContext {
    plainOtp: string;
    otpHash: string;
    otpExpiresAt: Date;
}
export interface RegisterResponse {
    message: string;
    userId: string;
    email: string;
}
export interface OtpContext {
    plainOtp: string;
    otpHash: string;
    otpExpiresAt: Date;
}
export interface VerifyEmailResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}
export interface LoginResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}
export interface LogoutResponse {
    message: string;
}
