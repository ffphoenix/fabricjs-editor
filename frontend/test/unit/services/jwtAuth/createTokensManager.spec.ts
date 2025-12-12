import { describe, it, expect, beforeEach } from "vitest";
import createTokensManager from "../../../../src/services/jwtAuth/createTokensManager";

const ACCESS_KEY = "access-token";
const REFRESH_KEY = "refresh-token";
const REFRESHED_AT = "token-refreshed-at";

describe("createTokensManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and reads tokens and refreshedAt timestamp", () => {
    const tm = createTokensManager({});
    const start = Date.now();
    tm.saveTokens({ accessToken: "a1", refreshToken: "r1" });

    expect(localStorage.getItem(ACCESS_KEY)).toBe("a1");
    expect(localStorage.getItem(REFRESH_KEY)).toBe("r1");
    const ts = localStorage.getItem(REFRESHED_AT);
    expect(ts).not.toBeNull();
    expect(Number(ts!)).toBeGreaterThanOrEqual(start);
    expect(tm.getAccessToken()).toBe("a1");
    expect(tm.getRefreshToken()).toBe("r1");
    expect(tm.getTokenRefreshedAt()).toBe(ts);
  });

  it("isAuthenticated reflects presence of access token", () => {
    const tm = createTokensManager({});
    expect(tm.isAuthenticated()).toBe(false);
    localStorage.setItem(ACCESS_KEY, "a2");
    expect(tm.isAuthenticated()).toBe(true);
  });

  it("deletes tokens", () => {
    const tm = createTokensManager({});
    tm.saveTokens({ accessToken: "a1", refreshToken: "r1" });
    tm.deleteTokens();
    expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
  });

  it("tracks refreshing state", () => {
    const tm = createTokensManager({});
    expect(tm.isRefreshing()).toBe(false);
    tm.setRefreshing(true);
    expect(tm.isRefreshing()).toBe(true);
    tm.setRefreshing(false);
    expect(tm.isRefreshing()).toBe(false);
  });
});
