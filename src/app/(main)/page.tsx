"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/hooks/useApi";
import { EventCard } from "@/components/event-card";
import { CardSkeleton } from "@/components/page-skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, PersonStanding, Trophy, Package } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useEvents({ page: "1", limit: "12", status: "approved" });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand/10 via-background to-brand/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/30">
            <PersonStanding className="h-8 w-8 text-brand-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            ค้นหางานวิ่ง{" "}
            <span className="text-brand-foreground dark:text-brand">
              Virtual Run
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground md:text-lg">
            สมัครงานวิ่ง ส่งผลวิ่ง รับเหรียญและของรางวัลส่งถึงบ้าน
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-lg gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหางานวิ่ง..."
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90 h-12 px-6"
            >
              ค้นหา
            </Button>
          </form>
        </div>

        {/* Decorative dots */}
        <div className="absolute -right-8 top-8 h-32 w-32 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -left-8 bottom-8 h-24 w-24 rounded-full bg-brand/10 blur-3xl" />
      </section>

      {/* Features row */}
      <section className="border-b">
        <div className="container mx-auto flex flex-wrap justify-center gap-8 px-4 py-8">
          {[
            { icon: PersonStanding, title: "สมัครง่าย", desc: "เลือกงานวิ่งแล้วสมัครทันที" },
            { icon: Trophy, title: "ส่งผลวิ่ง", desc: "ถ่ายรูปผลวิ่งอัพโหลดเลย" },
            { icon: Package, title: "รับเหรียญถึงบ้าน", desc: "ของรางวัลจัดส่งให้ถึงที่" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3 text-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                <f.icon className="h-5 w-5 text-brand-foreground dark:text-brand" />
              </div>
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Event Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">งานวิ่งที่เปิดรับสมัคร</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push("/search")}>
            ดูทั้งหมด →
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : data?.data?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.data.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <PersonStanding className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p>ยังไม่มีงานวิ่งที่เปิดรับสมัคร</p>
          </div>
        )}
      </section>
    </div>
  );
}
