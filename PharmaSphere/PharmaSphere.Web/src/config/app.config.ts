// src/config/app.config.ts
// Central configuration — reads from .env files via Vite's import.meta.env

export const AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  appName: (import.meta.env.VITE_APP_NAME as string) ?? 'EnterpriseApp',
  tokenKey: (import.meta.env.VITE_TOKEN_KEY as string) ?? 'auth_access_token',
  refreshTokenKey:
    (import.meta.env.VITE_REFRESH_TOKEN_KEY as string) ?? 'auth_refresh_token',
} as const;
