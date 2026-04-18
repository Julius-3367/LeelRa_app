"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Search, X, Loader2, Image as ImageIcon, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface AttendedEvent {
  id: string;
  activity: { title: string; venue: string; eventDate: string };
  dateAttended: string;
  venue: string;
  participantCount: number;
  notes: string | null;
  photos: string[];
  loggedBy: { name: string };
}

export default function AttendedPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<AttendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  const isAdmin = ["ADMIN", "SUPER_ADMIN", "SUPPORT_STAFF"].includes(session?.user.role ?? "");

  const fetchEvents = async (p = 1, q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), search: q, limit: "10" });
      const res = await fetch(`/api/v1/attended?${params}`);
      const json = await res.json();
      setEvents(json.data ?? []);
      setMeta(json.pagination ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchEvents(1, search); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attended Events</h1>
          <p className="text-sm text-gray-500">Log of activities attended by the MP</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setShowForm(true); fetchApprovedActivities(); }} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Log Event
          </Button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by venue or activity..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button type="submit" size="sm">Search</Button>
        {search && (
          <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(""); fetchEvents(1, ""); }}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </form>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400 text-sm">No attended events recorded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { const np = page - 1; setPage(np); fetchEvents(np, search); }}>Previous</Button>
          <span className="flex items-center text-sm text-gray-600 px-2">Page {meta.page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => { const np = page + 1; setPage(np); fetchEvents(np, search); }}>Next</Button>
        </div>
      )}

      {/* Log Attended Modal */}
      {showForm && (
        <LogEventModal
          activities={activities}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchEvents(1, search); toast({ title: "Event logged successfully" }); }}
        />
      )}
    </div>
  );

  async function fetchApprovedActivities() {
    const res = await fetch("/api/v1/activities?status=UPCOMING&limit=50");
    const json = await res.json();
    setActivities(json.data ?? []);
  }
}

function EventCard({ event }: { event: AttendedEvent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {event.photos.length > 0 ? (
        <div className="h-36 overflow-hidden">
          <img src={event.photos[0]} alt="Event" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-green-300" />
        </div>
      )}
      {event.photos.length > 1 && (
        <div className="text-xs text-gray-400 px-4 pt-1">+{event.photos.length - 1} more photo(s)</div>
      )}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{event.activity.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(event.dateAttended).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5" />
          {event.venue}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users className="w-3.5 h-3.5" />
          {event.participantCount?.toLocaleString() ?? "—"} participants
        </div>
        {event.notes && <p className="text-xs text-gray-500 line-clamp-2">{event.notes}</p>}
        <p className="text-xs text-gray-400">Logged by {event.loggedBy?.name}</p>
      </div>
    </div>
  );
}

function LogEventModal({ activities, onClose, onSuccess }: { activities: any[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ activityId: "", dateAttended: "", venue: "", participantCount: "", notes: "", photos: [] as string[] });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.activityId || !form.dateAttended || !form.venue || !form.participantCount) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/attended", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, participantCount: Number(form.participantCount) }),
      });
      const json = await res.json();
      if (res.ok) { onSuccess(); } else { toast({ title: "Error", description: json.error, variant: "destructive" }); }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Log Attended Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity <span className="text-red-500">*</span></label>
            <select value={form.activityId} onChange={(e) => setForm({ ...form, activityId: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select activity...</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>{a.title} — {new Date(a.eventDate).toLocaleDateString("en-KE")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Attended <span className="text-red-500">*</span></label>
            <input type="date" value={form.dateAttended} onChange={(e) => setForm({ ...form, dateAttended: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue <span className="text-red-500">*</span></label>
            <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Event venue"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Participants <span className="text-red-500">*</span></label>
            <input type="number" min="1" value={form.participantCount} onChange={(e) => setForm({ ...form, participantCount: e.target.value })} placeholder="Estimated attendance"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Summary or observations..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : "Log Event"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
