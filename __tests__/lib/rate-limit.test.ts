import { checkLoginRateLimit, resetLoginAttempts } from "@/lib/rate-limit";

describe("Rate Limiter", () => {
  const testIp = "10.0.0.1";

  beforeEach(() => {
    resetLoginAttempts(testIp);
  });

  it("allows requests under the limit", () => {
    for (let i = 0; i < 4; i++) {
      const result = checkLoginRateLimit(testIp);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks after 5 failed attempts", () => {
    for (let i = 0; i < 5; i++) {
      checkLoginRateLimit(testIp);
    }
    const result = checkLoginRateLimit(testIp);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("resets counter", () => {
    for (let i = 0; i < 5; i++) {
      checkLoginRateLimit(testIp);
    }
    resetLoginAttempts(testIp);
    const result = checkLoginRateLimit(testIp);
    expect(result.allowed).toBe(true);
  });
});
