"use client";

import { Suspense, use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEvent, useProfile } from "@/hooks/useApi";
import { submitRegistration } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth-guard";
import { GeographyPicker } from "@/components/geography-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Zap } from "lucide-react";
import type { ItemVariant } from "@/types/api";

function RegisterContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const packageIdParam = searchParams.get("packageId");

  const { data: event, isLoading } = useEvent(eventId);
  const { data: profile } = useProfile();
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [provinceId, setProvinceId] = useState<number | undefined>();
  const [districtId, setDistrictId] = useState<number | undefined>();
  const [subDistrictId, setSubDistrictId] = useState<number | undefined>();
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (packageIdParam) {
      setSelectedPackageId(Number(packageIdParam));
    }
  }, [packageIdParam]);

  const quickFill = () => {
    if (!profile) {
      toast.error("ไม่พบข้อมูลโปรไฟล์");
      return;
    }
    if (profile.firstName) setFirstName(profile.firstName);
    if (profile.lastName) setLastName(profile.lastName);
    if (profile.email) setEmail(profile.email);
    if (profile.phoneNumber) setPhone(profile.phoneNumber);
    if (profile.addressDetail) setAddressDetail(profile.addressDetail);
    if (profile.subDistrictId) setSubDistrictId(profile.subDistrictId);
    toast.success("ดึงข้อมูลเรียบร้อย");
  };

  const selectedPackage = event?.packages?.find((p) => p.id === selectedPackageId);

  const itemsWithVariants =
    selectedPackage?.packageItems
      ?.filter((pi) => pi.items?.itemVariants && pi.items.itemVariants.length > 0)
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

  if (isLoading) {
    return (
      <div className="max-w-2xl px-4 md:px-6 py-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-40 bg-muted rounded-xl" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl px-4 md:px-6 py-6">
      {/* Sticky Header */}
      <div className="sticky top-14 z-10 -mx-4 md:-mx-6 bg-background/95 backdrop-blur border-b px-4 md:px-6 py-3 mb-6">
        <p className="font-bold">{event?.title}</p>
        {selectedPackage && (
          <p className="text-sm text-muted-foreground">
            {selectedPackage.name} — ฿{selectedPackage.price?.toLocaleString()}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quick Fill Button */}
        <Button
          type="button"
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={quickFill}
        >
          <Zap className="mr-2 h-4 w-4" />
          ดึงข้อมูลจากโปรไฟล์
        </Button>

        {/* Section 1: ข้อมูลส่วนตัว */}
        <section>
          <h2 className="text-lg font-bold mb-4">ข้อมูลส่วนตัว</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ชื่อ</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="ชื่อ" />
              </div>
              <div className="space-y-1.5">
                <Label>นามสกุล</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="นามสกุล" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>อีเมล</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>เบอร์โทร</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
            </div>
          </div>
        </section>

        {/* Section 2: เลือกของ (Variants) */}
        {itemsWithVariants.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">เลือกตัวเลือก</h2>
            <div className="space-y-4">
              {itemsWithVariants.map((item) => (
                <div key={item.itemId} className="space-y-1.5">
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
            </div>
          </section>
        )}

        {/* Section 3: ที่อยู่จัดส่ง */}
        <section>
          <h2 className="text-lg font-bold mb-4">ที่อยู่จัดส่ง</h2>
          <div className="space-y-4">
            <GeographyPicker
              provinceId={provinceId}
              districtId={districtId}
              subDistrictId={subDistrictId}
              onProvinceChange={setProvinceId}
              onDistrictChange={setDistrictId}
              onSubDistrictChange={setSubDistrictId}
            />
            <div className="space-y-1.5">
              <Label>ที่อยู่เพิ่มเติม</Label>
              <Textarea
                placeholder="บ้านเลขที่ ซอย ถนน หมู่บ้าน"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>รหัสไปรษณีย์</Label>
              <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="10110" />
            </div>
          </div>
        </section>

        {/* Section 4: สรุป */}
        {selectedPackage && (
          <section>
            <h2 className="text-lg font-bold mb-4">สรุปรายการ</h2>
            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">งานวิ่ง</span>
                <span className="font-medium">{event?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">{selectedPackage.name}</span>
              </div>
              {selectedPackage.packageItems && selectedPackage.packageItems.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm">ของที่ได้:</span>
                  <div className="mt-1 space-y-0.5">
                    {selectedPackage.packageItems.map((pi) => (
                      <p key={pi.id} className="text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-brand shrink-0" />
                        {pi.items?.name}{pi.quantity > 1 && ` x${pi.quantity}`}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>รวมทั้งหมด</span>
                <span className="text-brand-foreground dark:text-brand">
                  ฿{selectedPackage.price?.toLocaleString()}
                </span>
              </div>
            </div>
          </section>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90 text-base py-6"
          disabled={!selectedPackageId || submitting}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          ยืนยันสมัคร
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
      <Suspense
        fallback={
          <div className="max-w-2xl px-4 md:px-6 py-6 animate-pulse space-y-4">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-40 bg-muted rounded-xl" />
          </div>
        }
      >
        <RegisterContent eventId={id} />
      </Suspense>
    </AuthGuard>
  );
}
