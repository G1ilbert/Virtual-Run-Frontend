"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile, updateProfile } from "@/hooks/useApi";
import { AuthGuard } from "@/components/auth-guard";
import { GeographyPicker } from "@/components/geography-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ProfileInfoPage() {
  const router = useRouter();
  const { data: profile, isLoading, mutate } = useProfile();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    addressDetail: "",
    zipCode: "",
  });
  const [provinceId, setProvinceId] = useState<number | undefined>();
  const [districtId, setDistrictId] = useState<number | undefined>();
  const [subDistrictId, setSubDistrictId] = useState<number | undefined>();

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        addressDetail: profile.addressDetail ?? "",
        zipCode: "",
      });
      setSubDistrictId(profile.subDistrictId ?? undefined);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        phoneNumber: form.phoneNumber || undefined,
        addressDetail: form.addressDetail || undefined,
        subDistrictId: subDistrictId ?? undefined,
      });
      await mutate();
      toast.success("บันทึกเรียบร้อย");
    } catch {
      toast.error("ไม่สามารถบันทึกได้ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="px-4 md:px-6 py-6 max-w-2xl mx-auto pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">ข้อมูลส่วนตัว & ที่อยู่</h1>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-10 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section 1: ข้อมูลส่วนตัว */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                ข้อมูลส่วนตัว
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>ชื่อ</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="ชื่อจริง"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>นามสกุล</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="นามสกุล"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>เบอร์โทร</Label>
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="08x-xxx-xxxx"
                />
              </div>
            </section>

            {/* Divider */}
            <div className="border-t" />

            {/* Section 2: ที่อยู่จัดส่ง */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                ที่อยู่จัดส่ง
              </h2>
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
                  value={form.addressDetail}
                  onChange={(e) => setForm({ ...form, addressDetail: e.target.value })}
                  placeholder="บ้านเลขที่ ซอย ถนน"
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>รหัสไปรษณีย์</Label>
                <Input
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  placeholder="10120"
                  maxLength={5}
                />
              </div>
            </section>

            {/* Desktop Save Button */}
            <div className="hidden md:block">
              <Button
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึก
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Save Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t md:hidden z-40">
        <Button
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          บันทึก
        </Button>
      </div>
    </AuthGuard>
  );
}
