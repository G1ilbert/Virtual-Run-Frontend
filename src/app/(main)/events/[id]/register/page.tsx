"use client";

import { Suspense, use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEvent } from "@/hooks/useApi";
import { submitRegistration } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth-guard";
import { DetailSkeleton } from "@/components/page-skeleton";
import { GeographyPicker } from "@/components/geography-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, CheckCircle2, MapPin, Package } from "lucide-react";
import type { ItemVariant } from "@/types/api";

function RegisterContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const packageIdParam = searchParams.get("packageId");

  const { data: event, isLoading } = useEvent(eventId);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null,
  );
  const [addressDetail, setAddressDetail] = useState("");
  const [provinceId, setProvinceId] = useState<number | undefined>();
  const [districtId, setDistrictId] = useState<number | undefined>();
  const [subDistrictId, setSubDistrictId] = useState<number | undefined>();
  const [selectedVariants, setSelectedVariants] = useState<
    Record<number, number>
  >({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (packageIdParam) {
      setSelectedPackageId(Number(packageIdParam));
    }
  }, [packageIdParam]);

  const selectedPackage = event?.packages?.find(
    (p) => p.id === selectedPackageId,
  );

  const itemsWithVariants =
    selectedPackage?.packageItems
      ?.filter(
        (pi) => pi.items?.itemVariants && pi.items.itemVariants.length > 0,
      )
      .map((pi) => ({
        itemId: pi.itemId,
        itemName: pi.items?.name ?? `Item #${pi.itemId}`,
        variants: pi.items?.itemVariants ?? [],
      })) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageId || !user) return;

    setSubmitting(true);
    try {
      const itemVariantsArr = Object.entries(selectedVariants).map(
        ([itemId, variantId]) => ({
          itemId: Number(itemId),
          itemVariantId: variantId,
        }),
      );

      const result = await submitRegistration({
        packageId: selectedPackageId,
        addressDetail: addressDetail || undefined,
        subDistrictId: subDistrictId || undefined,
        itemVariants: itemVariantsArr.length ? itemVariantsArr : undefined,
      });

      toast.success("สมัครสำเร็จ!");
      router.push(`/my/registrations/${result.id}`);
    } catch {
      // Error handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <DetailSkeleton />;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">สมัครงานวิ่ง</h1>
      <p className="text-muted-foreground mb-6">{event?.title}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Package selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              เลือกแพ็กเกจ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {event?.packages?.map((pkg) => (
              <div
                key={pkg.id}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  selectedPackageId === pkg.id
                    ? "border-brand bg-brand/5"
                    : "border-border hover:border-brand/30"
                }`}
                onClick={() => setSelectedPackageId(pkg.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{pkg.name}</p>
                    {pkg.targetDistance && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {pkg.targetDistance} กม.
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand-foreground dark:text-brand">
                      ฿{pkg.price?.toLocaleString()}
                    </p>
                  </div>
                </div>
                {selectedPackageId === pkg.id && pkg.packageItems && (
                  <div className="mt-3 space-y-1">
                    {pkg.packageItems.map((pi) => (
                      <p
                        key={pi.id}
                        className="text-sm text-muted-foreground flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3 w-3 text-brand" />
                        {pi.items?.name}
                        {pi.quantity > 1 && ` x${pi.quantity}`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Variants selection */}
        {itemsWithVariants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">เลือกตัวเลือก</CardTitle>
              <CardDescription>เช่น ไซส์เสื้อ สีเหรียญ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {itemsWithVariants.map((item) => (
                <div key={item.itemId} className="space-y-2">
                  <Label>{item.itemName}</Label>
                  <Select
                    value={selectedVariants[item.itemId]?.toString() ?? ""}
                    onValueChange={(v) =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [item.itemId]: Number(v),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือก..." />
                    </SelectTrigger>
                    <SelectContent>
                      {item.variants.map((v: ItemVariant) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.variantName}: {v.variantValue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Shipping info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลจัดส่ง</CardTitle>
            <CardDescription>ที่อยู่สำหรับจัดส่งของรางวัล</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GeographyPicker
              provinceId={provinceId}
              districtId={districtId}
              subDistrictId={subDistrictId}
              onProvinceChange={setProvinceId}
              onDistrictChange={setDistrictId}
              onSubDistrictChange={setSubDistrictId}
            />
            <div className="space-y-2">
              <Label htmlFor="address">รายละเอียดที่อยู่</Label>
              <Input
                id="address"
                placeholder="บ้านเลขที่ ซอย ถนน หมู่บ้าน"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {selectedPackage && (
          <Card className="border-brand/50">
            <CardHeader>
              <CardTitle className="text-lg">สรุปรายการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span>{selectedPackage.name}</span>
                <span className="font-semibold">
                  ฿{selectedPackage.price?.toLocaleString()}
                </span>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>รวมทั้งหมด</span>
                <span className="text-brand-foreground dark:text-brand">
                  ฿{selectedPackage.price?.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
          disabled={!selectedPackageId || submitting}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          สมัครและดำเนินการชำระเงิน
        </Button>
      </form>
    </div>
  );
}

export default function RegisterEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AuthGuard>
      <Suspense fallback={<DetailSkeleton />}>
        <RegisterContent eventId={id} />
      </Suspense>
    </AuthGuard>
  );
}
