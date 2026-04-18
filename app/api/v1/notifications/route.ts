import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { paginationSchema } from "@/lib/validators";
import { paginate, paginatedResponse } from "@/lib/utils";

// GET /api/v1/notifications
export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session!.user.id },
        orderBy: { createdAt: "desc" },
        ...paginate(parsed.page, parsed.limit),
      }),
      prisma.notification.count({ where: { userId: session!.user.id } }),
      prisma.notification.count({ where: { userId: session!.user.id, isRead: false } }),
    ]);

    return NextResponse.json({
      ...paginatedResponse(notifications, total, parsed.page, parsed.limit),
      unreadCount,
    });
  } catch (err) {
    console.error("[NOTIFICATIONS_GET]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
