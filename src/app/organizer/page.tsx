"use client";

import { useMemo } from "react";
import Link from "next/link";
import { OrganizerGuard } from "@/components/organizer-guard";
import { useMyEvents, useMyPayouts } from "@/hooks/useOrganizerApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Users,
  Wallet,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type { Event } from "@/types/api";

const statusMap: Record<
  Event["status"],
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  draft: { label: "แบบร่าง", variant: "secondary" },
  pending_approval: { label: "รอตรวจ", variant: "secondary" },
  approved: { label: "อนุมัติ", variant: "default" },
  rejected: { label: "ไม่ผ่าน", variant: "destructive" },
  completed: { label: "จบแล้ว", variant: "secondary" },
};

function DashboardContent() {
  const { data: myEvents, isLoading: eventsLoading } = useMyEvents();
  const { data: myPayouts, isLoading: payoutsLoading } = useMyPayouts();

  const isLoading = eventsLoading || payoutsLoading;

  const stats = useMemo(() => {
    const eventCount = myEvents?.length ?? 0;
    const totalRegistrations =
      myEvents?.reduce((sum, e) => sum + (e._count?.registrations ?? 0), 0) ??
      0;
    const totalRevenue =
      myPayouts
        ?.filter((p) => p.status === "confirmed")
        .reduce((sum, p) => sum + (p.netAmount ?? 0), 0) ?? 0;

    return { eventCount, totalRegistrations, totalRevenue };
  }, [myEvents, myPayouts]);

  const recentEvents = useMemo(() => {
    if (!myEvents) return [];
    return [...myEvents]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      )
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
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              จำนวน Events
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.eventCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ผู้สมัครรวม
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รายได้รวม
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ฿{stats.totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events ล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                ยังไม่มี Event
              </p>
            ) : (
              recentEvents.map((event) => {
                const s = statusMap[event.status];
                return (
                  <div key={event.id}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.startDate
                            ? new Date(event.startDate).toLocaleDateString(
                                "th-TH",
                              )
                            : "-"}
                        </p>
                      </div>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ดำเนินการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/organizer/events/new">
              <Button className="w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
                <Plus className="h-4 w-4" />
                สร้าง Event ใหม่
              </Button>
            </Link>
            <Link href="/organizer/payouts">
              <Button variant="outline" className="w-full gap-2">
                <ArrowRight className="h-4 w-4" />
                ดู Payouts
              </Button>
            </Link>
          </CardContent>
        </Card>
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
