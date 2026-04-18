import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/rbac";
import { activityRequestSchema, paginationSchema } from "@/lib/validators";
import { paginate, paginatedResponse, createAuditLog } from "@/lib/utils";
import { notifyUser, triggerRealtime } from "@/lib/notifications";
import { UserRole, RequestStatus, NotificationType } from "@prisma/client";

// GET /api/v1/requests - Admin view of all requests
export async function GET(request: NextRequest) {
  const { error, session } = await requireRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const status = searchParams.get("status") as RequestStatus | null;
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};
    if (status && Object.values(RequestStatus).includes(status)) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
        { organiserName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (dateFrom || dateTo) {
      where.eventDate = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    const [requests, total] = await Promise.all([
      prisma.activityRequest.findMany({
        where,
        include: {
          submittedBy: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        ...paginate(parsed.page, parsed.limit),
      }),
      prisma.activityRequest.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(requests, total, parsed.page, parsed.limit));
  } catch (err) {
    console.error("[REQUESTS_GET]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST /api/v1/requests - Submit new request
export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const result = activityRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message, code: "VALIDATION_ERROR", statusCode: 400 },
        { status: 400 }
      );
    }

    const { title, description, venue, eventDate, eventTime, expectedAttendance, organiserName, contactPhone, attachmentUrl } = result.data;

    const activityRequest = await prisma.activityRequest.create({
      data: {
        title,
        description,
        venue,
        eventDate: new Date(eventDate),
        eventTime,
        expectedAttendance,
        organiserName,
        contactPhone,
        attachmentUrl: attachmentUrl || null,
        submittedById: session!.user.id,
      },
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify submitter
    await notifyUser(
      session!.user.id,
      NotificationType.REQUEST_SUBMITTED,
      "Request Submitted",
      `Your request "${title}" has been submitted and is pending review.`,
      { requestId: activityRequest.id }
    );

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] }, isActive: true },
    });
    for (const admin of admins) {
      await notifyUser(
        admin.id,
        NotificationType.REQUEST_SUBMITTED,
        "New Activity Request",
        `${organiserName} submitted a new request: "${title}"`,
        { requestId: activityRequest.id }
      );
    }

    await triggerRealtime("requests", "new-request", {
      id: activityRequest.id,
      title,
      organiserName,
    });

    return NextResponse.json(activityRequest, { status: 201 });
  } catch (err) {
    console.error("[REQUESTS_POST]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
