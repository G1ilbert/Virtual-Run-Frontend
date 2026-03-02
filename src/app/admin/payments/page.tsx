"use client";

import { useState } from "react";
import { useAdminSlips, verifySlip } from "@/hooks/useAdminApi";
import type { Registration } from "@/types/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  ImageIcon,
  Loader2,
  Eye,
} from "lucide-react";

const PAYMENT_TABS = [
  { value: "submitted", label: "รอตรวจ" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "rejected", label: "ปฏิเสธ" },
  { value: "", label: "ทั้งหมด" },
] as const;

function getPaymentStatusBadge(status: Registration["paymentStatus"]) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">รอชำระ</Badge>;
    case "submitted":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
          รอตรวจสอบ
        </Badge>
      );
    case "confirmed":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
          ยืนยันแล้ว
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
          ปฏิเสธ
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount?: number) {
  if (amount == null) return "-";
  return "\u0E3F" + new Intl.NumberFormat("th-TH").format(amount);
}

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState("submitted");
  const limit = 12;

  const {
    data: slipsData,
    isLoading,
    mutate: mutateSlips,
  } = useAdminSlips({ page, limit, paymentStatus: paymentStatus || undefined });

  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    imageUrl: string;
  }>({ open: false, imageUrl: "" });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "confirmed" | "rejected";
    registration: Registration | null;
  }>({ open: false, type: "confirmed", registration: null });

  const [actionLoading, setActionLoading] = useState(false);

  const registrations = slipsData?.data ?? [];
  const meta = slipsData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const handleTabChange = (value: string) => {
    setPaymentStatus(value);
    setPage(1);
  };

  const openPreview = (imageUrl: string) => {
    setPreviewDialog({ open: true, imageUrl });
  };

  const openConfirmDialog = (
    type: "confirmed" | "rejected",
    registration: Registration
  ) => {
    setConfirmDialog({ open: true, type, registration });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.registration) return;
    setActionLoading(true);
    try {
      await verifySlip(confirmDialog.registration.id, {
        status: confirmDialog.type,
      });
      if (confirmDialog.type === "confirmed") {
        toast.success("ยืนยันการชำระเงินสำเร็จ");
      } else {
        toast.success("ปฏิเสธสลิปสำเร็จ");
      }
      await mutateSlips();
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: "confirmed", registration: null });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">ตรวจสลิปโอนเงิน</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ตรวจสอบและยืนยันสลิปการโอนเงินจากผู้สมัคร
        </p>
      </div>

      {/* Status filter tabs */}
      <Tabs value={paymentStatus} onValueChange={handleTabChange}>
        <TabsList className="flex-wrap">
          {PAYMENT_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Card list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CreditCard className="h-12 w-12 mb-3" />
          <p className="text-lg font-medium">ไม่พบรายการ</p>
          <p className="text-sm">ลองเปลี่ยนตัวกรองสถานะดู</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {registrations.map((reg) => (
              <Card key={reg.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Slip image */}
                  <div className="relative">
                    {reg.slipUrl ? (
                      <div
                        className="relative cursor-pointer group"
                        onClick={() => openPreview(reg.slipUrl!)}
                      >
                        <img
                          src={reg.slipUrl}
                          alt="สลิป"
                          className="w-full h-48 object-cover rounded-md border bg-muted"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors rounded-md">
                          <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center bg-muted h-48 rounded-md border">
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                          <p className="text-xs">ไม่มีรูป</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getPaymentStatusBadge(reg.paymentStatus)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {reg.users?.username ?? "ไม่ทราบชื่อ"}
                      </p>
                      <p className="font-bold text-sm text-red-600">
                        {formatAmount(reg.priceSnapshot)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {reg.packages?.events?.title ?? reg.packages?.name ?? "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(reg.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  {reg.paymentStatus === "submitted" && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => openConfirmDialog("confirmed", reg)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        ยืนยัน
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => openConfirmDialog("rejected", reg)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        ปฏิเสธ
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              หน้า {meta?.page ?? page} จาก {totalPages} (ทั้งหมด{" "}
              {meta?.total ?? 0} รายการ)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Image Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onOpenChange={(open) => {
          if (!open) setPreviewDialog({ open: false, imageUrl: "" });
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>สลิปโอนเงิน</DialogTitle>
          </DialogHeader>
          {previewDialog.imageUrl && (
            <div className="flex items-center justify-center">
              <img
                src={previewDialog.imageUrl}
                alt="สลิปโอนเงิน"
                className="max-h-[70vh] w-auto rounded-md border"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm/Reject Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({
              open: false,
              type: "confirmed",
              registration: null,
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "confirmed"
                ? "ยืนยันการชำระเงิน"
                : "ปฏิเสธสลิป"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === "confirmed"
                ? ("คุณต้องการยืนยันการชำระเงินของ \"" +
                    (confirmDialog.registration?.users?.username ?? "") +
                    "\" จำนวน " +
                    formatAmount(confirmDialog.registration?.priceSnapshot) +
                    " ใช่หรือไม่?")
                : ("คุณต้องการปฏิเสธสลิปของ \"" +
                    (confirmDialog.registration?.users?.username ?? "") +
                    "\" ใช่หรือไม่?")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({
                  open: false,
                  type: "confirmed",
                  registration: null,
                })
              }
              disabled={actionLoading}
            >
              ยกเลิก
            </Button>
            {confirmDialog.type === "confirmed" ? (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleConfirmAction}
                disabled={actionLoading}
              >
                {actionLoading && (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                )}
                ยืนยัน
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleConfirmAction}
                disabled={actionLoading}
              >
                {actionLoading && (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                )}
                ปฏิเสธ
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
