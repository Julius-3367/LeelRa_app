import { hasRole, hasAnyRole } from "@/lib/rbac";

describe("hasRole", () => {
  it("returns true when user has required role", () => {
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
  });
  it("returns true when user has higher role", () => {
    expect(hasRole("SUPER_ADMIN", "ADMIN")).toBe(true);
  });
  it("returns false when user has lower role", () => {
    expect(hasRole("MEMBER", "ADMIN")).toBe(false);
  });
  it("returns false for unknown role", () => {
    expect(hasRole("UNKNOWN" as any, "MEMBER")).toBe(false);
  });
});

describe("hasAnyRole", () => {
  it("returns true when user has one of the roles", () => {
    expect(hasAnyRole("SUPPORT_STAFF", ["ADMIN", "SUPPORT_STAFF"])).toBe(true);
  });
  it("returns false when user has none of the roles", () => {
    expect(hasAnyRole("MEMBER", ["ADMIN", "SUPER_ADMIN"])).toBe(false);
  });
});
