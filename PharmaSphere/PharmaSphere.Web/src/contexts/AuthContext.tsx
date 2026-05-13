// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { AppConfig } from '@/config/app.config';
import AuthService from '@/services/auth.service';
import {
  AuthState,
  AuthTokens,
  LoginRequest,
  UserProfile,
} from '@/types/auth.types';

// ─── Actions ─────────────────────────────────────────────────────────────────
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TWO_FACTOR_REQUIRED'; payload: { email: string } }
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserProfile; tokens: AuthTokens } }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  pendingTwoFactor: false,
  pendingEmail: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TWO_FACTOR_REQUIRED':
      return {
        ...state,
        isLoading: false,
        pendingTwoFactor: true,
        pendingEmail: action.payload.email,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        pendingTwoFactor: false,
        pendingEmail: null,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (payload: LoginRequest) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  resendTwoFactorCode: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore existing session from storage on app load
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem(AppConfig.tokenKey);
      const refreshToken = localStorage.getItem(AppConfig.refreshTokenKey);
      if (!token || !refreshToken) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        const user = await AuthService.getProfile();
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user,
            tokens: { accessToken: token, refreshToken, expiresIn: 0 },
          },
        });
      } catch {
        localStorage.removeItem(AppConfig.tokenKey);
        localStorage.removeItem(AppConfig.refreshTokenKey);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    restore();
  }, []);

  /**
   * Step 1 of auth: validate credentials.
   * On success store tokens, move to TWO_FACTOR_REQUIRED, then fire the
   * 2FA email in the background. Sending the email is best-effort — the
   * user can always hit "Resend" on the 2FA page if delivery fails.
   */
  const login = useCallback(async (payload: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const tokens = await AuthService.login(payload);
    // Store tokens so the interceptor can attach them for subsequent calls
    localStorage.setItem(AppConfig.tokenKey, tokens.accessToken);
    localStorage.setItem(AppConfig.refreshTokenKey, tokens.refreshToken);
    if (payload.rememberMe) {
      sessionStorage.setItem(AppConfig.tokenKey, tokens.accessToken);
    }
    // Move to 2FA step immediately — redirect happens before code is sent
    dispatch({
      type: 'TWO_FACTOR_REQUIRED',
      payload: { email: payload.email },
    });
    // Send the OTP email in the background; failures are recoverable via Resend
    AuthService.sendTwoFactorCode(payload.email).catch(() => {});
  }, []);

  /**
   * Step 2 of auth: verify the OTP the user received by email.
   * On success we fetch the user profile and complete login.
   */
  const verifyTwoFactor = useCallback(
    async (code: string) => {
      if (!state.pendingEmail) throw new Error('No pending 2FA session.');
      await AuthService.verifyTwoFactor(state.pendingEmail, code);
      const user = await AuthService.getProfile();
      const tokens: AuthTokens = {
        accessToken: localStorage.getItem(AppConfig.tokenKey) ?? '',
        refreshToken: localStorage.getItem(AppConfig.refreshTokenKey) ?? '',
        expiresIn: 0,
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } });
    },
    [state.pendingEmail],
  );

  /** Resend a fresh OTP to the pending email. */
  const resendTwoFactorCode = useCallback(async () => {
    if (!state.pendingEmail) throw new Error('No pending 2FA session.');
    await AuthService.sendTwoFactorCode(state.pendingEmail);
  }, [state.pendingEmail]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(AppConfig.refreshTokenKey);
    try {
      if (refreshToken) await AuthService.logout(refreshToken);
    } finally {
      localStorage.removeItem(AppConfig.tokenKey);
      localStorage.removeItem(AppConfig.refreshTokenKey);
      sessionStorage.clear();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, verifyTwoFactor, resendTwoFactorCode, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
