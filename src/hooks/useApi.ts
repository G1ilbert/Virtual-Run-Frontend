"use client";

import useSWR from "swr";
import * as client from "@/lib/api-client";
import type {
  Event,
  Registration,
  RunningProof,
  User,
  PaginatedResponse,
  PaymentQR,
  Province,
  District,
  SubDistrict,
} from "@/types/api";

// ─── Events ───

export function useEvents(params?: Record<string, string | number>) {
  const key = params ? `/events?${JSON.stringify(params)}` : "/events";
  return useSWR<PaginatedResponse<Event>>(key, () => client.fetchEvents(params));
}

export function useEvent(id: number | string | undefined) {
  return useSWR<Event | null>(id ? `/events/${id}` : null, () =>
    client.fetchEvent(id!),
  );
}

// ─── Registrations ───

export function useMyRegistrations() {
  return useSWR<Registration[]>("/registrations/my", () =>
    client.fetchMyRegistrations(),
  );
}

export function useRegistration(id: number | string | undefined) {
  return useSWR<Registration | null>(id ? `/registrations/${id}` : null, () =>
    client.fetchRegistration(id!),
  );
}

// ─── Running Proofs ───

export function useMyRunningProofs() {
  return useSWR<RunningProof[]>("/running-proofs/my", () =>
    client.fetchMyRunningProofs(),
  );
}

export function useRunningProof(id: number | string | undefined) {
  return useSWR<RunningProof | null>(
    id ? `/running-proofs/${id}` : null,
    () => client.fetchRunningProof(id!),
  );
}

// ─── Profile ───

export function useProfile() {
  return useSWR<User>("/users/me", () => client.fetchProfile());
}

// ─── Payment QR ───

export function usePaymentQR(registrationId: number | undefined) {
  return useSWR<PaymentQR>(
    registrationId ? `/payments/qr/${registrationId}` : null,
    () => client.fetchPaymentQR(registrationId!),
  );
}

// ─── Geography ───

export function useProvinces() {
  return useSWR<Province[]>("/geographies/provinces", () =>
    client.fetchProvinces(),
  );
}

export function useDistricts(provinceId: number | undefined) {
  return useSWR<District[]>(
    provinceId ? `/geographies/districts?provinceId=${provinceId}` : null,
    () => client.fetchDistricts(provinceId!),
  );
}

export function useSubDistricts(districtId: number | undefined) {
  return useSWR<SubDistrict[]>(
    districtId ? `/geographies/sub-districts?districtId=${districtId}` : null,
    () => client.fetchSubDistricts(districtId!),
  );
}

// ─── Re-export mutations from api-client ───

export const submitRegistration = client.createRegistration;
export const submitSlip = client.submitSlip;
export const confirmDelivery = client.confirmDelivery;
export const submitRunningProof = client.createRunningProof;
export const submitRunningResult = client.createRunningResult;
export const updateProfile = client.updateProfile;
