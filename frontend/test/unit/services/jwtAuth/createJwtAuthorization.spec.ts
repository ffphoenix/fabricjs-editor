import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import createJwtAuthorization from "../../../../src/services/jwtAuth/createJwtAuthorization";
import type { TokenManager, JwtTokens } from "../../../../src/services/jwtAuth/types";

type ReqHandler = (config: any) => any;
type ResErrorHandler = (error: any) => Promise<any>;

const makeAxiosMock = () => {
  let reqHandler: ReqHandler | null = null;
  let resErrorHandler: ResErrorHandler | null = null;

  const instance: any = (config?: any) => instance.request(config ?? {});
  instance.interceptors = {
    request: {
      use: (fn: ReqHandler) => {
        reqHandler = fn;
      },
    },
    response: {
      use: (_ok: any, err: ResErrorHandler) => {
        resErrorHandler = err;
      },
    },
  };
  instance.request = (config: any) => {
    const base = { headers: {}, ...config };
    const cfg = reqHandler ? reqHandler(base) : base;
    return Promise.resolve({ config: cfg, status: 200, data: null });
  };
  instance.trigger401 = (originalConfig: any) => {
    // Simulate axios calling the response error handler
    if (!resErrorHandler) throw new Error("no error handler");
    const error = { config: originalConfig, response: { status: 401 } };
    return resErrorHandler(error);
  };

  return instance;
};

const makeTokenManager = (overrides: Partial<TokenManager> = {}): TokenManager => {
  let refreshing = false;
  return {
    getAccessToken: () => "AT",
    getRefreshToken: () => "RT",
    getTokenRefreshedAt: () => String(Date.now()),
    saveTokens: vi.fn(),
    deleteTokens: vi.fn(),
    isAuthenticated: () => true,
    isRefreshing: () => refreshing,
    setRefreshing: (v: boolean) => {
      refreshing = v;
    },
    ...overrides,
  } as TokenManager;
};

describe("createJwtAuthorization", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds Authorization header via request interceptor", async () => {
    const axios = makeAxiosMock();
    const tm = makeTokenManager({ getAccessToken: () => "abc" });

    createJwtAuthorization({ tokenManager: tm, axiosInstance: axios, refreshAfterExpire: false });

    const res = await axios.request({ url: "/ping" });
    expect(res.config.headers.Authorization).toBe("Bearer abc");
  });

  it("schedules refreshBeforeExpire and calls refreshCallback", async () => {
    const axios = makeAxiosMock();
    const tm = makeTokenManager();
    const refreshed: JwtTokens = { accessToken: "newA", refreshToken: "newR" };
    const refreshCallback = vi.fn().mockResolvedValue({ data: refreshed });

    createJwtAuthorization({
      tokenManager: tm,
      axiosInstance: axios,
      tokenExpireTime: 1, // seconds
      refreshBeforeExpire: true,
      refreshAfterExpire: false,
      refreshOnWindowFocus: false,
      refreshCallback,
    });

    await vi.advanceTimersByTimeAsync(1000); // minimum delay when negative
    expect(refreshCallback).toHaveBeenCalledTimes(1);
    expect(tm.saveTokens as any).toHaveBeenCalledWith(refreshed);
  });

  it("refreshes on window focus when near expiry", async () => {
    const axios = makeAxiosMock();
    const tm = makeTokenManager({
      getTokenRefreshedAt: () => String(Date.now() - 60000 + 12000), // expire in < 15s
    });
    const refreshed: JwtTokens = { accessToken: "newA", refreshToken: "newR" };
    const refreshCallback = vi.fn().mockResolvedValue({ data: refreshed });
    createJwtAuthorization({
      tokenManager: tm,
      axiosInstance: axios,
      tokenExpireTime: 60,
      refreshBeforeExpire: false,
      refreshOnWindowFocus: true,
      refreshAfterExpire: false,
      refreshCallback,
    });

    window.dispatchEvent(new Event("focus"));
    // The callback is async; allow microtasks to flush
    await Promise.resolve();

    expect(refreshCallback).toHaveBeenCalledTimes(1);
    expect(tm.saveTokens as any).toHaveBeenCalledWith(refreshed);
  });

  it("handles 401 by refreshing and retrying request", async () => {
    const axios: any = makeAxiosMock();
    // Force branch in handleUnauthorizedError: tokenManager.isRefreshing() returns true
    let refreshing = true;
    const tm = makeTokenManager({
      isRefreshing: () => refreshing,
      setRefreshing: (v: boolean) => {
        refreshing = v;
      },
    });

    const refreshed: JwtTokens = { accessToken: "newA", refreshToken: "newR" };
    const refreshCallback = vi.fn().mockResolvedValue({ data: refreshed });

    // When retried, resolve with ok
    const okResponse = { status: 200, data: { ok: true } };
    axios.request = vi.fn().mockResolvedValue(okResponse);

    createJwtAuthorization({
      tokenManager: tm,
      axiosInstance: axios,
      refreshAfterExpire: true,
      refreshBeforeExpire: false,
      refreshOnWindowFocus: false,
      refreshCallback,
      redirectURI: "/",
    });

    const promise = axios.trigger401({ url: "/secure" });
    const res = await promise;
    expect(refreshCallback).toHaveBeenCalledTimes(1);
    expect(tm.saveTokens as any).toHaveBeenCalledWith(refreshed);
    expect(res).toBe(okResponse);
  });
});
