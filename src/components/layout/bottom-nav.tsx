"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ClipboardList, User, PersonStanding, Plus, Upload, X, Loader2, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useMyRegistrations, useMyRunningProofs, submitRunningProof, submitRunningResult } from "@/hooks/useApi";
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

const navItems = [
  { href: "/", icon: Home, label: "หน้าแรก" },
  { href: "/search", icon: Search, label: "ค้นหา" },
  { href: "#submit", icon: null, label: "ส่งผลวิ่ง", special: true },
  { href: "/my", icon: ClipboardList, label: "งานของฉัน" },
  { href: "/profile", icon: User, label: "โปรไฟล์" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ imageUrl: "", distance: "", duration: "", note: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>([]);

  const { data: registrations } = useMyRegistrations();
  const { mutate: mutateProofs } = useMyRunningProofs();

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
      await mutateProofs();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Role-based panel link (mobile) */}
      {user && (user.role === "ORGANIZER" || user.role === "ADMIN") && (
        <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 md:hidden">
          <div className="flex justify-center gap-2 px-4 pb-1">
            {(user.role === "ORGANIZER" || user.role === "ADMIN") && (
              <Link
                href="/organizer"
                className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 shadow-sm"
              >
                <Crown className="h-3.5 w-3.5" />
                จัดการงานวิ่ง
              </Link>
            )}
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/40 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 shadow-sm"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href !== "#submit" && pathname.startsWith(item.href);

            if (item.special) {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setOpen(true)}
                  className="flex flex-col items-center -mt-5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/30 transition-transform active:scale-95">
                    <PersonStanding className="h-7 w-7 text-brand-foreground" />
                  </div>
                  <span className="mt-0.5 text-[10px] font-medium text-brand-foreground dark:text-brand">
                    {item.label}
                  </span>
                </button>
              );
            }

            const Icon = item.icon!;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 px-3 transition-colors",
                  isActive
                    ? "text-brand-foreground dark:text-brand"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Submit Running Proof Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
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
                      className={`cursor-pointer rounded-lg border p-2.5 text-sm transition-colors ${
                        selectedRegistrations.includes(reg.id) ? "border-brand bg-brand/5" : "border-border hover:border-brand/30"
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
            <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ส่งผลวิ่ง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
