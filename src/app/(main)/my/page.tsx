"use client";

import { useState } from "react";
import Link from "next/link";
import { useMyRegistrations } from "@/hooks/useApi";
import { AuthGuard } from "@/components/auth-guard";
import { CardSkeleton } from "@/components/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Package,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import type { Registration } from "@/types/api";

const paymentStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "รอชำระ", variant: "outline" },
  submitted: { label: "รอตรวจสอบ", variant: "secondary" },
  confirmed: { label: "ชำระแล้ว", variant: "default" },
  rejected: { label: "ถูกปฏิเสธ", variant: "destructive" },
};

function getShipmentStatus(reg: Registration) {
  if (!reg.shipments?.length) return null;
  const s = reg.shipments[0];
  const map: Record<string, string> = {
    pending: "รอเตรียม",
    preparing: "กำลังเตรียม",
    shipped: "จัดส่งแล้ว",
    delivered: "ได้รับแล้ว",
  };
  return map[s.status] ?? s.status;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RegistrationCard({ reg }: { reg: Registration }) {
  const payment = paymentStatusMap[reg.paymentStatus] ?? {
    label: reg.paymentStatus,
    variant: "outline" as const,
  };
  const shipmentStatus = getShipmentStatus(reg);

  return (
    <Link href={`/my/registrations/${reg.id}`}>
      <Card className="transition-all hover:shadow-md hover:border-brand/30">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {reg.packages?.events?.title ??
                  reg.packages?.name ??
                  `Registration #${reg.id}`}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {reg.packages?.name}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(reg.createdAt)}
                </span>
                {reg.targetDistanceSnapshot && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {reg.targetDistanceSnapshot} กม.
                  </span>
                )}
                {reg.priceSnapshot && (
                  <span className="flex items-center gap-1">
                    ฿{Number(reg.priceSnapshot).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                <Badge variant={payment.variant}>{payment.label}</Badge>
                {shipmentStatus && (
                  <Badge variant="secondary">
                    <Package className="mr-1 h-3 w-3" />
                    {shipmentStatus}
                  </Badge>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MyDashboardPage() {
  const { data: registrations, isLoading } = useMyRegistrations();
  const [tab, setTab] = useState("all");

  const filtered = registrations?.filter((reg) => {
    if (tab === "all") return true;
    if (tab === "pending") return reg.paymentStatus === "pending";
    if (tab === "shipping")
      return (
        reg.paymentStatus === "confirmed" &&
        reg.shipments?.some((s) => s.status !== "delivered")
      );
    if (tab === "done")
      return reg.shipments?.some((s) => s.status === "delivered");
    return true;
  });

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          งานของฉัน
        </h1>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="pending">รอจ่าย</TabsTrigger>
            <TabsTrigger value="shipping">จัดส่ง</TabsTrigger>
            <TabsTrigger value="done">เสร็จ</TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : filtered?.length ? (
              <div className="space-y-3">
                {filtered.map((reg) => (
                  <RegistrationCard key={reg.id} reg={reg} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground">
                <ClipboardList className="mx-auto mb-4 h-12 w-12 opacity-30" />
                <p>ยังไม่มีรายการ</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
