"use client";

import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export default function MonthlyChart() {
  const [data, setData] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);

  useEffect(() => {
    const now = Date.now();
    
    // Skip fetch if we have fresh data
    if (data.length > 0 && (now - lastFetch) < CACHE_DURATION) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    
    fetch("/api/v1/reports/summary", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((json) => {
        if (json.monthlyTrends) {
          const processedData = json.monthlyTrends.map((d: { month: string; count: number }) => ({
            month: MONTHS[parseInt(d.month.split("-")[1]) - 1],
            count: d.count,
          }));
          setData(processedData);
          setLastFetch(now);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [data.length, lastFetch]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Monthly Activity Requests ({new Date().getFullYear()})</h3>
      {loading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(v: number) => [v, "Requests"]}
            />
            <Bar dataKey="count" fill="#2E7D32" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
