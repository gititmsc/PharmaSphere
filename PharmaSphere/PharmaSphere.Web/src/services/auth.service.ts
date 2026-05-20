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
   * Returns { code } when the server is in test mode (EnableTestMode=true) for auto-fill,
   * otherwise returns an empty object (204 No Content → no body).
   */
  sendTwoFactorCode: async (email: string): Promise<{ code?: string }> => {
    const res = await httpClient.post<{ code?: string } | null>('/auth/send-2fa', { email });
    return res.data ?? {};
  },

  /**
   * Verify the 6-digit OTP the user received by email.
   * POST /api/auth/verify-2fa  { email, code }
   */
  verifyTwoFactor: async (email: string, code: string): Promise<void> => {
    await httpClient.post('/auth/verify-2fa', { email, code });
  },

  /**
   * Validate a password-reset token (from the link in the email).
   * GET /api/auth/validate-reset-token?token=xxx
   * Returns { email } if the token is valid, throws 401 if not.
   */
  validateResetToken: async (token: string): Promise<{ email: string }> => {
    const { data } = await httpClient.get<{ email: string }>(
      `/auth/validate-reset-token?token=${encodeURIComponent(token)}`,
    );
    return data;
  },

  /**
   * Set a new password using a valid reset token.
   * POST /api/auth/reset-password  { token, newPassword }
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await httpClient.post('/auth/reset-password', { token, newPassword });
  },
};

export default AuthService;
