import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { paginationSchema } from "@/lib/validators";
import { paginate, paginatedResponse } from "@/lib/utils";

// GET /api/v1/requests/mine
export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const [requests, total] = await Promise.all([
      prisma.activityRequest.findMany({
        where: { submittedById: session!.user.id },
        orderBy: { createdAt: "desc" },
        ...paginate(parsed.page, parsed.limit),
      }),
      prisma.activityRequest.count({ where: { submittedById: session!.user.id } }),
    ]);

    return NextResponse.json(paginatedResponse(requests, total, parsed.page, parsed.limit));
  } catch (err) {
    console.error("[REQUESTS_MINE]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
