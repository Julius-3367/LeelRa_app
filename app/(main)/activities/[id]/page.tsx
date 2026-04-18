"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Phone, User, Pencil, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function ActivityDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: session } = useSession();
  const router = useRouter();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/activities/${id}`)
      .then((r) => r.json())
      .then(setActivity)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "SUPER_ADMIN";

  const handleCancel = async () => {
    if (!confirm("Cancel this activity?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/v1/activities/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Activity cancelled" });
        router.push("/activities");
      }
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading...</div>;
  }

  if (!activity) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Activity not found.</p>
        <Link href="/activities" className="text-primary text-sm mt-2 inline-block">Back to Activities</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/activities" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Activities
        </Link>
        {isAdmin && activity.status === "UPCOMING" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Cancel Event
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{activity.title}</h1>
          <StatusBadge status={activity.status} />
        </div>

        <p className="text-gray-600 mb-6">{activity.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={<Calendar />} label="Date" value={new Date(activity.eventDate).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
          <InfoRow icon={<Clock />} label="Time" value={activity.eventTime} />
          <InfoRow icon={<MapPin />} label="Venue" value={activity.venue} />
          {activity.request?.expectedAttendance && (
            <InfoRow icon={<Users />} label="Expected Attendance" value={activity.request.expectedAttendance.toLocaleString()} />
          )}
          {activity.request?.organiserName && (
            <InfoRow icon={<User />} label="Organiser" value={activity.request.organiserName} />
          )}
          {activity.request?.contactPhone && (
            <InfoRow icon={<Phone />} label="Contact" value={activity.request.contactPhone} />
          )}
        </div>

        {activity.attendedEvent && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
              <CheckCircle className="w-4 h-4" /> Event Attended
            </div>
            <p className="text-sm text-gray-600">Date: {new Date(activity.attendedEvent.dateAttended).toLocaleDateString("en-KE")}</p>
            <p className="text-sm text-gray-600">Participants: {activity.attendedEvent.participantCount.toLocaleString()}</p>
            {activity.attendedEvent.notes && <p className="text-sm text-gray-600 mt-1">{activity.attendedEvent.notes}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-primary mt-0.5 flex-shrink-0 w-4 h-4">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
