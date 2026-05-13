// src/services/auth.service.ts

import httpClient from './http.service';
import { AuthTokens, LoginRequest, UserProfile } from '@/types/auth.types';

const AuthService = {
  /** Authenticate with email + password. Returns JWT tokens. */
  login: async (payload: LoginRequest): Promise<AuthTokens> => {
    const { data } = await httpClient.post<AuthTokens>('/auth/login', payload);
    return data;
  },

  /** Fetch authenticated user's profile from GET /api/auth/me */
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await httpClient.get<UserProfile>('/auth/me');
    return data;
  },

  /** Logout — invalidates the refresh token server-side. */
  logout: async (refreshToken: string): Promise<void> => {
    await httpClient.post('/auth/logout', { refreshToken });
  },

  /** Request a password-reset email. */
  forgotPassword: async (email: string): Promise<void> => {
    await httpClient.post('/auth/forgot-password', { email });
  },

  /**
   * Send the 2FA auth code email after a successful password login.
   * POST /api/auth/send-2fa  { email }
   * The API generates a 6-digit OTP, stores it server-side, and emails it.
   */
  sendTwoFactorCode: async (email: string): Promise<void> => {
    await httpClient.post('/auth/send-2fa', { email });
  },

  /**
   * Verify the 6-digit OTP the user received by email.
   * POST /api/auth/verify-2fa  { email, code }
   */
  verifyTwoFactor: async (email: string, code: string): Promise<void> => {
    await httpClient.post('/auth/verify-2fa', { email, code });
  },
};

export default AuthService;
