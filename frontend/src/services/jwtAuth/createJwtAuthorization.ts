import type { AxiosInstance, AxiosResponse } from "axios";
import type { JwtTokens, TokenManager } from "./types";
import addAccessToken from "./axios/addAccessToken";
import refreshAfterExpireFunc from "./axios/registerErrorInterceptor";
import { tokenManager } from "../../utils/apiClient";

//@todo implement retry refreshWhenHidden, retryOnFailure
type configProps = {
  tokenManager: TokenManager;
  refreshCallback: () => Promise<AxiosResponse<JwtTokens>>;
  logoutCallback?: () => void;
  clientType?: "axios" | "fetch";
  axiosInstance?: AxiosInstance;
  refreshAfterExpire?: boolean;
  tokenExpireTime: number;
  refreshOnWindowFocus?: boolean;
  refreshBeforeExpire?: boolean;
  // refreshWhenHidden?: boolean;
  // retryOnFailure?: boolean;
  retryDelay?: number;
  retryCount?: number;
  retryOnStatus?: number[];

  redirectURI?: string;
};

let timeOutId: number = 0;
const refreshTokenBeforeSeconds = 15;

const calculateTimeToTokenExpire = (tokenManager: TokenManager, tokenExpireTime: number): number => {
  const lastRefreshAt = tokenManager.getTokenRefreshedAt();
  if (lastRefreshAt !== null) {
    return tokenExpireTime * 1000 - (Date.now() - parseInt(lastRefreshAt));
  }
  return tokenExpireTime * 1000;
};

const initRefreshByInterval = (
  refreshCallback: () => Promise<AxiosResponse<JwtTokens>>,
  tokenManager: TokenManager,
  tokenExpireTime = 60,
  logoutCallback: () => void,
) => {
  const refreshTime = calculateTimeToTokenExpire(tokenManager, tokenExpireTime) - refreshTokenBeforeSeconds * 1000;
  timeOutId = setTimeout(
    async () => {
      if (tokenManager.getRefreshToken() !== null) {
        try {
          const response = await refreshCallback();
          tokenManager.saveTokens(response.data);
        } catch {
          logoutCallback();
        }
      }
      initRefreshByInterval(refreshCallback, tokenManager, tokenExpireTime, logoutCallback);
    },
    refreshTime > 0 ? refreshTime : 1000,
  );
};

const initRefreshOnWindowFocus = (
  refreshCallback: () => Promise<AxiosResponse<JwtTokens>>,
  tokenManager: TokenManager,
  tokenExpireTime: number,
  refreshBeforeExpire = true,
  logoutCallback: () => void,
) => {
  window.addEventListener("focus", async () => {
    if (
      tokenManager.getRefreshToken() !== null &&
      calculateTimeToTokenExpire(tokenManager, tokenExpireTime) < refreshTokenBeforeSeconds * 1000
    ) {
      clearTimeout(timeOutId);
      try {
        const response = await refreshCallback();
        tokenManager.saveTokens(response.data);
      } catch {
        logoutCallback();
      }
      if (refreshBeforeExpire) initRefreshByInterval(refreshCallback, tokenManager, tokenExpireTime, logoutCallback);
    }
  });
};

const defaultLogoutCallback = (tokenManager: TokenManager) => {
  tokenManager.deleteTokens();
  if (window.location.pathname !== "/auth/login") {
    window.location.href = "/auth/login";
  }
};

export default ({
  tokenManager,
  axiosInstance,
  clientType = "axios",
  refreshAfterExpire = true,
  tokenExpireTime = 60,
  refreshOnWindowFocus = true,
  refreshBeforeExpire = true,
  refreshCallback,
  logoutCallback,
}: configProps) => {
  if (clientType === "axios")
    if (axiosInstance === undefined) {
      throw new Error("axiosInstance is required for axios clientType");
    } else {
      const logout = logoutCallback ?? (() => defaultLogoutCallback(tokenManager));
      addAccessToken(axiosInstance, tokenManager);
      if (refreshBeforeExpire) {
        initRefreshByInterval(refreshCallback, tokenManager, tokenExpireTime, logout);
      }

      if (refreshOnWindowFocus) {
        initRefreshOnWindowFocus(refreshCallback, tokenManager, tokenExpireTime, !!refreshBeforeExpire, logout);
      }

      if (refreshAfterExpire) {
        refreshAfterExpireFunc({ axiosInstance, refreshCallback, logout, tokenManager });
      }
    }
};
