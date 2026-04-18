"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PlusCircle, Calendar, Clock, MapPin, Trash2, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Request {
  id: string;
  title: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  status: string;
  createdAt: string;
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/requests/mine?page=${page}&limit=10`);
      const data = await res.json();
      setRequests(data.data ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [page]);

  const handleWithdraw = async (id: string) => {
    if (!confirm("Withdraw this request?")) return;
    setWithdrawingId(id);
    try {
      const res = await fetch(`/api/v1/requests/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Request withdrawn" });
        fetchRequests();
      } else {
        const json = await res.json();
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Your submitted activity requests</p>
        </div>
        <Link href="/requests/new">
          <Button size="sm">
            <PlusCircle className="w-4 h-4 mr-2" /> Submit New Request
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse h-24" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <PlusCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No requests yet. Submit your first one!</p>
          <Link href="/requests/new">
            <Button>Submit Activity Request</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/requests/${req.id}`} className="font-semibold text-gray-800 hover:text-primary truncate">
                      {req.title}
                    </Link>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {new Date(req.eventDate).toLocaleDateString("en-KE")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {req.eventTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {req.venue}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted: {new Date(req.createdAt).toLocaleDateString("en-KE")}
                  </p>
                </div>
                {req.status === "PENDING" && (
                  <button
                    onClick={() => handleWithdraw(req.id)}
                    disabled={withdrawingId === req.id}
                    title="Withdraw request"
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {withdrawingId === req.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
