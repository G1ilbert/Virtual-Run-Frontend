"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} />
      <div className="flex flex-1">
        <Sidebar collapsed={sidebarCollapsed} />
        <main
          className={cn(
            "flex-1 pb-20 md:pb-0 transition-all duration-200",
            sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[220px]",
          )}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
