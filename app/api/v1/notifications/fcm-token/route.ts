import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

// POST /api/v1/notifications/fcm-token
export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "FCM token is required", code: "VALIDATION_ERROR", statusCode: 400 },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session!.user.id },
      data: { fcmToken: token },
    });

    return NextResponse.json({ message: "FCM token registered" });
  } catch (err) {
    console.error("[FCM_TOKEN]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
