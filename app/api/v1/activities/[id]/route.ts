import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/rbac";
import { updateActivitySchema } from "@/lib/validators";
import { createAuditLog } from "@/lib/utils";
import { UserRole, ActivityStatus } from "@prisma/client";

// GET /api/v1/activities/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
        request: {
          select: {
            organiserName: true,
            contactPhone: true,
            expectedAttendance: true,
            attachmentUrl: true,
            submittedBy: { select: { id: true, name: true, email: true } },
          },
        },
        attendedEvent: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (err) {
    console.error("[ACTIVITY_GET]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/activities/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  if (error) return error;

  try {
    const body = await request.json();
    const result = updateActivitySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message, code: "VALIDATION_ERROR", statusCode: 400 },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({ where: { id: params.id } });
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    const data = result.data;
    const updated = await prisma.activity.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.venue && { venue: data.venue }),
        ...(data.eventDate && { eventDate: new Date(data.eventDate) }),
        ...(data.eventTime && { eventTime: data.eventTime }),
        ...(data.status && { status: data.status as ActivityStatus }),
      },
    });

    await createAuditLog({
      userId: session!.user.id,
      action: "UPDATE",
      resource: "activity",
      resourceId: params.id,
      description: `Updated activity "${activity.title}"`,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[ACTIVITY_PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/activities/:id — cancel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  if (error) return error;

  try {
    const activity = await prisma.activity.findUnique({ where: { id: params.id } });
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    await prisma.activity.update({
      where: { id: params.id },
      data: { status: ActivityStatus.CANCELLED },
    });

    await createAuditLog({
      userId: session!.user.id,
      action: "CANCEL",
      resource: "activity",
      resourceId: params.id,
      description: `Cancelled activity "${activity.title}"`,
    });

    return NextResponse.json({ message: "Activity cancelled successfully" });
  } catch (err) {
    console.error("[ACTIVITY_DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
