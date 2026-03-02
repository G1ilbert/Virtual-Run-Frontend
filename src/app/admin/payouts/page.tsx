"use client";

import { useState } from "react";
import {
  useAdminPayouts,
  createPayout,
  confirmPayout,
} from "@/hooks/useAdminApi";
import type { Payout } from "@/types/api";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  Wallet,
  Clock,
} from "lucide-react";

function formatAmount(amount: number) {
  return `\u0E3F${new Intl.NumberFormat("th-TH").format(amount)}`;
}

function statusBadge(status: Payout["status"]) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
          รอยืนยัน
        </Badge>
      );
    case "confirmed":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          ยืนยันแล้ว
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          ปฏิเสธ
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AdminPayoutsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [newPayout, setNewPayout] = useState({
    eventId: "",
    organizerId: "",
    totalAmount: "",
  });

  const limit = 10;
  const { data, mutate, isLoading } = useAdminPayouts({
    page,
    limit,
    status: statusFilter,
  });

  const payouts = data?.data ?? [];
  const meta = data?.meta;

  // Summary calculations
  const confirmedTotal = payouts
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + (p.netAmount ?? 0), 0);
  const pendingTotal = payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.netAmount ?? 0), 0);

  const handleConfirm = async (id: number, status: "confirmed" | "rejected") => {
    setActionLoading(id);
    try {
      await confirmPayout(id, { status });
      await mutate();
      toast.success(
        status === "confirmed"
          ? "ยืนยัน Payout สำเร็จ"
          : "ปฏิเสธ Payout แล้ว"
      );
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayout.eventId || !newPayout.organizerId) {
      toast.error("กรุณากรอก Event ID และ Organizer ID");
      return;
    }
    setCreating(true);
    try {
      await createPayout({
        eventId: Number(newPayout.eventId),
        organizerId: Number(newPayout.organizerId),
        totalAmount: newPayout.totalAmount
          ? Number(newPayout.totalAmount)
          : undefined,
      });
      await mutate();
      toast.success("สร้าง Payout สำเร็จ");
      setDialogOpen(false);
      setNewPayout({ eventId: "", organizerId: "", totalAmount: "" });
    } catch {
      toast.error("สร้าง Payout ไม่สำเร็จ");
    } finally {
      setCreating(false);
    }
  };

  const handleTabChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">จัดการ Payouts</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              สร้าง Payout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>สร้าง Payout ใหม่</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลเพื่อสร้าง Payout ให้ Organizer
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventId">Event ID</Label>
                <Input
                  id="eventId"
                  type="number"
                  placeholder="เช่น 1"
                  value={newPayout.eventId}
                  onChange={(e) =>
                    setNewPayout((prev) => ({
                      ...prev,
                      eventId: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizerId">Organizer ID</Label>
                <Input
                  id="organizerId"
                  type="number"
                  placeholder="เช่น 2"
                  value={newPayout.organizerId}
                  onChange={(e) =>
                    setNewPayout((prev) => ({
                      ...prev,
                      organizerId: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">
                  Total Amount (ไม่กรอก = คำนวณอัตโนมัติ)
                </Label>
                <Input
                  id="totalAmount"
                  type="number"
                  placeholder="เช่น 50000"
                  value={newPayout.totalAmount}
                  onChange={(e) =>
                    setNewPayout((prev) => ({
                      ...prev,
                      totalAmount: e.target.value,
                    }))
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating} className="gap-2">
                  {creating && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  สร้าง Payout
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ยอดยืนยันแล้ว</p>
              <p className="text-xl font-bold text-green-600">
                {formatAmount(confirmedTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ยอดรอยืนยัน</p>
              <p className="text-xl font-bold text-amber-600">
                {formatAmount(pendingTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="pending">รอยืนยัน</TabsTrigger>
          <TabsTrigger value="confirmed">ยืนยันแล้ว</TabsTrigger>
          <TabsTrigger value="">ทั้งหมด</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          ไม่พบข้อมูล Payout
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">
                    {payout.events?.title ?? `Event #${payout.eventId}`}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(payout.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {payout.commission != null
                      ? formatAmount(payout.commission)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {payout.netAmount != null
                      ? formatAmount(payout.netAmount)
                      : "-"}
                  </TableCell>
                  <TableCell>{statusBadge(payout.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {payout.createdAt
                      ? new Date(payout.createdAt).toLocaleDateString("th-TH")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {payout.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20"
                          disabled={actionLoading === payout.id}
                          onClick={() =>
                            handleConfirm(payout.id, "confirmed")
                          }
                        >
                          {actionLoading === payout.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                          disabled={actionLoading === payout.id}
                          onClick={() =>
                            handleConfirm(payout.id, "rejected")
                          }
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            หน้า {meta.page} / {meta.totalPages} (ทั้งหมด {meta.total} รายการ)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
