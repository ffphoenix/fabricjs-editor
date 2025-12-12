import type { JwtTokens, TokenManager } from "./types";

const accessTokenKey = "access-token";
const refreshTokenKey = "refresh-token";
const tokenRefreshedAt = "token-refreshed-at";

const saveTokensDefault = (tokens: JwtTokens) => {
  localStorage.setItem(accessTokenKey, tokens.accessToken);
  localStorage.setItem(refreshTokenKey, tokens.refreshToken);
  localStorage.setItem(tokenRefreshedAt, Date.now().toString());
};

const deleteTokensDefault = () => {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
};

const isAuthenticatedDefault = () => localStorage.getItem(accessTokenKey) !== null;

const getAccessTokenDefault = () => localStorage.getItem(accessTokenKey);
const getRefreshTokenDefault = () => localStorage.getItem(refreshTokenKey);
const getTokenRefreshedAtDefault = () => localStorage.getItem(tokenRefreshedAt);

type TokensManagerProps = {
  saveTokens?: (tokens: JwtTokens) => void;
  deleteTokens?: () => void;
  isAuthenticated?: () => boolean;
  getAccessToken?: () => string | null;
  getRefreshToken?: () => string | null;
  getTokenRefreshedAt?: () => string | null;
};

export default ({
  saveTokens,
  deleteTokens,
  isAuthenticated,
  getAccessToken,
  getRefreshToken,
  getTokenRefreshedAt,
}: TokensManagerProps): TokenManager => {
  let refreshingStatus: boolean = false;
  return {
    saveTokens: saveTokens ?? saveTokensDefault,
    deleteTokens: deleteTokens ?? deleteTokensDefault,
    isAuthenticated: isAuthenticated ?? isAuthenticatedDefault,
    getAccessToken: getAccessToken ?? getAccessTokenDefault,
    getRefreshToken: getRefreshToken ?? getRefreshTokenDefault,
    getTokenRefreshedAt: getTokenRefreshedAt ?? getTokenRefreshedAtDefault,
    isRefreshing: () => refreshingStatus,
    setRefreshing: (status: boolean) => {
      refreshingStatus = status;
    },
  };
};
