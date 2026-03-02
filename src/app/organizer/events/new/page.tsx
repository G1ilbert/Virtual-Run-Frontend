"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrganizerGuard } from "@/components/organizer-guard";
import { createEvent, uploadEventCover, uploadEventDetails } from "@/hooks/useOrganizerApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

function NewEventContent() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const newEvent = await createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      // Upload images after event creation
      if (coverImage) {
        await uploadEventCover(newEvent.id, coverImage);
      }
      if (detailImages.length > 0) {
        await uploadEventDetails(newEvent.id, detailImages);
      }
      toast.success("สร้าง Event สำเร็จ");
      router.push(`/organizer/events/${newEvent.id}`);
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">สร้าง Event ใหม่</h1>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูล Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">ชื่องาน *</Label>
              <Input
                id="title"
                placeholder="ชื่อ Event"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                placeholder="รายละเอียดเกี่ยวกับ Event"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">วันเริ่มต้น</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">วันสิ้นสุด</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <ImageUpload
                label="ภาพปก Event"
                hint="แนะนำขนาด 1920×1080 (16:9)"
                value={coverImage}
                onChange={(v) => setCoverImage(v as string)}
                aspectRatio="aspect-video"
              />
            </div>

            {/* Detail Images */}
            <div className="space-y-2">
              <ImageUpload
                label="ภาพรายละเอียด"
                hint="อัปโหลดได้สูงสุด 10 รูป"
                value={detailImages}
                onChange={(v) => setDetailImages(v as string[])}
                multiple
                maxFiles={10}
                aspectRatio="aspect-video"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !title.trim()}
              className="w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              สร้าง Event
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewEventPage() {
  return (
    <OrganizerGuard>
      <NewEventContent />
    </OrganizerGuard>
  );
}
