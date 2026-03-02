"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEvents } from "@/hooks/useApi";
import { EventCard } from "@/components/event-card";
import { CardSkeleton } from "@/components/page-skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, PersonStanding } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [status, setStatus] = useState("approved");
  const [page, setPage] = useState(1);

  const params: Record<string, string | number> = {
    page,
    limit: 12,
  };
  if (status && status !== "all") params.status = status;
  if (query.trim()) params.search = query.trim();

  const { data, isLoading } = useEvents(params);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">ค้นหางานวิ่ง</h1>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่องานวิ่ง..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            ค้นหา
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span>กรอง:</span>
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="approved">เปิดรับสมัคร</SelectItem>
              <SelectItem value="completed">จบแล้ว</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data?.data?.length ? (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            พบ {data.meta.total} งานวิ่ง
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.data.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ก่อนหน้า
              </Button>
              <span className="text-sm text-muted-foreground">
                หน้า {page} / {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ถัดไป
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <PersonStanding className="mx-auto mb-4 h-12 w-12 opacity-30" />
          <p>ไม่พบงานวิ่งที่ค้นหา</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
