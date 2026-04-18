import * as React from "react";
import { cn } from "@/lib/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "pending" | "approved" | "rejected" | "consideration" | "upcoming" | "attended" | "cancelled";
}

const variantClasses: Record<string, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "text-foreground border",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  approved: "bg-green-100 text-green-800 border border-green-200",
  rejected: "bg-red-100 text-red-800 border border-red-200",
  consideration: "bg-blue-100 text-blue-800 border border-blue-200",
  upcoming: "bg-green-100 text-green-800 border border-green-200",
  attended: "bg-gray-100 text-gray-700 border border-gray-200",
  cancelled: "bg-red-100 text-red-800 border border-red-200",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant] ?? variantClasses.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    PENDING: { variant: "pending", label: "Pending" },
    APPROVED: { variant: "approved", label: "Approved" },
    REJECTED: { variant: "rejected", label: "Rejected" },
    UNDER_CONSIDERATION: { variant: "consideration", label: "Under Consideration" },
    UPCOMING: { variant: "upcoming", label: "Upcoming" },
    ATTENDED: { variant: "attended", label: "Attended" },
    CANCELLED: { variant: "cancelled", label: "Cancelled" },
  };

  const config = map[status] ?? { variant: "default" as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
