"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRunningProof } from "@/hooks/useApi";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Gauge,
  FileText,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcPace(distance?: number, duration?: string) {
  if (!distance || !duration) return null;
  const parts = duration.split(":").map(Number);
  let totalMinutes = 0;
  if (parts.length === 3) {
    totalMinutes = parts[0] * 60 + parts[1] + parts[2] / 60;
  } else if (parts.length === 2) {
    totalMinutes = parts[0] + parts[1] / 60;
  }
  if (totalMinutes === 0 || distance === 0) return null;
  const paceMin = totalMinutes / distance;
  const min = Math.floor(paceMin);
  const sec = Math.round((paceMin - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")} min/km`;
}

export default function RunningProofDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: proof, isLoading } = useRunningProof(id);

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="px-4 md:px-6 py-6 max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="aspect-video bg-muted rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!proof) {
    return (
      <AuthGuard>
        <div className="px-4 md:px-6 py-16 text-center">
          <p className="text-muted-foreground">ไม่พบผลวิ่งนี้</p>
        </div>
      </AuthGuard>
    );
  }

  const pace = calcPace(proof.distance, proof.duration);

  return (
    <AuthGuard>
      <div className="px-4 md:px-6 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">รายละเอียดผลวิ่ง</h1>
        </div>

        {/* Image */}
        <div className="rounded-xl overflow-hidden bg-muted mb-6">
          {proof.imageUrl ? (
            <img
              src={proof.imageUrl}
              alt="Running proof"
              className="w-full aspect-video object-contain"
            />
          ) : (
            <div className="aspect-video flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <MapPin className="h-5 w-5 text-brand-foreground dark:text-brand mx-auto mb-1" />
            <p className="text-xl font-bold">{proof.distance ?? "—"}</p>
            <p className="text-[10px] text-muted-foreground">กม.</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <Clock className="h-5 w-5 text-brand-foreground dark:text-brand mx-auto mb-1" />
            <p className="text-xl font-bold">{proof.duration ?? "—"}</p>
            <p className="text-[10px] text-muted-foreground">เวลา</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <Gauge className="h-5 w-5 text-brand-foreground dark:text-brand mx-auto mb-1" />
            <p className="text-xl font-bold">{pace ?? "—"}</p>
            <p className="text-[10px] text-muted-foreground">pace</p>
          </div>
        </div>

        {/* Note */}
        {proof.note && (
          <div className="rounded-xl border p-3 mb-4">
            <p className="text-sm flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              {proof.note}
            </p>
          </div>
        )}

        {/* Date */}
        <p className="text-sm text-muted-foreground mb-6">
          ส่งเมื่อ {formatDate(proof.createdAt)}
        </p>

        {/* Linked events */}
        {proof.runningResults && proof.runningResults.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3">ผูกกับงาน</h2>
            <div className="rounded-xl border divide-y">
              {proof.runningResults.map((rr) => {
                const eventTitle =
                  rr.registrations?.packages?.events?.title ??
                  rr.registrations?.packages?.name ??
                  `Registration #${rr.registrationId}`;

                return (
                  <Link
                    key={rr.id}
                    href={`/my/registrations/${rr.registrationId}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{eventTitle}</p>
                      {rr.reviewNote && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {rr.reviewNote}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Badge
                        variant={
                          rr.status === "approved"
                            ? "default"
                            : rr.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {rr.status === "approved"
                          ? "อนุมัติ"
                          : rr.status === "rejected"
                            ? "ไม่ผ่าน"
                            : "รอตรวจ"}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
