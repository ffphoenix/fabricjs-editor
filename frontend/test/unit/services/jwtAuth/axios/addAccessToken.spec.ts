import { describe, it, expect } from "vitest";
import addAccessToken from "../../../../../src/services/jwtAuth/axios/addAccessToken";
import type { TokenManager } from "../../../../../src/services/jwtAuth/types";

const makeAxiosMock = () => {
  let reqHandler: ((config: any) => any) | null = null;
  const instance: any = (config?: any) => instance.request(config ?? {});
  instance.interceptors = {
    request: {
      use: (fn: (config: any) => any) => {
        reqHandler = fn;
      },
    },
  };
  instance.request = (config: any) => {
    const base = { headers: {}, ...config };
    const cfg = reqHandler ? reqHandler(base) : base;
    return Promise.resolve({ config: cfg, status: 200, data: null });
  };
  return instance;
};

const tm = (access: string | null): TokenManager => ({
  getAccessToken: () => access,
  getRefreshToken: () => null,
  getTokenRefreshedAt: () => null,
  saveTokens: () => {},
  isAuthenticated: () => Boolean(access),
  deleteTokens: () => {},
  isRefreshing: () => false,
  setRefreshing: () => {},
});

describe("axios/addAccessToken", () => {
  it("adds Authorization header when access token exists", async () => {
    const axios = makeAxiosMock();
    addAccessToken(axios, tm("abc123"));
    const res = await axios.request({ url: "/foo" });
    expect(res.config.headers.Authorization).toBe("Bearer abc123");
  });

  it("does not add Authorization header when no access token", async () => {
    const axios = makeAxiosMock();
    addAccessToken(axios, tm(null));
    const res = await axios.request({ url: "/bar" });
    expect(res.config.headers.Authorization).toBeUndefined();
  });
});
