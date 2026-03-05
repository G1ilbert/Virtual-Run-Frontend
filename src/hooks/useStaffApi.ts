"use client";

import useSWR from "swr";
import * as staffClient from "@/lib/staff-api-client";
import type {
  Event,
  Registration,
  RunningResult,
  Shipment,
  PaginatedResponse,
} from "@/types/api";

// ─── Staff Events ───

export function useStaffEvents() {
  return useSWR<Event[]>("/events/staff", () =>
    staffClient.fetchStaffEvents(),
    { shouldRetryOnError: false },
  );
}

// ─── Check if user is staff ───

export function useIsStaff() {
  return useSWR<boolean>("/staff/check", () =>
    staffClient.checkIsStaff(),
    { shouldRetryOnError: false },
  );
}

// ─── Staff Registrations ───

export function useStaffRegistrations(params: {
  eventId?: number;
  page?: number;
  limit?: number;
  paymentStatus?: string;
}) {
  const key = `/staff/registrations?${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<Registration>>(key, () =>
    staffClient.fetchStaffRegistrations(params),
  );
}

// ─── Staff Running Results ───

export function useStaffRunningResults(params: {
  eventId?: number;
  page?: number;
  limit?: number;
  status?: string;
}) {
  const key = `/staff/running-results?${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<RunningResult>>(key, () =>
    staffClient.fetchStaffRunningResults(params),
  );
}

// ─── Staff Shipments ───

export function useStaffShipments(params: {
  eventId?: number;
  page?: number;
  limit?: number;
  status?: string;
}) {
  const key = `/staff/shipments?${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<Shipment>>(key, () =>
    staffClient.fetchStaffShipments(params),
  );
}

// ─── Re-export mutations ───

export const staffReviewRunningResult = staffClient.staffReviewRunningResult;
export const staffUpdateShipment = staffClient.staffUpdateShipment;
