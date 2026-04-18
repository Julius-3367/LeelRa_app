import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Request {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  submittedBy: { name: string; email: string };
}

export function RecentRequests({ requests }: { requests: Request[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Recent Requests</h3>
        <Link href="/requests" className="text-sm text-primary hover:text-primary-700">
          View all →
        </Link>
      </div>

      {requests.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No requests yet</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link
              key={req.id}
              href={`/requests/${req.id}`}
              className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary">
                  {req.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {req.submittedBy.name} &bull; {formatDate(new Date(req.createdAt))}
                </p>
              </div>
              <StatusBadge status={req.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
