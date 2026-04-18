"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, List, Search, MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Activity {
  id: string;
  title: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  status: string;
  request: {
    organiserName: string;
    expectedAttendance: number;
  };
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Link
      href={`/activities/${activity.id}`}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all group block"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-800 group-hover:text-primary line-clamp-2 flex-1 mr-2">
          {activity.title}
        </h3>
        <StatusBadge status={activity.status} />
      </div>
      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
          <span>
            {new Date(activity.eventDate).toLocaleDateString("en-KE", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{activity.eventTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="truncate">{activity.venue}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{activity.request?.expectedAttendance?.toLocaleString()} expected</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        Organised by {activity.request?.organiserName}
      </div>
    </Link>
  );
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivities = async (p: number, q: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "50" });
    if (q) params.set("search", q);
    try {
      const res = await fetch(`/api/v1/activities?${params}`);
      const data = await res.json();
      setActivities(data.data ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(page, search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const grouped = useMemo(() => {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString("en-KE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    const map: Record<string, Activity[]> = {};
    activities.forEach((a) => {
      const key = fmt(a.eventDate);
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });

    return Object.entries(map).sort(
      ([, aItems], [, bItems]) =>
        new Date(aItems[0].eventDate).getTime() -
        new Date(bItems[0].eventDate).getTime()
    );
  }, [activities]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Upcoming Activities</h1>
          <p className="text-gray-500 text-sm mt-1">All approved upcoming events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            <List className="w-4 h-4 mr-1" /> List
          </Button>
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("calendar")}
          >
            <Calendar className="w-4 h-4 mr-1" /> By Date
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by event name or venue..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No upcoming activities found</p>
        </div>
      ) : view === "list" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Calendar / By-Date view */
        <div className="space-y-8">
          {grouped.map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white text-sm font-bold flex-shrink-0">
                  {new Date(items[0].eventDate).getDate()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{dateLabel}</p>
                  <p className="text-xs text-gray-400">
                    {items.length} event{items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                style={{ paddingLeft: "3.25rem" }}
              >
                {items.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
