// src/types/auth.types.ts

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface TwoFactorVerifyRequest {
  email: string;
  code: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

// Aligns with GET /api/auth/me → UserProfileDto
export interface UserProfile {
  userId: number;
  email: string;
  roleName: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // 2FA pending — login succeeded but OTP not yet verified
  pendingTwoFactor: boolean;
  pendingEmail: string | null;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
