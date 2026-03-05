"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Menu,
  ArrowLeft,
  Wrench,
} from "lucide-react";

const sidebarItems = [
  { href: "/staff", icon: LayoutDashboard, label: "Dashboard", dividerAfter: true },
];

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
          <Wrench className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm">Staff Panel</p>
          <p className="text-[10px] text-muted-foreground">ตรวจสอบ & จัดส่ง</p>
        </div>
      </div>
      <div className="border-t" />
      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/staff"
              ? pathname === "/staff"
              : pathname.startsWith(item.href);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-600/10 text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-emerald-600")} />
                {item.label}
              </Link>
              {item.dividerAfter && <div className="my-2 mx-3 border-t" />}
            </div>
          );
        })}
      </nav>
      <div className="border-t" />
      <div className="p-3">
        <Link href="/" onClick={onClose}>
          <Button variant="ghost" size="sm" className="w-full gap-2 justify-start text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้า User
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-[220px] md:flex-col md:border-r bg-background fixed left-0 top-0 bottom-0 z-40">
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col md:ml-[220px]">
          {/* Top navbar */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 md:px-6">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[220px] p-0">
                <SidebarContent pathname={pathname} onClose={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex-1 md:hidden">
              <p className="font-bold text-sm">Staff Panel</p>
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
