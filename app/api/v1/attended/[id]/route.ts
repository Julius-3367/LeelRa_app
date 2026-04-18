import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { createAuditLog } from "@/lib/utils";
import { UserRole } from "@prisma/client";

// PATCH /api/v1/attended/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_STAFF]);
  if (error) return error;

  try {
    const body = await request.json();
    const { venue, participantCount, notes, photos } = body;

    const event = await prisma.attendedEvent.findUnique({ where: { id: params.id } });
    if (!event) {
      return NextResponse.json(
        { error: "Attended event not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    const updated = await prisma.attendedEvent.update({
      where: { id: params.id },
      data: {
        ...(venue && { venue }),
        ...(participantCount !== undefined && { participantCount }),
        ...(notes !== undefined && { notes }),
        ...(photos && { photos }),
      },
      include: {
        activity: { select: { id: true, title: true } },
        loggedBy: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: session!.user.id,
      action: "UPDATE",
      resource: "attended_event",
      resourceId: params.id,
      description: `Updated attended event record`,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[ATTENDED_PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
