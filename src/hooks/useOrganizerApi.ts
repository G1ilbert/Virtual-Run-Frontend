"use client";

import useSWR from "swr";
import * as orgClient from "@/lib/organizer-api-client";
import type {
  Event,
  Package,
  Item,
  Registration,
  RunningResult,
  Shipment,
  EventStaff,
  Payout,
  OrganizerApplication,
  PaginatedResponse,
  StockSummary,
} from "@/types/api";

// ─── Applications ───

export function useMyApplications() {
  return useSWR<OrganizerApplication[]>("/organizer-applications/my", () =>
    orgClient.fetchMyApplications(),
  );
}

// ─── Events ───

export function useMyEvents() {
  return useSWR<Event[]>("/events/my/events", () =>
    orgClient.fetchMyEvents(),
  );
}

// ─── Packages ───

export function usePackagesByEvent(eventId: number | undefined) {
  return useSWR<Package[]>(
    eventId ? `/packages/event/${eventId}` : null,
    () => orgClient.fetchPackagesByEvent(eventId!),
  );
}

// ─── Items ───

export function useItemsByEvent(eventId: number | undefined) {
  return useSWR<Item[]>(
    eventId ? `/items/event/${eventId}` : null,
    () => orgClient.fetchItemsByEvent(eventId!),
  );
}

// ─── Registrations ───

export function useOrgRegistrations(params: {
  page?: number;
  limit?: number;
  eventId?: number;
  paymentStatus?: string;
}) {
  const key = `/registrations?org&${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<Registration>>(key, () =>
    orgClient.fetchRegistrationsPaginated(params),
  );
}

// ─── Running Results ───

export function useOrgRunningResults(params: {
  page?: number;
  limit?: number;
  eventId?: number;
  status?: string;
}) {
  const key = `/running-results?org&${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<RunningResult>>(key, () =>
    orgClient.fetchRunningResultsPaginated(params),
  );
}

// ─── Shipments ───

export function useOrgShipments(params: {
  page?: number;
  limit?: number;
  eventId?: number;
  status?: string;
}) {
  const key = `/shipments?org&${JSON.stringify(params)}`;
  return useSWR<PaginatedResponse<Shipment>>(key, () =>
    orgClient.fetchShipmentsPaginated(params),
  );
}

// ─── Event Staff ───

export function useEventStaff(eventId: number | undefined) {
  return useSWR<EventStaff[]>(
    eventId ? `/event-staff/${eventId}` : null,
    () => orgClient.fetchEventStaff(eventId!),
  );
}

// ─── Stock ───

export function useStockSummary(itemId: number | undefined, itemVariantId?: number) {
  return useSWR<StockSummary>(
    itemId ? `/stock/summary/${itemId}?v=${itemVariantId ?? ""}` : null,
    () => orgClient.fetchStockSummary(itemId!, itemVariantId),
  );
}

// ─── Payouts ───

export function useMyPayouts() {
  return useSWR<Payout[]>("/payouts/my", () =>
    orgClient.fetchMyPayouts(),
  );
}

// ─── Re-export mutations ───

export const createApplication = orgClient.createApplication;
export const createEvent = orgClient.createEvent;
export const updateEvent = orgClient.updateEvent;
export const deleteEvent = orgClient.deleteEvent;
export const submitEventForReview = orgClient.submitEventForReview;
export const createPackage = orgClient.createPackage;
export const updatePackage = orgClient.updatePackage;
export const deletePackage = orgClient.deletePackage;
export const createItem = orgClient.createItem;
export const updateItem = orgClient.updateItem;
export const deleteItem = orgClient.deleteItem;
export const addItemVariant = orgClient.addItemVariant;
export const deleteItemVariant = orgClient.deleteItemVariant;
export const addPackageItem = orgClient.addPackageItem;
export const removePackageItem = orgClient.removePackageItem;
export const createStockIn = orgClient.createStockIn;
export const updateRegistrationPayment = orgClient.updateRegistrationPayment;
export const reviewRunningResult = orgClient.reviewRunningResult;
export const createShipment = orgClient.createShipment;
export const createBatchShipments = orgClient.createBatchShipments;
export const updateShipmentStatus = orgClient.updateShipmentStatus;
export const assignShipmentStaff = orgClient.assignShipmentStaff;
export const updateShipmentStaff = orgClient.updateShipmentStaff;
export const fetchStockSummary = orgClient.fetchStockSummary;
export const uploadEventCover = orgClient.uploadEventCover;
export const uploadEventDetails = orgClient.uploadEventDetails;
export const uploadPackageImage = orgClient.uploadPackageImage;
export const uploadItemImage = orgClient.uploadItemImage;
export const addEventStaff = orgClient.addEventStaff;
export const removeEventStaff = orgClient.removeEventStaff;
export const searchUsers = orgClient.searchUsers;
