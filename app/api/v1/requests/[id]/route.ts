import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/rbac";
import { reviewRequestSchema } from "@/lib/validators";
import { createAuditLog } from "@/lib/utils";
import { notifyUser, triggerRealtime } from "@/lib/notifications";
import { sendEmail, approvalEmailTemplate } from "@/lib/email";
import { UserRole, RequestStatus, ActivityStatus, NotificationType } from "@prisma/client";

// GET /api/v1/requests/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const activityRequest = await prisma.activityRequest.findUnique({
      where: { id: params.id },
      include: {
        submittedBy: { select: { id: true, name: true, email: true, phone: true } },
        activity: true,
      },
    });

    if (!activityRequest) {
      return NextResponse.json(
        { error: "Request not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    // Members can only view their own requests
    if (
      session!.user.role === UserRole.MEMBER &&
      activityRequest.submittedById !== session!.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN", statusCode: 403 },
        { status: 403 }
      );
    }

    return NextResponse.json(activityRequest);
  } catch (err) {
    console.error("[REQUEST_GET]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/requests/:id/status — approve/reject/flag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // DELETE = withdraw (member only, pending requests only)
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const activityRequest = await prisma.activityRequest.findUnique({
      where: { id: params.id },
    });

    if (!activityRequest) {
      return NextResponse.json(
        { error: "Request not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    if (activityRequest.submittedById !== session!.user.id) {
      return NextResponse.json(
        { error: "You can only withdraw your own requests", code: "FORBIDDEN", statusCode: 403 },
        { status: 403 }
      );
    }

    if (activityRequest.status !== RequestStatus.PENDING) {
      return NextResponse.json(
        { error: "Only pending requests can be withdrawn", code: "INVALID_STATUS", statusCode: 400 },
        { status: 400 }
      );
    }

    await prisma.activityRequest.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Request withdrawn successfully" });
  } catch (err) {
    console.error("[REQUEST_DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
