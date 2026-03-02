"use client";

import { use, useState } from "react";
import { OrganizerGuard } from "@/components/organizer-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useMyEvents,
  usePackagesByEvent,
  useItemsByEvent,
  useOrgRegistrations,
  useOrgRunningResults,
  useOrgShipments,
  useEventStaff,
  updateEvent,
  submitEventForReview,
  createPackage,
  updatePackage,
  deletePackage,
  createItem,
  updateItem,
  deleteItem,
  addItemVariant,
  deleteItemVariant,
  addPackageItem,
  removePackageItem,
  reviewRunningResult,
  createShipment,
  createBatchShipments,
  updateShipmentStatus,
  assignShipmentStaff,
  updateShipmentStaff,
  uploadEventCover,
  uploadEventDetails,
  uploadPackageImage,
  uploadItemImage,
} from "@/hooks/useOrganizerApi";
import { ImageUpload } from "@/components/image-upload";
import { toast } from "sonner";
import type { Event, Package as PackageType, Item, Registration } from "@/types/api";
import {
  Save,
  SendHorizonal,
  Plus,
  Trash2,
  Pencil,
  PackagePlus,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Ban,
  Truck,
  Users,
  ClipboardList,
  Trophy,
  Box,
  Info,
  LinkIcon,
} from "lucide-react";

// ─── Helpers ───

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateInput(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 10);
}

function statusBadge(status: string) {
  const map: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
    draft: { variant: "secondary", label: "แบบร่าง" },
    pending_approval: { variant: "secondary", label: "รอตรวจ" },
    approved: { variant: "default", label: "อนุมัติ" },
    rejected: { variant: "destructive", label: "ไม่ผ่าน" },
    completed: { variant: "default", label: "เสร็จสิ้น" },
    pending: { variant: "secondary", label: "รอดำเนินการ" },
    submitted: { variant: "secondary", label: "ส่งสลิปแล้ว" },
    confirmed: { variant: "default", label: "ยืนยันแล้ว" },
    preparing: { variant: "secondary", label: "กำลังจัดเตรียม" },
    shipped: { variant: "default", label: "จัดส่งแล้ว" },
    delivered: { variant: "default", label: "ได้รับแล้ว" },
  };
  const m = map[status] ?? { variant: "secondary" as const, label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

function paymentBadge(status: string) {
  const map: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
    pending: { variant: "secondary", label: "รอชำระ" },
    submitted: { variant: "secondary", label: "ส่งสลิปแล้ว" },
    confirmed: { variant: "default", label: "ยืนยันแล้ว" },
    rejected: { variant: "destructive", label: "ไม่ผ่าน" },
  };
  const m = map[status] ?? { variant: "secondary" as const, label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

function calcPace(distance?: number, duration?: string) {
  if (!distance || !duration || distance <= 0) return null;
  const parts = duration.split(":").map(Number);
  const totalMinutes = (parts[0] ?? 0) * 60 + (parts[1] ?? 0) + (parts[2] ?? 0) / 60;
  const paceMin = totalMinutes / distance;
  const m = Math.floor(paceMin);
  const s = Math.round((paceMin - m) * 60);
  return { formatted: `${m}:${s.toString().padStart(2, "0")}`, raw: paceMin };
}

// ─── Pagination Component ───

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        หน้า {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Tab 1: Details
// ═══════════════════════════════════════════════════════════════════

function DetailsTab({
  event,
  onSaved,
}: {
  event: Event;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [startDate, setStartDate] = useState(formatDateInput(event.startDate));
  const [endDate, setEndDate] = useState(formatDateInput(event.endDate));
  const [coverImage, setCoverImage] = useState(event.coverImage ?? "");
  const [detailImages, setDetailImages] = useState<string[]>(event.detailImages ?? []);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateEvent(event.id, {
        title,
        description,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      // Upload images
      if (coverImage && coverImage !== event.coverImage) {
        await uploadEventCover(event.id, coverImage);
      }
      if (JSON.stringify(detailImages) !== JSON.stringify(event.detailImages ?? [])) {
        await uploadEventDetails(event.id, detailImages);
      }
      toast.success("บันทึกสำเร็จ");
      onSaved();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitForReview() {
    setSubmitting(true);
    try {
      await submitEventForReview(event.id);
      toast.success("ส่งตรวจสอบแล้ว");
      onSaved();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ข้อมูลงานวิ่ง</CardTitle>
            {statusBadge(event.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">ชื่องาน</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">วันเริ่ม</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">วันสิ้นสุด</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Cover Image */}
          <ImageUpload
            label="ภาพปก Event"
            hint="แนะนำขนาด 1920×1080 (16:9)"
            value={coverImage}
            onChange={(v) => setCoverImage(v as string)}
            aspectRatio="aspect-video"
          />

          {/* Detail Images */}
          <ImageUpload
            label="ภาพรายละเอียด"
            hint="อัปโหลดได้สูงสุด 10 รูป"
            value={detailImages}
            onChange={(v) => setDetailImages(v as string[])}
            multiple
            maxFiles={10}
            aspectRatio="aspect-video"
          />

          <Separator />
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
            {event.status === "draft" && (
              <Button
                variant="outline"
                onClick={handleSubmitForReview}
                disabled={submitting}
              >
                <SendHorizonal className="mr-2 h-4 w-4" />
                {submitting ? "กำลังส่ง..." : "ส่งให้ตรวจ"}
              </Button>
            )}
            {event.status === "pending_approval" && (
              <Badge variant="secondary" className="h-9 px-4 text-sm">
                รอตรวจสอบ
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Tab 2: Packages
// ═══════════════════════════════════════════════════════════════════

function PackagesTab({
  eventId,
  items,
}: {
  eventId: number;
  items: Item[];
}) {
  const { data: packages, mutate } = usePackagesByEvent(eventId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<PackageType | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [targetDistance, setTargetDistance] = useState("");
  const [saving, setSaving] = useState(false);

  // add item to package dialog
  const [linkDialogPkgId, setLinkDialogPkgId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [linkQty, setLinkQty] = useState("1");

  function openCreate() {
    setEditPkg(null);
    setName("");
    setPrice("");
    setTargetDistance("");
    setDialogOpen(true);
  }

  function openEdit(pkg: PackageType) {
    setEditPkg(pkg);
    setName(pkg.name);
    setPrice(String(pkg.price));
    setTargetDistance(pkg.targetDistance ? String(pkg.targetDistance) : "");
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editPkg) {
        await updatePackage(editPkg.id, {
          name,
          price: Number(price),
          targetDistance: targetDistance ? Number(targetDistance) : undefined,
        });
        toast.success("แก้ไขแพ็กเกจสำเร็จ");
      } else {
        await createPackage({
          eventId,
          name,
          price: Number(price),
          targetDistance: targetDistance ? Number(targetDistance) : undefined,
        });
        toast.success("สร้างแพ็กเกจสำเร็จ");
      }
      setDialogOpen(false);
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletePackage(id);
      toast.success("ลบแพ็กเกจแล้ว");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  async function handleAddItem() {
    if (!linkDialogPkgId || !selectedItemId) return;
    try {
      await addPackageItem({
        packageId: linkDialogPkgId,
        itemId: Number(selectedItemId),
        quantity: Number(linkQty) || 1,
      });
      toast.success("เพิ่มของในแพ็กเกจแล้ว");
      setLinkDialogPkgId(null);
      setSelectedItemId("");
      setLinkQty("1");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  async function handleRemoveItem(packageItemId: number) {
    try {
      await removePackageItem(packageItemId);
      toast.success("ลบของออกจากแพ็กเกจแล้ว");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">แพ็กเกจทั้งหมด</h3>
        <Button
          size="sm"
          className="bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={openCreate}
        >
          <Plus className="mr-1 h-4 w-4" />
          เพิ่มแพ็กเกจ
        </Button>
      </div>

      {!packages || packages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            ยังไม่มีแพ็กเกจ
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              {/* Package Image */}
              {pkg.image && (
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <img src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                    <CardDescription>
                      ฿{pkg.price?.toLocaleString()}
                      {pkg.targetDistance ? ` / ${pkg.targetDistance} กม.` : ""}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(pkg)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Package Image Upload */}
                <ImageUpload
                  label="ภาพแพ็กเกจ"
                  hint="แนะนำขนาด 800×800"
                  value={pkg.image ?? ""}
                  onChange={async (v) => {
                    const url = v as string;
                    if (url) {
                      try {
                        await uploadPackageImage(pkg.id, url);
                        toast.success("อัปโหลดภาพแพ็กเกจสำเร็จ");
                        mutate();
                      } catch { toast.error("อัปโหลดล้มเหลว"); }
                    }
                  }}
                  aspectRatio="aspect-square"
                />
                {pkg.packageItems && pkg.packageItems.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">ของในแพ็กเกจ:</p>
                    {pkg.packageItems.map((pi) => (
                      <div key={pi.id} className="flex items-center justify-between text-sm">
                        <span>
                          {pi.items?.name ?? `Item #${pi.itemId}`}
                          {pi.quantity > 1 ? ` x${pi.quantity}` : ""}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveItem(pi.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setLinkDialogPkgId(pkg.id);
                    setSelectedItemId("");
                    setLinkQty("1");
                  }}
                >
                  <PackagePlus className="mr-1 h-4 w-4" />
                  เพิ่มของ
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Package Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editPkg ? "แก้ไขแพ็กเกจ" : "สร้างแพ็กเกจใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>ชื่อแพ็กเกจ</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>ราคา (บาท)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ระยะทางเป้าหมาย (กม.)</Label>
              <Input
                type="number"
                value={targetDistance}
                onChange={(e) => setTargetDistance(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={handleSave}
              disabled={saving || !name}
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item to Package Dialog */}
      <Dialog
        open={linkDialogPkgId !== null}
        onOpenChange={(open) => {
          if (!open) setLinkDialogPkgId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มของในแพ็กเกจ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>เลือกของ</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกของ..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>จำนวน</Label>
              <Input
                type="number"
                min={1}
                value={linkQty}
                onChange={(e) => setLinkQty(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogPkgId(null)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={handleAddItem}
              disabled={!selectedItemId}
            >
              เพิ่ม
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Tab 3: Items
// ═══════════════════════════════════════════════════════════════════

function ItemsTab({ eventId }: { eventId: number }) {
  const { data: items, mutate } = useItemsByEvent(eventId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [variantName, setVariantName] = useState("");

  function openCreate() {
    setEditItem(null);
    setName("");
    setCategory("");
    setDialogOpen(true);
  }

  function openEdit(item: Item) {
    setEditItem(item);
    setName(item.name);
    setCategory(item.category ?? "");
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) {
        await updateItem(editItem.id, { name, type: category });
        toast.success("แก้ไขของสำเร็จ");
      } else {
        await createItem({ eventId, name, type: category });
        toast.success("สร้างของสำเร็จ");
      }
      setDialogOpen(false);
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteItem(id);
      toast.success("ลบของแล้ว");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  async function handleAddVariant(itemId: number) {
    if (!variantName.trim()) return;
    try {
      await addItemVariant(itemId, { name: variantName.trim() });
      toast.success("เพิ่ม Variant สำเร็จ");
      setVariantName("");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  async function handleDeleteVariant(variantId: number) {
    try {
      await deleteItemVariant(variantId);
      toast.success("ลบ Variant แล้ว");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ของทั้งหมด</h3>
        <Button
          size="sm"
          className="bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={openCreate}
        >
          <Plus className="mr-1 h-4 w-4" />
          เพิ่มของ
        </Button>
      </div>

      {!items || items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            ยังไม่มีของ
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              {/* Item Image */}
              {(item.image || item.imageUrl) && (
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img src={item.image || item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    {item.category && (
                      <CardDescription>{item.category}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Item Image Upload */}
                <ImageUpload
                  label="ภาพสินค้า"
                  hint="แนะนำขนาด 800×800"
                  value={item.image || item.imageUrl || ""}
                  onChange={async (v) => {
                    const url = v as string;
                    if (url) {
                      try {
                        await uploadItemImage(item.id, url);
                        toast.success("อัปโหลดภาพสินค้าสำเร็จ");
                        mutate();
                      } catch { toast.error("อัปโหลดล้มเหลว"); }
                    }
                  }}
                  aspectRatio="aspect-square"
                />
                {item.itemVariants && item.itemVariants.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.itemVariants.map((v) => (
                      <Badge key={v.id} variant="secondary" className="gap-1">
                        {v.variantValue}
                        <button
                          onClick={() => handleDeleteVariant(v.id)}
                          className="ml-0.5 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="ชื่อ variant เช่น S, M, L"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddVariant(item.id);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddVariant(item.id)}
                    disabled={!variantName.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Item Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "แก้ไขของ" : "สร้างของใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>ชื่อ</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>หมวดหมู่</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="เช่น เสื้อ, เหรียญ, อุปกรณ์"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={handleSave}
              disabled={saving || !name}
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Tab 4: Staff
// ═══════════════════════════════════════════════════════════════════

function StaffTab({ eventId }: { eventId: number }) {
  const { data: staff } = useEventStaff(eventId);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">สตาฟ</h3>
      {!staff || staff.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            ยังไม่มีสตาฟ
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Username</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">วันที่เพิ่ม</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="px-4 py-3">{s.users?.username ?? "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.users?.email ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(s.assignedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Tab 5: Registrations
// ═══════════════════════════════════════════════════════════════════

function RegistrationsTab({ eventId }: { eventId: number }) {
  const [page, setPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const { data } = useOrgRegistrations({
    eventId,
    page,
    limit: 10,
    paymentStatus: paymentFilter !== "all" ? paymentFilter : undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-semibold">ผู้สมัคร</h3>
        <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="pending">รอชำระ</SelectItem>
            <SelectItem value="submitted">ส่งสลิปแล้ว</SelectItem>
            <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
            <SelectItem value="rejected">ไม่ผ่าน</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!data || data.data.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            ไม่มีข้อมูลผู้สมัคร
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">ชื่อผู้สมัคร</th>
                    <th className="px-4 py-3 text-left font-medium">แพ็กเกจ</th>
                    <th className="px-4 py-3 text-left font-medium">สถานะชำระเงิน</th>
                    <th className="px-4 py-3 text-left font-medium">วันที่สมัคร</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((reg) => (
                    <tr key={reg.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">
                        {reg.users?.username ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {reg.packages?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3">{paymentBadge(reg.paymentStatus)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(reg.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Tab 6: Running Results
// ═══════════════════════════════════════════════════════════════════

function RunningResultsTab({ eventId }: { eventId: number }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, mutate } = useOrgRunningResults({
    eventId,
    page,
    limit: 10,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  async function handleReview(id: number, status: "approved" | "rejected") {
    setReviewingId(id);
    try {
      await reviewRunningResult(id, 0, { status });
      toast.success(status === "approved" ? "อนุมัติแล้ว" : "ปฏิเสธแล้ว");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-semibold">ผลวิ่ง</h3>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="pending">รอตรวจ</SelectItem>
            <SelectItem value="approved">อนุมัติ</SelectItem>
            <SelectItem value="rejected">ไม่ผ่าน</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!data || data.data.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            ไม่มีข้อมูลผลวิ่ง
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">นักวิ่ง</th>
                    <th className="px-4 py-3 text-left font-medium">ระยะทาง</th>
                    <th className="px-4 py-3 text-left font-medium">เวลา</th>
                    <th className="px-4 py-3 text-left font-medium">Pace</th>
                    <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                    <th className="px-4 py-3 text-left font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((result) => {
                    const proof = result.runningProofs;
                    const pace = calcPace(proof?.distance, proof?.duration);
                    const isSuspicious = pace && pace.raw < 3;

                    return (
                      <tr
                        key={result.id}
                        className={`border-b last:border-0 ${isSuspicious ? "bg-red-50 dark:bg-red-950/20" : ""}`}
                      >
                        <td className="px-4 py-3 font-medium">
                          {result.registrations?.users?.username ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {proof?.distance ? `${proof.distance} กม.` : "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {proof?.duration ?? "-"}
                        </td>
                        <td className={`px-4 py-3 ${isSuspicious ? "text-red-600 font-bold" : "text-muted-foreground"}`}>
                          {pace ? `${pace.formatted} min/km` : "-"}
                          {isSuspicious && " (!)"}
                        </td>
                        <td className="px-4 py-3">{statusBadge(result.status)}</td>
                        <td className="px-4 py-3">
                          {result.status === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                disabled={reviewingId === result.id}
                                onClick={() => handleReview(result.id, "approved")}
                              >
                                <Check className="mr-1 h-3 w-3" />
                                อนุมัติ
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-destructive"
                                disabled={reviewingId === result.id}
                                onClick={() => handleReview(result.id, "rejected")}
                              >
                                <Ban className="mr-1 h-3 w-3" />
                                ปฏิเสธ
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Tab 7: Shipments
// ═══════════════════════════════════════════════════════════════════

function ShipmentsTab({ eventId }: { eventId: number }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, mutate } = useOrgShipments({
    eventId,
    page,
    limit: 10,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: staff } = useEventStaff(eventId);
  const { data: registrations } = useOrgRegistrations({ eventId, page: 1, limit: 100 });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState("");
  const [creating, setCreating] = useState(false);
  const [batchCreating, setBatchCreating] = useState(false);

  // Assign staff dialog
  const [assignDialogShipmentId, setAssignDialogShipmentId] = useState<number | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Get confirmed registrations that don't have a shipment yet
  const confirmedRegs = (registrations?.data ?? []).filter(
    (r) => r.paymentStatus === "confirmed"
  );

  async function handleCreateShipment() {
    if (!selectedRegId) return;
    setCreating(true);
    try {
      await createShipment({ registrationId: Number(selectedRegId) });
      toast.success("สร้าง Shipment สำเร็จ");
      setCreateDialogOpen(false);
      setSelectedRegId("");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setCreating(false);
    }
  }

  async function handleBatchCreate() {
    const regIds = confirmedRegs.map((r) => r.id);
    if (regIds.length === 0) {
      toast.error("ไม่มี registration ที่ยืนยันแล้ว");
      return;
    }
    setBatchCreating(true);
    try {
      await createBatchShipments(regIds);
      toast.success(`สร้าง ${regIds.length} Shipments สำเร็จ`);
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setBatchCreating(false);
    }
  }

  async function handleUpdateStatus(shipmentId: number, status: string) {
    try {
      await updateShipmentStatus(shipmentId, status);
      toast.success("อัพเดทสถานะสำเร็จ");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  async function handleAssignStaff() {
    if (!assignDialogShipmentId || !selectedStaffId) return;
    try {
      await assignShipmentStaff({
        shipmentId: assignDialogShipmentId,
        eventStaffId: Number(selectedStaffId),
        trackingNumber: trackingNumber || undefined,
      });
      toast.success("มอบหมายสตาฟสำเร็จ");
      setAssignDialogShipmentId(null);
      setSelectedStaffId("");
      setTrackingNumber("");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-semibold">การจัดส่ง</h3>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">รอดำเนินการ</SelectItem>
              <SelectItem value="preparing">กำลังจัดเตรียม</SelectItem>
              <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
              <SelectItem value="delivered">ได้รับแล้ว</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            สร้าง Shipment
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleBatchCreate}
            disabled={batchCreating}
          >
            <Truck className="mr-1 h-4 w-4" />
            {batchCreating ? "กำลังสร้าง..." : "Batch สร้าง"}
          </Button>
        </div>
      </div>

      {!data || data.data.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            ไม่มีข้อมูลการจัดส่ง
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                    <th className="px-4 py-3 text-left font-medium">Tracking</th>
                    <th className="px-4 py-3 text-left font-medium">วันที่สร้าง</th>
                    <th className="px-4 py-3 text-left font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((shipment) => {
                    const staffAssignment = shipment.shipmentStaff?.[0];
                    return (
                      <tr key={shipment.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">#{shipment.id}</td>
                        <td className="px-4 py-3">{statusBadge(shipment.status)}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {staffAssignment?.trackingNumber ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(shipment.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {shipment.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => handleUpdateStatus(shipment.id, "preparing")}
                              >
                                จัดเตรียม
                              </Button>
                            )}
                            {shipment.status === "preparing" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => handleUpdateStatus(shipment.id, "shipped")}
                              >
                                <Truck className="mr-1 h-3 w-3" />
                                จัดส่ง
                              </Button>
                            )}
                            {(shipment.status === "pending" || shipment.status === "preparing") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setAssignDialogShipmentId(shipment.id);
                                  setSelectedStaffId("");
                                  setTrackingNumber(staffAssignment?.trackingNumber ?? "");
                                }}
                              >
                                <LinkIcon className="mr-1 h-3 w-3" />
                                มอบหมาย
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Create Shipment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้าง Shipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>เลือกผู้สมัคร (ยืนยันแล้ว)</Label>
              <Select value={selectedRegId} onValueChange={setSelectedRegId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกผู้สมัคร..." />
                </SelectTrigger>
                <SelectContent>
                  {confirmedRegs.map((reg) => (
                    <SelectItem key={reg.id} value={String(reg.id)}>
                      {reg.users?.username ?? `Reg #${reg.id}`} - {reg.packages?.name ?? ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={handleCreateShipment}
              disabled={creating || !selectedRegId}
            >
              {creating ? "กำลังสร้าง..." : "สร้าง"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog
        open={assignDialogShipmentId !== null}
        onOpenChange={(open) => {
          if (!open) setAssignDialogShipmentId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>มอบหมายสตาฟ + Tracking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>เลือกสตาฟ</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสตาฟ..." />
                </SelectTrigger>
                <SelectContent>
                  {(staff ?? []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.users?.username ?? `Staff #${s.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="TH20260300XX"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogShipmentId(null)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={handleAssignStaff}
              disabled={!selectedStaffId}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════

export default function OrganizerEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const eventId = Number(id);
  const { data: events, mutate: mutateEvents } = useMyEvents();
  const { data: items } = useItemsByEvent(eventId);

  const event = events?.find((e) => e.id === eventId);

  if (!events) {
    return (
      <OrganizerGuard>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-64 rounded bg-muted" />
          </div>
        </div>
      </OrganizerGuard>
    );
  }

  if (!event) {
    return (
      <OrganizerGuard>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">ไม่พบงานวิ่งนี้</p>
        </div>
      </OrganizerGuard>
    );
  }

  return (
    <OrganizerGuard>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{event.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            จัดการงานวิ่ง ID #{event.id}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1">
            <TabsTrigger value="details" className="gap-1.5">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">รายละเอียด</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="gap-1.5">
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">Packages</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-1.5">
              <PackagePlus className="h-4 w-4" />
              <span className="hidden sm:inline">Items</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="registrations" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">ผู้สมัคร</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-1.5">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">ผลวิ่ง</span>
            </TabsTrigger>
            <TabsTrigger value="shipments" className="gap-1.5">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">จัดส่ง</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="details">
              <DetailsTab event={event} onSaved={() => mutateEvents()} />
            </TabsContent>

            <TabsContent value="packages">
              <PackagesTab eventId={eventId} items={items ?? []} />
            </TabsContent>

            <TabsContent value="items">
              <ItemsTab eventId={eventId} />
            </TabsContent>

            <TabsContent value="staff">
              <StaffTab eventId={eventId} />
            </TabsContent>

            <TabsContent value="registrations">
              <RegistrationsTab eventId={eventId} />
            </TabsContent>

            <TabsContent value="results">
              <RunningResultsTab eventId={eventId} />
            </TabsContent>

            <TabsContent value="shipments">
              <ShipmentsTab eventId={eventId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </OrganizerGuard>
  );
}
