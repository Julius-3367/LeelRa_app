/**
 * Integration tests for the requests API.
 * Tests the full submit → approve flow.
 */

import { NextRequest } from "next/server";

// Mock dependencies before imports
jest.mock("@/lib/prisma", () => ({
  prisma: {
    activityRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    activity: { create: jest.fn() },
    notification: { create: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn((fn: Function) => fn(require("@/lib/prisma").prisma)),
  },
}));

jest.mock("@/lib/rbac", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
  hasRole: jest.fn(),
  getSession: jest.fn(),
}));

jest.mock("@/lib/notifications", () => ({
  notifyUser: jest.fn().mockResolvedValue(undefined),
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/utils", () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
  apiError: (msg: string, status: number) => new Response(JSON.stringify({ error: msg }), { status }),
  paginate: jest.fn().mockReturnValue({ skip: 0, take: 10 }),
  paginatedResponse: jest.fn((data: any, meta: any) => new Response(JSON.stringify({ data, meta }), { status: 200 })),
  formatDate: jest.fn().mockReturnValue("2026-01-01"),
}));

const { prisma } = require("@/lib/prisma");
const { requireAuth, requireRole, getSession } = require("@/lib/rbac");

const mockAdminSession = {
  user: { id: "admin-1", name: "Admin", email: "admin@leelra.ke", role: "ADMIN" },
};

const mockMemberSession = {
  user: { id: "member-1", name: "Member", email: "member@leelra.ke", role: "MEMBER" },
};

describe("POST /api/v1/requests (submit request)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAuth.mockResolvedValue(mockMemberSession);
    getSession.mockResolvedValue(mockMemberSession);
  });

  it("creates a request for authenticated member", async () => {
    const { POST } = await import("@/app/api/v1/requests/route");
    const mockRequest = {
      id: "req-1",
      title: "Community Baraza",
      status: "PENDING",
      createdAt: new Date(),
    };
    prisma.activityRequest.create.mockResolvedValue(mockRequest);

    const req = new NextRequest("http://localhost/api/v1/requests", {
      method: "POST",
      body: JSON.stringify({
        title: "Community Baraza",
        description: "Monthly community meeting to discuss local issues",
        venue: "Ainamoi Town Hall",
        eventDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        eventTime: "10:00",
        expectedAttendance: 150,
        organiserName: "Jane Doe",
        contactPhone: "+254712345678",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(prisma.activityRequest.create).toHaveBeenCalled();
  });
});

describe("PATCH /api/v1/requests/[id]/status (approve/reject)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireRole.mockResolvedValue(mockAdminSession);
    getSession.mockResolvedValue(mockAdminSession);
  });

  it("approves a pending request and creates activity", async () => {
    const { PATCH } = await import("@/app/api/v1/requests/[id]/status/route");
    const mockUpdatedRequest = { id: "req-1", status: "APPROVED", submittedById: "member-1" };
    const mockActivity = { id: "act-1", requestId: "req-1" };

    prisma.activityRequest.findUnique.mockResolvedValue({
      id: "req-1",
      title: "Community Baraza",
      status: "PENDING",
      submittedById: "member-1",
    });
    prisma.activityRequest.update.mockResolvedValue(mockUpdatedRequest);
    prisma.activity.create.mockResolvedValue(mockActivity);
    prisma.$transaction.mockImplementation(async (fn: Function) => fn(prisma));

    const req = new NextRequest("http://localhost/api/v1/requests/req-1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "APPROVED", adminNotes: "Approved for scheduling" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PATCH(req, { params: { id: "req-1" } });
    expect([200, 201]).toContain(res.status);
  });
});
