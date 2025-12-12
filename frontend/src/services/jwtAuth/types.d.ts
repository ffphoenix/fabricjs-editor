import type { InternalAxiosRequestConfig } from "axios";

export type JwtTokens = { accessToken: string; refreshToken: string };

export type TokenManager = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  getTokenRefreshedAt: () => string | null;
  saveTokens: (tokens: JwtTokens) => void;
  isAuthenticated: () => boolean;
  deleteTokens: () => void;
  isRefreshing: () => boolean;
  setRefreshing: (isRefreshing: boolean) => void;
};

export type CustomInternalAxiosRequestConfig = InternalAxiosRequestConfig & {
  skipAuthTokenAdding?: boolean;
};
