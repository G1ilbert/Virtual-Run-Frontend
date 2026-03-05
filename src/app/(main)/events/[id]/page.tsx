"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEvent } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PersonStanding,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import type { Package as PackageType } from "@/types/api";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusInfo(status: string, regEndDate?: string) {
  const isRegClosed = regEndDate ? new Date(regEndDate) < new Date() : false;

  if (status === "completed") return { label: "เสร็จสิ้น", color: "bg-muted text-muted-foreground" };
  if (status === "approved" && isRegClosed) return { label: "ปิดรับสมัคร", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  if (status === "approved") return { label: "เปิดรับสมัคร", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  return { label: status, color: "bg-muted text-muted-foreground" };
}

function PackageCard({
  pkg,
  eventId,
  disabled,
  isLoggedIn,
}: {
  pkg: PackageType;
  eventId: number;
  disabled: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  const handleRegister = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }
    router.push(`/events/${eventId}/register?packageId=${pkg.id}`);
  };

  return (
    <div className="shrink-0 w-64 rounded-xl border bg-card p-4 space-y-3 snap-start">
      {pkg.image && (
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <img src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
        </div>
      )}

      <h3 className="font-semibold">{pkg.name}</h3>

      {pkg.targetDistance && (
        <p className="text-sm text-muted-foreground">{pkg.targetDistance} กม.</p>
      )}

      <p className="text-2xl font-bold text-brand-foreground dark:text-brand">
        ฿{pkg.price?.toLocaleString() ?? 0}
      </p>

      {pkg.packageItems && pkg.packageItems.length > 0 && (
        <div className="space-y-1">
          {pkg.packageItems.slice(0, 3).map((pi) => (
            <div key={pi.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-brand shrink-0" />
              <span className="truncate">{pi.items?.name ?? `Item #${pi.itemId}`}</span>
            </div>
          ))}
          {pkg.packageItems.length > 3 && (
            <p className="text-xs text-muted-foreground">+{pkg.packageItems.length - 3} รายการ</p>
          )}
        </div>
      )}

      <Button
        className={
          disabled
            ? "w-full bg-muted text-muted-foreground cursor-not-allowed"
            : "w-full bg-brand text-brand-foreground hover:bg-brand/90"
        }
        disabled={disabled}
        onClick={handleRegister}
      >
        {disabled ? "ปิดรับสมัคร" : "สมัคร"}
      </Button>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: event, isLoading, error } = useEvent(id);
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="aspect-video w-full bg-muted md:mx-auto md:max-w-[900px] md:rounded-xl" />
        <div className="mx-auto max-w-[900px] px-4 py-4 space-y-3">
          <div className="h-6 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto px-4 py-16 text-center">
        <PersonStanding className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground">ไม่พบงานวิ่งนี้</p>
      </div>
    );
  }

  const allImages = [
    event.coverImage,
    ...(event.detailImages ?? []),
  ].filter(Boolean) as string[];

  const statusInfo = getStatusInfo(event.status, event.registrationEndDate);
  const isRegClosed = event.status === "completed" ||
    (event.registrationEndDate ? new Date(event.registrationEndDate) < new Date() : false);

  const scrollPackages = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -280 : 280;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div>
      {/* Cover Image Gallery */}
      <div className="relative mx-auto max-w-[900px]">
        {allImages.length > 0 ? (
          <div
            className="relative aspect-video cursor-pointer overflow-hidden bg-muted md:rounded-xl"
            onClick={() => setFullscreenImage(allImages[currentImage])}
          >
            <img
              src={allImages[currentImage]}
              alt={event.title}
              className="h-full w-full object-cover"
            />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage((i) => (i - 1 + allImages.length) % allImages.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage((i) => (i + 1) % allImages.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-muted md:rounded-xl">
            <PersonStanding className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        {allImages.length > 1 && (
          <div className="flex justify-center gap-1.5 py-2">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImage
                    ? "w-4 bg-foreground"
                    : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Info */}
      <div className="mx-auto max-w-[900px] px-4 py-4">
        <h1 className="text-xl font-bold md:text-2xl">{event.title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {event.startDate && (
            <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
          )}
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {event.organizer && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            ผู้จัดงาน: {event.organizer.username}
          </p>
        )}

        {/* Description (collapsible) */}
        {event.description && (
          <div className="mt-4">
            <p
              className={`whitespace-pre-wrap text-sm leading-relaxed ${
                descExpanded ? "" : "line-clamp-3"
              }`}
            >
              {event.description}
            </p>
            <button
              onClick={() => setDescExpanded(!descExpanded)}
              className="mt-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {descExpanded ? "ย่อ" : "ดูเพิ่มเติม"}
            </button>
          </div>
        )}

        {/* Packages Section */}
        {event.packages && event.packages.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">เลือก Package</h2>
              {event.packages.length > 2 && (
                <div className="hidden md:flex gap-1">
                  <button
                    onClick={() => scrollPackages("left")}
                    className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollPackages("right")}
                    className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
            >
              {event.packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  eventId={event.id}
                  disabled={isRegClosed}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen Image Dialog */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">ดูรูปภาพ</DialogTitle>
          {fullscreenImage && (
            <img
              src={fullscreenImage}
              alt="Fullscreen"
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
