import type {
  Event,
  Package,
  PackageItem,
  Item,
  ItemVariant,
  Registration,
  RunningResult,
  Shipment,
  ShipmentStaff,
  OrganizerApplication,
  EventStaff,
  Payout,
  StockIn,
  StockSummary,
  PaginatedResponse,
} from "@/types/api";
import {
  mockOrganizerApplications,
  mockOrganizerEvents,
  mockItems,
  mockOrganizerRegistrations,
  mockOrganizerRunningResults,
  mockOrganizerShipments,
  mockEventStaff,
  mockPayouts,
  mockStockSummaries,
  mockStockIns,
  mockSearchableUsers,
} from "@/lib/organizer-mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// ─── In-memory mutable state (persists during session) ───

let _applications = [...mockOrganizerApplications];
let _events = [...mockOrganizerEvents];
let _items = [...mockItems];
let _registrations = [...mockOrganizerRegistrations];
let _runningResults = [...mockOrganizerRunningResults];
let _shipments = [...mockOrganizerShipments];
let _eventStaff = [...mockEventStaff];
let _payouts = [...mockPayouts];
let _stockSummaries = [...mockStockSummaries];
let _stockIns = [...mockStockIns];

let _nextAppId = 100;
let _nextEventId = 100;
let _nextPackageId = 100;
let _nextItemId = 100;
let _nextVariantId = 100;
let _nextPackageItemId = 100;
let _nextRegId = 200;
let _nextResultId = 200;
let _nextShipmentId = 100;
let _nextShipmentStaffId = 100;
let _nextStockInId = 100;

export function resetOrganizerMockState() {
  _applications = [...mockOrganizerApplications];
  _events = [...mockOrganizerEvents];
  _items = [...mockItems];
  _registrations = [...mockOrganizerRegistrations];
  _runningResults = [...mockOrganizerRunningResults];
  _shipments = [...mockOrganizerShipments];
  _eventStaff = [...mockEventStaff];
  _payouts = [...mockPayouts];
  _stockSummaries = [...mockStockSummaries];
  _stockIns = [...mockStockIns];
}

// ═══════════════════════════════════════════════════════════════════
// Organizer Applications
// ═══════════════════════════════════════════════════════════════════

export async function fetchMyApplications(): Promise<OrganizerApplication[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/organizer-applications/my")).data;
  }
  await delay();
  return _applications;
}

export async function createApplication(data: {
  documentProofUrl?: string;
  contactInfo?: string;
}): Promise<OrganizerApplication> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/organizer-applications", data)).data;
  }
  await delay(800);
  const newApp: OrganizerApplication = {
    id: _nextAppId++,
    userId: 2,
    documentProofUrl: data.documentProofUrl,
    contactInfo: data.contactInfo,
    status: "pending",
    createdAt: new Date().toISOString(),
    users: { id: 2, username: "organizer_run", email: "organizer@example.com" },
  };
  _applications = [newApp, ..._applications];
  return newApp;
}

// ═══════════════════════════════════════════════════════════════════
// Events (Organizer)
// ═══════════════════════════════════════════════════════════════════

export async function fetchMyEvents(): Promise<Event[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/events/my/events")).data;
  }
  await delay();
  return _events;
}

export async function createEvent(data: {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Event> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/events", data)).data;
  }
  await delay(800);
  const newEvent: Event = {
    id: _nextEventId++,
    title: data.title,
    description: data.description,
    startDate: data.startDate,
    endDate: data.endDate,
    status: "draft",
    organizerId: 2,
    organizer: { id: 2, username: "organizer_run" },
    _count: { registrations: 0 },
    packages: [],
    createdAt: new Date().toISOString(),
  };
  _events = [newEvent, ..._events];
  return newEvent;
}

export async function updateEvent(id: number, data: Partial<Event>): Promise<Event> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch(`/events/${id}`, data)).data;
  }
  await delay(600);
  _events = _events.map((e) => (e.id === id ? { ...e, ...data } : e));
  return _events.find((e) => e.id === id)!;
}

export async function deleteEvent(id: number): Promise<void> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    await api.delete(`/events/${id}`);
    return;
  }
  await delay(600);
  _events = _events.filter((e) => e.id !== id);
}

export async function submitEventForReview(id: number): Promise<Event> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch(`/events/${id}/submit`)).data;
  }
  await delay(800);
  _events = _events.map((e) =>
    e.id === id ? { ...e, status: "pending_approval" as const } : e,
  );
  return _events.find((e) => e.id === id)!;
}

// ═══════════════════════════════════════════════════════════════════
// Packages
// ═══════════════════════════════════════════════════════════════════

export async function fetchPackagesByEvent(eventId: number): Promise<Package[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get(`/packages/event/${eventId}`)).data;
  }
  await delay();
  const event = _events.find((e) => e.id === eventId);
  return event?.packages ?? [];
}

export async function createPackage(data: {
  eventId: number;
  name?: string;
  price?: number;
  targetDistance?: number;
}): Promise<Package> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/packages", data)).data;
  }
  await delay(800);
  const newPkg: Package = {
    id: _nextPackageId++,
    eventId: data.eventId,
    name: data.name ?? "New Package",
    price: data.price ?? 0,
    targetDistance: data.targetDistance,
    packageItems: [],
  };
  _events = _events.map((e) =>
    e.id === data.eventId
      ? { ...e, packages: [...(e.packages ?? []), newPkg] }
      : e,
  );
  return newPkg;
}

export async function updatePackage(id: number, data: Partial<Package>): Promise<Package> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch(`/packages/${id}`, data)).data;
  }
  await delay(600);
  let updated: Package | undefined;
  _events = _events.map((e) => ({
    ...e,
    packages: e.packages?.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...data };
        return updated;
      }
      return p;
    }),
  }));
  return updated!;
}

export async function deletePackage(id: number): Promise<void> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    await api.delete(`/packages/${id}`);
    return;
  }
  await delay(600);
  _events = _events.map((e) => ({
    ...e,
    packages: e.packages?.filter((p) => p.id !== id),
  }));
}

// ═══════════════════════════════════════════════════════════════════
// Items
// ═══════════════════════════════════════════════════════════════════

export async function fetchItemsByEvent(eventId: number): Promise<Item[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get(`/items/event/${eventId}`)).data;
  }
  await delay();
  // In mock mode, return all items (they'd be filtered by event on the backend)
  return _items;
}

export async function createItem(data: {
  eventId: number;
  name?: string;
  type?: string;
  variants?: { name?: string }[];
}): Promise<Item> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/items", data)).data;
  }
  await delay(800);
  const newItemId = _nextItemId++;
  const variants: ItemVariant[] = (data.variants ?? []).map((v, i) => ({
    id: _nextVariantId++,
    itemId: newItemId,
    variantName: v.name ?? `Variant ${i + 1}`,
    variantValue: v.name ?? `Variant ${i + 1}`,
  }));
  const newItem: Item = {
    id: newItemId,
    name: data.name ?? "New Item",
    category: data.type,
    itemVariants: variants.length > 0 ? variants : undefined,
  };
  _items = [..._items, newItem];
  return newItem;
}

export async function updateItem(
  id: number,
  data: { name?: string; type?: string },
): Promise<Item> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch(`/items/${id}`, data)).data;
  }
  await delay(600);
  _items = _items.map((item) =>
    item.id === id
      ? { ...item, name: data.name ?? item.name, category: data.type ?? item.category }
      : item,
  );
  return _items.find((item) => item.id === id)!;
}

export async function deleteItem(id: number): Promise<void> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    await api.delete(`/items/${id}`);
    return;
  }
  await delay(600);
  _items = _items.filter((item) => item.id !== id);
}

export async function addItemVariant(
  itemId: number,
  data: { name?: string },
): Promise<ItemVariant> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post(`/items/${itemId}/variants`, data)).data;
  }
  await delay(600);
  const newVariant: ItemVariant = {
    id: _nextVariantId++,
    itemId,
    variantName: data.name ?? "New Variant",
    variantValue: data.name ?? "New Variant",
  };
  _items = _items.map((item) =>
    item.id === itemId
      ? { ...item, itemVariants: [...(item.itemVariants ?? []), newVariant] }
      : item,
  );
  return newVariant;
}

export async function deleteItemVariant(variantId: number): Promise<void> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    await api.delete(`/items/variants/${variantId}`);
    return;
  }
  await delay(600);
  _items = _items.map((item) => ({
    ...item,
    itemVariants: item.itemVariants?.filter((v) => v.id !== variantId),
  }));
}

// ═══════════════════════════════════════════════════════════════════
// Package Items
// ═══════════════════════════════════════════════════════════════════

export async function addPackageItem(data: {
  packageId: number;
  itemId: number;
  quantity: number;
}): Promise<PackageItem> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/package-items", data)).data;
  }
  await delay(600);
  const item = _items.find((i) => i.id === data.itemId);
  const newPkgItem: PackageItem = {
    id: _nextPackageItemId++,
    packageId: data.packageId,
    itemId: data.itemId,
    quantity: data.quantity,
    items: item,
  };
  _events = _events.map((e) => ({
    ...e,
    packages: e.packages?.map((p) =>
      p.id === data.packageId
        ? { ...p, packageItems: [...(p.packageItems ?? []), newPkgItem] }
        : p,
    ),
  }));
  return newPkgItem;
}

export async function removePackageItem(id: number): Promise<void> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    await api.delete(`/package-items/${id}`);
    return;
  }
  await delay(600);
  _events = _events.map((e) => ({
    ...e,
    packages: e.packages?.map((p) => ({
      ...p,
      packageItems: p.packageItems?.filter((pi) => pi.id !== id),
    })),
  }));
}

// ═══════════════════════════════════════════════════════════════════
// Stock
// ═══════════════════════════════════════════════════════════════════

export async function fetchStockSummary(
  itemId: number,
  itemVariantId?: number,
): Promise<StockSummary> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    const query = itemVariantId ? `?itemVariantId=${itemVariantId}` : "";
    return (await api.get(`/stock/summary/${itemId}${query}`)).data;
  }
  await delay(300);
  const found = _stockSummaries.find(
    (s) => s.itemId === itemId && s.itemVariantId === (itemVariantId ?? undefined),
  );
  return found ?? { itemId, itemVariantId, totalIn: 0, totalOut: 0, balance: 0 };
}

export async function createStockIn(data: {
  itemId: number;
  itemVariantId?: number;
  quantity: number;
  note?: string;
}): Promise<StockIn> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/stock/in", data)).data;
  }
  await delay(800);
  const item = _items.find((i) => i.id === data.itemId);
  const variant = data.itemVariantId
    ? item?.itemVariants?.find((v) => v.id === data.itemVariantId)
    : undefined;
  const newStockIn: StockIn = {
    id: _nextStockInId++,
    itemId: data.itemId,
    itemVariantId: data.itemVariantId,
    quantity: data.quantity,
    note: data.note,
    createdAt: new Date().toISOString(),
    items: item,
    itemVariants: variant,
  };
  _stockIns = [newStockIn, ..._stockIns];
  // Update summary
  const idx = _stockSummaries.findIndex(
    (s) => s.itemId === data.itemId && s.itemVariantId === (data.itemVariantId ?? undefined),
  );
  if (idx >= 0) {
    _stockSummaries[idx] = {
      ..._stockSummaries[idx],
      totalIn: _stockSummaries[idx].totalIn + data.quantity,
      balance: _stockSummaries[idx].balance + data.quantity,
    };
  } else {
    _stockSummaries.push({
      itemId: data.itemId,
      itemVariantId: data.itemVariantId,
      totalIn: data.quantity,
      totalOut: 0,
      balance: data.quantity,
    });
  }
  return newStockIn;
}

// ═══════════════════════════════════════════════════════════════════
// Registrations (Organizer view)
// ═══════════════════════════════════════════════════════════════════

export async function fetchRegistrationsPaginated(params: {
  page?: number;
  limit?: number;
  eventId?: number;
  paymentStatus?: string;
}): Promise<PaginatedResponse<Registration>> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return (await api.get(`/registrations${query ? `?${query}` : ""}`)).data;
  }
  await delay();
  let filtered = [..._registrations];
  if (params.eventId) {
    filtered = filtered.filter((r) => r.packages?.eventId === params.eventId);
  }
  if (params.paymentStatus && params.paymentStatus !== "all") {
    filtered = filtered.filter((r) => r.paymentStatus === params.paymentStatus);
  }
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    meta: {
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function updateRegistrationPayment(
  id: number,
  data: { paymentStatus: string },
): Promise<Registration> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch(`/registrations/${id}`, data)).data;
  }
  await delay(600);
  _registrations = _registrations.map((r) =>
    r.id === id
      ? { ...r, paymentStatus: data.paymentStatus as Registration["paymentStatus"] }
      : r,
  );
  return _registrations.find((r) => r.id === id)!;
}

// ═══════════════════════════════════════════════════════════════════
// Running Results (Organizer view)
// ═══════════════════════════════════════════════════════════════════

export async function fetchRunningResultsPaginated(params: {
  page?: number;
  limit?: number;
  eventId?: number;
  status?: string;
}): Promise<PaginatedResponse<RunningResult>> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return (await api.get(`/running-results${query ? `?${query}` : ""}`)).data;
  }
  await delay();
  let filtered = [..._runningResults];
  if (params.eventId) {
    filtered = filtered.filter(
      (r) => r.registrations?.packages?.eventId === params.eventId,
    );
  }
  if (params.status && params.status !== "all") {
    filtered = filtered.filter((r) => r.status === params.status);
  }
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    meta: {
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function reviewRunningResult(
  id: number,
  staffId: number,
  data: { status: "approved" | "rejected"; reviewNote?: string },
): Promise<RunningResult> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch(`/running-results/${id}/review?staffId=${staffId}`, data)).data;
  }
  await delay(800);
  _runningResults = _runningResults.map((r) =>
    r.id === id
      ? {
          ...r,
          status: data.status,
          reviewNote: data.reviewNote,
          reviewedAt: new Date().toISOString(),
        }
      : r,
  );
  return _runningResults.find((r) => r.id === id)!;
}

// ═══════════════════════════════════════════════════════════════════
// Shipments
// ═══════════════════════════════════════════════════════════════════

export async function fetchShipmentsPaginated(params: {
  page?: number;
  limit?: number;
  eventId?: number;
  status?: string;
}): Promise<PaginatedResponse<Shipment>> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return (await api.get(`/shipments${query ? `?${query}` : ""}`)).data;
  }
  await delay();
  let filtered = [..._shipments];
  if (params.status && params.status !== "all") {
    filtered = filtered.filter((s) => s.status === params.status);
  }
  // eventId filtering would need registration->package->eventId lookup
  // For simplicity in mock, we return all
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    meta: {
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function createShipment(data: {
  registrationId: number;
}): Promise<Shipment> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/shipments", data)).data;
  }
  await delay(800);
  const newShipment: Shipment = {
    id: _nextShipmentId++,
    registrationId: data.registrationId,
    status: "pending",
    createdAt: new Date().toISOString(),
    shipmentItems: [],
    shipmentStaff: [],
  };
  _shipments = [newShipment, ..._shipments];
  return newShipment;
}

export async function createBatchShipments(
  registrationIds: number[],
): Promise<Shipment[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/shipments/batch", { registrationIds })).data;
  }
  await delay(1200);
  const newShipments: Shipment[] = registrationIds.map((regId) => ({
    id: _nextShipmentId++,
    registrationId: regId,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    shipmentItems: [],
    shipmentStaff: [],
  }));
  _shipments = [...newShipments, ..._shipments];
  return newShipments;
}

export async function updateShipmentStatus(
  id: number,
  status: string,
): Promise<Shipment> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch(`/shipments/${id}`, { status })).data;
  }
  await delay(600);
  _shipments = _shipments.map((s) =>
    s.id === id
      ? {
          ...s,
          status: status as Shipment["status"],
          updatedAt: new Date().toISOString(),
          ...(status === "preparing" ? { preparedAt: new Date().toISOString() } : {}),
        }
      : s,
  );
  return _shipments.find((s) => s.id === id)!;
}

export async function assignShipmentStaff(data: {
  shipmentId: number;
  eventStaffId: number;
  trackingNumber?: string;
}): Promise<ShipmentStaff> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/shipments/staff", data)).data;
  }
  await delay(600);
  const newStaff: ShipmentStaff = {
    id: _nextShipmentStaffId++,
    shipmentId: data.shipmentId,
    eventStaffId: data.eventStaffId,
    trackingNumber: data.trackingNumber,
  };
  _shipments = _shipments.map((s) =>
    s.id === data.shipmentId
      ? { ...s, shipmentStaff: [...(s.shipmentStaff ?? []), newStaff] }
      : s,
  );
  return newStaff;
}

export async function updateShipmentStaff(
  id: number,
  data: { trackingNumber?: string; shipped?: boolean; confirmed?: boolean },
): Promise<ShipmentStaff> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch(`/shipments/staff/${id}`, data)).data;
  }
  await delay(600);
  let updatedStaff: ShipmentStaff | undefined;
  _shipments = _shipments.map((s) => ({
    ...s,
    shipmentStaff: s.shipmentStaff?.map((ss) => {
      if (ss.id === id) {
        updatedStaff = {
          ...ss,
          ...(data.trackingNumber !== undefined ? { trackingNumber: data.trackingNumber } : {}),
          ...(data.shipped ? { shippedAt: new Date().toISOString() } : {}),
          ...(data.confirmed ? { confirmedAt: new Date().toISOString() } : {}),
        };
        return updatedStaff;
      }
      return ss;
    }),
  }));
  return updatedStaff!;
}

// ═══════════════════════════════════════════════════════════════════
// Event Staff
// ═══════════════════════════════════════════════════════════════════

export async function fetchEventStaff(eventId: number): Promise<EventStaff[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get(`/shipments/${eventId}/staff`)).data;
  }
  await delay();
  return _eventStaff.filter((s) => s.eventId === eventId);
}

// ═══════════════════════════════════════════════════════════════════
// Payouts
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// Image Uploads (Mock: store data-URL / Real: POST to /files/upload/*)
// ═══════════════════════════════════════════════════════════════════

export async function uploadEventCover(
  eventId: number,
  imageDataUrl: string,
): Promise<string> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    const blob = dataUrlToBlob(imageDataUrl);
    const form = new FormData();
    form.append("file", blob, "cover.jpg");
    form.append("eventId", String(eventId));
    const res = await api.post("/files/upload/events/cover", form, {
      headers: { "Content-Type": undefined },
    });
    return res.data.path;
  }
  await delay(600);
  // mock: persist on in-memory event
  _events = _events.map((e) =>
    e.id === eventId ? { ...e, coverImage: imageDataUrl } : e,
  );
  return imageDataUrl;
}

export async function uploadEventDetails(
  eventId: number,
  imageDataUrls: string[],
): Promise<string[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    const form = new FormData();
    form.append("eventId", String(eventId));
    imageDataUrls.forEach((url) => {
      form.append("files", dataUrlToBlob(url), `detail-${Date.now()}.jpg`);
    });
    const res = await api.post("/files/upload/events/details", form, {
      headers: { "Content-Type": undefined },
    });
    return res.data.paths;
  }
  await delay(800);
  _events = _events.map((e) =>
    e.id === eventId
      ? { ...e, detailImages: imageDataUrls }
      : e,
  );
  return imageDataUrls;
}

export async function uploadPackageImage(
  packageId: number,
  imageDataUrl: string,
): Promise<string> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    const blob = dataUrlToBlob(imageDataUrl);
    const form = new FormData();
    form.append("file", blob, "package.jpg");
    form.append("packageId", String(packageId));
    const res = await api.post("/files/upload/packages", form, {
      headers: { "Content-Type": undefined },
    });
    return res.data.path;
  }
  await delay(600);
  // mock: persist on in-memory packages
  _events = _events.map((e) => ({
    ...e,
    packages: e.packages?.map((p) =>
      p.id === packageId ? { ...p, image: imageDataUrl } : p,
    ),
  }));
  return imageDataUrl;
}

export async function uploadItemImage(
  itemId: number,
  imageDataUrl: string,
): Promise<string> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    const blob = dataUrlToBlob(imageDataUrl);
    const form = new FormData();
    form.append("file", blob, "item.jpg");
    form.append("itemId", String(itemId));
    const res = await api.post("/files/upload/items", form, {
      headers: { "Content-Type": undefined },
    });
    return res.data.path;
  }
  await delay(600);
  _items = _items.map((item) =>
    item.id === itemId ? { ...item, image: imageDataUrl } : item,
  );
  return imageDataUrl;
}

/** Convert a data-URL string to a Blob for FormData */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header?.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64 ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ═══════════════════════════════════════════════════════════════════
// Payouts
// ═══════════════════════════════════════════════════════════════════

export async function fetchMyPayouts(): Promise<Payout[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/payouts/my")).data;
  }
  await delay();
  return _payouts;
}

// ═══════════════════════════════════════════════════════════════════
// Staff Management & User Search
// ═══════════════════════════════════════════════════════════════════

export async function addEventStaff(data: {
  eventId: number;
  userId: number;
}): Promise<EventStaff> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/event-staff", data)).data;
  }
  await delay(600);
  const user = mockSearchableUsers.find((u) => u.id === data.userId);
  const newStaff: EventStaff = {
    id: Date.now(),
    eventId: data.eventId,
    userId: data.userId,
    assignedAt: new Date().toISOString(),
    users: user ? { id: user.id, username: user.username, email: user.email } : { id: data.userId, username: `User #${data.userId}` },
  };
  _eventStaff = [..._eventStaff, newStaff];
  return newStaff;
}

export async function removeEventStaff(staffId: number): Promise<void> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    await api.delete(`/event-staff/${staffId}`);
    return;
  }
  await delay(600);
  _eventStaff = _eventStaff.filter((s) => s.id !== staffId);
}

export async function searchUsers(query: string): Promise<{ id: number; username: string; email?: string }[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get(`/users?search=${encodeURIComponent(query)}&limit=10`)).data?.data ?? [];
  }
  await delay(300);
  const q = query.toLowerCase();
  return mockSearchableUsers.filter(
    (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  );
}
