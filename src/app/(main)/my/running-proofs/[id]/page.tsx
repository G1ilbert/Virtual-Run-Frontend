"use client";

import { use } from "react";
import { useRunningProof } from "@/hooks/useApi";
import { AuthGuard } from "@/components/auth-guard";
import { DetailSkeleton } from "@/components/page-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Image,
  MapPin,
  Clock,
  Gauge,
  Trophy,
  FileText,
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
  // duration format: "HH:MM:SS" or similar
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
  const { data: proof, isLoading } = useRunningProof(id);

  if (isLoading) {
    return (
      <AuthGuard>
        <DetailSkeleton />
      </AuthGuard>
    );
  }

  if (!proof) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">ไม่พบผลวิ่งนี้</p>
        </div>
      </AuthGuard>
    );
  }

  const pace = calcPace(proof.distance, proof.duration);

  return (
    <AuthGuard>
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          รายละเอียดผลวิ่ง
        </h1>

        {/* Image */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative aspect-video bg-muted flex items-center justify-center">
            {proof.imageUrl ? (
              <img
                src={proof.imageUrl}
                alt="Running proof"
                className="h-full w-full object-contain"
              />
            ) : (
              <Image className="h-16 w-16 text-muted-foreground/30" />
            )}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <MapPin className="h-5 w-5 text-brand-foreground dark:text-brand mb-1" />
              <p className="text-xl font-bold">
                {proof.distance ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">กม.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <Clock className="h-5 w-5 text-brand-foreground dark:text-brand mb-1" />
              <p className="text-xl font-bold">
                {proof.duration ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">เวลา</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <Gauge className="h-5 w-5 text-brand-foreground dark:text-brand mb-1" />
              <p className="text-xl font-bold">{pace ?? "—"}</p>
              <p className="text-xs text-muted-foreground">pace</p>
            </CardContent>
          </Card>
        </div>

        {/* Note */}
        {proof.note && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-sm flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                {proof.note}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Date */}
        <p className="text-sm text-muted-foreground mb-6">
          ส่งเมื่อ {formatDate(proof.createdAt)}
        </p>

        {/* Linked results */}
        {proof.runningResults && proof.runningResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">งานที่ผูก</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proof.runningResults.map((rr) => (
                <div
                  key={rr.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {rr.registrations?.packages?.events?.title ??
                        rr.registrations?.packages?.name ??
                        `Registration #${rr.registrationId}`}
                    </p>
                    {rr.reviewNote && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rr.reviewNote}
                      </p>
                    )}
                  </div>
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
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
