"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useStaffRegistrations,
  useStaffRunningResults,
  useStaffShipments,
  staffReviewRunningResult,
  staffUpdateShipment,
} from "@/hooks/useStaffApi";
import { useStaffEvents } from "@/hooks/useStaffApi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { generateShippingLabelPDF, generateTrackingNumber } from "@/components/shipping-label-pdf";
import type { SenderInfo } from "@/types/api";
import { mockSenderInfo } from "@/lib/organizer-mock-data";
import {
  ArrowLeft,
  Users,
  ClipboardCheck,
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  Truck,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Printer,
} from "lucide-react";

type Tab = "registrations" | "results" | "shipments";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const paymentBadge: Record<string, { label: string; color: string }> = {
  pending: { label: "รอชำระ", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  submitted: { label: "รอตรวจ", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  confirmed: { label: "ยืนยัน", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "ปฏิเสธ", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const resultBadge: Record<string, { label: string; color: string }> = {
  pending: { label: "รอตรวจ", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  approved: { label: "ผ่าน", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "ไม่ผ่าน", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const shipmentBadge: Record<string, { label: string; color: string }> = {
  pending: { label: "รอจัดส่ง", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  preparing: { label: "กำลังจัด", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  delivered: { label: "ส่งถึงแล้ว", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export default function StaffEventDetailPage() {
  const params = useParams();
  const eventId = Number(params.id);
  const [activeTab, setActiveTab] = useState<Tab>("registrations");

  // Fetch event info
  const { data: events } = useStaffEvents();
  const event = events?.find((e) => e.id === eventId);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "registrations", label: "ผู้สมัคร", icon: Users },
    { key: "results", label: "ผลวิ่ง", icon: ClipboardCheck },
    { key: "shipments", label: "จัดส่ง", icon: Package },
  ];

  return (
    <div className="px-4 md:px-6 py-6 max-w-[1000px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/staff">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold">{event?.title ?? "กำลังโหลด..."}</h1>
          {event && (
            <p className="text-sm text-muted-foreground">
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "registrations" && <RegistrationsTab eventId={eventId} />}
      {activeTab === "results" && <RunningResultsTab eventId={eventId} />}
      {activeTab === "shipments" && <ShipmentsTab eventId={eventId} eventTitle={event?.title ?? ""} />}
    </div>
  );
}

// ═════════════════════════════════════════
// Tab: Registrations (READ-ONLY)
// ═════════════════════════════════════════

function RegistrationsTab({ eventId }: { eventId: number }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useStaffRegistrations({ eventId, page, limit: 10 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const registrations = data?.data ?? [];
  const meta = data?.meta;

  if (registrations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>ยังไม่มีผู้สมัคร</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        ดูรายชื่อผู้สมัครเท่านั้น (read-only)
      </p>

      <div className="space-y-2">
        {registrations.map((reg) => {
          const badge = paymentBadge[reg.paymentStatus] ?? paymentBadge.pending;
          return (
            <div
              key={reg.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold">
                {(reg.users?.username ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {reg.users?.username ?? `User #${reg.userId}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reg.packages?.name ?? "Package"} &middot; {formatDate(reg.createdAt)}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════
// Tab: Running Results (Approve / Reject)
// ═════════════════════════════════════════

function RunningResultsTab({ eventId }: { eventId: number }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isLoading, mutate } = useStaffRunningResults({
    eventId,
    page,
    limit: 10,
    status: statusFilter || undefined,
  });
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleReview = async () => {
    if (!reviewId) return;
    setReviewing(true);
    try {
      await staffReviewRunningResult(reviewId, {
        status: reviewAction,
        reviewNote: reviewNote || undefined,
      });
      toast.success(reviewAction === "approved" ? "อนุมัติผลวิ่งแล้ว" : "ปฏิเสธผลวิ่งแล้ว");
      setReviewId(null);
      setReviewNote("");
      await mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setReviewing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const results = data?.data ?? [];
  const meta = data?.meta;

  const statusFilters = [
    { value: "", label: "ทั้งหมด" },
    { value: "pending", label: "รอตรวจ" },
    { value: "approved", label: "ผ่าน" },
    { value: "rejected", label: "ไม่ผ่าน" },
  ];

  return (
    <div>
      {/* Status Filter */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors whitespace-nowrap",
              statusFilter === f.value
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-background text-muted-foreground border-border hover:border-emerald-600/50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>ไม่มีผลวิ่ง</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((rr) => {
            const badge = resultBadge[rr.status] ?? resultBadge.pending;
            const proof = rr.runningProofs;
            const reg = rr.registrations;

            return (
              <div key={rr.id} className="rounded-xl border p-4">
                <div className="flex gap-3">
                  {/* Proof Image */}
                  {proof?.imageUrl && (
                    <div
                      className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer"
                      onClick={() => setPreviewImage(proof.imageUrl)}
                    >
                      <img
                        src={proof.imageUrl}
                        alt="proof"
                        className="h-full w-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {reg?.users?.username ?? `User #${reg?.userId}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reg?.packages?.name} &middot; {formatDate(rr.createdAt)}
                        </p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Distance & Duration */}
                    <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                      {proof?.distance && <span>{proof.distance} กม.</span>}
                      {proof?.duration && <span>{proof.duration}</span>}
                    </div>
                    {proof?.note && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {proof.note}
                      </p>
                    )}

                    {/* Review Note */}
                    {rr.reviewNote && (
                      <p className="text-xs mt-1.5 bg-muted rounded px-2 py-1">
                        <span className="font-medium">หมายเหตุ:</span> {rr.reviewNote}
                      </p>
                    )}

                    {/* Actions for pending */}
                    {rr.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={() => {
                            setReviewId(rr.id);
                            setReviewAction("approved");
                            setReviewNote("");
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          อนุมัติ
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            setReviewId(rr.id);
                            setReviewAction("rejected");
                            setReviewNote("");
                          }}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          ปฏิเสธ
                        </Button>
                        {proof?.imageUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1"
                            onClick={() => setPreviewImage(proof.imageUrl)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            ดูรูป
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Edit status back for already reviewed */}
                    {(rr.status === "approved" || rr.status === "rejected") && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            setReviewId(rr.id);
                            setReviewAction(rr.status === "approved" ? "rejected" : "approved");
                            setReviewNote("");
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          แก้ไข
                        </Button>
                        {proof?.imageUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1"
                            onClick={() => setPreviewImage(proof.imageUrl)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            ดูรูป
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewId !== null} onOpenChange={(open) => { if (!open) setReviewId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approved" ? "อนุมัติผลวิ่ง" : "ปฏิเสธผลวิ่ง"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approved"
                ? "ยืนยันว่าผลวิ่งนี้ถูกต้อง"
                : "ระบุเหตุผลที่ปฏิเสธ"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder={reviewAction === "rejected" ? "เหตุผลที่ปฏิเสธ..." : "หมายเหตุ (ถ้ามี)..."}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewId(null)}>
              ยกเลิก
            </Button>
            <Button
              className={
                reviewAction === "approved"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
              onClick={handleReview}
              disabled={reviewing}
            >
              {reviewing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewAction === "approved" ? "อนุมัติ" : "ปฏิเสธ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={previewImage !== null} onOpenChange={(open) => { if (!open) setPreviewImage(null); }}>
        <DialogContent className="max-w-lg p-2">
          <DialogHeader>
            <DialogTitle className="sr-only">ดูรูปผลวิ่ง</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img
              src={previewImage}
              alt="Running proof"
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═════════════════════════════════════════
// Tab: Shipments (Assigned to this staff only)
// ═════════════════════════════════════════

function ShipmentsTab({ eventId, eventTitle }: { eventId: number; eventTitle: string }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isLoading, mutate } = useStaffShipments({
    eventId,
    page,
    limit: 10,
    status: statusFilter || undefined,
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updating, setUpdating] = useState(false);

  // Sender info from localStorage or default
  const senderInfo: SenderInfo = (() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`sender_info_${eventId}`);
      if (saved) return JSON.parse(saved) as SenderInfo;
    }
    return mockSenderInfo;
  })();

  async function handlePrintLabel(ship: any) {
    const reg = ship.registrations;
    const tracking = ship.shipmentStaff?.find((ss: any) => ss.trackingNumber)?.trackingNumber || generateTrackingNumber(ship.id);
    await generateShippingLabelPDF([{
      trackingNumber: tracking,
      sender: senderInfo,
      recipient: {
        name: reg?.users?.username ?? `ผู้รับ #${ship.registrationId}`,
        address: reg?.addressDetail ?? "123 ถ.สุขุมวิท",
        district: "วัฒนา",
        province: "กรุงเทพฯ",
        zipCode: "10110",
        phone: "08x-xxx-xxxx",
      },
      eventTitle,
      packageName: reg?.packages?.name ?? "-",
      items: (ship.shipmentItems ?? []).map((si: any) => {
        const name = si.items?.name ?? `Item #${si.itemId}`;
        const variant = si.itemVariants ? ` (${si.itemVariants.variantValue})` : "";
        return `${name}${variant}`;
      }),
      createdDate: formatDate(ship.createdAt) || "-",
    }]);
  }

  const handleUpdateShipment = async (id: number, status: string) => {
    setUpdating(true);
    try {
      await staffUpdateShipment(id, {
        status,
        trackingNumber: trackingNumber || undefined,
      });
      toast.success("อัพเดทสถานะจัดส่งแล้ว");
      setEditId(null);
      setTrackingNumber("");
      await mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const shipments = data?.data ?? [];
  const meta = data?.meta;

  const statusFilters = [
    { value: "", label: "ทั้งหมด" },
    { value: "pending", label: "รอจัดส่ง" },
    { value: "preparing", label: "กำลังจัด" },
    { value: "shipped", label: "จัดส่งแล้ว" },
    { value: "delivered", label: "ส่งถึงแล้ว" },
  ];

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        แสดงเฉพาะพัสดุที่ได้รับมอบหมาย
      </p>

      {/* Status Filter */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors whitespace-nowrap",
              statusFilter === f.value
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-background text-muted-foreground border-border hover:border-emerald-600/50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shipments.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>ไม่มีพัสดุที่ได้รับมอบหมาย</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((ship) => {
            const badge = shipmentBadge[ship.status] ?? shipmentBadge.pending;
            const reg = (ship as any).registrations;
            const tracking = ship.shipmentStaff?.find((ss) => ss.trackingNumber)?.trackingNumber;

            return (
              <div key={ship.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-medium">
                      {reg?.users?.username ?? `User #${reg?.userId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reg?.packages?.name} &middot; #{ship.id}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Items */}
                {ship.shipmentItems && ship.shipmentItems.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-0.5 mb-2">
                    {ship.shipmentItems.map((si) => (
                      <p key={si.id}>
                        &bull; {si.items?.name}
                        {si.itemVariants && ` (${si.itemVariants.variantValue})`}
                        {si.quantity > 1 && ` x${si.quantity}`}
                      </p>
                    ))}
                  </div>
                )}

                {/* Tracking */}
                {tracking && (
                  <p className="text-xs mb-2">
                    <span className="font-medium">Tracking:</span>{" "}
                    <span className="text-emerald-600 font-mono">{tracking}</span>
                  </p>
                )}

                {/* Print Label */}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => handlePrintLabel(ship)}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    พิมพ์ใบจ่าหน้า
                  </Button>
                </div>

                {/* Actions */}
                {(ship.status === "preparing" || ship.status === "pending") && (
                  <div className="flex gap-2 mt-2">
                    {editId === ship.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="หมายเลขพัสดุ (Tracking)"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="h-8 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={updating}
                            onClick={() => handleUpdateShipment(ship.id, "shipped")}
                          >
                            {updating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                            <Truck className="mr-1 h-3 w-3" />
                            จัดส่ง
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => { setEditId(null); setTrackingNumber(""); }}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => setEditId(ship.id)}
                      >
                        <Truck className="h-3.5 w-3.5" />
                        อัพเดทการจัดส่ง
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
