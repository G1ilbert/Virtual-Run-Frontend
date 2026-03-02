"use client";

import { useState } from "react";
import { useAdminEvents, approveEvent, rejectEvent } from "@/hooks/useAdminApi";
import type { Event } from "@/types/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Users,
  Loader2,
} from "lucide-react";

const STATUS_TABS = [
  { value: "", label: "ทั้งหมด" },
  { value: "pending_approval", label: "รอ Approve" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
] as const;

function getStatusBadge(status: Event["status"]) {
  switch (status) {
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "pending_approval":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
          รอ Approve
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
          Rejected
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
          Completed
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
  });
}

export default function AdminEventsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const limit = 10;

  const {
    data: eventsData,
    isLoading,
    mutate: mutateEvents,
  } = useAdminEvents({ page, limit, status: status || undefined });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    event: Event | null;
  }>({ open: false, type: "approve", event: null });

  const [actionLoading, setActionLoading] = useState(false);

  const events = eventsData?.data ?? [];
  const meta = eventsData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const openConfirmDialog = (type: "approve" | "reject", event: Event) => {
    setConfirmDialog({ open: true, type, event });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.event) return;
    setActionLoading(true);
    try {
      if (confirmDialog.type === "approve") {
        await approveEvent(confirmDialog.event.id);
        toast.success("อนุมัติ Event \"" + confirmDialog.event.title + "\" สำเร็จ");
      } else {
        await rejectEvent(confirmDialog.event.id);
        toast.success("Reject Event \"" + confirmDialog.event.title + "\" สำเร็จ");
      }
      await mutateEvents();
    } catch {
      toast.error(
        confirmDialog.type === "approve"
          ? "ไม่สามารถ Approve ได้"
          : "ไม่สามารถ Reject ได้"
      );
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: "approve", event: null });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">จัดการ Events</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ตรวจสอบและอนุมัติ Events จาก Organizer
        </p>
      </div>

      {/* Status filter tabs */}
      <Tabs value={status} onValueChange={handleStatusChange}>
        <TabsList className="flex-wrap">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-32" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mb-3" />
          <p className="text-lg font-medium">ไม่พบ Event</p>
          <p className="text-sm">ลองเปลี่ยนตัวกรองสถานะดู</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่องาน</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันจัดงาน</TableHead>
                  <TableHead className="text-center">ผู้สมัคร</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {event.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.organizer?.username ?? "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(event.startDate)}
                      {event.endDate ? (" - " + formatDate(event.endDate)) : ""}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {event._count?.registrations ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {event.status === "pending_approval" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => openConfirmDialog("approve", event)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openConfirmDialog("reject", event)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({ open: false, type: "approve", event: null });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "approve"
                ? "ยืนยัน Approve Event"
                : "ยืนยัน Reject Event"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === "approve"
                ? ("คุณต้องการ Approve \"" + (confirmDialog.event?.title ?? "") + "\" ใช่หรือไม่?")
                : ("คุณต้องการ Reject \"" + (confirmDialog.event?.title ?? "") + "\" ใช่หรือไม่?")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, type: "approve", event: null })
              }
              disabled={actionLoading}
            >
              ยกเลิก
            </Button>
            {confirmDialog.type === "approve" ? (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleConfirmAction}
                disabled={actionLoading}
              >
                {actionLoading && (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                )}
                Approve
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
                Reject
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
