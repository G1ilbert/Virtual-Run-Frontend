"use client";

import Link from "next/link";
import { PersonStanding } from "lucide-react";
import type { Event } from "@/types/api";
import { getImageUrl } from "@/lib/image";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
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

function getDistanceRange(event: Event) {
  if (!event.packages?.length) return "";
  const distances = event.packages
    .map((p) => p.targetDistance)
    .filter((d): d is number => d != null && d > 0)
    .sort((a, b) => a - b);
  if (!distances.length) return "";
  if (distances.length === 1) return `${distances[0]}K`;
  return `${distances[0]}K - ${distances[distances.length - 1]}K`;
}

export function EventCard({ event }: { event: Event }) {
  const minPrice = getMinPrice(event);
  const distanceRange = getDistanceRange(event);

  return (
    <Link href={`/events/${event.id}`} className="group block">
      {/* Cover Image - 16:9 aspect ratio */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
        {event.coverImage || event.bannerImage ? (
          <img
            src={getImageUrl(event.coverImage || event.bannerImage)}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <PersonStanding className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-1">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">
          {event.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {minPrice !== null && (
            <span className="font-semibold text-foreground">
              ฿{minPrice.toLocaleString()}
            </span>
          )}
          {distanceRange && (
            <>
              {minPrice !== null && <span>·</span>}
              <span>{distanceRange}</span>
            </>
          )}
        </div>
        {event.startDate && (
          <p className="text-xs text-muted-foreground">
            {formatDate(event.startDate)}
          </p>
        )}
      </div>
    </Link>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video rounded-xl bg-muted" />
      <div className="mt-2.5 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}
