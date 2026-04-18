import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { UserRole, RequestStatus, ActivityStatus } from "@prisma/client";

// GET /api/v1/reports/summary
export async function GET(request: NextRequest) {
  const { error } = await requireRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  if (error) return error;

  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Optimize by combining count queries and using more efficient queries
    const [
      statusCounts,
      activityCounts,
      attendedStats,
      recentRequests,
      monthlyTrends,
    ] = await Promise.all([
      // Combine all request status counts into one query
      prisma.activityRequest.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // Combine activity status counts
      prisma.activity.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // Combine attended events stats
      prisma.attendedEvent.aggregate({
        _count: { id: true },
        _sum: { participantCount: true },
      }),
      prisma.activityRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          submittedBy: { select: { name: true } },
        },
      }),
      // Optimize monthly trends with better indexing
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "ActivityRequest" 
        WHERE "createdAt" >= ${startOfYear}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `,
    ]);

    // Extract counts from grouped results
    const statusCountMap = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    const activityCountMap = activityCounts.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalRequests = statusCounts.reduce((sum, item) => sum + item._count.id, 0);
    const pendingRequests = statusCountMap[RequestStatus.PENDING] || 0;
    const approvedRequests = statusCountMap[RequestStatus.APPROVED] || 0;
    const rejectedRequests = statusCountMap[RequestStatus.REJECTED] || 0;
    const underConsiderationRequests = statusCountMap[RequestStatus.UNDER_CONSIDERATION] || 0;
    const totalActivities = activityCounts.reduce((sum, item) => sum + item._count.id, 0);
    const upcomingActivities = activityCountMap[ActivityStatus.UPCOMING] || 0;
    const cancelledActivities = activityCountMap[ActivityStatus.CANCELLED] || 0;
    const totalAttended = attendedStats._count.id;
    const totalParticipants = attendedStats._sum.participantCount ?? 0;

    // Aggregate monthly trends
    const monthMap: Record<string, number> = {};
    for (let m = 0; m < 12; m++) {
      monthMap[`${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`] = 0;
    }
    
    // Type the raw query result
    const monthlyDataRaw = monthlyTrends as Array<{
      month: Date;
      count: bigint;
    }>;
    
    for (const row of monthlyDataRaw) {
      const key = `${row.month.getFullYear()}-${String(row.month.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap[key] !== undefined) {
        monthMap[key] += Number(row.count);
      }
    }

    const monthlyData = Object.entries(monthMap).map(([month, count]) => ({
      month,
      count,
    }));

    return NextResponse.json({
      stats: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        underConsiderationRequests,
        totalActivities,
        cancelledActivities,
        totalAttended,
        totalParticipants,
      },
      recentRequests,
      monthlyTrends: monthlyData,
    });
  } catch (err) {
    console.error("[REPORTS_SUMMARY]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
