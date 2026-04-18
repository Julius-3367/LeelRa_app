import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { reviewRequestSchema } from "@/lib/validators";
import { createAuditLog } from "@/lib/utils";
import { notifyUser, triggerRealtime } from "@/lib/notifications";
import { sendEmail, approvalEmailTemplate } from "@/lib/email";
import { UserRole, RequestStatus, ActivityStatus, NotificationType } from "@prisma/client";

// PATCH /api/v1/requests/:id/status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  if (error) return error;

  try {
    const body = await request.json();
    const result = reviewRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message, code: "VALIDATION_ERROR", statusCode: 400 },
        { status: 400 }
      );
    }

    const { status, adminNotes } = result.data;

    const activityRequest = await prisma.activityRequest.findUnique({
      where: { id: params.id },
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!activityRequest) {
      return NextResponse.json(
        { error: "Request not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    if (activityRequest.status !== RequestStatus.PENDING && activityRequest.status !== RequestStatus.UNDER_CONSIDERATION) {
      return NextResponse.json(
        { error: "Request has already been finalized", code: "INVALID_STATUS", statusCode: 400 },
        { status: 400 }
      );
    }

    // Update request status
    const updated = await prisma.activityRequest.update({
      where: { id: params.id },
      data: {
        status: status as RequestStatus,
        adminNotes: adminNotes ?? null,
        reviewedAt: new Date(),
        reviewedBy: session!.user.id,
      },
    });

    // If approved, create an Activity record
    if (status === RequestStatus.APPROVED) {
      await prisma.activity.create({
        data: {
          title: activityRequest.title,
          description: activityRequest.description,
          venue: activityRequest.venue,
          eventDate: activityRequest.eventDate,
          eventTime: activityRequest.eventTime,
          status: ActivityStatus.UPCOMING,
          requestId: activityRequest.id,
        },
      });
    }

    // Determine notification type
    const notifMap = {
      APPROVED: NotificationType.REQUEST_APPROVED,
      REJECTED: NotificationType.REQUEST_REJECTED,
      UNDER_CONSIDERATION: NotificationType.REQUEST_CONSIDERATION,
    };

    const notifTitles = {
      APPROVED: "Request Approved! 🎉",
      REJECTED: "Request Update",
      UNDER_CONSIDERATION: "Request Under Consideration",
    };

    const notifMessages = {
      APPROVED: `Your request "${activityRequest.title}" has been approved.`,
      REJECTED: `Your request "${activityRequest.title}" was not approved.${adminNotes ? ` Notes: ${adminNotes}` : ""}`,
      UNDER_CONSIDERATION: `Your request "${activityRequest.title}" is under consideration.`,
    };

    // In-app notification
    await notifyUser(
      activityRequest.submittedById,
      notifMap[status as keyof typeof notifMap],
      notifTitles[status as keyof typeof notifTitles],
      notifMessages[status as keyof typeof notifMessages],
      { requestId: activityRequest.id }
    );

    // Email notification
    await sendEmail({
      to: activityRequest.submittedBy.email,
      subject: `LeelRa App — Request ${status === "APPROVED" ? "Approved" : status === "REJECTED" ? "Rejected" : "Update"}: ${activityRequest.title}`,
      html: approvalEmailTemplate(
        activityRequest.submittedBy.name,
        activityRequest.title,
        status,
        adminNotes
      ),
    });

    await createAuditLog({
      userId: session!.user.id,
      action: "REVIEW",
      resource: "activity_request",
      resourceId: params.id,
      description: `Set request "${activityRequest.title}" status to ${status}`,
    });

    await triggerRealtime(`user-${activityRequest.submittedById}`, "request-updated", {
      requestId: activityRequest.id,
      status,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[REQUEST_STATUS_PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
