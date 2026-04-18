import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/rbac";
import { attendedEventSchema, paginationSchema } from "@/lib/validators";
import { paginate, paginatedResponse, createAuditLog } from "@/lib/utils";
import { UserRole, ActivityStatus, NotificationType } from "@prisma/client";

// GET /api/v1/attended
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

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { venue: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        { activity: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.dateAttended = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    const [events, total] = await Promise.all([
      prisma.attendedEvent.findMany({
        where,
        include: {
          activity: { select: { id: true, title: true, eventDate: true } },
          loggedBy: { select: { id: true, name: true } },
        },
        orderBy: { dateAttended: "desc" },
        ...paginate(parsed.page, parsed.limit),
      }),
      prisma.attendedEvent.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(events, total, parsed.page, parsed.limit));
  } catch (err) {
    console.error("[ATTENDED_GET]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST /api/v1/attended
export async function POST(request: NextRequest) {
  const { error, session } = await requireRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_STAFF]);
  if (error) return error;

  try {
    const body = await request.json();
    const result = attendedEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message, code: "VALIDATION_ERROR", statusCode: 400 },
        { status: 400 }
      );
    }

    const { activityId, dateAttended, venue, participantCount, notes, photos } = result.data;

    // Ensure the activity exists and isn't already marked attended
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { attendedEvent: true },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    if (activity.attendedEvent) {
      return NextResponse.json(
        { error: "Attended event already logged for this activity", code: "DUPLICATE", statusCode: 409 },
        { status: 409 }
      );
    }

    const [attendedEvent] = await prisma.$transaction([
      prisma.attendedEvent.create({
        data: {
          activityId,
          dateAttended: new Date(dateAttended),
          venue,
          participantCount,
          notes: notes ?? null,
          photos: photos ?? [],
          loggedById: session!.user.id,
        },
        include: {
          activity: { select: { id: true, title: true } },
          loggedBy: { select: { id: true, name: true } },
        },
      }),
      prisma.activity.update({
        where: { id: activityId },
        data: { status: ActivityStatus.ATTENDED },
      }),
    ]);

    await createAuditLog({
      userId: session!.user.id,
      action: "CREATE",
      resource: "attended_event",
      resourceId: attendedEvent.id,
      description: `Logged attended event for activity "${activity.title}"`,
    });

    return NextResponse.json(attendedEvent, { status: 201 });
  } catch (err) {
    console.error("[ATTENDED_POST]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
