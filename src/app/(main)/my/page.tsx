"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMyRegistrations, useMyRunningProofs, submitRunningProof, submitRunningResult } from "@/hooks/useApi";
import { AuthGuard } from "@/components/auth-guard";
import { cn } from "@/lib/utils";
import { ClipboardList, Search, Upload, X, Loader2, CheckCircle2, ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Registration } from "@/types/api";

const TAB_FILTERS = [
  { label: "กำลังดำเนินการ", value: "active" },
  { label: "ประวัติ", value: "history" },
] as const;

function getProgressInfo(reg: Registration) {
  const target = reg.targetDistanceSnapshot ?? reg.packages?.targetDistance ?? 0;
  if (target <= 0) return { percent: 0, ran: 0, target: 0, remaining: 0, completed: false };

  const approvedResults = reg.runningResults?.filter((r) => r.status === "approved") ?? [];
  const ran = approvedResults.reduce((sum, r) => {
    const dist = r.runningProofs?.distance ?? 0;
    return sum + dist;
  }, 0);

  const percent = Math.min((ran / target) * 100, 100);
  const remaining = Math.max(target - ran, 0);
  const completed = ran >= target;

  return { percent, ran: Math.round(ran * 10) / 10, target, remaining: Math.round(remaining * 10) / 10, completed };
}

function getStatusBadge(reg: Registration) {
  if (reg.paymentStatus === "pending") return { label: "รอชำระเงิน", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
  if (reg.paymentStatus === "submitted") return { label: "รอตรวจสลิป", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  if (reg.paymentStatus === "rejected") return { label: "ชำระไม่สำเร็จ", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  if (reg.shipments?.some((s) => s.status === "delivered")) return { label: "ได้รับของแล้ว", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  if (reg.shipments?.some((s) => s.status === "shipped")) return { label: "กำลังจัดส่ง", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
  if (reg.shipments?.some((s) => s.status === "preparing")) return { label: "เตรียมจัดส่ง", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
  if (reg.paymentStatus === "confirmed") return { label: "จ่ายแล้ว", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  return { label: reg.paymentStatus, color: "bg-muted text-muted-foreground" };
}

function isActiveReg(reg: Registration): boolean {
  if (reg.paymentStatus === "pending" || reg.paymentStatus === "submitted") return true;
  if (reg.paymentStatus === "rejected") return true;
  if (reg.paymentStatus === "confirmed") {
    const delivered = reg.shipments?.some((s) => s.status === "delivered");
    if (delivered) {
      // Check if event is completed
      const eventStatus = reg.packages?.events?.status;
      return eventStatus !== "completed";
    }
    return true;
  }
  return false;
}

function calcPace(distance?: number, duration?: string) {
  if (!distance || !duration) return null;
  const parts = duration.split(":").map(Number);
  let totalMinutes = 0;
  if (parts.length === 3) totalMinutes = parts[0] * 60 + parts[1] + parts[2] / 60;
  else if (parts.length === 2) totalMinutes = parts[0] + parts[1] / 60;
  if (totalMinutes === 0 || distance === 0) return null;
  const paceMin = totalMinutes / distance;
  const min = Math.floor(paceMin);
  const sec = Math.round((paceMin - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatShortDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function RegistrationCard({
  reg,
  showActions,
  onSubmitProof,
}: {
  reg: Registration;
  showActions: boolean;
  onSubmitProof: (regId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const badge = getStatusBadge(reg);
  const progress = getProgressInfo(reg);
  const coverImage = reg.packages?.events?.coverImage || reg.packages?.events?.bannerImage;
  const canSubmitProof = reg.paymentStatus === "confirmed";
  const linkedResults = reg.runningResults ?? [];

  return (
    <div className="rounded-xl border p-3 space-y-3">
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="shrink-0 w-[120px] h-[80px] rounded-lg overflow-hidden bg-muted">
          {coverImage ? (
            <img src={coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ClipboardList className="h-6 w-6 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {reg.packages?.events?.title ?? reg.packages?.name ?? `#${reg.id}`}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Package: {reg.packages?.name}
          </p>
          <div className="mt-1.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {canSubmitProof && progress.target > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">
              {progress.completed ? "วิ่งครบแล้ว!" : `${progress.ran} / ${progress.target} km`}
            </span>
            <span className="text-muted-foreground">{Math.round(progress.percent)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress.completed ? "bg-green-500" : "bg-brand",
              )}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          {!progress.completed && (
            <p className="text-[11px] text-muted-foreground">เหลืออีก {progress.remaining} km</p>
          )}
          {progress.completed && (
            <p className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> วิ่งครบแล้ว!
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-2">
          {canSubmitProof && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => onSubmitProof(reg.id)}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              ส่งผลวิ่ง
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            asChild
          >
            <Link href={`/my/registrations/${reg.id}`}>
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              ดูรายละเอียด
            </Link>
          </Button>
        </div>
      )}

      {/* Expandable Linked Results */}
      {linkedResults.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
            ดูผลวิ่งที่ผูก ({linkedResults.length} รายการ)
          </button>
          {expanded && (
            <div className="mt-2 rounded-lg border divide-y text-xs">
              {linkedResults.map((rr) => {
                const dist = rr.runningProofs?.distance;
                const dur = rr.runningProofs?.duration;
                const pace = calcPace(dist, dur);
                const statusColors: Record<string, string> = {
                  approved: "text-green-600 dark:text-green-400",
                  rejected: "text-red-600 dark:text-red-400",
                  pending: "text-yellow-600 dark:text-yellow-400",
                };
                const statusLabels: Record<string, string> = {
                  approved: "ผ่าน",
                  rejected: "ไม่ผ่าน",
                  pending: "รอตรวจ",
                };

                return (
                  <Link
                    key={rr.id}
                    href={`/my/running-proofs/${rr.runningProofId}`}
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground w-14">{formatShortDate(rr.createdAt)}</span>
                      <span className="font-medium">{dist ? `${dist} km` : "—"}</span>
                      <span className="text-muted-foreground">{dur ?? "—"}</span>
                      {pace && <span className="text-muted-foreground">{pace} /km</span>}
                    </div>
                    <span className={cn("font-medium", statusColors[rr.status] ?? "")}>
                      {statusLabels[rr.status] ?? rr.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyDashboardPage() {
  const { data: registrations, isLoading, mutate: mutateRegs } = useMyRegistrations();
  const { mutate: mutateProofs } = useMyRunningProofs();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");

  // Submit proof dialog state
  const [proofOpen, setProofOpen] = useState(false);
  const [proofRegId, setProofRegId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ imageUrl: "", distance: "", duration: "", note: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openProofDialog = (regId: number) => {
    setProofRegId(regId);
    setProofOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setForm((prev) => ({ ...prev, imageUrl: localUrl }));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setForm((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitProof = async () => {
    if (!form.imageUrl.trim()) {
      toast.error("กรุณาเลือกรูปผลวิ่ง");
      return;
    }
    if (!form.distance) {
      toast.error("กรุณากรอกระยะทาง");
      return;
    }
    setSubmitting(true);
    try {
      const proof = await submitRunningProof({
        imageUrl: form.imageUrl,
        distance: Number(form.distance),
        duration: form.duration || undefined,
        note: form.note || undefined,
      });
      if (proofRegId) {
        await submitRunningResult({ registrationId: proofRegId, runningProofId: proof.id });
      }
      toast.success("ส่งผลวิ่งเรียบร้อย");
      setProofOpen(false);
      setForm({ imageUrl: "", distance: "", duration: "", note: "" });
      clearImage();
      setProofRegId(null);
      await Promise.all([mutateRegs(), mutateProofs()]);
    } catch {
      // handled by api-client
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = registrations?.filter((reg) => {
    if (activeTab === "active") return isActiveReg(reg);
    // history: completed events / delivered
    return !isActiveReg(reg);
  });

  return (
    <AuthGuard>
      <div className="px-4 md:px-6 py-4 max-w-[900px]">
        {/* Tab Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
          {TAB_FILTERS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Registration List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border p-3 space-y-3">
                <div className="flex gap-3">
                  <div className="w-[120px] h-[80px] rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered?.length ? (
          <div className="space-y-3">
            {filtered.map((reg) => (
              <RegistrationCard
                key={reg.id}
                reg={reg}
                showActions={activeTab === "active"}
                onSubmitProof={openProofDialog}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">
              {activeTab === "active" ? "ยังไม่มีงานที่สมัคร" : "ยังไม่มีประวัติ"}
            </p>
            {activeTab === "active" && (
              <Button
                variant="outline"
                onClick={() => router.push("/search")}
              >
                <Search className="mr-2 h-4 w-4" />
                ค้นหางานวิ่ง
              </Button>
            )}
          </div>
        )}
      </div>

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
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border bg-muted" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={clearImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-brand/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">คลิกเพื่อเลือกรูป</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>ระยะทาง (กม.) *</Label>
                <Input type="number" step="0.01" placeholder="5.00" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>เวลา (ชม:นาที:วินาที)</Label>
                <Input placeholder="00:30:00" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>หมายเหตุ</Label>
              <Textarea placeholder="โน้ตเพิ่มเติม..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProofOpen(false)}>ยกเลิก</Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleSubmitProof} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ส่งผลวิ่ง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
