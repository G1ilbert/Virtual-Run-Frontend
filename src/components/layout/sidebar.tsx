"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsStaff } from "@/hooks/useStaffApi";
import {
  Home,
  ClipboardList,
  PersonStanding,
  FileEdit,
  Crown,
  Clock,
  Wrench,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
}

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  dividerAfter?: boolean;
  show?: boolean;
  disabled?: boolean;
  disabledLabel?: string;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: isStaff } = useIsStaff();

  const isOrganizer = user?.role === "ORGANIZER" || user?.role === "ADMIN";
  const isPendingOrganizer = false;

  const navItems: NavItem[] = [
    { href: "/", icon: Home, label: "หน้าแรก", dividerAfter: true },
    { href: "/my", icon: ClipboardList, label: "งานของฉัน" },
    { href: "/my/running-proofs", icon: PersonStanding, label: "ผลวิ่ง", dividerAfter: true },
    // Staff section (only if user is staff of at least 1 event)
    ...(isStaff
      ? [{ href: "/staff", icon: Wrench, label: "Staff", dividerAfter: true }]
      : []
    ),
    // Organizer section
    ...(isOrganizer
      ? [{ href: "/organizer", icon: Crown, label: "จัดการงานวิ่ง" }]
      : isPendingOrganizer
        ? [{ href: "#", icon: Clock, label: "รอการอนุมัติ", disabled: true, disabledLabel: "รอการอนุมัติ" }]
        : [{ href: "/organizer/apply", icon: FileEdit, label: "สมัครเป็นผู้จัด" }]
    ),
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col fixed left-0 top-14 bottom-0 z-40 border-r bg-background transition-all duration-200 overflow-y-auto overflow-x-hidden",
        collapsed ? "w-[72px]" : "w-[220px]",
      )}
    >
      <nav className="flex flex-col gap-0.5 p-2 pt-3">
        {navItems.map((item) => {
          if (item.show === false) return null;
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <div key={item.href + item.label}>
              {item.disabled ? (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed opacity-50",
                    collapsed && "justify-center px-0",
                  )}
                  title={collapsed ? item.disabledLabel || item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.disabledLabel || item.label}</span>}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand/10 text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", active && "text-brand-foreground dark:text-brand")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )}
              {item.dividerAfter && (
                <div className="my-2 mx-3 border-t" />
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
