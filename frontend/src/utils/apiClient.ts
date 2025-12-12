import { Api } from "../../generated/api";
import type { AxiosRequestConfig } from "axios";
import createJwtAuthManager from "../services/jwtAuth/createJwtAuthorization";
import createTokensManager from "../services/jwtAuth/createTokensManager";

const apiClient = new Api({
  secure: false,
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000, // 5 seconds
  headers: {
    "Content-Type": "application/json",
  },
} as AxiosRequestConfig);

export const tokenManager = createTokensManager({});

createJwtAuthManager({
  tokenManager,
  axiosInstance: apiClient.instance,
  tokenExpireTime: import.meta.env.VITE_JWT_EXPIRE_TIME,
  refreshCallback: () =>
    apiClient.auth.refresh({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      skipAuthTokenAdding: true,
      headers: {
        Authorization: `Bearer ${tokenManager.getRefreshToken()}`,
      },
    }),
  redirectURI: "/auth/login",
});
export default apiClient;
