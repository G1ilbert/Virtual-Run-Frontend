"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/contexts/AuthContext";
import {
  useMyApplications,
  createApplication,
} from "@/hooks/useOrganizerApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  XCircle,
  Send,
  ArrowRight,
  Loader2,
} from "lucide-react";

function ApplyContent() {
  const { user } = useAuth();
  const { data: applications, isLoading, mutate } = useMyApplications();

  const [contactInfo, setContactInfo] = useState("");
  const [documentProofUrl, setDocumentProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOrganizer =
    user?.role === "ORGANIZER" || user?.role === "ADMIN";

  const latestApp = applications?.[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createApplication({ contactInfo, documentProofUrl });
      toast.success("ส่งคำขอสำเร็จ");
      setContactInfo("");
      setDocumentProofUrl("");
      mutate();
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already an organizer
  if (isOrganizer) {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h2 className="text-xl font-bold">คุณเป็น Organizer แล้ว</h2>
            <p className="text-sm text-muted-foreground text-center">
              คุณสามารถจัดการ Event ได้จาก Dashboard
            </p>
            <Link href="/organizer">
              <Button className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
                <ArrowRight className="h-4 w-4" />
                ไปที่ Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending application
  if (latestApp?.status === "pending") {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Clock className="h-12 w-12 text-yellow-500" />
            <h2 className="text-xl font-bold">รอตรวจสอบ</h2>
            <Badge variant="secondary">อยู่ระหว่างตรวจสอบ</Badge>
            <p className="text-sm text-muted-foreground text-center">
              คำขอของคุณอยู่ระหว่างการพิจารณา กรุณารอแจ้งผลจากทีมงาน
            </p>
            <p className="text-xs text-muted-foreground">
              ส่งเมื่อ:{" "}
              {latestApp.createdAt
                ? new Date(latestApp.createdAt).toLocaleDateString("th-TH")
                : "-"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rejected - show info + option to reapply
  if (latestApp?.status === "rejected") {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <XCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold">คำขอไม่ผ่านการอนุมัติ</h2>
            <Badge variant="destructive">ไม่ผ่าน</Badge>
            <p className="text-sm text-muted-foreground text-center">
              คำขอก่อนหน้าไม่ได้รับการอนุมัติ คุณสามารถส่งคำขอใหม่ได้
            </p>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>ส่งคำขอใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactInfo">ข้อมูลติดต่อ</Label>
                <Input
                  id="contactInfo"
                  placeholder="เบอร์โทร, อีเมล, หรือ LINE ID"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentProofUrl">ลิงก์เอกสาร</Label>
                <Input
                  id="documentProofUrl"
                  placeholder="ลิงก์เอกสารยืนยันตัวตน"
                  value={documentProofUrl}
                  onChange={(e) => setDocumentProofUrl(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                ส่งคำขอ
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No application yet - show form
  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">สมัครเป็น Organizer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          กรอกข้อมูลเพื่อส่งคำขอเป็นผู้จัดงานวิ่ง
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลคำขอ</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactInfo">ข้อมูลติดต่อ</Label>
              <Input
                id="contactInfo"
                placeholder="เบอร์โทร, อีเมล, หรือ LINE ID"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentProofUrl">ลิงก์เอกสาร</Label>
              <Input
                id="documentProofUrl"
                placeholder="ลิงก์เอกสารยืนยันตัวตน"
                value={documentProofUrl}
                onChange={(e) => setDocumentProofUrl(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              ส่งคำขอ
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrganizerApplyPage() {
  return (
    <AuthGuard>
      <ApplyContent />
    </AuthGuard>
  );
}
