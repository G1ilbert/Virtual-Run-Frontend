"use client";

import Link from "next/link";
import { useAdminDashboard } from "@/hooks/useAdminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CalendarDays,
  Wallet,
  CreditCard,
  FileCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  draft: { label: "แบบร่าง", variant: "secondary" },
  pending_approval: { label: "รออนุมัติ", variant: "secondary" },
  approved: { label: "อนุมัติแล้ว", variant: "default" },
  rejected: { label: "ไม่ผ่าน", variant: "destructive" },
  completed: { label: "จบแล้ว", variant: "secondary" },
};

function formatCurrency(amount: number) {
  return `฿${new Intl.NumberFormat("th-TH").format(amount)}`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      label: "ผู้ใช้ทั้งหมด",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      highlight: false,
    },
    {
      label: "งานวิ่งทั้งหมด",
      value: data.totalEvents.toLocaleString(),
      icon: CalendarDays,
      highlight: false,
    },
    {
      label: "รายได้รวม",
      value: formatCurrency(data.totalRevenue),
      icon: Wallet,
      highlight: false,
    },
    {
      label: "สลิปรอตรวจ",
      value: data.pendingSlips.toLocaleString(),
      icon: CreditCard,
      highlight: data.pendingSlips > 0,
    },
    {
      label: "Organizer Applications",
      value: data.pendingOrgApplications.toLocaleString(),
      icon: FileCheck,
      highlight: data.pendingOrgApplications > 0,
    },
    {
      label: "งานรอ Approve",
      value: data.eventsByStatus.pending_approval.toLocaleString(),
      icon: Clock,
      highlight: data.eventsByStatus.pending_approval > 0,
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          ภาพรวมระบบ Virtual Run Admin
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className={
              stat.highlight
                ? "border-amber-400/50 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-950/20"
                : undefined
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon
                className={`h-4 w-4 ${
                  stat.highlight
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }`}
              />
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  stat.highlight
                    ? "text-amber-700 dark:text-amber-300"
                    : ""
                }`}
              >
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Events by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.eventsByStatus).map(([status, count]) => {
              const s = statusLabels[status] ?? {
                label: status,
                variant: "secondary" as const,
              };
              return (
                <div
                  key={status}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <Badge variant={s.variant}>{s.label}</Badge>
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/payments">
              <Button
                variant="outline"
                className="gap-2 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <CreditCard className="h-4 w-4" />
                ตรวจสลิปโอนเงิน
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/admin/organizer-applications">
              <Button
                variant="outline"
                className="gap-2 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <FileCheck className="h-4 w-4" />
                ตรวจ Organizer Applications
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/admin/events">
              <Button
                variant="outline"
                className="gap-2 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <CalendarDays className="h-4 w-4" />
                จัดการ Events
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
