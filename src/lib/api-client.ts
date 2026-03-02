import type {
  Event,
  Registration,
  RunningProof,
  RunningResult,
  User,
  PaginatedResponse,
  PaymentQR,
  Province,
  District,
  SubDistrict,
} from "@/types/api";
import {
  mockEvents,
  mockRegistrations,
  mockRunningProofs,
  mockPaymentQR,
  mockUsers,
  mockProvinces,
  mockDistricts,
  mockSubDistricts,
} from "@/lib/mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// Simulate network delay
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// ─── In-memory mutable state (persists during session) ───

let _registrations = [...mockRegistrations];
let _proofs = [...mockRunningProofs];
let _profile = { ...mockUsers.user };
let _nextRegId = 100;
let _nextProofId = 100;
let _nextResultId = 100;

export function resetMockState() {
  _registrations = [...mockRegistrations];
  _proofs = [...mockRunningProofs];
  _profile = { ...mockUsers.user };
}

// ─── Events ───

export async function fetchEvents(
  params?: Record<string, string | number>,
): Promise<PaginatedResponse<Event>> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    const query = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return (await api.get(`/events${query}`)).data;
  }
  await delay();
  let filtered = [...mockEvents];
  const status = params?.status as string | undefined;
  const search = params?.search as string | undefined;
  if (status && status !== "all") filtered = filtered.filter((e) => e.status === status);
  if (search) filtered = filtered.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));
  const page = Number(params?.page ?? 1);
  const limit = Number(params?.limit ?? 12);
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    meta: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) },
  };
}

export async function fetchEvent(id: number | string): Promise<Event | null> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get(`/events/${id}`)).data;
  }
  await delay(300);
  return mockEvents.find((e) => e.id === Number(id)) ?? null;
}

// ─── Registrations ───

export async function fetchMyRegistrations(): Promise<Registration[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/registrations/my")).data;
  }
  await delay();
  return _registrations;
}

export async function fetchRegistration(id: number | string): Promise<Registration | null> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get(`/registrations/${id}`)).data;
  }
  await delay(300);
  return _registrations.find((r) => r.id === Number(id)) ?? null;
}

export async function createRegistration(data: {
  packageId: number;
  addressDetail?: string;
  subDistrictId?: number;
  itemVariants?: { itemId: number; itemVariantId?: number }[];
}): Promise<Registration> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/registrations", data)).data;
  }
  await delay(800);
  // Find the package from events
  let foundPkg = null;
  let foundEvent = null;
  for (const ev of mockEvents) {
    const pkg = ev.packages?.find((p) => p.id === data.packageId);
    if (pkg) { foundPkg = pkg; foundEvent = ev; break; }
  }
  const newReg: Registration = {
    id: _nextRegId++,
    userId: 1,
    packageId: data.packageId,
    status: "active",
    paymentStatus: "pending",
    priceSnapshot: foundPkg?.price ?? 0,
    targetDistanceSnapshot: foundPkg?.targetDistance ?? 0,
    addressDetail: data.addressDetail,
    subDistrictId: data.subDistrictId,
    createdAt: new Date().toISOString(),
    packages: foundPkg ? { ...foundPkg, events: foundEvent ? { id: foundEvent.id, title: foundEvent.title, status: foundEvent.status } as Event : undefined } : undefined,
    shipments: [],
    registrationItemVariants: [],
    runningResults: [],
  };
  _registrations = [newReg, ..._registrations];
  return newReg;
}

// ─── Payments ───

export async function fetchPaymentQR(registrationId: number): Promise<PaymentQR> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get(`/payments/qr/${registrationId}`)).data;
  }
  await delay(300);
  const reg = _registrations.find((r) => r.id === registrationId);
  return { ...mockPaymentQR, amount: reg?.priceSnapshot ?? 500 };
}

export async function submitSlip(registrationId: number, slipUrl: string): Promise<Registration> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post(`/payments/${registrationId}/submit-slip`, { slipUrl })).data;
  }
  await delay(800);
  _registrations = _registrations.map((r) =>
    r.id === registrationId ? { ...r, paymentStatus: "submitted" as const, slipUrl } : r,
  );
  return _registrations.find((r) => r.id === registrationId)!;
}

// ─── Shipments ───

export async function confirmDelivery(shipmentId: number): Promise<void> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    await api.patch(`/shipments/${shipmentId}/confirm-delivery`);
    return;
  }
  await delay(800);
  _registrations = _registrations.map((r) => ({
    ...r,
    shipments: r.shipments?.map((s) =>
      s.id === shipmentId ? { ...s, status: "delivered" as const, updatedAt: new Date().toISOString() } : s,
    ),
  }));
}

// ─── Running Proofs ───

export async function fetchMyRunningProofs(): Promise<RunningProof[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/running-proofs/my")).data;
  }
  await delay();
  return _proofs;
}

export async function fetchRunningProof(id: number | string): Promise<RunningProof | null> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get(`/running-proofs/${id}`)).data;
  }
  await delay(300);
  return _proofs.find((p) => p.id === Number(id)) ?? null;
}

export async function createRunningProof(data: {
  imageUrl: string;
  distance?: number;
  duration?: string;
  note?: string;
}): Promise<RunningProof> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/running-proofs", data)).data;
  }
  await delay(800);
  const newProof: RunningProof = {
    id: _nextProofId++,
    userId: 1,
    imageUrl: data.imageUrl || "https://placehold.co/600x800/f2cc0f/212121?text=New+Proof",
    distance: data.distance,
    duration: data.duration,
    note: data.note,
    createdAt: new Date().toISOString(),
    runningResults: [],
  };
  _proofs = [newProof, ..._proofs];
  return newProof;
}

export async function createRunningResult(data: {
  registrationId: number;
  runningProofId: number;
}): Promise<RunningResult> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.post("/running-results", data)).data;
  }
  await delay(500);
  const newResult: RunningResult = {
    id: _nextResultId++,
    registrationId: data.registrationId,
    runningProofId: data.runningProofId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  // Add to proof
  _proofs = _proofs.map((p) =>
    p.id === data.runningProofId
      ? { ...p, runningResults: [...(p.runningResults ?? []), newResult] }
      : p,
  );
  // Add to registration
  _registrations = _registrations.map((r) =>
    r.id === data.registrationId
      ? { ...r, runningResults: [...(r.runningResults ?? []), newResult] }
      : r,
  );
  return newResult;
}

// ─── Running Results (my) ───

export async function fetchMyRunningResults(): Promise<RunningResult[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/running-results/my")).data;
  }
  await delay();
  return _proofs.flatMap((p) => p.runningResults ?? []);
}

// ─── Profile ───

export async function fetchProfile(): Promise<User> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/users/me")).data;
  }
  await delay(300);
  return _profile;
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch("/users/me", data)).data;
  }
  await delay(600);
  _profile = { ..._profile, ...data };
  return _profile;
}

// ─── Geography ───

export async function fetchProvinces(): Promise<Province[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/geographies/provinces")).data;
  }
  await delay(200);
  return mockProvinces;
}

export async function fetchDistricts(provinceId: number): Promise<District[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get(`/geographies/districts?provinceId=${provinceId}`)).data;
  }
  await delay(200);
  return mockDistricts.filter((d) => d.provinceId === provinceId);
}

export async function fetchSubDistricts(districtId: number): Promise<SubDistrict[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get(`/geographies/sub-districts?districtId=${districtId}`)).data;
  }
  await delay(200);
  return mockSubDistricts.filter((s) => s.districtId === districtId);
}
