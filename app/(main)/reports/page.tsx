"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const MonthlyChart = dynamic(() => import("@/components/dashboard/monthly-chart"), { ssr: false });

interface Summary {
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  underConsideration: number;
  upcomingActivities: number;
  cancelledActivities: number;
  totalAttended: number;
  totalParticipants: number;
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);

  useEffect(() => { fetchSummary(); }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/v1/reports/summary?${params}`);
      const json = await res.json();
      if (json.stats) {
        setSummary({
          totalRequests: json.stats.totalRequests,
          pending: json.stats.pendingRequests,
          approved: json.stats.approvedRequests,
          rejected: json.stats.rejectedRequests,
          underConsideration: json.stats.underConsiderationRequests,
          upcomingActivities: json.stats.totalActivities,
          cancelledActivities: json.stats.cancelledActivities,
          totalAttended: json.stats.totalAttended,
          totalParticipants: json.stats.totalParticipants,
        });
      }
    } finally { setLoading(false); }
  };

  const exportReport = async (type: "pdf" | "xlsx") => {
    setExporting(type);
    try {
      const params = new URLSearchParams({ type });
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/v1/reports/export?${params}`);
      if (!res.ok) { alert("Export failed"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leelra-report.${type === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500">Activity and request analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportReport("pdf")} disabled={!!exporting}>
            {exporting === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="ml-2">Export PDF</span>
          </Button>
          <Button size="sm" onClick={() => exportReport("xlsx")} disabled={!!exporting}>
            {exporting === "xlsx" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="ml-2">Export Excel</span>
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <Button size="sm" onClick={fetchSummary} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Filter"}
          </Button>
          {(dateFrom || dateTo) && (
            <Button size="sm" variant="ghost" onClick={() => { setDateFrom(""); setDateTo(""); fetchSummary(); }}>Clear</Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard label="Total Requests" value={summary.totalRequests} color="blue" />
            <StatCard label="Pending" value={summary.pending} color="yellow" />
            <StatCard label="Approved" value={summary.approved} color="green" />
            <StatCard label="Rejected" value={summary.rejected} color="red" />
            <StatCard label="Under Review" value={summary.underConsideration} color="purple" />
            <StatCard label="Upcoming Activities" value={summary.upcomingActivities} color="green" />
            <StatCard label="Cancelled" value={summary.cancelledActivities} color="red" />
            <StatCard label="Events Attended" value={summary.totalAttended} color="blue" />
            <StatCard label="Total Participants" value={(summary.totalParticipants ?? 0).toLocaleString()} color="purple" />
          </div>

          {/* Monthly Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-gray-800">Monthly Activity Trends</h2>
            </div>
            <MonthlyChart />
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color] ?? "bg-gray-50 text-gray-700"}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-70">{label}</p>
    </div>
  );
}
