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
import { CardSkeleton } from "@/components/page-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  Image,
  MapPin,
  Clock,
  ChevronRight,
  Trophy,
  PersonStanding,
  Upload,
  X,
} from "lucide-react";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
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
  const [form, setForm] = useState({
    imageUrl: "",
    distance: "",
    duration: "",
    note: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>(
    [],
  );

  const confirmedRegs =
    registrations?.filter((r) => r.paymentStatus === "confirmed") ?? [];

  const toggleReg = (id: number) => {
    setSelectedRegistrations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview using local URL
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    // For mock mode, use the local URL as imageUrl
    // For real mode, this would upload to a cloud service first
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

      // Link to selected registrations
      for (const regId of selectedRegistrations) {
        await submitRunningResult({
          registrationId: regId,
          runningProofId: proof.id,
        });
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
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            ผลวิ่งของฉัน
          </h1>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand text-brand-foreground hover:bg-brand/90">
                <Plus className="mr-1.5 h-4 w-4" />
                ส่งผลวิ่ง
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ส่งผลวิ่งใหม่</DialogTitle>
                <DialogDescription>
                  อัพโหลดรูปผลวิ่งและกรอกข้อมูล
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label>รูปผลวิ่ง *</Label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-48 object-contain rounded-lg border bg-muted"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={clearImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-brand/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        คลิกเพื่อเลือกรูป
                      </p>
                      <p className="text-xs text-muted-foreground">
                        รองรับ JPG, PNG
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>ระยะทาง (กม.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="5.00"
                      value={form.distance}
                      onChange={(e) =>
                        setForm({ ...form, distance: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>เวลา</Label>
                    <Input
                      placeholder="00:30:00"
                      value={form.duration}
                      onChange={(e) =>
                        setForm({ ...form, duration: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>หมายเหตุ</Label>
                  <Textarea
                    placeholder="โน้ตเพิ่มเติม..."
                    value={form.note}
                    onChange={(e) =>
                      setForm({ ...form, note: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                {/* Registration multi-select */}
                {confirmedRegs.length > 0 && (
                  <div className="space-y-2">
                    <Label>ผูกกับงาน (เลือกได้หลายงาน)</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {confirmedRegs.map((reg) => (
                        <div
                          key={reg.id}
                          className={`cursor-pointer rounded-lg border p-2.5 text-sm transition-colors ${
                            selectedRegistrations.includes(reg.id)
                              ? "border-brand bg-brand/5"
                              : "border-border hover:border-brand/30"
                          }`}
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
                <Button variant="outline" onClick={() => setOpen(false)}>
                  ยกเลิก
                </Button>
                <Button
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  ส่งผลวิ่ง
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Proofs list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : proofs?.length ? (
          <div className="space-y-3">
            {proofs.map((proof) => (
              <Link key={proof.id} href={`/my/running-proofs/${proof.id}`}>
                <Card className="transition-all hover:shadow-md hover:border-brand/30">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image preview */}
                      <div className="h-20 w-20 shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {proof.imageUrl ? (
                          <img
                            src={proof.imageUrl}
                            alt="Running proof"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image className="h-8 w-8 text-muted-foreground/40" />
                        )}
                      </div>

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
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(proof.createdAt)}
                        </p>

                        {proof.runningResults &&
                          proof.runningResults.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {proof.runningResults.map((rr) => (
                                <Badge
                                  key={rr.id}
                                  variant={
                                    rr.status === "approved"
                                      ? "default"
                                      : rr.status === "rejected"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="text-[10px]"
                                >
                                  {rr.status === "approved"
                                    ? "อนุมัติ"
                                    : rr.status === "rejected"
                                      ? "ไม่ผ่าน"
                                      : "รอตรวจ"}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <PersonStanding className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="mb-2">ยังไม่มีผลวิ่ง</p>
            <p className="text-sm">กดปุ่ม &ldquo;ส่งผลวิ่ง&rdquo; เพื่อส่งผลวิ่งใหม่</p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
