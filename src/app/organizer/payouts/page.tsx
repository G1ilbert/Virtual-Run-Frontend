"use client";

import { useMemo } from "react";
import { OrganizerGuard } from "@/components/organizer-guard";
import { useMyPayouts } from "@/hooks/useOrganizerApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  Clock,
  CheckCircle,
  Loader2,
  CalendarDays,
} from "lucide-react";
import type { Payout } from "@/types/api";

const payoutStatusMap: Record<
  Payout["status"],
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  pending: { label: "รออนุมัติ", variant: "secondary" },
  confirmed: { label: "จ่ายแล้ว", variant: "default" },
  rejected: { label: "ไม่อนุมัติ", variant: "destructive" },
};

function PayoutsContent() {
  const { data: payouts, isLoading } = useMyPayouts();

  const summary = useMemo(() => {
    if (!payouts) return { confirmedTotal: 0, pendingTotal: 0 };

    const confirmedTotal = payouts
      .filter((p) => p.status === "confirmed")
      .reduce((sum, p) => sum + (p.netAmount ?? 0), 0);

    const pendingTotal = payouts
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + (p.netAmount ?? 0), 0);

    return { confirmedTotal, pendingTotal };
  }, [payouts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">รายได้</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รายได้สุทธิ (จ่ายแล้ว)
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ฿{summary.confirmedTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รอดำเนินการ
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ฿{summary.pendingTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">รายการ Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {!payouts || payouts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Wallet className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                ยังไม่มีรายการ Payout
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => {
                const s = payoutStatusMap[payout.status];
                const commission = payout.commission ?? payout.totalAmount * 0.1;
                return (
                  <div key={payout.id}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-sm font-medium">
                          {payout.events?.title ?? `Event #${payout.eventId}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            ยอดรวม: ฿{payout.totalAmount.toLocaleString()}
                          </span>
                          <span>
                            ค่าคอมมิชชั่น (10%): ฿{commission.toLocaleString()}
                          </span>
                          <span className="font-medium text-foreground">
                            สุทธิ: ฿
                            {(payout.netAmount ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {payout.createdAt
                            ? new Date(payout.createdAt).toLocaleDateString(
                                "th-TH",
                              )
                            : "-"}
                        </div>
                      </div>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrganizerPayoutsPage() {
  return (
    <OrganizerGuard>
      <PayoutsContent />
    </OrganizerGuard>
  );
}
