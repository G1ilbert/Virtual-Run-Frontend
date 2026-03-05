"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  useMyRunningProofs,
  useMyRegistrations,
  submitRunningProof,
  submitRunningResult,
} from "@/hooks/useApi";
import { AuthGuard } from "@/components/auth-guard";
import { cn } from "@/lib/utils";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  MapPin,
  Clock,
  PersonStanding,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RunningProofsPage() {
  const { data: proofs, isLoading, mutate } = useMyRunningProofs();
  const { data: registrations } = useMyRegistrations();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ imageUrl: "", distance: "", duration: "", note: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>([]);

  const confirmedRegs = registrations?.filter((r) => r.paymentStatus === "confirmed") ?? [];

  const toggleReg = (id: number) => {
    setSelectedRegistrations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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

  const handleSubmit = async () => {
    if (!form.imageUrl.trim()) {
      toast.error("กรุณาเลือกรูปผลวิ่ง");
      return;
    }
    setSubmitting(true);
    try {
      const proof = await submitRunningProof({
        imageUrl: form.imageUrl,
        distance: form.distance ? Number(form.distance) : undefined,
        duration: form.duration || undefined,
        note: form.note || undefined,
      });
      for (const regId of selectedRegistrations) {
        await submitRunningResult({ registrationId: regId, runningProofId: proof.id });
      }
      toast.success("ส่งผลวิ่งสำเร็จ!");
      setOpen(false);
      setForm({ imageUrl: "", distance: "", duration: "", note: "" });
      clearImage();
      setSelectedRegistrations([]);
      await mutate();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="px-4 md:px-6 py-4 max-w-[900px]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">ผลวิ่งของฉัน</h1>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
                <Plus className="mr-1 h-4 w-4" />
                ส่งผลวิ่งใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ส่งผลวิ่งใหม่</DialogTitle>
                <DialogDescription>อัพโหลดรูปผลวิ่งและกรอกข้อมูล</DialogDescription>
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
                      className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:border-brand/50 transition-colors"
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
                    <Label>ระยะทาง (กม.)</Label>
                    <Input type="number" step="0.01" placeholder="5.00" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>เวลา</Label>
                    <Input placeholder="00:30:00" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>หมายเหตุ</Label>
                  <Textarea placeholder="โน้ตเพิ่มเติม..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} />
                </div>

                {confirmedRegs.length > 0 && (
                  <div className="space-y-2">
                    <Label>ผูกกับงาน (เลือกได้หลายงาน)</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {confirmedRegs.map((reg) => (
                        <div
                          key={reg.id}
                          className={cn(
                            "cursor-pointer rounded-lg border p-2.5 text-sm transition-colors",
                            selectedRegistrations.includes(reg.id)
                              ? "border-brand bg-brand/5"
                              : "border-border hover:border-brand/30"
                          )}
                          onClick={() => toggleReg(reg.id)}
                        >
                          {reg.packages?.events?.title ?? reg.packages?.name ?? `#${reg.id}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
                <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  ส่งผลวิ่ง
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Proofs List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3 rounded-xl border p-3">
                <div className="w-16 h-16 rounded-lg bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : proofs?.length ? (
          <div className="space-y-3">
            {proofs.map((proof) => {
              const resultStatus = proof.runningResults?.[0]?.status;
              const statusMap: Record<string, { label: string; color: string }> = {
                approved: { label: "ผ่าน", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                rejected: { label: "ไม่ผ่าน", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
                pending: { label: "รอตรวจ", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
              };
              const badge = resultStatus ? statusMap[resultStatus] : null;

              return (
                <Link
                  key={proof.id}
                  href={`/my/running-proofs/${proof.id}`}
                  className="flex gap-3 rounded-xl border p-3 hover:bg-muted/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {proof.imageUrl ? (
                      <img src={proof.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      {proof.distance && (
                        <span className="flex items-center gap-1 font-semibold">
                          <MapPin className="h-3.5 w-3.5" />
                          {proof.distance} กม.
                        </span>
                      )}
                      {proof.duration && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {proof.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(proof.createdAt)}
                    </p>
                    {/* Linked events */}
                    {proof.runningResults && proof.runningResults.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        <span className="font-medium text-foreground/70">ผูกกับ:</span>{" "}
                        {proof.runningResults.map((rr) =>
                          rr.registrations?.packages?.events?.title ?? `#${rr.registrationId}`
                        ).join(", ")}
                      </p>
                    )}
                    {badge && (
                      <span className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PersonStanding className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">ยังไม่มีผลวิ่ง</p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
