import type { SenderInfo } from "@/types/api";

export interface ShippingLabelData {
  trackingNumber: string;
  sender: SenderInfo;
  recipient: {
    name: string;
    address: string;
    subDistrict?: string;
    district?: string;
    province?: string;
    zipCode?: string;
    phone?: string;
  };
  eventTitle: string;
  packageName: string;
  items: string[];
  createdDate: string;
}

/** Generate a shipping label PDF (10x15 cm) using jsPDF + JsBarcode */
export async function generateShippingLabelPDF(
  labels: ShippingLabelData[],
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const JsBarcode = (await import("jsbarcode")).default;

  // 10cm x 15cm = ~283 x 425 points (1cm ≈ 28.35pt)
  const pageW = 283;
  const pageH = 425;
  const margin = 14;
  const lineH = 14;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageW, pageH],
  });

  // Add Noto Sans Thai font support is complex; use built-in Helvetica for now
  // Thai text will render if browser supports it in the PDF viewer

  for (let i = 0; i < labels.length; i++) {
    if (i > 0) doc.addPage([pageW, pageH]);
    const label = labels[i];
    let y = margin;

    // Title
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.text("Virtual Run", pageW / 2, y, { align: "center" });
    y += lineH;

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += lineH;

    // ─── Sender ───
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.text("Sender:", margin, y);
    y += 10;
    doc.setFontSize(9);
    doc.text(label.sender.shopName, margin, y);
    y += 10;
    doc.setFontSize(7);
    doc.text(label.sender.address, margin, y);
    y += 9;
    doc.text(`${label.sender.district} ${label.sender.province} ${label.sender.zipCode}`, margin, y);
    y += 9;
    doc.text(`Tel: ${label.sender.phone}`, margin, y);
    y += lineH;

    doc.line(margin, y, pageW - margin, y);
    y += lineH;

    // ─── Recipient ───
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.text("Recipient:", margin, y);
    y += 10;
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.text(label.recipient.name, margin, y);
    y += 13;
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.text(label.recipient.address, margin, y);
    y += 10;
    if (label.recipient.subDistrict || label.recipient.district) {
      doc.text(
        `${label.recipient.subDistrict ?? ""} ${label.recipient.district ?? ""}`.trim(),
        margin,
        y,
      );
      y += 10;
    }
    if (label.recipient.province || label.recipient.zipCode) {
      doc.text(
        `${label.recipient.province ?? ""} ${label.recipient.zipCode ?? ""}`.trim(),
        margin,
        y,
      );
      y += 10;
    }
    if (label.recipient.phone) {
      doc.text(`Tel: ${label.recipient.phone}`, margin, y);
      y += 10;
    }
    y += 4;

    doc.line(margin, y, pageW - margin, y);
    y += lineH;

    // ─── Event & Package ───
    doc.setFontSize(8);
    doc.text(`Event: ${label.eventTitle}`, margin, y);
    y += 10;
    doc.text(`Package: ${label.packageName}`, margin, y);
    y += 10;
    if (label.items.length > 0) {
      doc.text(`Items: ${label.items.join(", ")}`, margin, y);
      y += 10;
    }

    y += 4;
    doc.line(margin, y, pageW - margin, y);
    y += lineH + 4;

    // ─── Barcode ───
    try {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, label.trackingNumber, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false,
        margin: 0,
      });
      const barcodeDataUrl = canvas.toDataURL("image/png");
      const barcodeW = pageW - margin * 2;
      const barcodeH = 40;
      const barcodeX = margin;
      doc.addImage(barcodeDataUrl, "PNG", barcodeX, y, barcodeW, barcodeH);
      y += barcodeH + 6;
    } catch {
      // If barcode generation fails, just show the text
      y += 10;
    }

    // Tracking number text
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.text(label.trackingNumber, pageW / 2, y, { align: "center" });
    y += lineH;

    // Created date
    doc.setFontSize(7);
    doc.setFont("Helvetica", "normal");
    doc.text(`Created: ${label.createdDate}`, pageW / 2, y, { align: "center" });
  }

  // Open print dialog
  doc.autoPrint();
  if (typeof window === "undefined") return;
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.addEventListener("afterprint", () => {
      URL.revokeObjectURL(url);
    });
  }
}

/** Generate a tracking number in format VR-YYYYMMDD-XXXX */
export function generateTrackingNumber(sequence: number = 1): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(sequence).padStart(4, "0");
  return `VR-${y}${m}${d}-${seq}`;
}
