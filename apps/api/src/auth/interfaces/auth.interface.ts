export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  rank: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
  devOtp?: string;
}

export interface AuthResponse extends TokenPair {
  message: string;
  user: AuthUser;
}

export type VerifyEmailResponse = AuthResponse;
export type LoginResponse = 
  | AuthResponse 
  | { 
      requires2fa: true; 
      requires2faSetup: boolean; 
      tempToken: string; 
      message: string; 
      qrCodeUrl?: string; 
      secret?: string;
    };
export type RefreshTokenResponse = TokenPair;

export interface LogoutResponse {
  message: string;
}
