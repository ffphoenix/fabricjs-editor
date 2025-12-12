import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { JwtTokens, TokenManager } from "../types";

type RetryQueue = {
  config: AxiosRequestConfig;
  resolve: (response: AxiosResponse) => void;
  reject: (reason?: AxiosError) => void;
}[];

const retryQueue: RetryQueue = [];

type handleUnauthorizedErrorProps = {
  axiosInstance: AxiosInstance;
  refreshCallback: () => Promise<AxiosResponse<JwtTokens>>;
  originalConfig: AxiosRequestConfig;
  logout: () => void;
  tokenManager: TokenManager;
};
const handleUnauthorizedError = async ({
  refreshCallback,
  originalConfig,
  logout,
  axiosInstance,
  tokenManager,
}: handleUnauthorizedErrorProps) => {
  if (tokenManager.isRefreshing()) {
    tokenManager.setRefreshing(true);
    try {
      // Refresh the access token
      const newAccessTokens = (await refreshCallback()).data;
      console.log("newAccessTokens", newAccessTokens);
      tokenManager.saveTokens(newAccessTokens);

      retryQueue.forEach(({ config, resolve, reject }) => {
        axiosInstance
          .request(config)
          .then((response) => {
            resolve(response);
          })
          .catch((retryError) => reject(retryError));
      });
      return axiosInstance(originalConfig);
    } catch (refreshError) {
      logout();
      return Promise.reject(refreshError);
    } finally {
      retryQueue.length = 0;
      tokenManager.setRefreshing(false);
    }
  }

  return new Promise<AxiosResponse>((resolve, reject) => {
    retryQueue.push({ config: originalConfig, resolve, reject });
  });
};

const isRetryableError = (error: AxiosError, tokenManager: TokenManager) => {
  return (
    tokenManager.getRefreshToken() !== null &&
    tokenManager.getAccessToken() !== null &&
    error.config &&
    error.response?.status === 401
  );
};

export type errorInterceptorPops = {
  axiosInstance: AxiosInstance;
  logout: () => void;
  refreshCallback: () => Promise<AxiosResponse<JwtTokens>>;
  tokenManager: TokenManager;
};
export default ({ axiosInstance, logout, refreshCallback, tokenManager }: errorInterceptorPops) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (isRetryableError(error, tokenManager)) {
        return handleUnauthorizedError({
          axiosInstance,
          originalConfig: error.config,
          refreshCallback: refreshCallback,
          logout: logout,
          tokenManager,
        });
      }
      return Promise.reject(error);
    },
  );
};
