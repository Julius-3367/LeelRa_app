"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2, AlertCircle, CheckCircle2, Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  REQUEST_APPROVED: <CheckCircle2 className="w-5 h-5 text-green-600" />,
  REQUEST_REJECTED: <AlertCircle className="w-5 h-5 text-red-500" />,
  REQUEST_SUBMITTED: <Bell className="w-5 h-5 text-blue-500" />,
  ACTIVITY_REMINDER: <Calendar className="w-5 h-5 text-yellow-500" />,
  SYSTEM: <Info className="w-5 h-5 text-gray-400" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchNotifications = async (p = 1, unreadOnly = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      if (unreadOnly) params.set("unreadOnly", "true");
      const res = await fetch(`/api/v1/notifications?${params}`);
      const json = await res.json();
      setNotifications(json.data ?? []);
      setMeta(json.pagination ?? null);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(1, filterUnread); }, []);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch("/api/v1/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast({ title: "All notifications marked as read" });
    } finally { setMarking(false); }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500">Your activity and system notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={marking}>
            {marking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCheck className="w-4 h-4 mr-2" />}
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setFilterUnread(false); fetchNotifications(1, false); }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterUnread ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          All
        </button>
        <button
          onClick={() => { setFilterUnread(true); fetchNotifications(1, true); }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterUnread ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Unread
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">{filterUnread ? "No unread notifications" : "No notifications yet"}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <li key={n.id} className={`flex gap-4 px-5 py-4 transition-colors ${!n.isRead ? "bg-blue-50/40" : "hover:bg-gray-50/50"}`}>
                <div className="flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] ?? <Bell className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? "font-semibold text-gray-800" : "font-medium text-gray-700"}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatRelative(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary" />}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { const np = page - 1; setPage(np); fetchNotifications(np, filterUnread); }}>Previous</Button>
          <span className="flex items-center text-sm text-gray-600 px-2">Page {meta.page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => { const np = page + 1; setPage(np); fetchNotifications(np, filterUnread); }}>Next</Button>
        </div>
      )}
    </div>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-KE");
}
