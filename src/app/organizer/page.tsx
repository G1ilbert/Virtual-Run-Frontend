"use client";

import { useMemo } from "react";
import Link from "next/link";
import { OrganizerGuard } from "@/components/organizer-guard";
import { useMyEvents, useMyPayouts, useOrgRunningResults, useOrgRegistrations } from "@/hooks/useOrganizerApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Users,
  Wallet,
  Plus,
  ArrowRight,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import type { Event } from "@/types/api";

const statusMap: Record<
  Event["status"],
  { label: string; color: string }
> = {
  draft: { label: "แบบร่าง", color: "bg-muted text-muted-foreground" },
  pending_approval: { label: "รอตรวจ", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  approved: { label: "อนุมัติ", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "ไม่ผ่าน", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  completed: { label: "จบแล้ว", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

function DashboardContent() {
  const { data: myEvents, isLoading: eventsLoading } = useMyEvents();
  const { data: myPayouts, isLoading: payoutsLoading } = useMyPayouts();
  const { data: pendingResults } = useOrgRunningResults({ status: "pending", limit: 5 });
  const { data: recentRegs } = useOrgRegistrations({ limit: 5 });

  const isLoading = eventsLoading || payoutsLoading;

  const stats = useMemo(() => {
    const eventCount = myEvents?.length ?? 0;
    const totalRegistrations =
      myEvents?.reduce((sum, e) => sum + (e._count?.registrations ?? 0), 0) ?? 0;
    const totalRevenue =
      myPayouts
        ?.filter((p) => p.status === "confirmed")
        .reduce((sum, p) => sum + (p.netAmount ?? 0), 0) ?? 0;
    const pendingReviewCount = pendingResults?.meta?.total ?? 0;
    return { eventCount, totalRegistrations, totalRevenue, pendingReviewCount };
  }, [myEvents, myPayouts, pendingResults]);

  const recentEvents = useMemo(() => {
    if (!myEvents) return [];
    return [...myEvents]
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .slice(0, 5);
  }, [myEvents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1200px]">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">งานทั้งหมด</span>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{stats.eventCount}</p>
        </div>
        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">ผู้สมัครทั้งหมด</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
        </div>
        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">รายได้รวม</span>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">฿{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-4 border-brand/30 bg-brand/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">รอตรวจผลวิ่ง</span>
            <ClipboardCheck className="h-4 w-4 text-brand-foreground dark:text-brand" />
          </div>
          <p className="text-2xl font-bold text-brand-foreground dark:text-brand">{stats.pendingReviewCount}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Registrations */}
        <div className="rounded-xl border">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-sm">การสมัครล่าสุด</h2>
          </div>
          <div className="divide-y">
            {(recentRegs?.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">ยังไม่มีผู้สมัคร</p>
            ) : (
              (recentRegs?.data ?? []).slice(0, 5).map((reg) => (
                <div key={reg.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {(reg as any).users?.username ?? `User #${reg.userId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reg.packages?.events?.title ?? reg.packages?.name} · {formatDate(reg.createdAt)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    reg.paymentStatus === "confirmed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    reg.paymentStatus === "submitted" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    reg.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {reg.paymentStatus === "confirmed" ? "จ่ายแล้ว" :
                     reg.paymentStatus === "submitted" ? "รอตรวจ" :
                     reg.paymentStatus === "pending" ? "รอจ่าย" : "ไม่ผ่าน"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Running Results */}
        <div className="rounded-xl border">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-sm">ผลวิ่งที่รอตรวจ</h2>
          </div>
          <div className="divide-y">
            {(pendingResults?.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">ไม่มีผลวิ่งรอตรวจ</p>
            ) : (
              (pendingResults?.data ?? []).slice(0, 5).map((rr) => (
                <div key={rr.id} className="flex items-center gap-3 px-4 py-2.5">
                  {rr.runningProofs?.imageUrl && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={rr.runningProofs.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {rr.runningProofs?.distance ? `${rr.runningProofs.distance} km` : "—"}{" "}
                      {rr.runningProofs?.duration && `· ${rr.runningProofs.duration}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rr.registrations?.packages?.events?.title ?? `Registration #${rr.registrationId}`}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    รอตรวจ
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="rounded-xl border">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">Events ล่าสุด</h2>
          <Link href="/organizer/events/new">
            <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90 gap-1">
              <Plus className="h-3.5 w-3.5" />
              สร้างใหม่
            </Button>
          </Link>
        </div>
        <div className="divide-y">
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">ยังไม่มี Event</p>
          ) : (
            recentEvents.map((event) => {
              const s = statusMap[event.status];
              return (
                <Link
                  key={event.id}
                  href={`/organizer/events/${event.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.startDate)} · ผู้สมัคร {event._count?.registrations ?? 0} คน
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${s.color}`}>
                    {s.label}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrganizerDashboardPage() {
  return (
    <OrganizerGuard>
      <DashboardContent />
    </OrganizerGuard>
  );
}
