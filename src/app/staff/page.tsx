"use client";

import Link from "next/link";
import { useStaffEvents } from "@/hooks/useStaffApi";
import { CalendarDays, Users, ClipboardCheck, Package, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/image";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StaffDashboardPage() {
  const { data: events, isLoading } = useStaffEvents();

  return (
    <div className="px-4 md:px-6 py-6 max-w-[900px]">
      <h1 className="text-xl font-bold mb-1">Staff Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">
        งานวิ่งที่คุณได้รับมอบหมายเป็น Staff
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid gap-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/staff/events/${event.id}`}
              className="group flex flex-col sm:flex-row gap-4 rounded-xl border p-4 hover:bg-muted/50 transition-colors"
            >
              {/* Event Image */}
              <div className="w-full sm:w-40 h-28 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                {event.bannerImage ? (
                  <img
                    src={getImageUrl(event.bannerImage)}
                    alt={event.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-base group-hover:text-emerald-600 transition-colors">
                  {event.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>ผู้สมัคร</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    <span>ผลวิ่ง</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    <span>จัดส่ง</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Staff
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarDays className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">ยังไม่ได้รับมอบหมายงาน</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            เมื่อผู้จัดงานเพิ่มคุณเป็น Staff จะแสดงที่นี่
          </p>
        </div>
      )}
    </div>
  );
}
