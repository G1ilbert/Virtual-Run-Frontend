"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useMyRegistrations, updateProfile } from "@/hooks/useApi";
import { AuthGuard } from "@/components/auth-guard";
import { DetailSkeleton } from "@/components/page-skeleton";
import { GeographyPicker } from "@/components/geography-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  User,
  Phone,
  MapPin,
  Trophy,
  ClipboardList,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading, mutate } = useProfile();
  const { data: registrations } = useMyRegistrations();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    addressDetail: "",
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
      });
      setSubDistrictId(profile.subDistrictId ?? undefined);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        ...form,
        subDistrictId: subDistrictId ?? undefined,
      });
      await mutate();
      setEditing(false);
      toast.success("บันทึกข้อมูลสำเร็จ");
    } catch {
      // Error handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const totalRegistrations = registrations?.length ?? 0;
  const totalDistance = registrations?.reduce(
    (sum, r) => sum + (r.targetDistanceSnapshot ?? 0),
    0,
  ) ?? 0;

  return (
    <AuthGuard>
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">โปรไฟล์</h1>

        {isLoading ? (
          <DetailSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Avatar & Username */}
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-brand text-brand-foreground text-2xl font-bold">
                    {profile?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{profile?.username}</h2>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                    <ClipboardList className="h-5 w-5 text-brand-foreground dark:text-brand" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalRegistrations}</p>
                    <p className="text-xs text-muted-foreground">งานที่สมัคร</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                    <Trophy className="h-5 w-5 text-brand-foreground dark:text-brand" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalDistance}</p>
                    <p className="text-xs text-muted-foreground">กม. รวม</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Edit Profile */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">ข้อมูลส่วนตัว</CardTitle>
                    <CardDescription>แก้ไขข้อมูลโปรไฟล์ของคุณ</CardDescription>
                  </div>
                  {!editing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      แก้ไข
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      ชื่อ
                    </Label>
                    {editing ? (
                      <Input
                        value={form.firstName}
                        onChange={(e) =>
                          setForm({ ...form, firstName: e.target.value })
                        }
                        placeholder="ชื่อจริง"
                      />
                    ) : (
                      <p className="text-sm">
                        {profile?.firstName || "—"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>นามสกุล</Label>
                    {editing ? (
                      <Input
                        value={form.lastName}
                        onChange={(e) =>
                          setForm({ ...form, lastName: e.target.value })
                        }
                        placeholder="นามสกุล"
                      />
                    ) : (
                      <p className="text-sm">
                        {profile?.lastName || "—"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    เบอร์โทร
                  </Label>
                  {editing ? (
                    <Input
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm({ ...form, phoneNumber: e.target.value })
                      }
                      placeholder="08x-xxx-xxxx"
                    />
                  ) : (
                    <p className="text-sm">{profile?.phoneNumber || "—"}</p>
                  )}
                </div>

                {editing && (
                  <>
                    <Separator />
                    <GeographyPicker
                      provinceId={provinceId}
                      districtId={districtId}
                      subDistrictId={subDistrictId}
                      onProvinceChange={setProvinceId}
                      onDistrictChange={setDistrictId}
                      onSubDistrictChange={setSubDistrictId}
                    />
                  </>
                )}

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    ที่อยู่
                  </Label>
                  {editing ? (
                    <Input
                      value={form.addressDetail}
                      onChange={(e) =>
                        setForm({ ...form, addressDetail: e.target.value })
                      }
                      placeholder="บ้านเลขที่ ซอย ถนน หมู่บ้าน"
                    />
                  ) : (
                    <p className="text-sm">{profile?.addressDetail || "—"}</p>
                  )}
                </div>

                {editing && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="bg-brand text-brand-foreground hover:bg-brand/90"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      บันทึก
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
