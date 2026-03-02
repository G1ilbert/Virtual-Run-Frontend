"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  Wallet,
  FileCheck,
  Settings,
  Menu,
  LogOut,
  Shield,
  ArrowLeft,
} from "lucide-react";

const sidebarItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/events", icon: CalendarDays, label: "Events" },
  { href: "/admin/payments", icon: CreditCard, label: "ตรวจสลิป" },
  { href: "/admin/payouts", icon: Wallet, label: "Payouts" },
  { href: "/admin/organizer-applications", icon: FileCheck, label: "Organizer Apps" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

function SidebarContent({
  pathname,
  onClose,
  onLogout,
}: {
  pathname: string;
  onClose?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm">Virtual Run</p>
          <p className="text-[10px] text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-red-600/10 text-red-700 dark:text-red-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="space-y-2 p-3">
        <Link href="/">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้า User
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Don't wrap login page with AdminGuard
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-60 md:flex-col md:border-r bg-card">
          <SidebarContent pathname={pathname} onLogout={logout} />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Top navbar */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 md:px-6">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SidebarContent
                  pathname={pathname}
                  onClose={() => setSheetOpen(false)}
                  onLogout={logout}
                />
              </SheetContent>
            </Sheet>

            <div className="flex-1 md:hidden">
              <p className="font-bold text-sm">Admin Panel</p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {admin?.username || "Admin"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">
                {(admin?.username || "A").charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
