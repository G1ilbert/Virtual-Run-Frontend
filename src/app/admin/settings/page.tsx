"use client";

import { useState, useEffect } from "react";
import {
  useSystemSettings,
  updateSystemSettings,
} from "@/hooks/useAdminApi";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: settings, mutate: mutateSettings, isLoading } = useSystemSettings();
  const [form, setForm] = useState({
    promptpayId: "",
    promptpayName: "",
    commissionRate: 10,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSystemSettings({
        promptpayId: form.promptpayId,
        promptpayName: form.promptpayName,
        commissionRate: Number(form.commissionRate),
      });
      await mutateSettings();
      toast.success("บันทึกสำเร็จ");
    } catch {
      toast.error("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>การตั้งค่าระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="promptpayId">PromptPay ID</Label>
                <Input
                  id="promptpayId"
                  type="text"
                  placeholder="เช่น 0812345678"
                  value={form.promptpayId}
                  onChange={(e) =>
                    handleChange("promptpayId", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promptpayName">PromptPay Name</Label>
                <Input
                  id="promptpayName"
                  type="text"
                  placeholder="ชื่อบัญชี PromptPay"
                  value={form.promptpayName}
                  onChange={(e) =>
                    handleChange("promptpayName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionRate">Commission Rate %</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step={0.1}
                  min={0}
                  max={100}
                  placeholder="เช่น 10"
                  value={form.commissionRate}
                  onChange={(e) =>
                    handleChange("commissionRate", e.target.value)
                  }
                />
              </div>

              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                บันทึก
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
