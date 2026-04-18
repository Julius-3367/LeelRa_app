import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/rbac";
import { updateActivitySchema, paginationSchema } from "@/lib/validators";
import { paginate, paginatedResponse, createAuditLog } from "@/lib/utils";
import { UserRole, ActivityStatus } from "@prisma/client";

// GET /api/v1/activities
export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const month = searchParams.get("month"); // YYYY-MM format

    const where: Record<string, unknown> = {
      status: ActivityStatus.UPCOMING,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
      ];
    }

    if (month) {
      const [year, mon] = month.split("-").map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 0, 23, 59, 59);
      where.eventDate = { gte: start, lte: end };
    } else if (dateFrom || dateTo) {
      where.eventDate = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          request: {
            select: {
              organiserName: true,
              contactPhone: true,
              expectedAttendance: true,
              submittedBy: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { eventDate: "asc" },
        ...paginate(parsed.page, parsed.limit),
      }),
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(activities, total, parsed.page, parsed.limit));
  } catch (err) {
    console.error("[ACTIVITIES_GET]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
