// src/services/http.service.ts
// Axios instance with interceptors for JWT auth, token refresh, and error handling

import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { AppConfig } from '@/config/app.config';
import { AuthTokens } from '@/types/auth.types';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token as string);
  });
  failedQueue = [];
};

const httpClient: AxiosInstance = axios.create({
  baseURL: AppConfig.apiBaseUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request interceptor ───────────────────────────────────────────────────────
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AppConfig.tokenKey);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auth endpoints must never trigger the token-refresh logic — they either don't
// need authentication or ARE the authentication flow.
const NO_REFRESH_URLS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/send-2fa',
  '/auth/verify-2fa',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/validate-reset-token',
];

const isAuthEndpoint = (url?: string) =>
  NO_REFRESH_URLS.some((path) => url?.includes(path));

// ─── Response interceptor ─────────────────────────────────────────────────────
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(AppConfig.refreshTokenKey);
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<AuthTokens>(
          `${AppConfig.apiBaseUrl}/auth/refresh`,
          { refreshToken },
        );
        localStorage.setItem(AppConfig.tokenKey, data.accessToken);
        localStorage.setItem(AppConfig.refreshTokenKey, data.refreshToken);
        httpClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        return httpClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default httpClient;
