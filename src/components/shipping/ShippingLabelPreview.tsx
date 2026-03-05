"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export interface ShippingLabelSender {
  shopName: string;
  phone: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  zipCode: string;
}

export interface ShippingLabelReceiver {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  zipCode: string;
}

export interface ShippingLabelItem {
  name: string;
  variant: string | null;
}

export interface ShippingLabelData {
  id: number;
  trackingNumber: string;
  createdAt: string;
  status: string;
  receiver: ShippingLabelReceiver;
  event: { name: string };
  package: { name: string };
  items: ShippingLabelItem[];
}

interface ShippingLabelPreviewProps {
  shipment: ShippingLabelData;
  sender: ShippingLabelSender;
  scale?: number;
}

export function ShippingLabelPreview({
  shipment,
  sender,
  scale = 1,
}: ShippingLabelPreviewProps) {
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, shipment.trackingNumber, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: false,
          margin: 0,
        });
      } catch {
        // barcode generation failed
      }
    }
  }, [shipment.trackingNumber]);

  const r = shipment.receiver;
  const createdDate = new Date(shipment.createdAt).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const seq = `#${String(shipment.id).padStart(4, "0")}`;

  return (
    <div
      className="shipping-label-root"
      style={{
        width: `${100 * scale}mm`,
        height: `${150 * scale}mm`,
        background: "#fff",
        color: "#000",
        fontFamily: "'Noto Sans Thai', 'Helvetica Neue', Arial, sans-serif",
        fontSize: `${9 * scale}px`,
        lineHeight: 1.4,
        padding: `${5 * scale}mm`,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid #ddd",
        position: "relative",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: `${12 * scale}px`,
          paddingBottom: `${2 * scale}mm`,
          letterSpacing: "0.5px",
        }}
      >
        VIRTUAL RUN
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1.5px solid #000", marginBottom: `${2 * scale}mm` }} />

      {/* Sender Section */}
      <div style={{ marginBottom: `${2 * scale}mm` }}>
        <div
          style={{
            fontSize: `${7 * scale}px`,
            color: "#888",
            marginBottom: `${1 * scale}mm`,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          ผู้ส่ง (FROM)
        </div>
        <div style={{ fontWeight: 700, fontSize: `${10 * scale}px` }}>
          {sender.shopName}
        </div>
        <div style={{ fontSize: `${8 * scale}px` }}>{sender.address}</div>
        <div style={{ fontSize: `${8 * scale}px` }}>
          แขวง{sender.subDistrict} เขต{sender.district}
        </div>
        <div style={{ fontSize: `${8 * scale}px` }}>
          {sender.province} {sender.zipCode}
        </div>
        <div style={{ fontSize: `${8 * scale}px` }}>โทร: {sender.phone}</div>
      </div>

      {/* Double Divider */}
      <div
        style={{
          borderTop: "3px double #000",
          marginBottom: `${3 * scale}mm`,
        }}
      />

      {/* Receiver Section */}
      <div style={{ flex: 1, marginBottom: `${2 * scale}mm` }}>
        <div
          style={{
            fontSize: `${7 * scale}px`,
            color: "#888",
            marginBottom: `${1.5 * scale}mm`,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          ผู้รับ (TO)
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: `${14 * scale}px`,
            marginBottom: `${1 * scale}mm`,
          }}
        >
          {r.firstName} {r.lastName}
        </div>
        <div style={{ fontSize: `${10 * scale}px`, marginBottom: `${0.5 * scale}mm` }}>
          {r.address}
        </div>
        <div style={{ fontSize: `${10 * scale}px`, marginBottom: `${0.5 * scale}mm` }}>
          แขวง{r.subDistrict} เขต{r.district}
        </div>
        <div
          style={{
            fontSize: `${12 * scale}px`,
            fontWeight: 700,
            marginBottom: `${0.5 * scale}mm`,
          }}
        >
          {r.province} {r.zipCode}
        </div>
        <div style={{ fontSize: `${10 * scale}px` }}>โทร: {r.phone}</div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #000", marginBottom: `${2 * scale}mm` }} />

      {/* Event / Package / Items */}
      <div style={{ marginBottom: `${2 * scale}mm`, fontSize: `${8 * scale}px` }}>
        <div>
          <span style={{ color: "#666" }}>งาน: </span>
          {shipment.event.name}
        </div>
        <div>
          <span style={{ color: "#666" }}>แพ็กเกจ: </span>
          {shipment.package.name}
        </div>
        <div>
          <span style={{ color: "#666" }}>รายการ: </span>
          {shipment.items
            .map((item) => (item.variant ? `${item.name} (${item.variant})` : item.name))
            .join(", ")}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #000", marginBottom: `${2 * scale}mm` }} />

      {/* Barcode */}
      <div
        style={{
          textAlign: "center",
          padding: `${1 * scale}mm ${2 * scale}mm`,
          marginBottom: `${1 * scale}mm`,
        }}
      >
        <canvas
          ref={barcodeRef}
          style={{ width: `${80 * scale}mm`, height: `${15 * scale}mm` }}
        />
        <div
          style={{
            fontSize: `${10 * scale}px`,
            fontWeight: 600,
            letterSpacing: "1px",
            marginTop: `${1 * scale}mm`,
          }}
        >
          {shipment.trackingNumber}
        </div>
      </div>

      {/* Footer: date + sequence */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: `${7 * scale}px`,
          color: "#666",
        }}
      >
        <span>วันที่: {createdDate}</span>
        <span>{seq}</span>
      </div>
    </div>
  );
}
