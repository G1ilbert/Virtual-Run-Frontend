"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEvents } from "@/hooks/useApi";
import { EventCard, EventCardSkeleton } from "@/components/event-card";
import { Search, PersonStanding } from "lucide-react";
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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [activeFilter, setActiveFilter] = useState("all");

  const { data, isLoading } = useEvents({
    page: "1",
    limit: "50",
    status: "approved",
    ...(query.trim() ? { search: query.trim() } : {}),
  });

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const filteredEvents = useMemo(() => {
    const events = data?.data ?? [];
    return events.filter((e) => matchesFilter(e, activeFilter));
  }, [data, activeFilter]);

  return (
    <div className="px-4 md:px-6 py-4 max-w-[1600px]">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหางานวิ่ง..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={!!initialQ}
            className="w-full rounded-full border bg-muted/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:bg-background focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
      </form>

      {/* Chip Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
        {CHIP_FILTERS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => setActiveFilter(chip.value)}
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

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PersonStanding className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">ไม่พบงานวิ่งที่ค้นหา</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 md:px-6 py-4 max-w-[1600px]">
          <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
