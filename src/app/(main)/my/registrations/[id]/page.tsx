"use client";

import { use, useState, useRef } from "react";
import { useRegistration, usePaymentQR, useMyRunningProofs, submitSlip, confirmDelivery, submitRunningProof, submitRunningResult } from "@/hooks/useApi";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  Circle,
  Upload,
  X,
  PersonStanding,
} from "lucide-react";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TimelineStep {
  label: string;
  done: boolean;
  detail?: string;
}

export default function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: reg, isLoading, mutate } = useRegistration(id);
  const { data: qrData } = usePaymentQR(
    reg?.paymentStatus === "pending" ? reg.id : undefined,
  );
  const { mutate: mutateProofs } = useMyRunningProofs();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submittingSlip, setSubmittingSlip] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submit proof dialog
  const [proofOpen, setProofOpen] = useState(false);
  const [proofSubmitting, setProofSubmitting] = useState(false);
  const [proofForm, setProofForm] = useState({ imageUrl: "", distance: "", duration: "", note: "" });
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const proofFileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmitSlip = async () => {
    if (!imagePreview || !reg) return;
    setSubmittingSlip(true);
    try {
      await submitSlip(reg.id, imagePreview);
      toast.success("ส่งหลักฐานแล้ว รอตรวจสอบ");
      setUploadOpen(false);
      setImagePreview(null);
      await mutate();
    } catch {
      // handled
    } finally {
      setSubmittingSlip(false);
    }
  };

  const handleConfirmDelivery = async () => {
    const shipment = reg?.shipments?.[0];
    if (!shipment) return;
    setConfirming(true);
    try {
      await confirmDelivery(shipment.id);
      toast.success("ยืนยันรับของสำเร็จ!");
      setConfirmOpen(false);
      await mutate();
    } catch {
      // handled
    } finally {
      setConfirming(false);
    }
  };

  const handleProofFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProofPreview(url);
    setProofForm((p) => ({ ...p, imageUrl: url }));
  };

  const clearProofImage = () => {
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofPreview(null);
    setProofForm((p) => ({ ...p, imageUrl: "" }));
    if (proofFileRef.current) proofFileRef.current.value = "";
  };

  const handleSubmitProof = async () => {
    if (!proofForm.imageUrl.trim() || !proofForm.distance || !reg) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setProofSubmitting(true);
    try {
      const proof = await submitRunningProof({
        imageUrl: proofForm.imageUrl,
        distance: Number(proofForm.distance),
        duration: proofForm.duration || undefined,
        note: proofForm.note || undefined,
      });
      await submitRunningResult({ registrationId: reg.id, runningProofId: proof.id });
      toast.success("ส่งผลวิ่งเรียบร้อย");
      setProofOpen(false);
      setProofForm({ imageUrl: "", distance: "", duration: "", note: "" });
      clearProofImage();
      await Promise.all([mutate(), mutateProofs()]);
    } catch {
      // handled
    } finally {
      setProofSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="max-w-2xl px-4 md:px-6 py-6 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="space-y-6 mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="h-4 w-32 bg-muted rounded mt-2" />
              </div>
            ))}
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!reg) {
    return (
      <AuthGuard>
        <div className="px-4 py-16 text-center">
          <PersonStanding className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">ไม่พบรายการลงทะเบียน</p>
        </div>
      </AuthGuard>
    );
  }

  const shipment = reg.shipments?.[0];
  const trackingNumber = shipment?.shipmentStaff?.[0]?.trackingNumber;
  const canSubmitProof = reg.paymentStatus === "confirmed";

  // Progress calculation
  const target = reg.targetDistanceSnapshot ?? reg.packages?.targetDistance ?? 0;
  const approvedResults = reg.runningResults?.filter((r) => r.status === "approved") ?? [];
  const ran = approvedResults.reduce((sum, r) => sum + (r.runningProofs?.distance ?? 0), 0);
  const progressPercent = target > 0 ? Math.min((ran / target) * 100, 100) : 0;
  const remaining = Math.max(target - ran, 0);
  const completed = ran >= target && target > 0;

  const paymentBadge = (() => {
    switch (reg.paymentStatus) {
      case "pending": return { label: "รอจ่าย", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "submitted": return { label: "รอตรวจสอบ", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
      case "confirmed": return { label: "จ่ายแล้ว", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      default: return { label: reg.paymentStatus, color: "bg-muted text-muted-foreground" };
    }
  })();

  const steps: TimelineStep[] = [
    { label: "สมัครแล้ว", done: true, detail: formatDate(reg.createdAt) },
    { label: "ชำระเงิน", done: reg.paymentStatus === "confirmed" || reg.paymentStatus === "submitted", detail: reg.paymentStatus === "confirmed" ? "ชำระแล้ว" : reg.paymentStatus === "submitted" ? "รอตรวจสอบ" : "รอชำระ" },
    { label: "ตรวจสอบ", done: reg.paymentStatus === "confirmed", detail: reg.paymentStatus === "confirmed" ? "ตรวจสอบแล้ว" : "รอตรวจ" },
    { label: "จัดส่ง", done: !!shipment && ["shipped", "delivered"].includes(shipment.status), detail: trackingNumber ?? (shipment ? shipment.status === "preparing" ? "กำลังเตรียม" : "รอจัดส่ง" : "รอจัดส่ง") },
    { label: "ได้รับของ", done: shipment?.status === "delivered", detail: shipment?.status === "delivered" ? formatDate(shipment.updatedAt) : "รอรับ" },
  ];

  return (
    <AuthGuard>
      <div className="max-w-2xl px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold">{reg.packages?.events?.title ?? `#${reg.id}`}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">{reg.packages?.name}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${paymentBadge.color}`}>
              {paymentBadge.label}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {canSubmitProof && target > 0 && (
          <div className="rounded-xl border p-4 mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {completed ? "วิ่งครบแล้ว!" : `${Math.round(ran * 10) / 10} / ${target} km`}
              </span>
              <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", completed ? "bg-green-500" : "bg-brand")}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {!completed && (
              <p className="text-xs text-muted-foreground">เหลืออีก {Math.round(remaining * 10) / 10} km</p>
            )}
            {completed && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> วิ่งครบแล้ว!
              </p>
            )}

            <Button
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90 mt-2"
              onClick={() => setProofOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              ส่งผลวิ่ง
            </Button>
          </div>
        )}

        {/* Vertical Timeline */}
        <div className="relative pl-8 space-y-6 mb-8">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />
          {steps.map((step) => (
            <div key={step.label} className="relative flex items-start gap-3">
              <div className="absolute -left-8 flex h-8 w-8 items-center justify-center">
                {step.done ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand">
                    <CheckCircle2 className="h-4 w-4 text-brand-foreground" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-background">
                    <Circle className="h-3 w-3 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${step.done ? "" : "text-muted-foreground"}`}>{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment QR Section */}
        {reg.paymentStatus === "pending" && (
          <div className="rounded-xl border p-4 mb-6 space-y-4">
            {qrData?.qrCodeDataUrl && (
              <div className="flex flex-col items-center">
                <img src={qrData.qrCodeDataUrl} alt="QR" className="h-48 w-48" />
                <p className="mt-2 text-2xl font-bold text-brand-foreground dark:text-brand">
                  ฿{Number(reg.priceSnapshot ?? 0).toLocaleString()}
                </p>
              </div>
            )}
            <Button className="w-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              ส่งหลักฐานการโอน
            </Button>
          </div>
        )}

        {/* Shipped - Confirm Delivery */}
        {shipment?.status === "shipped" && (
          <div className="rounded-xl border p-4 mb-6 space-y-3">
            {trackingNumber && (
              <div>
                <p className="text-sm text-muted-foreground">เลขพัสดุ</p>
                <p className="font-mono font-semibold text-lg">{trackingNumber}</p>
              </div>
            )}
            <Button className="w-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setConfirmOpen(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              ยืนยันรับของ
            </Button>
          </div>
        )}

        {/* Running Results */}
        {reg.runningResults && reg.runningResults.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold mb-3">ผลวิ่ง</h2>
            {reg.runningResults.map((rr) => {
              const statusMap: Record<string, { label: string; color: string }> = {
                approved: { label: "ผ่าน", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                rejected: { label: "ไม่ผ่าน", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
                pending: { label: "รอตรวจ", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
              };
              const s = statusMap[rr.status] ?? statusMap.pending;
              return (
                <div key={rr.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {rr.runningProofs?.distance ? `${rr.runningProofs.distance} km` : `Proof #${rr.runningProofId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(rr.createdAt)}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.color}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Slip Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ส่งหลักฐานการโอน</DialogTitle>
            <DialogDescription>เลือกรูปสลิปการโอนเงิน</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Slip" className="w-full max-h-64 object-contain rounded-lg border bg-muted" />
                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-brand/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">คลิกเพื่อเลือกรูปสลิป</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>ยกเลิก</Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleSubmitSlip} disabled={!imagePreview || submittingSlip}>
              {submittingSlip && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ส่ง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delivery Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>ยืนยันรับของ</DialogTitle>
            <DialogDescription>ได้รับของแล้วใช่ไหม?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>ยกเลิก</Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleConfirmDelivery} disabled={confirming}>
              {confirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Running Proof Dialog */}
      <Dialog open={proofOpen} onOpenChange={setProofOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ส่งผลวิ่ง</DialogTitle>
            <DialogDescription>อัพโหลดรูป screenshot GPS แล้วกรอกระยะทางและเวลา</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>รูปผลวิ่ง *</Label>
              {proofPreview ? (
                <div className="relative">
                  <img src={proofPreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border bg-muted" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={clearProofImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-brand/50 transition-colors" onClick={() => proofFileRef.current?.click()}>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">คลิกเพื่อเลือกรูป</p>
                </div>
              )}
              <input ref={proofFileRef} type="file" accept="image/*" className="hidden" onChange={handleProofFile} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>ระยะทาง (กม.) *</Label>
                <Input type="number" step="0.01" placeholder="5.00" value={proofForm.distance} onChange={(e) => setProofForm({ ...proofForm, distance: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>เวลา (ชม:นาที:วินาที)</Label>
                <Input placeholder="00:30:00" value={proofForm.duration} onChange={(e) => setProofForm({ ...proofForm, duration: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>หมายเหตุ</Label>
              <Textarea placeholder="โน้ตเพิ่มเติม..." value={proofForm.note} onChange={(e) => setProofForm({ ...proofForm, note: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProofOpen(false)}>ยกเลิก</Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleSubmitProof} disabled={proofSubmitting}>
              {proofSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ส่งผลวิ่ง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
