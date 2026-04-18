import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";
import { DashboardStats } from "@/components/dashboard/stats";
import { RecentRequests } from "@/components/dashboard/recent-requests";
import { OwnerAvatar } from "@/components/ui/owner-avatar";
import { UserRole, RequestStatus, ActivityStatus } from "@prisma/client";

const MonthlyChart = dynamic(() => import("@/components/dashboard/monthly-chart"), {
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading chart...</div>
});

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (session.user.role === UserRole.MEMBER || session.user.role === UserRole.SUPPORT_STAFF) {
    redirect("/activities");
  }

  const [totalRequests, pendingRequests, approvedRequests, totalAttended, upcomingActivities, recentRequests] =
    await Promise.all([
      prisma.activityRequest.count(),
      prisma.activityRequest.count({ where: { status: RequestStatus.PENDING } }),
      prisma.activityRequest.count({ where: { status: RequestStatus.APPROVED } }),
      prisma.attendedEvent.count(),
      prisma.activity.count({ where: { status: ActivityStatus.UPCOMING } }),
      prisma.activityRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          submittedBy: { select: { name: true, email: true } },
        },
      }),
    ]);

  return (
    <div className="space-y-6">
      {/* Welcome Header with Wakili Langat's photo */}
      <div className="bg-gradient-to-r from-primary-800 to-secondary rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <OwnerAvatar size={64} />
          <div>
            <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
            <p className="text-primary-200 text-sm">
              Wakili Geoffrey Langat &bull; Ainamoi Constituency &bull; MP Aspirant
            </p>
            <p className="text-accent font-medium text-sm mt-1">
              {new Date().toLocaleDateString("en-KE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats
        stats={{
          totalRequests,
          pendingRequests,
          approvedRequests,
          totalAttended,
          upcomingActivities,
        }}
      />

      {/* Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyChart />
        <RecentRequests requests={recentRequests as any} />
      </div>
    </div>
  );
}
