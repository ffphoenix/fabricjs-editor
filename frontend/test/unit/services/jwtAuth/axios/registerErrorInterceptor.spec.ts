import { describe, it, expect, vi, beforeEach } from "vitest";
import registerErrorInterceptor from "../../../../../src/services/jwtAuth/axios/registerErrorInterceptor";
import type { TokenManager, JwtTokens } from "../../../../../src/services/jwtAuth/types";

type ResErrorHandler = (error: any) => Promise<any>;

const makeAxiosMock = () => {
  let resErrorHandler: ResErrorHandler | null = null;

  const instance: any = (config?: any) => instance.request(config ?? {});
  instance.interceptors = {
    response: {
      use: (_ok: any, err: ResErrorHandler) => {
        resErrorHandler = err;
      },
    },
  };
  instance.request = vi.fn().mockResolvedValue({ status: 200, data: { ok: true } });
  instance.trigger401 = (originalConfig: any) => {
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

describe("axios/registerErrorInterceptor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("refreshes token and retries the request on 401 when refreshing", async () => {
    const axios = makeAxiosMock();
    const tm = makeTokenManager();
    tm.setRefreshing(true);

    const refreshed: JwtTokens = { accessToken: "newA", refreshToken: "newR" };
    const refreshCallback = vi.fn().mockResolvedValue({ data: refreshed });

    registerErrorInterceptor({ axiosInstance: axios, refreshCallback, redirectURI: "/login", tokenManager: tm });

    const originalConfig = { url: "/secure" };
    const res = await axios.trigger401(originalConfig);

    expect(refreshCallback).toHaveBeenCalledTimes(1);
    expect(tm.saveTokens as any).toHaveBeenCalledWith(refreshed);
    expect(axios.request).toHaveBeenCalledWith(originalConfig);
    expect(res).toEqual({ status: 200, data: { ok: true } });
  });

  it("rejects when error is not retryable (missing tokens)", async () => {
    const axios = makeAxiosMock();
    const tm = makeTokenManager({ getAccessToken: () => null, getRefreshToken: () => null });
    const refreshCallback = vi.fn();

    registerErrorInterceptor({ axiosInstance: axios, refreshCallback, redirectURI: "/", tokenManager: tm });

    await expect(axios.trigger401({ url: "/x" })).rejects.toBeTruthy();
    expect(refreshCallback).not.toHaveBeenCalled();
  });

  it("queues 401 when not refreshing, then flushes queue after a subsequent refresh", async () => {
    const axios = makeAxiosMock();
    const tm = makeTokenManager();
    // initially not refreshing -> first call should queue
    tm.setRefreshing(false);

    const refreshed: JwtTokens = { accessToken: "A2", refreshToken: "R2" };
    const refreshCallback = vi.fn().mockResolvedValue({ data: refreshed });

    registerErrorInterceptor({ axiosInstance: axios, refreshCallback, redirectURI: "/", tokenManager: tm });

    const p1 = axios.trigger401({ url: "/queued" });

    // Now simulate that we are in a refreshing state for the next 401
    tm.setRefreshing(true);
    const p2 = axios.trigger401({ url: "/second" });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(refreshCallback).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({ url: "/queued" });
    expect(axios.request).toHaveBeenCalledWith({ url: "/second" });
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
  });

  it("on refresh failure, clears tokens and redirects", async () => {
    const axios = makeAxiosMock();
    const tm = makeTokenManager();
    tm.setRefreshing(true);

    const refreshCallback = vi.fn().mockRejectedValue(new Error("refresh failed"));

    // Ensure starting path is different than redirectURI so redirect happens
    Object.defineProperty(window, "location", {
      value: { pathname: "/old", href: "/old" },
      writable: true,
    });

    registerErrorInterceptor({ axiosInstance: axios, refreshCallback, redirectURI: "/login", tokenManager: tm });

    await expect(axios.trigger401({ url: "/secure" })).rejects.toBeTruthy();
    expect(tm.deleteTokens as any).toHaveBeenCalled();
    expect(window.location.href).toBe("/login");
  });
});
