"use client";

import { useState } from "react";
import { OrganizerGuard } from "@/components/organizer-guard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShippingLabelPreview,
  type ShippingLabelData,
  type ShippingLabelSender,
} from "@/components/shipping/ShippingLabelPreview";
import {
  generateShippingLabelPDF,
  generateSingleLabelPDF,
} from "@/components/shipping/ShippingLabelPDF";
import { Eye, Printer } from "lucide-react";

// ─── Mock Data ───

const mockSender: ShippingLabelSender = {
  shopName: "เก่าต่อไป Running Club",
  phone: "089-123-4567",
  address: "99/9 ถ.รัชดาภิเษก",
  subDistrict: "ห้วยขวาง",
  district: "ห้วยขวาง",
  province: "กรุงเทพมหานคร",
  zipCode: "10310",
};

const mockShipments: ShippingLabelData[] = [
  {
    id: 1,
    trackingNumber: "VR-20260323-0001",
    createdAt: "2026-03-23",
    status: "preparing",
    receiver: {
      firstName: "สมชาย",
      lastName: "ใจดี",
      phone: "081-234-5678",
      address: "123/45 หมู่บ้านสุขใจ ซ.ลาดพร้าว 71",
      subDistrict: "ลาดพร้าว",
      district: "ลาดพร้าว",
      province: "กรุงเทพมหานคร",
      zipCode: "10230",
    },
    event: { name: "งานวิ่งชายหาดหัวหิน 2026" },
    package: { name: "Half Marathon 21K" },
    items: [
      { name: "เสื้อวิ่ง", variant: "L" },
      { name: "เหรียญ Finisher", variant: null },
    ],
  },
  {
    id: 2,
    trackingNumber: "VR-20260323-0002",
    createdAt: "2026-03-23",
    status: "preparing",
    receiver: {
      firstName: "สมหญิง",
      lastName: "รักวิ่ง",
      phone: "092-345-6789",
      address: "456 อาคาร ABC ชั้น 5 ถ.สุขุมวิท",
      subDistrict: "คลองเตย",
      district: "คลองเตย",
      province: "กรุงเทพมหานคร",
      zipCode: "10110",
    },
    event: { name: "งานวิ่งชายหาดหัวหิน 2026" },
    package: { name: "Mini Marathon 10K" },
    items: [
      { name: "เสื้อวิ่ง", variant: "M" },
      { name: "เหรียญ Finisher", variant: null },
      { name: "ถุงผ้า", variant: null },
    ],
  },
  {
    id: 3,
    trackingNumber: "VR-20260323-0003",
    createdAt: "2026-03-23",
    status: "preparing",
    receiver: {
      firstName: "วิทยา",
      lastName: "มานะ",
      phone: "085-678-9012",
      address: "789 หมู่ 3 ต.ป่าตอง",
      subDistrict: "ป่าตอง",
      district: "กะทู้",
      province: "ภูเก็ต",
      zipCode: "83150",
    },
    event: { name: "Phuket Beach Run 2026" },
    package: { name: "Fun Run 5K" },
    items: [{ name: "เสื้อวิ่ง", variant: "XL" }],
  },
];

// ─── Page ───

export default function ShippingLabelDemoPage() {
  const [previewShipment, setPreviewShipment] = useState<ShippingLabelData | null>(null);
  const [printing, setPrinting] = useState(false);
  const [printingAll, setPrintingAll] = useState(false);

  async function handlePrintSingle(shipment: ShippingLabelData) {
    setPrinting(true);
    try {
      await generateSingleLabelPDF(shipment, mockSender);
    } finally {
      setPrinting(false);
    }
  }

  async function handlePrintAll() {
    setPrintingAll(true);
    try {
      await generateShippingLabelPDF(mockShipments, mockSender);
    } finally {
      setPrintingAll(false);
    }
  }

  return (
    <OrganizerGuard>
      <div className="p-4 md:p-6 space-y-6 max-w-[1000px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Shipping Label Demo</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ตัวอย่างการสร้างใบจ่าหน้าขนาด 10x15 cm พร้อม barcode
            </p>
          </div>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={handlePrintAll}
            disabled={printingAll}
          >
            <Printer className="mr-2 h-4 w-4" />
            {printingAll ? "กำลังสร้าง PDF..." : "ปริ้นทั้งหมด"}
          </Button>
        </div>

        {/* Shipments Table */}
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">ผู้รับ</th>
                  <th className="px-4 py-3 text-left font-medium">ที่อยู่</th>
                  <th className="px-4 py-3 text-left font-medium">Tracking</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockShipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{shipment.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {shipment.receiver.firstName} {shipment.receiver.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {shipment.package.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px]">
                      <div>{shipment.receiver.address}</div>
                      <div>
                        {shipment.receiver.district}, {shipment.receiver.province}{" "}
                        {shipment.receiver.zipCode}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-muted rounded px-2 py-1">
                        {shipment.trackingNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => setPreviewShipment(shipment)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handlePrintSingle(shipment)}
                          disabled={printing}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          ปริ้น PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-2">ข้อมูล Label</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>ขนาด: 100mm x 150mm (4x6 นิ้ว) มาตรฐานขนส่ง</li>
            <li>Barcode: CODE128 สแกนได้จริง</li>
            <li>รองรับภาษาไทยผ่าน Noto Sans Thai + html2canvas</li>
            <li>PDF สร้างด้วย jsPDF + html2canvas (HTML to Canvas to PDF)</li>
          </ul>
        </div>

        {/* Preview Modal */}
        <Dialog
          open={previewShipment !== null}
          onOpenChange={(open) => {
            if (!open) setPreviewShipment(null);
          }}
        >
          <DialogContent className="max-w-fit p-6">
            <DialogHeader>
              <DialogTitle>Preview ใบจ่าหน้า</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              {previewShipment && (
                <ShippingLabelPreview
                  shipment={previewShipment}
                  sender={mockSender}
                  scale={1}
                />
              )}
              <Button
                className="bg-brand text-brand-foreground hover:bg-brand/90 w-full"
                onClick={() => {
                  if (previewShipment) handlePrintSingle(previewShipment);
                }}
                disabled={printing}
              >
                <Printer className="mr-2 h-4 w-4" />
                {printing ? "กำลังสร้าง PDF..." : "ปริ้น PDF"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </OrganizerGuard>
  );
}
