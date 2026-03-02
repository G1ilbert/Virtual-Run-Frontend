"use client";

import { use } from "react";
import Link from "next/link";
import { useEvent } from "@/hooks/useApi";
import { DetailSkeleton } from "@/components/page-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Users,
  MapPin,
  Package,
  ArrowRight,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import type { Package as PackageType } from "@/types/api";
import { ImageGallery } from "@/components/image-upload";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PackageCard({ pkg, eventId }: { pkg: PackageType; eventId: number }) {
  return (
    <Card className="relative flex flex-col transition-all hover:shadow-lg hover:border-brand/50 overflow-hidden">
      {/* Package Image */}
      {pkg.image && (
        <div className="relative h-40 bg-muted">
          <img src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{pkg.name}</CardTitle>
        {pkg.description && (
          <CardDescription>{pkg.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="text-3xl font-bold text-brand-foreground dark:text-brand">
          ฿{pkg.price?.toLocaleString() ?? 0}
        </div>

        {pkg.targetDistance && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            ระยะทาง {pkg.targetDistance} กม.
          </div>
        )}

        {pkg.packageItems && pkg.packageItems.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-sm font-medium">ของที่ได้รับ:</p>
            {pkg.packageItems.map((pi) => (
              <div
                key={pi.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                {(pi.items?.image || pi.items?.imageUrl) ? (
                  <img
                    src={pi.items.image || pi.items.imageUrl}
                    alt={pi.items?.name ?? ""}
                    className="h-6 w-6 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-foreground dark:text-brand flex-shrink-0" />
                )}
                {pi.items?.name ?? `Item #${pi.itemId}`}
                {pi.quantity > 1 && ` x${pi.quantity}`}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
          asChild
        >
          <Link href={`/events/${eventId}/register?packageId=${pkg.id}`}>
            สมัคร
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: event, isLoading, error } = useEvent(id);

  if (isLoading) return <DetailSkeleton />;
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">ไม่พบงานวิ่งนี้</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Banner / Cover Image */}
      <div className="relative h-48 md:h-72 rounded-xl overflow-hidden bg-gradient-to-br from-brand/20 to-brand/5 mb-6">
        {(event.coverImage || event.bannerImage) ? (
          <img
            src={event.coverImage || event.bannerImage}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapPin className="h-16 w-16 text-brand/30" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant={event.status === "approved" ? "default" : "secondary"}>
            {event.status === "approved" ? "เปิดรับสมัคร" : event.status}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">{event.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </span>
          {event._count?.registrations !== undefined && (
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {event._count.registrations} ผู้สมัคร
            </span>
          )}
          {event.organizer && (
            <span className="flex items-center gap-1.5">
              ผู้จัด: {event.organizer.username}
            </span>
          )}
        </div>

        {event.description && (
          <>
            <Separator className="my-4" />
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>
          </>
        )}
      </div>

      {/* Detail Images Gallery */}
      {event.detailImages && event.detailImages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            รูปภาพ
          </h2>
          <ImageGallery images={event.detailImages} />
        </section>
      )}

      {/* Packages */}
      {event.packages && event.packages.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            แพ็กเกจ
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} eventId={event.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
