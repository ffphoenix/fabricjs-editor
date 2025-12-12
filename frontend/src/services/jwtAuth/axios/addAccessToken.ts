import type { AxiosInstance } from "axios";
import type { CustomInternalAxiosRequestConfig, TokenManager } from "../types";

export default (instance: AxiosInstance, tokenManager: TokenManager) => {
  instance.interceptors.request.use((config: CustomInternalAxiosRequestConfig) => {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken && !config?.skipAuthTokenAdding) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });
};
