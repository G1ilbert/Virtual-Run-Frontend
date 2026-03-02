"use client";

import useSWR from "swr";
import * as adminClient from "@/lib/admin-api-client";
import type {
  User,
  Event,
  Registration,
  OrganizerApplication,
  Payout,
  PaginatedResponse,
} from "@/types/api";
import type { AdminDashboardStats, SystemSettings } from "@/lib/admin-mock-data";

// ─── Dashboard ───

export function useAdminDashboard() {
  return useSWR<AdminDashboardStats>("admin/dashboard", () =>
    adminClient.fetchDashboardStats(),
  );
}

// ─── Users ───

export function useAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const key = `admin/users?${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<User>>(key, () =>
    adminClient.fetchUsers(params),
  );
}

export function useAdminUser(id: number | undefined) {
  return useSWR<User>(
    id ? `admin/users/${id}` : null,
    () => adminClient.fetchUser(id!),
  );
}

// ─── Events ───

export function useAdminEvents(params: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const key = `admin/events?${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<Event>>(key, () =>
    adminClient.fetchAdminEvents(params),
  );
}

// ─── Payments (Slips) ───

export function useAdminSlips(params: {
  page?: number;
  limit?: number;
  paymentStatus?: string;
}) {
  const key = `admin/slips?${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<Registration>>(key, () =>
    adminClient.fetchPendingSlips(params),
  );
}

// ─── Payouts ───

export function useAdminPayouts(params: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const key = `admin/payouts?${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<Payout>>(key, () =>
    adminClient.fetchPayouts(params),
  );
}

// ─── Organizer Applications ───

export function useAdminOrgApplications(params: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const key = `admin/org-apps?${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<OrganizerApplication>>(key, () =>
    adminClient.fetchOrganizerApplications(params),
  );
}

// ─── System Settings ───

export function useSystemSettings() {
  return useSWR<SystemSettings>("admin/system-settings", () =>
    adminClient.fetchSystemSettings(),
  );
}

// ─── Re-export mutations ───

export const adminLogin = adminClient.adminLogin;
export const adminLogout = adminClient.adminLogout;
export const updateUser = adminClient.updateUser;
export const deleteUser = adminClient.deleteUser;
export const approveEvent = adminClient.approveEvent;
export const rejectEvent = adminClient.rejectEvent;
export const verifySlip = adminClient.verifySlip;
export const createPayout = adminClient.createPayout;
export const confirmPayout = adminClient.confirmPayout;
export const reviewOrganizerApplication = adminClient.reviewOrganizerApplication;
export const updateSystemSettings = adminClient.updateSystemSettings;
