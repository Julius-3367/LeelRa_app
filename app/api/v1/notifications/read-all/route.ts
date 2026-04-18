import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

// PATCH /api/v1/notifications/read-all
export async function PATCH(request: NextRequest) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const { count } = await prisma.notification.updateMany({
      where: { userId: session!.user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ message: `Marked ${count} notifications as read` });
  } catch (err) {
    console.error("[NOTIFICATIONS_READ_ALL]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
