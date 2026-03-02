"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin } from "lucide-react";
import type { Event } from "@/types/api";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMinPrice(event: Event) {
  if (!event.packages?.length) return null;
  const prices = event.packages.map((p) => p.price).filter(Boolean);
  return prices.length ? Math.min(...prices) : null;
}

function getStatusBadge(status: Event["status"]) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    approved: { label: "เปิดรับสมัคร", variant: "default" },
    completed: { label: "จบแล้ว", variant: "secondary" },
    draft: { label: "แบบร่าง", variant: "outline" },
    pending_approval: { label: "รอตรวจสอบ", variant: "outline" },
    rejected: { label: "ไม่อนุมัติ", variant: "destructive" },
  };
  const item = map[status] || { label: status, variant: "outline" as const };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function EventCard({ event }: { event: Event }) {
  const minPrice = getMinPrice(event);

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-brand/50">
        {/* Banner */}
        <div className="relative h-40 bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center overflow-hidden">
          {(event.coverImage || event.bannerImage) ? (
            <img
              src={event.coverImage || event.bannerImage}
              alt={event.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <MapPin className="h-12 w-12 text-brand/40" />
          )}
          <div className="absolute top-2 right-2">
            {getStatusBadge(event.status)}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-brand-foreground dark:group-hover:text-brand transition-colors">
            {event.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(event.startDate)}
            </span>
            {event._count?.registrations !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {event._count.registrations} คน
              </span>
            )}
          </div>

          {minPrice !== null && (
            <p className="mt-2 text-sm font-semibold">
              เริ่มต้น{" "}
              <span className="text-brand-foreground dark:text-brand">
                ฿{minPrice.toLocaleString()}
              </span>
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
