"use client";

import { use, useState } from "react";
import { useRegistration, usePaymentQR, submitSlip, confirmDelivery } from "@/hooks/useApi";
import { AuthGuard } from "@/components/auth-guard";
import { DetailSkeleton } from "@/components/page-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2,
  Circle,
  CreditCard,
  Package,
  Truck,
  Home,
  Trophy,
  Upload,
  QrCode,
} from "lucide-react";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Timeline step
interface TimelineStep {
  label: string;
  icon: React.ReactNode;
  done: boolean;
  date?: string;
}

export default function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: reg, isLoading, mutate } = useRegistration(id);
  const { data: qrData } = usePaymentQR(
    reg?.paymentStatus === "pending" ? reg.id : undefined,
  );

  const [slipUrl, setSlipUrl] = useState("");
  const [submittingSlip, setSubmittingSlip] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleSubmitSlip = async () => {
    if (!slipUrl.trim() || !reg) return;
    setSubmittingSlip(true);
    try {
      await submitSlip(reg.id, slipUrl);
      toast.success("ส่งสลิปสำเร็จ รอตรวจสอบ");
      await mutate();
      setSlipUrl("");
    } catch {
      // handled
    } finally {
      setSubmittingSlip(false);
    }
  };

  const handleConfirmDelivery = async () => {
    const shipment = reg?.shipments?.[0];
    if (!shipment || shipment.status !== "shipped") return;
    setConfirming(true);
    try {
      await confirmDelivery(shipment.id);
      toast.success("ยืนยันรับของสำเร็จ!");
      await mutate();
    } catch {
      // handled
    } finally {
      setConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <DetailSkeleton />
      </AuthGuard>
    );
  }

  if (!reg) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">ไม่พบรายการลงทะเบียน</p>
        </div>
      </AuthGuard>
    );
  }

  const shipment = reg.shipments?.[0];
  const trackingNumber = shipment?.shipmentStaff?.[0]?.trackingNumber;

  // Build timeline
  const steps: TimelineStep[] = [
    {
      label: "สมัคร",
      icon: <CheckCircle2 className="h-5 w-5" />,
      done: true,
      date: reg.createdAt,
    },
    {
      label: "ชำระเงิน",
      icon: <CreditCard className="h-5 w-5" />,
      done: reg.paymentStatus === "confirmed",
    },
    {
      label: "เตรียมจัดส่ง",
      icon: <Package className="h-5 w-5" />,
      done: !!shipment && ["preparing", "shipped", "delivered"].includes(shipment.status),
      date: shipment?.preparedAt,
    },
    {
      label: "จัดส่ง",
      icon: <Truck className="h-5 w-5" />,
      done: !!shipment && ["shipped", "delivered"].includes(shipment.status),
    },
    {
      label: "ได้รับ",
      icon: <Home className="h-5 w-5" />,
      done: shipment?.status === "delivered",
    },
  ];

  return (
    <AuthGuard>
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">
          {reg.packages?.events?.title ?? reg.packages?.name ?? `#${reg.id}`}
        </h1>
        <p className="text-muted-foreground mb-6">{reg.packages?.name}</p>

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">สถานะ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {steps.map((step, i) => (
                <div key={step.label} className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      step.done
                        ? "bg-brand text-brand-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.done ? step.icon : <Circle className="h-5 w-5" />}
                  </div>
                  <span className="mt-2 text-[10px] sm:text-xs text-center font-medium">
                    {step.label}
                  </span>
                  {step.date && (
                    <span className="text-[9px] text-muted-foreground">
                      {formatDate(step.date)}
                    </span>
                  )}
                  {i < steps.length - 1 && (
                    <div
                      className={`absolute h-0.5 ${step.done ? "bg-brand" : "bg-muted"}`}
                      style={{ display: "none" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        {reg.paymentStatus === "pending" && (
          <Card className="mb-6 border-brand/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                ชำระเงิน
              </CardTitle>
              <CardDescription>
                สแกน QR Code เพื่อชำระเงินจำนวน ฿
                {Number(reg.priceSnapshot ?? 0).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrData?.qrCodeDataUrl && (
                <div className="flex justify-center">
                  <img
                    src={qrData.qrCodeDataUrl}
                    alt="PromptPay QR Code"
                    className="h-48 w-48"
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>URL สลิปการโอน</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="วาง URL สลิปที่นี่..."
                    value={slipUrl}
                    onChange={(e) => setSlipUrl(e.target.value)}
                  />
                  <Button
                    onClick={handleSubmitSlip}
                    disabled={!slipUrl.trim() || submittingSlip}
                    className="bg-brand text-brand-foreground hover:bg-brand/90"
                  >
                    {submittingSlip ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {reg.paymentStatus === "submitted" && (
          <Card className="mb-6">
            <CardContent className="flex items-center gap-3 pt-6">
              <Badge variant="secondary">รอตรวจสอบ</Badge>
              <span className="text-sm text-muted-foreground">
                ส่งสลิปแล้ว รอเจ้าหน้าที่ตรวจสอบ
              </span>
            </CardContent>
          </Card>
        )}

        {/* Shipping / Confirm Delivery */}
        {shipment?.status === "shipped" && (
          <Card className="mb-6 border-brand/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                จัดส่งแล้ว
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trackingNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">เลขพัสดุ</p>
                  <p className="font-mono font-semibold">{trackingNumber}</p>
                </div>
              )}
              <Button
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={handleConfirmDelivery}
                disabled={confirming}
              >
                {confirming && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <CheckCircle2 className="mr-2 h-4 w-4" />
                ยืนยันรับของ
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Running Results */}
        {reg.runningResults && reg.runningResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                ผลวิ่ง
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reg.runningResults.map((rr) => (
                <div
                  key={rr.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Proof #{rr.runningProofId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(rr.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      rr.status === "approved"
                        ? "default"
                        : rr.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {rr.status === "approved"
                      ? "อนุมัติ"
                      : rr.status === "rejected"
                        ? "ไม่ผ่าน"
                        : "รอตรวจ"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
