import { ClipboardList, CheckCircle, XCircle, History, Calendar, Clock } from "lucide-react";
import React from "react";

interface StatsProps {
  stats: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    totalAttended: number;
    upcomingActivities: number;
  };
}

const statCards = (s: StatsProps["stats"]) => [
  {
    label: "Total Requests",
    value: s.totalRequests,
    icon: <ClipboardList className="w-6 h-6" />,
    color: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  {
    label: "Pending Review",
    value: s.pendingRequests,
    icon: <Clock className="w-6 h-6" />,
    color: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  {
    label: "Approved",
    value: s.approvedRequests,
    icon: <CheckCircle className="w-6 h-6" />,
    color: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  {
    label: "Upcoming Events",
    value: s.upcomingActivities,
    icon: <Calendar className="w-6 h-6" />,
    color: "bg-primary",
    bg: "bg-primary-50",
    text: "text-primary-700",
  },
  {
    label: "Events Attended",
    value: s.totalAttended,
    icon: <History className="w-6 h-6" />,
    color: "bg-gray-500",
    bg: "bg-gray-100",
    text: "text-gray-700",
  },
];

export const DashboardStats = React.memo(function DashboardStats({ stats }: StatsProps) {
  const cards = statCards(stats);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
            <span className={card.text}>{card.icon}</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{card.value.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
});
