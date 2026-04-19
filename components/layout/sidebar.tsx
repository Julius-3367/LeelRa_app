"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Calendar,
  History,
  Bell,
  BarChart3,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    href: "/requests/new",
    label: "Submit Request",
    icon: <PlusCircle className="w-5 h-5" />,
    roles: [UserRole.MEMBER],
  },
  {
    href: "/requests/mine",
    label: "My Requests",
    icon: <ClipboardList className="w-5 h-5" />,
    roles: [UserRole.MEMBER],
  },
  {
    href: "/requests",
    label: "All Requests",
    icon: <ClipboardList className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    href: "/activities",
    label: "Upcoming Activities",
    icon: <Calendar className="w-5 h-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT_STAFF, UserRole.MEMBER],
  },
  {
    href: "/attended",
    label: "Attended Events",
    icon: <History className="w-5 h-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT_STAFF, UserRole.MEMBER],
  },
  {
    href: "/reports",
    label: "Reports",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    href: "/admin/users",
    label: "User Management",
    icon: <Users className="w-5 h-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: <Bell className="w-5 h-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT_STAFF, UserRole.MEMBER],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT_STAFF, UserRole.MEMBER],
  },
];

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 flex-shrink-0 bg-secondary flex flex-col shadow-xl z-10">
      {/* Logo */}
      <div className="p-5 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-secondary">LR</span>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">LeelRa App</p>
            <p className="text-primary-300 text-xs mt-0.5">Ainamoi Constituency</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-primary-200 hover:bg-primary-700/50 hover:text-white"
              )}
            >
              <span className={cn("flex-shrink-0", isActive ? "text-white" : "text-primary-300 group-hover:text-white")}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary-700">
        <p className="text-primary-400 text-xs text-center">
          &copy; {new Date().getFullYear()} LeelRa App
        </p>
        <p className="text-primary-500 text-xs text-center">Confidential</p>
      </div>
    </aside>
  );
}
