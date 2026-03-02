"use client";

import { useState } from "react";
import Link from "next/link";
import { OrganizerGuard } from "@/components/organizer-guard";
import { useMyEvents, deleteEvent } from "@/hooks/useOrganizerApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Settings,
  Trash2,
  CalendarDays,
  Users,
  Loader2,
} from "lucide-react";
import type { Event } from "@/types/api";

const statusMap: Record<
  Event["status"],
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  draft: { label: "แบบร่าง", variant: "secondary" },
  pending_approval: { label: "รอตรวจ", variant: "secondary" },
  approved: { label: "อนุมัติ", variant: "default" },
  rejected: { label: "ไม่ผ่าน", variant: "destructive" },
  completed: { label: "จบแล้ว", variant: "secondary" },
};

function EventsContent() {
  const { data: events, isLoading, mutate } = useMyEvents();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredEvents =
    events?.filter((e) =>
      statusFilter === "all" ? true : e.status === statusFilter,
    ) ?? [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEvent(deleteTarget.id);
      toast.success("ลบ Event สำเร็จ");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">งานวิ่งของฉัน</h1>
        <Link href="/organizer/events/new">
          <Button className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
            <Plus className="h-4 w-4" />
            สร้างใหม่
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">สถานะ:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="draft">แบบร่าง</SelectItem>
            <SelectItem value="pending_approval">รอตรวจ</SelectItem>
            <SelectItem value="approved">อนุมัติ</SelectItem>
            <SelectItem value="rejected">ไม่ผ่าน</SelectItem>
            <SelectItem value="completed">จบแล้ว</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Event List */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <CalendarDays className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ไม่พบ Event</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEvents.map((event) => {
            const s = statusMap[event.status];
            return (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">
                          {event.title}
                        </h3>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {event.startDate
                            ? new Date(event.startDate).toLocaleDateString(
                                "th-TH",
                              )
                            : "-"}{" "}
                          -{" "}
                          {event.endDate
                            ? new Date(event.endDate).toLocaleDateString(
                                "th-TH",
                              )
                            : "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event._count?.registrations ?? 0} ผู้สมัคร
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/organizer/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Settings className="h-3.5 w-3.5" />
                          จัดการ
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(event)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        ลบ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณต้องการลบ &quot;{deleteTarget?.title}&quot; ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              ลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrganizerEventsPage() {
  return (
    <OrganizerGuard>
      <EventsContent />
    </OrganizerGuard>
  );
}
