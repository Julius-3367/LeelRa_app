"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, FileText, Calendar, MapPin, Phone, User, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function RequestDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: session } = useSession();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [notes, setNotes] = useState("");
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED" | "UNDER_CONSIDERATION" | null>(null);

  useEffect(() => {
    fetch(`/api/v1/requests/${id}`)
      .then((r) => r.json())
      .then(setRequest)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "SUPER_ADMIN";
  const canReview = isAdmin && request && (request.status === "PENDING" || request.status === "UNDER_CONSIDERATION");

  const handleReview = async () => {
    if (!reviewAction) return;
    setReviewing(true);
    try {
      const res = await fetch(`/api/v1/requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: reviewAction, adminNotes: notes || undefined }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({ title: `Request ${reviewAction === "APPROVED" ? "approved" : reviewAction === "REJECTED" ? "rejected" : "flagged"}` });
        setRequest({ ...request, status: reviewAction, adminNotes: notes });
        setShowReviewPanel(false);
        setReviewAction(null);
        setNotes("");
      } else {
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading...</div>;

  if (!request) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Request not found.</p>
      <Link href="/requests" className="text-primary text-sm mt-2 inline-block">Back to Requests</Link>
    </div>
  );

  const backHref = isAdmin ? "/requests" : "/requests/mine";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={backHref} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <StatusBadge status={request.status} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{request.title}</h1>
        <p className="text-xs text-gray-400 mb-4">Submitted {new Date(request.createdAt).toLocaleDateString("en-KE")} by {request.submittedBy?.name}</p>
        <p className="text-gray-600 mb-6">{request.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <InfoRow icon={<Calendar />} label="Event Date" value={new Date(request.eventDate).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
          <InfoRow icon={<Clock />} label="Time" value={request.eventTime} />
          <InfoRow icon={<MapPin />} label="Venue" value={request.venue} />
          <InfoRow icon={<Users />} label="Expected Attendance" value={request.expectedAttendance?.toLocaleString()} />
          <InfoRow icon={<User />} label="Organiser" value={request.organiserName} />
          <InfoRow icon={<Phone />} label="Contact" value={request.contactPhone} />
        </div>

        {request.attachmentUrl && (
          <a href={request.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-700">
            <FileText className="w-4 h-4" /> View Attachment
          </a>
        )}

        {request.adminNotes && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs font-medium text-blue-700 mb-1">Admin Notes</p>
            <p className="text-sm text-blue-800">{request.adminNotes}</p>
          </div>
        )}
      </div>

      {/* Admin Review Panel */}
      {canReview && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Review Decision</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => { setReviewAction("APPROVED"); setShowReviewPanel(true); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reviewAction === "APPROVED" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
            >
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => { setReviewAction("REJECTED"); setShowReviewPanel(true); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reviewAction === "REJECTED" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button
              onClick={() => { setReviewAction("UNDER_CONSIDERATION"); setShowReviewPanel(true); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reviewAction === "UNDER_CONSIDERATION" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
            >
              <Clock className="w-4 h-4" /> Under Consideration
            </button>
          </div>

          {showReviewPanel && reviewAction && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for the submitter (optional)..."
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-3 resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={handleReview} disabled={reviewing} size="sm">
                  {reviewing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</> : `Confirm ${reviewAction === "APPROVED" ? "Approval" : reviewAction === "REJECTED" ? "Rejection" : "Flag"}`}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setShowReviewPanel(false); setReviewAction(null); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-primary mt-0.5 flex-shrink-0 w-4 h-4">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value ?? "—"}</p>
      </div>
    </div>
  );
}
