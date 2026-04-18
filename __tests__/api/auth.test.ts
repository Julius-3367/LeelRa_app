/**
 * Integration tests for the authentication API routes.
 * Uses jest-mock-extended to mock Prisma client.
 * Requires: npm install --save-dev jest-mock-extended @types/bcryptjs
 */

import { NextRequest } from "next/server";

// Mock prisma before importing routes
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    passwordResetToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: { create: jest.fn() },
  },
}));

jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  passwordResetEmailTemplate: jest.fn().mockReturnValue("<html>Reset</html>"),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkLoginRateLimit: jest.fn().mockReturnValue({ allowed: true }),
  resetLoginAttempts: jest.fn(),
  getClientIpFromRequest: jest.fn().mockReturnValue("127.0.0.1"),
}));

const { prisma } = require("@/lib/prisma");

describe("POST /api/v1/auth/forgot-password", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 even when user does not exist (prevents email enumeration)", async () => {
    const { POST } = await import("@/app/api/v1/auth/forgot-password/route");
    prisma.user.findUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "unknown@example.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it("creates reset token when user exists", async () => {
    const { POST } = await import("@/app/api/v1/auth/forgot-password/route");
    prisma.user.findUnique.mockResolvedValue({ id: "user-1", email: "admin@leelra.ke", name: "Admin" });
    prisma.passwordResetToken.create.mockResolvedValue({ token: "test-token" });
    const req = new NextRequest("http://localhost/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "admin@leelra.ke" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.passwordResetToken.create).toHaveBeenCalled();
  });

  it("returns 422 for invalid email format", async () => {
    const { POST } = await import("@/app/api/v1/auth/forgot-password/route");
    const req = new NextRequest("http://localhost/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });
});
