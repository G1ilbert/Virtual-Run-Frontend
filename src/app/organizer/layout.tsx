"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Wallet,
  Menu,
  ArrowLeft,
  PersonStanding,
} from "lucide-react";

const sidebarItems = [
  { href: "/organizer", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/organizer/events", icon: CalendarDays, label: "งานวิ่งของฉัน" },
  { href: "/organizer/apply", icon: FileText, label: "สมัคร Organizer" },
  { href: "/organizer/payouts", icon: Wallet, label: "รายได้" },
];

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
          <PersonStanding className="h-5 w-5 text-brand-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm">Virtual Run</p>
          <p className="text-[10px] text-muted-foreground">Organizer Panel</p>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/organizer"
              ? pathname === "/organizer"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand/10 text-brand-foreground dark:text-brand"
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
      <div className="p-3">
        <Link href="/">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้า User
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-60 md:flex-col md:border-r bg-card">
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Top navbar (mobile) */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 md:px-6">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SidebarContent pathname={pathname} onClose={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex-1 md:hidden">
              <p className="font-bold text-sm">Organizer Panel</p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.firstName || user?.username || "Organizer"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-brand-foreground text-xs font-bold">
                {(user?.username || "O").charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
