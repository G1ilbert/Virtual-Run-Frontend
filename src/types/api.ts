// ─── User ───
export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  addressDetail?: string;
  subDistrictId?: number;
  firebaseUid?: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
  isOrganizerVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Event ───
export interface Event {
  id: number;
  title: string;
  description?: string;
  bannerImage?: string;
  coverImage?: string;
  detailImages?: string[];
  startDate?: string;
  endDate?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "completed";
  organizerId?: number;
  organizer?: { id: number; username: string };
  packages?: Package[];
  _count?: { registrations?: number };
  createdAt?: string;
}

// ─── Package ───
export interface Package {
  id: number;
  eventId: number;
  name: string;
  description?: string;
  price: number;
  targetDistance?: number;
  maxParticipants?: number;
  image?: string;
  packageItems?: PackageItem[];
  events?: Event;
}

// ─── PackageItem ───
export interface PackageItem {
  id: number;
  packageId: number;
  itemId: number;
  quantity: number;
  items?: Item;
}

// ─── Item ───
export interface Item {
  id: number;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  image?: string;
  itemVariants?: ItemVariant[];
}

// ─── ItemVariant ───
export interface ItemVariant {
  id: number;
  itemId: number;
  variantName: string;
  variantValue: string;
}

// ─── Registration ───
export interface Registration {
  id: number;
  userId: number;
  packageId: number;
  status: string;
  paymentStatus: "pending" | "submitted" | "confirmed" | "rejected";
  priceSnapshot?: number;
  targetDistanceSnapshot?: number;
  addressDetail?: string;
  subDistrictId?: number;
  slipUrl?: string;
  createdAt?: string;
  packages?: Package;
  users?: { id: number; username: string };
  shipments?: Shipment[];
  registrationItemVariants?: RegistrationItemVariant[];
  runningResults?: RunningResult[];
}

// ─── RegistrationItemVariant ───
export interface RegistrationItemVariant {
  id: number;
  registrationId: number;
  itemId: number;
  itemVariantId: number;
  itemVariants?: ItemVariant;
  items?: Item;
}

// ─── Shipment ───
export interface Shipment {
  id: number;
  registrationId: number;
  status: "pending" | "preparing" | "shipped" | "delivered";
  preparedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  shipmentItems?: ShipmentItem[];
  shipmentStaff?: ShipmentStaff[];
}

// ─── ShipmentItem ───
export interface ShipmentItem {
  id: number;
  shipmentId: number;
  itemId: number;
  itemVariantId?: number;
  quantity: number;
  items?: Item;
  itemVariants?: ItemVariant;
}

// ─── ShipmentStaff ───
export interface ShipmentStaff {
  id: number;
  shipmentId: number;
  eventStaffId: number;
  trackingNumber?: string;
  shippedAt?: string;
  confirmedAt?: string;
}

// ─── RunningProof ───
export interface RunningProof {
  id: number;
  userId: number;
  imageUrl: string;
  distance?: number;
  duration?: string;
  note?: string;
  createdAt?: string;
  runningResults?: RunningResult[];
}

// ─── RunningResult ───
export interface RunningResult {
  id: number;
  registrationId: number;
  runningProofId: number;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
  reviewedAt?: string;
  createdAt?: string;
  registrations?: Registration;
  runningProofs?: RunningProof;
}

// ─── Paginated Response ───
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Payment ───
export interface PaymentQR {
  qrCodeDataUrl: string;
  amount: number;
  promptPayId: string;
  promptPayName: string;
}

// ─── Geography ───
export interface Province {
  id: number;
  nameTh: string;
  nameEn?: string;
  geographyId?: number;
}

export interface District {
  id: number;
  nameTh: string;
  nameEn?: string;
  provinceId?: number;
}

export interface SubDistrict {
  id: number;
  nameTh: string;
  nameEn?: string;
  postalCode?: string;
  districtId?: number;
}

// ─── Organizer Application ───
export interface OrganizerApplication {
  id: number;
  userId: number;
  documentProofUrl?: string;
  contactInfo?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  users?: { id: number; username: string; email?: string };
}

// ─── Event Staff ───
export interface EventStaff {
  id: number;
  eventId: number;
  userId: number;
  assignedAt?: string;
  users?: { id: number; username: string; email?: string };
}

// ─── Payout ───
export interface Payout {
  id: number;
  eventId: number;
  organizerId: number;
  totalAmount: number;
  commission?: number;
  netAmount?: number;
  status: "pending" | "confirmed" | "rejected";
  createdAt?: string;
  events?: { id: number; title: string };
}

// ─── Stock ───
export interface StockIn {
  id: number;
  itemId: number;
  itemVariantId?: number;
  quantity: number;
  note?: string;
  createdAt?: string;
  items?: Item;
  itemVariants?: ItemVariant;
}

export interface StockSummary {
  itemId: number;
  itemVariantId?: number;
  totalIn: number;
  totalOut: number;
  balance: number;
}

// ─── Shipment Adjustment ───
export interface ShipmentAdjustment {
  id: number;
  shipmentId: number;
  itemId: number;
  itemVariantId?: number;
  quantity: number;
  adjustmentType: "add" | "remove" | "replace";
  reason?: string;
  createdAt?: string;
  items?: Item;
  itemVariants?: ItemVariant;
}

// ─── Notification ───
export interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

// ─── Sender Info (for shipping labels) ───
export interface SenderInfo {
  shopName: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  zipCode: string;
}
