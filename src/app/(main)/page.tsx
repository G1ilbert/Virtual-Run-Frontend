"use client";

import { useState, useMemo } from "react";
import { useEvents } from "@/hooks/useApi";
import { EventCard, EventCardSkeleton } from "@/components/event-card";
import { PersonStanding } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/api";

const CHIP_FILTERS = [
  { label: "ทั้งหมด", value: "all" },
  { label: "5K", value: "5k" },
  { label: "10K", value: "10k" },
  { label: "21K", value: "21k" },
  { label: "42K", value: "42k" },
  { label: "Fun Run", value: "fun" },
  { label: "Trail", value: "trail" },
] as const;

function matchesFilter(event: Event, filter: string): boolean {
  if (filter === "all") return true;

  const distances = event.packages
    ?.map((p) => p.targetDistance)
    .filter((d): d is number => d != null) ?? [];

  const titleLower = event.title.toLowerCase();
  const descLower = (event.description ?? "").toLowerCase();
  const packageNames = event.packages?.map((p) => p.name.toLowerCase()).join(" ") ?? "";
  const searchText = `${titleLower} ${descLower} ${packageNames}`;

  switch (filter) {
    case "5k":
      return distances.some((d) => d >= 3 && d <= 6);
    case "10k":
      return distances.some((d) => d >= 7 && d <= 15);
    case "21k":
      return distances.some((d) => d >= 16 && d <= 25);
    case "42k":
      return distances.some((d) => d >= 26);
    case "fun":
      return searchText.includes("fun");
    case "trail":
      return searchText.includes("trail");
    default:
      return true;
  }
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(12);
  const { data, isLoading } = useEvents({ page: "1", limit: "50", status: "approved" });

  const filteredEvents = useMemo(() => {
    const events = data?.data ?? [];
    return events.filter((e) => matchesFilter(e, activeFilter));
  }, [data, activeFilter]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  return (
    <div className="px-4 md:px-6 py-4 max-w-[1600px]">
      {/* Chip Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
        {CHIP_FILTERS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => {
              setActiveFilter(chip.value);
              setVisibleCount(12);
            }}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              activeFilter === chip.value
                ? "bg-foreground text-background"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Event Grid */}
      {isLoading ? (
        <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : visibleEvents.length > 0 ? (
        <>
          <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + 12)}
                className="rounded-full bg-muted px-6 py-2.5 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                โหลดเพิ่มเติม
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PersonStanding className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">ยังไม่มีงานวิ่งในขณะนี้</p>
        </div>
      )}
    </div>
  );
}
