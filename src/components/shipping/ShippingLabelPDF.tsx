"use client";

import type {
  ShippingLabelData,
  ShippingLabelSender,
} from "./ShippingLabelPreview";

// Re-export types for convenience
export type { ShippingLabelData, ShippingLabelSender, ShippingLabelReceiver, ShippingLabelItem } from "./ShippingLabelPreview";

/**
 * Render a single label as an off-screen HTML element,
 * capture with html2canvas, and return a canvas.
 */
async function renderLabelToCanvas(
  shipment: ShippingLabelData,
  sender: ShippingLabelSender,
): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;
  const JsBarcode = (await import("jsbarcode")).default;

  // Create hidden container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.zIndex = "-1";
  document.body.appendChild(container);

  const r = shipment.receiver;
  const createdDate = new Date(shipment.createdAt).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const seq = `#${String(shipment.id).padStart(4, "0")}`;
  const itemsText = shipment.items
    .map((item) => (item.variant ? `${item.name} (${item.variant})` : item.name))
    .join(", ");

  // Label size at 2x resolution for crisp print (200mm x 300mm at 2x → 756px x 1134px)
  const W = 756;
  const H = 1134;
  const pad = 38; // ~5mm at 2x

  const label = document.createElement("div");
  label.style.cssText = `
    width: ${W}px;
    height: ${H}px;
    background: #fff;
    color: #000;
    font-family: 'Noto Sans Thai', 'Helvetica Neue', Arial, sans-serif;
    font-size: 18px;
    line-height: 1.4;
    padding: ${pad}px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  // Generate barcode to canvas first
  const barcodeCanvas = document.createElement("canvas");
  try {
    JsBarcode(barcodeCanvas, shipment.trackingNumber, {
      format: "CODE128",
      width: 3,
      height: 80,
      displayValue: false,
      margin: 0,
    });
  } catch {
    // barcode generation failed
  }
  const barcodeDataUrl = barcodeCanvas.toDataURL("image/png");

  label.innerHTML = `
    <!-- Brand Header -->
    <div style="text-align:center;font-weight:700;font-size:24px;padding-bottom:8px;letter-spacing:1px;">
      VIRTUAL RUN
    </div>
    <!-- Divider -->
    <div style="border-top:3px solid #000;margin-bottom:10px;"></div>

    <!-- Sender -->
    <div style="margin-bottom:10px;">
      <div style="font-size:14px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">
        ผู้ส่ง (FROM)
      </div>
      <div style="font-weight:700;font-size:20px;">${sender.shopName}</div>
      <div style="font-size:16px;">${sender.address}</div>
      <div style="font-size:16px;">แขวง${sender.subDistrict} เขต${sender.district}</div>
      <div style="font-size:16px;">${sender.province} ${sender.zipCode}</div>
      <div style="font-size:16px;">โทร: ${sender.phone}</div>
    </div>

    <!-- Double Divider -->
    <div style="border-top:5px double #000;margin-bottom:14px;"></div>

    <!-- Receiver -->
    <div style="flex:1;margin-bottom:10px;">
      <div style="font-size:14px;color:#888;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">
        ผู้รับ (TO)
      </div>
      <div style="font-weight:700;font-size:28px;margin-bottom:4px;">${r.firstName} ${r.lastName}</div>
      <div style="font-size:20px;margin-bottom:2px;">${r.address}</div>
      <div style="font-size:20px;margin-bottom:2px;">แขวง${r.subDistrict} เขต${r.district}</div>
      <div style="font-weight:700;font-size:24px;margin-bottom:2px;">${r.province} ${r.zipCode}</div>
      <div style="font-size:20px;">โทร: ${r.phone}</div>
    </div>

    <!-- Divider -->
    <div style="border-top:2px solid #000;margin-bottom:10px;"></div>

    <!-- Event / Package / Items -->
    <div style="margin-bottom:10px;font-size:16px;">
      <div><span style="color:#666;">งาน: </span>${shipment.event.name}</div>
      <div><span style="color:#666;">แพ็กเกจ: </span>${shipment.package.name}</div>
      <div><span style="color:#666;">รายการ: </span>${itemsText}</div>
    </div>

    <!-- Divider -->
    <div style="border-top:2px solid #000;margin-bottom:10px;"></div>

    <!-- Barcode -->
    <div style="text-align:center;padding:4px 8px;margin-bottom:4px;">
      <img src="${barcodeDataUrl}" style="width:${W - pad * 2 - 40}px;height:60px;" />
      <div style="font-size:20px;font-weight:600;letter-spacing:2px;margin-top:4px;">
        ${shipment.trackingNumber}
      </div>
    </div>

    <!-- Footer -->
    <div style="display:flex;justify-content:space-between;font-size:14px;color:#666;">
      <span>วันที่: ${createdDate}</span>
      <span>${seq}</span>
    </div>
  `;

  container.appendChild(label);

  // Wait for fonts to load
  await document.fonts.ready;
  // Small delay to ensure rendering
  await new Promise((resolve) => setTimeout(resolve, 100));

  const canvas = await html2canvas(label, {
    scale: 1,
    useCORS: true,
    backgroundColor: "#ffffff",
    width: W,
    height: H,
    logging: false,
  });

  // Cleanup
  document.body.removeChild(container);

  return canvas;
}

/**
 * Generate a shipping label PDF for one or more shipments.
 * Each shipment gets its own page (100mm x 150mm).
 * Opens a new window with print dialog.
 */
export async function generateShippingLabelPDF(
  shipments: ShippingLabelData[],
  sender: ShippingLabelSender,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  // 100mm x 150mm
  const pageW = 100;
  const pageH = 150;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [pageW, pageH],
  });

  for (let i = 0; i < shipments.length; i++) {
    if (i > 0) doc.addPage([pageW, pageH]);

    const canvas = await renderLabelToCanvas(shipments[i], sender);

    // Add canvas as image filling the entire page
    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", 0, 0, pageW, pageH);
  }

  // Open print dialog
  doc.autoPrint();
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.addEventListener("afterprint", () => {
      URL.revokeObjectURL(url);
    });
  }
}

/**
 * Generate a PDF for a single shipment label.
 */
export async function generateSingleLabelPDF(
  shipment: ShippingLabelData,
  sender: ShippingLabelSender,
): Promise<void> {
  return generateShippingLabelPDF([shipment], sender);
}
