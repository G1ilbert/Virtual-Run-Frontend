import type {
  User,
  Event,
  Registration,
  OrganizerApplication,
  Payout,
  PaginatedResponse,
} from "@/types/api";
import {
  mockAdminUsers,
  mockAdminEvents,
  mockPendingSlips,
  mockAdminOrgApplications,
  mockAdminPayouts,
  mockDashboardStats,
  mockSystemSettings,
  mockAdminUser,
  type AdminDashboardStats,
  type SystemSettings,
} from "@/lib/admin-mock-data";
import axios, { type AxiosInstance } from "axios";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// ─── Admin axios instance (lazy, separate from Firebase-based api) ───

let _adminApi: AxiosInstance | null = null;

function getAdminApi(): AxiosInstance {
  if (!_adminApi) {
    _adminApi = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: { "Content-Type": "application/json" },
    });
    _adminApi.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("vr_admin_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  return _adminApi;
}

// ─── In-memory mutable state (persists during session) ───

let _users = [...mockAdminUsers];
let _events = [...mockAdminEvents];
let _slips = [...mockPendingSlips];
let _orgApplications = [...mockAdminOrgApplications];
let _payouts = [...mockAdminPayouts];
let _dashboardStats = { ...mockDashboardStats };
let _systemSettings = { ...mockSystemSettings };

export function resetAdminMockState() {
  _users = [...mockAdminUsers];
  _events = [...mockAdminEvents];
  _slips = [...mockPendingSlips];
  _orgApplications = [...mockAdminOrgApplications];
  _payouts = [...mockAdminPayouts];
  _dashboardStats = { ...mockDashboardStats };
  _systemSettings = { ...mockSystemSettings };
}

// ─── Pagination helper ───

function paginate<T>(items: T[], page = 1, limit = 10): PaginatedResponse<T> {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: {
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Admin Auth
// ═══════════════════════════════════════════════════════════════════

export async function adminLogin(
  username: string,
  password: string,
): Promise<{ accessToken: string; admin: { id: number; username: string } }> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    const res = await api.post("/auth/admin/login", { username, password });
    const { accessToken } = res.data;
    if (typeof window !== "undefined") {
      localStorage.setItem("vr_admin_token", accessToken);
    }
    return res.data;
  }
  await delay(800);
  if (username === "admin" && password === "admin123") {
    const token = "mock_admin_jwt_token_" + Date.now();
    if (typeof window !== "undefined") {
      localStorage.setItem("vr_admin_token", token);
    }
    return { accessToken: token, admin: { ...mockAdminUser } };
  }
  throw new Error("Invalid admin credentials");
}

export function adminLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("vr_admin_token");
  }
  _adminApi = null;
}

// ═══════════════════════════════════════════════════════════════════
// Dashboard Stats
// ═══════════════════════════════════════════════════════════════════

export async function fetchDashboardStats(): Promise<AdminDashboardStats> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.get("/admin/dashboard")).data;
  }
  await delay();
  return _dashboardStats;
}

// ═══════════════════════════════════════════════════════════════════
// Users (Admin)
// ═══════════════════════════════════════════════════════════════════

export async function fetchUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<PaginatedResponse<User>> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.get("/users", { params })).data;
  }
  await delay();
  let filtered = [..._users];
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    );
  }
  if (params?.role && params.role !== "all") {
    filtered = filtered.filter((u) => u.role === params.role);
  }
  return paginate(filtered, params?.page, params?.limit);
}

export async function fetchUser(id: number): Promise<User> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.get(`/users/${id}`)).data;
  }
  await delay(300);
  const user = _users.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateUser(
  id: number,
  data: Partial<User>,
): Promise<User> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.patch(`/users/${id}`, data)).data;
  }
  await delay(600);
  _users = _users.map((u) => (u.id === id ? { ...u, ...data } : u));
  const updated = _users.find((u) => u.id === id);
  if (!updated) throw new Error("User not found");
  return updated;
}

export async function deleteUser(id: number): Promise<void> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    await api.delete(`/users/${id}`);
    return;
  }
  await delay(600);
  _users = _users.filter((u) => u.id !== id);
}

// ═══════════════════════════════════════════════════════════════════
// Events (Admin)
// ═══════════════════════════════════════════════════════════════════

export async function fetchAdminEvents(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<Event>> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.get("/events", { params })).data;
  }
  await delay();
  let filtered = [..._events];
  if (params?.status && params.status !== "all") {
    filtered = filtered.filter((e) => e.status === params.status);
  }
  return paginate(filtered, params?.page, params?.limit);
}

export async function approveEvent(id: number): Promise<Event> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.patch(`/events/${id}/approve`)).data;
  }
  await delay(600);
  _events = _events.map((e) =>
    e.id === id ? { ...e, status: "approved" as const } : e,
  );
  const updated = _events.find((e) => e.id === id);
  if (!updated) throw new Error("Event not found");
  return updated;
}

export async function rejectEvent(id: number): Promise<Event> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.patch(`/events/${id}/reject`)).data;
  }
  await delay(600);
  _events = _events.map((e) =>
    e.id === id ? { ...e, status: "rejected" as const } : e,
  );
  const updated = _events.find((e) => e.id === id);
  if (!updated) throw new Error("Event not found");
  return updated;
}

// ═══════════════════════════════════════════════════════════════════
// Payments (Slip verification)
// ═══════════════════════════════════════════════════════════════════

export async function fetchPendingSlips(params?: {
  page?: number;
  limit?: number;
  paymentStatus?: string;
}): Promise<PaginatedResponse<Registration>> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.get("/registrations", { params })).data;
  }
  await delay();
  let filtered = [..._slips];
  if (params?.paymentStatus && params.paymentStatus !== "all") {
    filtered = filtered.filter(
      (r) => r.paymentStatus === params.paymentStatus,
    );
  }
  return paginate(filtered, params?.page, params?.limit);
}

export async function verifySlip(
  registrationId: number,
  data: { status: "confirmed" | "rejected" },
): Promise<Registration> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.patch(`/payments/${registrationId}/verify-slip`, data))
      .data;
  }
  await delay(600);
  _slips = _slips.map((r) =>
    r.id === registrationId
      ? { ...r, paymentStatus: data.status as Registration["paymentStatus"] }
      : r,
  );
  const updated = _slips.find((r) => r.id === registrationId);
  if (!updated) throw new Error("Registration not found");
  return updated;
}

// ═══════════════════════════════════════════════════════════════════
// Payouts
// ═══════════════════════════════════════════════════════════════════

export async function fetchPayouts(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<Payout>> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.get("/payouts", { params })).data;
  }
  await delay();
  let filtered = [..._payouts];
  if (params?.status && params.status !== "all") {
    filtered = filtered.filter((p) => p.status === params.status);
  }
  return paginate(filtered, params?.page, params?.limit);
}

export async function createPayout(data: {
  eventId: number;
  organizerId: number;
  totalAmount?: number;
}): Promise<Payout> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.post("/payouts", data)).data;
  }
  await delay(800);
  const totalAmount = data.totalAmount ?? 0;
  const commission = totalAmount * (_systemSettings.commissionRate / 100);
  const newPayout: Payout = {
    id: _payouts.length + 100,
    eventId: data.eventId,
    organizerId: data.organizerId,
    totalAmount,
    commission,
    netAmount: totalAmount - commission,
    status: "pending",
    createdAt: new Date().toISOString(),
    events: _events.find((e) => e.id === data.eventId)
      ? {
          id: data.eventId,
          title:
            _events.find((e) => e.id === data.eventId)?.title ?? "Unknown",
        }
      : undefined,
  };
  _payouts = [newPayout, ..._payouts];
  return newPayout;
}

export async function confirmPayout(
  id: number,
  data: { status: "confirmed" | "rejected" },
): Promise<Payout> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.patch(`/payouts/${id}/confirm`, data)).data;
  }
  await delay(600);
  _payouts = _payouts.map((p) =>
    p.id === id ? { ...p, status: data.status } : p,
  );
  const updated = _payouts.find((p) => p.id === id);
  if (!updated) throw new Error("Payout not found");
  return updated;
}

// ═══════════════════════════════════════════════════════════════════
// Organizer Applications
// ═══════════════════════════════════════════════════════════════════

export async function fetchOrganizerApplications(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<OrganizerApplication>> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.get("/organizer-applications", { params })).data;
  }
  await delay();
  let filtered = [..._orgApplications];
  if (params?.status && params.status !== "all") {
    filtered = filtered.filter((a) => a.status === params.status);
  }
  return paginate(filtered, params?.page, params?.limit);
}

export async function fetchOrganizerApplication(
  id: number,
): Promise<OrganizerApplication> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.get(`/organizer-applications/${id}`)).data;
  }
  await delay(300);
  const app = _orgApplications.find((a) => a.id === id);
  if (!app) throw new Error("Application not found");
  return app;
}

export async function reviewOrganizerApplication(
  id: number,
  data: { status: "approved" | "rejected" },
): Promise<OrganizerApplication> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.patch(`/organizer-applications/${id}/review`, data)).data;
  }
  await delay(600);
  _orgApplications = _orgApplications.map((a) =>
    a.id === id ? { ...a, status: data.status } : a,
  );
  const updated = _orgApplications.find((a) => a.id === id);
  if (!updated) throw new Error("Application not found");
  return updated;
}

// ═══════════════════════════════════════════════════════════════════
// System Settings
// ═══════════════════════════════════════════════════════════════════

export async function fetchSystemSettings(): Promise<SystemSettings> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.get("/system-settings")).data;
  }
  await delay(300);
  return { ..._systemSettings };
}

export async function updateSystemSettings(
  data: Partial<SystemSettings>,
): Promise<SystemSettings> {
  if (!USE_MOCK) {
    const api = getAdminApi();
    return (await api.patch("/system-settings", data)).data;
  }
  await delay(600);
  _systemSettings = { ..._systemSettings, ...data };
  return { ..._systemSettings };
}
