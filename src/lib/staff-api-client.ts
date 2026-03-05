import type { Event, EventStaff, Registration, RunningResult, Shipment, PaginatedResponse } from "@/types/api";
import { mockEvents } from "@/lib/mock-data";
import {
  mockEventStaff,
  mockOrganizerRegistrations,
  mockOrganizerRunningResults,
  mockOrganizerShipments,
} from "@/lib/organizer-mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Get current user id from localStorage
function getCurrentUserId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("vr_mock_user");
    if (stored) {
      const u = JSON.parse(stored);
      return u.id ?? null;
    }
  } catch { /* ignore */ }
  return null;
}

// ─── Staff Events (events where user is staff) ───

export async function fetchStaffEvents(): Promise<Event[]> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/events/staff")).data;
  }
  await delay(400);
  const userId = getCurrentUserId();
  if (!userId) return [];

  // Find events where user is staff
  const staffAssignments = mockEventStaff.filter((s) => s.userId === userId);
  const eventIds = staffAssignments.map((s) => s.eventId);
  return mockEvents.filter((e) => eventIds.includes(e.id));
}

// ─── Check if user is staff of any event ───

export async function checkIsStaff(): Promise<boolean> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    const res = await api.get("/events/staff");
    return (res.data as Event[]).length > 0;
  }
  await delay(100);
  const userId = getCurrentUserId();
  if (!userId) return false;
  return mockEventStaff.some((s) => s.userId === userId);
}

// ─── Staff Registrations for an event ───

export async function fetchStaffRegistrations(params: {
  eventId?: number;
  page?: number;
  limit?: number;
  paymentStatus?: string;
}): Promise<PaginatedResponse<Registration>> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/registrations", { params })).data;
  }
  await delay(300);
  let filtered = [...mockOrganizerRegistrations];
  if (params.eventId) {
    filtered = filtered.filter((r) => r.packages?.events?.id === params.eventId);
  }
  if (params.paymentStatus) {
    filtered = filtered.filter((r) => r.paymentStatus === params.paymentStatus);
  }
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);
  return {
    data,
    meta: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) },
  };
}

// ─── Staff Running Results for an event ───

export async function fetchStaffRunningResults(params: {
  eventId?: number;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<RunningResult>> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/running-results", { params })).data;
  }
  await delay(300);
  let filtered = [...mockOrganizerRunningResults];
  if (params.eventId) {
    filtered = filtered.filter((r) => r.registrations?.packages?.events?.id === params.eventId);
  }
  if (params.status) {
    filtered = filtered.filter((r) => r.status === params.status);
  }
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);
  return {
    data,
    meta: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) },
  };
}

// ─── Staff can review running results ───

export async function staffReviewRunningResult(id: number, data: {
  status: "approved" | "rejected";
  reviewNote?: string;
}): Promise<RunningResult> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch(`/running-results/${id}/review`, data)).data;
  }
  await delay(500);
  const rr = mockOrganizerRunningResults.find((r) => r.id === id);
  if (rr) {
    rr.status = data.status;
    rr.reviewNote = data.reviewNote;
    rr.reviewedAt = new Date().toISOString();
  }
  return rr!;
}

// ─── Staff Shipments (only assigned to this staff) ───

export async function fetchStaffShipments(params: {
  eventId?: number;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<Shipment>> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.get("/shipments/my-staff", { params })).data;
  }
  await delay(300);
  const userId = getCurrentUserId();

  // Filter shipments where staff is assigned
  let filtered = mockOrganizerShipments.filter((s) =>
    s.shipmentStaff?.some((ss) => {
      const staffMatch = mockEventStaff.find((es) => es.id === ss.eventStaffId);
      return staffMatch?.userId === userId;
    })
  );
  if (params.eventId) {
    filtered = filtered.filter((s) =>
      s.registrations?.packages?.events?.id === params.eventId
    );
  }
  if (params.status) {
    filtered = filtered.filter((s) => s.status === params.status);
  }
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);
  return {
    data,
    meta: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) },
  };
}

// ─── Staff update shipment ───

export async function staffUpdateShipment(id: number, data: {
  status?: string;
  trackingNumber?: string;
}): Promise<Shipment> {
  if (!USE_MOCK) {
    const { default: api } = await import("@/lib/api");
    return (await api.patch(`/shipments/${id}`, data)).data;
  }
  await delay(500);
  const shipment = mockOrganizerShipments.find((s) => s.id === id);
  if (shipment && data.status) {
    shipment.status = data.status as Shipment["status"];
  }
  return shipment!;
}
