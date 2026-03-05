"use client";

import { useState } from "react";
import {
  useAdminOrgApplications,
  reviewOrganizerApplication,
} from "@/hooks/useAdminApi";
import type { OrganizerApplication } from "@/types/api";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { getImageUrl } from "@/lib/image";

function statusBadge(status: OrganizerApplication["status"]) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
          รอ Review
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          อนุมัติแล้ว
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          ปฏิเสธ
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AdminOrganizerApplicationsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const limit = 10;
  const { data, mutate, isLoading } = useAdminOrgApplications({
    page,
    limit,
    status: statusFilter,
  });

  const applications = data?.data ?? [];
  const meta = data?.meta;

  const handleReview = async (
    id: number,
    status: "approved" | "rejected"
  ) => {
    setActionLoading(id);
    try {
      await reviewOrganizerApplication(id, { status });
      await mutate();
      if (status === "approved") {
        toast.success("อนุมัติแล้ว — User เปลี่ยนเป็น ORGANIZER อัตโนมัติ");
      } else {
        toast.success("ปฏิเสธคำขอแล้ว");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTabChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">Organizer Applications</h1>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="pending">รอ Review</TabsTrigger>
          <TabsTrigger value="">ทั้งหมด</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Application Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          ไม่พบคำขอสมัคร Organizer
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {app.users?.username ?? `User #${app.userId}`}
                  </CardTitle>
                  {app.users?.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {app.users.email}
                    </p>
                  )}
                </div>
                {statusBadge(app.status)}
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                {/* Contact Info */}
                {app.contactInfo && (
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span>{app.contactInfo}</span>
                  </div>
                )}

                {/* Document Proof */}
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  {app.documentProofUrl ? (
                    <button
                      type="button"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                      onClick={() =>
                        setPreviewImage(app.documentProofUrl!)
                      }
                    >
                      ดูเอกสาร
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="text-muted-foreground">
                      ไม่มีเอกสารแนบ
                    </span>
                  )}
                </div>

                {/* Date */}
                {app.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      สมัครเมื่อ{" "}
                      {new Date(app.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </CardContent>

              {/* Actions for pending applications */}
              {app.status === "pending" && (
                <CardFooter className="gap-2 border-t pt-4">
                  <Button
                    size="sm"
                    className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={actionLoading === app.id}
                    onClick={() => handleReview(app.id, "approved")}
                  >
                    {actionLoading === app.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                    disabled={actionLoading === app.id}
                    onClick={() => handleReview(app.id, "rejected")}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            หน้า {meta.page} / {meta.totalPages} (ทั้งหมด {meta.total} รายการ)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog
        open={previewImage !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>เอกสารประกอบการสมัคร</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(previewImage)}
                alt="Document proof"
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
