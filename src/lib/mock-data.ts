import type {
  User,
  Event,
  Package,
  Registration,
  RunningProof,
  RunningResult,
  Shipment,
  Item,
  ItemVariant,
  PackageItem,
  PaymentQR,
  Province,
  District,
  SubDistrict,
  Notification,
} from "@/types/api";

// ─── Mock Users ───

export const mockUsers: Record<string, User> = {
  user: {
    id: 1,
    username: "runner_jaa",
    email: "jaa@example.com",
    firstName: "จ๊ะ",
    lastName: "วิ่งดี",
    phoneNumber: "081-234-5678",
    addressDetail: "123/45 ซ.สุขุมวิท 55",
    subDistrictId: 1,
    role: "USER",
    createdAt: "2025-06-15T08:00:00Z",
  },
  organizer: {
    id: 2,
    username: "organizer_run",
    email: "organizer@example.com",
    firstName: "สมชาย",
    lastName: "จัดงาน",
    phoneNumber: "089-999-8888",
    addressDetail: "99/1 ถ.รัชดาภิเษก",
    subDistrictId: 5,
    role: "ORGANIZER",
    isOrganizerVerified: true,
    createdAt: "2025-01-10T08:00:00Z",
  },
  admin: {
    id: 3,
    username: "admin",
    email: "admin@virtualrun.com",
    firstName: "แอดมิน",
    lastName: "ระบบ",
    phoneNumber: "02-123-4567",
    role: "ADMIN",
    createdAt: "2024-01-01T00:00:00Z",
  },
  staff: {
    id: 30,
    username: "staff_lek",
    email: "lek@virtualrun.com",
    firstName: "เล็ก",
    lastName: "ช่วยงาน",
    phoneNumber: "081-111-2222",
    role: "USER",
    createdAt: "2025-03-01T08:00:00Z",
  },
};

// ─── Item Variants ───

const shirtVariants: ItemVariant[] = [
  { id: 1, itemId: 1, variantName: "ไซส์", variantValue: "S" },
  { id: 2, itemId: 1, variantName: "ไซส์", variantValue: "M" },
  { id: 3, itemId: 1, variantName: "ไซส์", variantValue: "L" },
  { id: 4, itemId: 1, variantName: "ไซส์", variantValue: "XL" },
];

const shirtVariants2: ItemVariant[] = [
  { id: 5, itemId: 3, variantName: "ไซส์", variantValue: "S" },
  { id: 6, itemId: 3, variantName: "ไซส์", variantValue: "M" },
  { id: 7, itemId: 3, variantName: "ไซส์", variantValue: "L" },
  { id: 8, itemId: 3, variantName: "ไซส์", variantValue: "XL" },
];

// ─── Items ───

const items: Item[] = [
  { id: 1, name: "เสื้อวิ่ง Dry-Fit", description: "เสื้อวิ่งระบายอากาศ", category: "เสื้อ", image: "https://placehold.co/400x400/f2cc0f/212121?text=เสื้อ+Dry-Fit", itemVariants: shirtVariants },
  { id: 2, name: "เหรียญ Finisher", description: "เหรียญที่ระลึก", category: "เหรียญ", image: "https://placehold.co/400x400/facc15/212121?text=เหรียญ+Finisher" },
  { id: 3, name: "เสื้อวิ่ง Premium", description: "เสื้อวิ่งพรีเมียม", category: "เสื้อ", image: "https://placehold.co/400x400/eab308/212121?text=เสื้อ+Premium", itemVariants: shirtVariants2 },
  { id: 4, name: "เหรียญทอง Limited", description: "เหรียญ Limited Edition", category: "เหรียญ", image: "https://placehold.co/400x400/ca8a04/ffffff?text=เหรียญทอง" },
  { id: 5, name: "BIB Number", description: "เบอร์วิ่ง", category: "อุปกรณ์", image: "https://placehold.co/400x400/a3a3a3/212121?text=BIB" },
  { id: 6, name: "ถุงผ้า Eco Bag", description: "ถุงผ้ารักษ์โลก", category: "ของแถม", image: "https://placehold.co/400x400/4ade80/212121?text=Eco+Bag" },
];

// ─── Events + Packages ───

export const mockEvents: Event[] = [
  {
    id: 1,
    title: "วิ่งสู้ฝุ่น 2026",
    description: "งานวิ่ง Virtual Run ปี 2026 สู้ฝุ่น PM2.5 ร่วมสมทบทุนซื้อเครื่องฟอกอากาศให้โรงเรียน วิ่งที่ไหนก็ได้ ส่งผลวิ่งผ่านแอป รับเหรียญและเสื้อวิ่งส่งถึงบ้าน",
    bannerImage: "https://placehold.co/800x400/f2cc0f/212121?text=วิ่งสู้ฝุ่น+2026",
    coverImage: "https://placehold.co/1920x1080/f2cc0f/212121?text=วิ่งสู้ฝุ่น+2026+Cover",
    detailImages: [
      "https://placehold.co/1920x1080/f59e0b/212121?text=Detail+1+เส้นทางวิ่ง",
      "https://placehold.co/1920x1080/d97706/ffffff?text=Detail+2+เสื้อวิ่ง",
      "https://placehold.co/1920x1080/b45309/ffffff?text=Detail+3+เหรียญรางวัล",
    ],
    startDate: "2026-03-01T00:00:00Z",
    endDate: "2026-04-30T23:59:59Z",
    registrationStartDate: "2026-01-15T00:00:00Z",
    registrationEndDate: "2026-03-31T23:59:59Z",
    status: "approved",
    organizerId: 2,
    organizer: { id: 2, username: "organizer_run" },
    _count: { registrations: 234 },
    packages: [
      {
        id: 1, eventId: 1, name: "Fun Run 5K", description: "วิ่ง 5 กิโลเมตร เหมาะสำหรับมือใหม่", price: 500, targetDistance: 5, maxParticipants: 500, image: "https://placehold.co/800x800/f2cc0f/212121?text=Fun+Run+5K",
        packageItems: [
          { id: 1, packageId: 1, itemId: 1, quantity: 1, items: items[0] },
          { id: 2, packageId: 1, itemId: 2, quantity: 1, items: items[1] },
          { id: 3, packageId: 1, itemId: 5, quantity: 1, items: items[4] },
        ],
      },
      {
        id: 2, eventId: 1, name: "Challenge 10K", description: "วิ่ง 10 กิโลเมตร ท้าทายตัวเอง", price: 800, targetDistance: 10, maxParticipants: 300, image: "https://placehold.co/800x800/212121/f2cc0f?text=Challenge+10K",
        packageItems: [
          { id: 4, packageId: 2, itemId: 3, quantity: 1, items: items[2] },
          { id: 5, packageId: 2, itemId: 4, quantity: 1, items: items[3] },
          { id: 6, packageId: 2, itemId: 5, quantity: 1, items: items[4] },
          { id: 7, packageId: 2, itemId: 6, quantity: 1, items: items[5] },
        ],
      },
    ],
    createdAt: "2025-12-01T08:00:00Z",
  },
  {
    id: 2,
    title: "BKK Mini Marathon",
    description: "งาน Virtual Marathon กรุงเทพฯ วิ่งสะสมระยะทางภายใน 30 วัน เลือกระยะ 5K 10K หรือ Half Marathon ได้ตามใจ",
    bannerImage: "https://placehold.co/800x400/212121/f2cc0f?text=BKK+Mini+Marathon",
    coverImage: "https://placehold.co/1920x1080/212121/f2cc0f?text=BKK+Marathon+Cover",
    detailImages: [
      "https://placehold.co/1920x1080/374151/f2cc0f?text=BKK+Detail+1",
      "https://placehold.co/1920x1080/1f2937/f2cc0f?text=BKK+Detail+2",
    ],
    startDate: "2026-04-01T00:00:00Z",
    endDate: "2026-05-31T23:59:59Z",
    registrationStartDate: "2026-02-01T00:00:00Z",
    registrationEndDate: "2026-04-15T23:59:59Z",
    status: "approved",
    organizerId: 2,
    organizer: { id: 2, username: "organizer_run" },
    _count: { registrations: 512 },
    packages: [
      { id: 3, eventId: 2, name: "5K Fun", price: 600, targetDistance: 5, maxParticipants: 1000, image: "https://placehold.co/800x800/374151/f2cc0f?text=5K+Fun", packageItems: [{ id: 8, packageId: 3, itemId: 1, quantity: 1, items: items[0] }, { id: 9, packageId: 3, itemId: 2, quantity: 1, items: items[1] }] },
      { id: 4, eventId: 2, name: "10K Challenge", price: 900, targetDistance: 10, maxParticipants: 500, image: "https://placehold.co/800x800/1f2937/f2cc0f?text=10K+Challenge", packageItems: [{ id: 10, packageId: 4, itemId: 3, quantity: 1, items: items[2] }, { id: 11, packageId: 4, itemId: 4, quantity: 1, items: items[3] }] },
      { id: 5, eventId: 2, name: "Half Marathon 21K", price: 1200, targetDistance: 21, maxParticipants: 200, image: "https://placehold.co/800x800/111827/f2cc0f?text=Half+Marathon", packageItems: [{ id: 12, packageId: 5, itemId: 3, quantity: 1, items: items[2] }, { id: 13, packageId: 5, itemId: 4, quantity: 1, items: items[3] }, { id: 14, packageId: 5, itemId: 6, quantity: 1, items: items[5] }] },
    ],
    createdAt: "2026-01-05T08:00:00Z",
  },
  {
    id: 3,
    title: "วิ่งการกุศล ช้างน้อย",
    description: "วิ่งเพื่อช้างไทย รายได้ส่วนหนึ่งมอบให้มูลนิธิอนุรักษ์ช้างไทย ระยะสั้น เหมาะทุกวัย",
    bannerImage: "https://placehold.co/800x400/4ade80/212121?text=ช้างน้อย+Run",
    coverImage: "https://placehold.co/1920x1080/4ade80/212121?text=ช้างน้อย+Cover",
    detailImages: [
      "https://placehold.co/1920x1080/22c55e/ffffff?text=ช้างน้อย+Detail+1",
    ],
    startDate: "2026-03-15T00:00:00Z",
    endDate: "2026-04-15T23:59:59Z",
    registrationStartDate: "2026-02-01T00:00:00Z",
    registrationEndDate: "2026-03-31T23:59:59Z",
    status: "approved",
    organizerId: 2,
    organizer: { id: 2, username: "organizer_run" },
    _count: { registrations: 180 },
    packages: [
      { id: 6, eventId: 3, name: "Kids Run 3K", price: 400, targetDistance: 3, maxParticipants: 300, image: "https://placehold.co/800x800/4ade80/212121?text=Kids+Run+3K", packageItems: [{ id: 15, packageId: 6, itemId: 1, quantity: 1, items: items[0] }, { id: 16, packageId: 6, itemId: 2, quantity: 1, items: items[1] }] },
      { id: 7, eventId: 3, name: "Family Run 5K", price: 600, targetDistance: 5, maxParticipants: 200, image: "https://placehold.co/800x800/22c55e/ffffff?text=Family+Run+5K", packageItems: [{ id: 17, packageId: 7, itemId: 3, quantity: 1, items: items[2] }, { id: 18, packageId: 7, itemId: 4, quantity: 1, items: items[3] }, { id: 19, packageId: 7, itemId: 6, quantity: 1, items: items[5] }] },
    ],
    createdAt: "2026-01-20T08:00:00Z",
  },
  {
    id: 4,
    title: "Chiang Mai Trail Run",
    description: "งาน Virtual Trail Run ท้าทายเส้นทางภูเขา วิ่งเทรลที่ไหนก็ได้ สะสมระยะ ส่งผลวิ่ง",
    bannerImage: "https://placehold.co/800x400/92400e/ffffff?text=Chiang+Mai+Trail",
    coverImage: "https://placehold.co/1920x1080/92400e/ffffff?text=Chiang+Mai+Trail+Cover",
    detailImages: [
      "https://placehold.co/1920x1080/7c2d12/ffffff?text=Trail+Detail+1",
      "https://placehold.co/1920x1080/9a3412/ffffff?text=Trail+Detail+2",
      "https://placehold.co/1920x1080/c2410c/ffffff?text=Trail+Detail+3",
      "https://placehold.co/1920x1080/ea580c/ffffff?text=Trail+Detail+4",
    ],
    startDate: "2026-05-01T00:00:00Z",
    endDate: "2026-06-30T23:59:59Z",
    registrationStartDate: "2026-03-01T00:00:00Z",
    registrationEndDate: "2026-05-15T23:59:59Z",
    status: "approved",
    organizerId: 2,
    organizer: { id: 2, username: "organizer_run" },
    _count: { registrations: 98 },
    packages: [
      { id: 8, eventId: 4, name: "Trail 10K", price: 900, targetDistance: 10, maxParticipants: 200, image: "https://placehold.co/800x800/92400e/ffffff?text=Trail+10K", packageItems: [{ id: 20, packageId: 8, itemId: 3, quantity: 1, items: items[2] }, { id: 21, packageId: 8, itemId: 4, quantity: 1, items: items[3] }] },
      { id: 9, eventId: 4, name: "Ultra Trail 25K", price: 1500, targetDistance: 25, maxParticipants: 100, image: "https://placehold.co/800x800/7c2d12/ffffff?text=Ultra+Trail+25K", packageItems: [{ id: 22, packageId: 9, itemId: 3, quantity: 1, items: items[2] }, { id: 23, packageId: 9, itemId: 4, quantity: 1, items: items[3] }, { id: 24, packageId: 9, itemId: 6, quantity: 1, items: items[5] }] },
    ],
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: 5,
    title: "วิ่งริมทะเล หัวหิน",
    description: "วิ่งชิลล์ริมทะเล ปิดรับสมัครแล้ว",
    bannerImage: "https://placehold.co/800x400/0ea5e9/ffffff?text=หัวหิน+Beach+Run",
    coverImage: "https://placehold.co/1920x1080/0ea5e9/ffffff?text=หัวหิน+Cover",
    detailImages: [],
    startDate: "2026-01-15T00:00:00Z",
    endDate: "2026-02-28T23:59:59Z",
    status: "completed",
    organizerId: 2,
    organizer: { id: 2, username: "organizer_run" },
    _count: { registrations: 420 },
    packages: [
      { id: 10, eventId: 5, name: "5K Beach", price: 500, targetDistance: 5, image: "https://placehold.co/800x800/0ea5e9/ffffff?text=5K+Beach", packageItems: [] },
      { id: 11, eventId: 5, name: "10K Beach", price: 800, targetDistance: 10, image: "https://placehold.co/800x800/0284c7/ffffff?text=10K+Beach", packageItems: [] },
    ],
    createdAt: "2025-11-01T08:00:00Z",
  },
  {
    id: 6,
    title: "Night Run พัทยา",
    description: "วิ่งกลางคืนที่พัทยา เต็มแล้ว!",
    bannerImage: "https://placehold.co/800x400/7c3aed/ffffff?text=Night+Run+พัทยา",
    coverImage: "https://placehold.co/1920x1080/7c3aed/ffffff?text=Night+Run+Cover",
    detailImages: [
      "https://placehold.co/1920x1080/6d28d9/ffffff?text=Night+Run+Detail+1",
      "https://placehold.co/1920x1080/5b21b6/ffffff?text=Night+Run+Detail+2",
    ],
    startDate: "2026-04-20T00:00:00Z",
    endDate: "2026-05-20T23:59:59Z",
    status: "approved",
    organizerId: 2,
    organizer: { id: 2, username: "organizer_run" },
    _count: { registrations: 500 },
    packages: [
      { id: 12, eventId: 6, name: "5K Night", price: 700, targetDistance: 5, maxParticipants: 500, image: "https://placehold.co/800x800/7c3aed/ffffff?text=5K+Night", packageItems: [{ id: 25, packageId: 12, itemId: 1, quantity: 1, items: items[0] }, { id: 26, packageId: 12, itemId: 2, quantity: 1, items: items[1] }] },
    ],
    createdAt: "2026-01-10T08:00:00Z",
  },
];

// ─── Registrations ───

export const mockRegistrations: Registration[] = [
  {
    id: 1,
    userId: 1,
    packageId: 1,
    status: "active",
    paymentStatus: "pending",
    priceSnapshot: 500,
    targetDistanceSnapshot: 5,
    addressDetail: "123/45 ซ.สุขุมวิท 55",
    subDistrictId: 1,
    createdAt: "2026-02-20T10:30:00Z",
    packages: { ...mockEvents[0].packages![0], events: { id: 1, title: "วิ่งสู้ฝุ่น 2026", status: "approved" } as Event },
    shipments: [],
    registrationItemVariants: [{ id: 1, registrationId: 1, itemId: 1, itemVariantId: 3, itemVariants: shirtVariants[2], items: items[0] }],
    runningResults: [],
  },
  {
    id: 2,
    userId: 1,
    packageId: 4,
    status: "active",
    paymentStatus: "confirmed",
    priceSnapshot: 900,
    targetDistanceSnapshot: 10,
    addressDetail: "123/45 ซ.สุขุมวิท 55",
    subDistrictId: 1,
    slipUrl: "https://placehold.co/400x600/4ade80/ffffff?text=Slip+Confirmed",
    createdAt: "2026-02-22T14:00:00Z",
    packages: { ...mockEvents[1].packages![1], events: { id: 2, title: "BKK Mini Marathon", status: "approved" } as Event },
    shipments: [{ id: 1, registrationId: 2, status: "preparing", createdAt: "2026-02-25T08:00:00Z", preparedAt: "2026-02-26T10:00:00Z", shipmentItems: [], shipmentStaff: [] }],
    registrationItemVariants: [{ id: 2, registrationId: 2, itemId: 3, itemVariantId: 7, itemVariants: shirtVariants2[2], items: items[2] }],
    runningResults: [
      { id: 4, registrationId: 2, runningProofId: 4, status: "approved", createdAt: "2026-02-25T08:00:00Z", runningProofs: { id: 4, userId: 1, imageUrl: "", distance: 3.5, duration: "00:25:00", createdAt: "2026-02-25T05:30:00Z" } },
      { id: 6, registrationId: 2, runningProofId: 6, status: "approved", createdAt: "2026-02-27T08:00:00Z", runningProofs: { id: 6, userId: 1, imageUrl: "", distance: 3.0, duration: "00:20:00", createdAt: "2026-02-27T06:00:00Z" } },
      { id: 5, registrationId: 2, runningProofId: 5, status: "rejected", reviewNote: "Pace เร็วเกินจริง", createdAt: "2026-02-28T10:00:00Z", runningProofs: { id: 5, userId: 1, imageUrl: "", distance: 42.0, duration: "01:20:00", createdAt: "2026-02-28T08:00:00Z" } },
    ],
  },
  {
    id: 3,
    userId: 1,
    packageId: 7,
    status: "active",
    paymentStatus: "confirmed",
    priceSnapshot: 600,
    targetDistanceSnapshot: 5,
    addressDetail: "123/45 ซ.สุขุมวิท 55",
    subDistrictId: 1,
    slipUrl: "https://placehold.co/400x600/4ade80/ffffff?text=Slip",
    createdAt: "2026-02-10T09:00:00Z",
    packages: { ...mockEvents[2].packages![1], events: { id: 3, title: "วิ่งการกุศล ช้างน้อย", status: "approved" } as Event },
    shipments: [{
      id: 2, registrationId: 3, status: "shipped", createdAt: "2026-02-12T08:00:00Z", preparedAt: "2026-02-13T10:00:00Z",
      shipmentItems: [{ id: 1, shipmentId: 2, itemId: 3, itemVariantId: 7, quantity: 1, items: items[2], itemVariants: shirtVariants2[2] }],
      shipmentStaff: [{ id: 1, shipmentId: 2, eventStaffId: 1, trackingNumber: "TH123456789", shippedAt: "2026-02-14T15:00:00Z" }],
    }],
    registrationItemVariants: [{ id: 3, registrationId: 3, itemId: 3, itemVariantId: 6, itemVariants: shirtVariants2[1], items: items[2] }],
    runningResults: [
      { id: 3, registrationId: 3, runningProofId: 3, status: "approved", createdAt: "2026-02-20T08:00:00Z", runningProofs: { id: 3, userId: 1, imageUrl: "", distance: 3.0, duration: "00:18:00", createdAt: "2026-02-20T06:00:00Z" } },
    ],
  },
  {
    id: 4,
    userId: 1,
    packageId: 10,
    status: "active",
    paymentStatus: "confirmed",
    priceSnapshot: 500,
    targetDistanceSnapshot: 5,
    addressDetail: "123/45 ซ.สุขุมวิท 55",
    subDistrictId: 1,
    slipUrl: "https://placehold.co/400x600/4ade80/ffffff?text=Slip",
    createdAt: "2025-12-20T08:00:00Z",
    packages: { ...mockEvents[4].packages![0], events: { id: 5, title: "วิ่งริมทะเล หัวหิน", status: "completed" } as Event },
    shipments: [{
      id: 3, registrationId: 4, status: "delivered", createdAt: "2025-12-22T08:00:00Z", preparedAt: "2025-12-23T10:00:00Z", updatedAt: "2026-01-05T10:00:00Z",
      shipmentItems: [{ id: 2, shipmentId: 3, itemId: 1, quantity: 1, items: items[0] }],
      shipmentStaff: [{ id: 2, shipmentId: 3, eventStaffId: 1, trackingNumber: "TH987654321", shippedAt: "2025-12-24T10:00:00Z", confirmedAt: "2026-01-05T10:00:00Z" }],
    }],
    registrationItemVariants: [],
    runningResults: [
      { id: 1, registrationId: 4, runningProofId: 1, status: "approved", createdAt: "2026-01-10T08:00:00Z", runningProofs: { id: 1, userId: 1, imageUrl: "", distance: 5.2, duration: "00:35:00", createdAt: "2026-01-10T06:30:00Z" } },
      { id: 2, registrationId: 4, runningProofId: 2, status: "approved", createdAt: "2026-01-15T08:00:00Z", runningProofs: { id: 2, userId: 1, imageUrl: "", distance: 10.1, duration: "01:05:00", createdAt: "2026-01-15T07:00:00Z" } },
    ],
  },
];

// ─── Running Proofs ───

export const mockRunningProofs: RunningProof[] = [
  {
    id: 1,
    userId: 1,
    imageUrl: "https://placehold.co/600x800/f2cc0f/212121?text=5.2km+35min",
    distance: 5.2,
    duration: "00:35:00",
    note: "วิ่งรอบสวนลุมพินี เช้า",
    createdAt: "2026-01-10T06:30:00Z",
    runningResults: [{ id: 1, registrationId: 4, runningProofId: 1, status: "approved", createdAt: "2026-01-10T08:00:00Z", registrations: { id: 4, packages: { id: 10, name: "5K Beach", events: { id: 5, title: "วิ่งริมทะเล หัวหิน", status: "completed" } as Event } as Package } as Registration }],
  },
  {
    id: 2,
    userId: 1,
    imageUrl: "https://placehold.co/600x800/4ade80/212121?text=10.1km+1h05m",
    distance: 10.1,
    duration: "01:05:00",
    note: "วิ่งรอบสวนรถไฟ 2 รอบ",
    createdAt: "2026-01-15T07:00:00Z",
    runningResults: [{ id: 2, registrationId: 4, runningProofId: 2, status: "approved", createdAt: "2026-01-15T09:00:00Z", registrations: { id: 4, packages: { id: 10, name: "5K Beach", events: { id: 5, title: "วิ่งริมทะเล หัวหิน", status: "completed" } as Event } as Package } as Registration }],
  },
  {
    id: 3,
    userId: 1,
    imageUrl: "https://placehold.co/600x800/60a5fa/ffffff?text=3.0km+18min",
    distance: 3.0,
    duration: "00:18:00",
    note: "วิ่งเช้าแถวบ้าน",
    createdAt: "2026-02-20T06:00:00Z",
    runningResults: [{ id: 3, registrationId: 3, runningProofId: 3, status: "pending", createdAt: "2026-02-20T08:00:00Z", registrations: { id: 3, packages: { id: 7, name: "Family Run 5K", events: { id: 3, title: "วิ่งการกุศล ช้างน้อย", status: "approved" } as Event } as Package } as Registration }],
  },
  {
    id: 4,
    userId: 1,
    imageUrl: "https://placehold.co/600x800/a855f7/ffffff?text=21.5km+1h45m",
    distance: 21.5,
    duration: "01:45:00",
    note: "Half Marathon ซ้อมก่อนงานจริง",
    createdAt: "2026-02-25T05:30:00Z",
    runningResults: [{ id: 4, registrationId: 2, runningProofId: 4, status: "pending", createdAt: "2026-02-25T08:00:00Z", registrations: { id: 2, packages: { id: 4, name: "10K Challenge", events: { id: 2, title: "BKK Mini Marathon", status: "approved" } as Event } as Package } as Registration }],
  },
  {
    id: 5,
    userId: 1,
    imageUrl: "https://placehold.co/600x800/ef4444/ffffff?text=42km+1h20m+REJECTED",
    distance: 42.0,
    duration: "01:20:00",
    note: "ทดสอบระบบ",
    createdAt: "2026-02-28T08:00:00Z",
    runningResults: [{ id: 5, registrationId: 2, runningProofId: 5, status: "rejected", reviewNote: "Pace เร็วเกินจริง (1:54 min/km) — เร็วกว่า world record", createdAt: "2026-02-28T10:00:00Z", registrations: { id: 2, packages: { id: 4, name: "10K Challenge", events: { id: 2, title: "BKK Mini Marathon", status: "approved" } as Event } as Package } as Registration }],
  },
];

// ─── Mock QR ───

export const mockPaymentQR: PaymentQR = {
  qrCodeDataUrl: "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#fff"/><rect x="20" y="20" width="40" height="40" fill="#000"/><rect x="140" y="20" width="40" height="40" fill="#000"/><rect x="20" y="140" width="40" height="40" fill="#000"/><rect x="80" y="20" width="10" height="10" fill="#000"/><rect x="100" y="20" width="10" height="10" fill="#000"/><rect x="80" y="40" width="10" height="10" fill="#000"/><rect x="110" y="50" width="10" height="10" fill="#000"/><rect x="80" y="70" width="40" height="10" fill="#000"/><rect x="20" y="80" width="10" height="40" fill="#000"/><rect x="50" y="90" width="10" height="10" fill="#000"/><rect x="80" y="90" width="10" height="10" fill="#000"/><rect x="110" y="80" width="10" height="10" fill="#000"/><rect x="140" y="90" width="10" height="10" fill="#000"/><rect x="160" y="80" width="10" height="20" fill="#000"/><rect x="80" y="110" width="10" height="10" fill="#000"/><rect x="100" y="120" width="10" height="10" fill="#000"/><rect x="140" y="110" width="20" height="10" fill="#000"/><rect x="140" y="140" width="10" height="10" fill="#000"/><rect x="160" y="150" width="10" height="10" fill="#000"/><rect x="140" y="170" width="20" height="10" fill="#000"/><text x="100" y="195" text-anchor="middle" font-size="10" fill="#666">PromptPay Mock</text></svg>`),
  amount: 500,
  promptPayId: "0812345678",
  promptPayName: "Virtual Run Co., Ltd.",
};

// ─── Mock Geography ───

export const mockProvinces: Province[] = [
  { id: 1, nameTh: "กรุงเทพมหานคร", nameEn: "Bangkok", geographyId: 2 },
  { id: 2, nameTh: "นนทบุรี", nameEn: "Nonthaburi", geographyId: 2 },
  { id: 3, nameTh: "เชียงใหม่", nameEn: "Chiang Mai", geographyId: 1 },
  { id: 4, nameTh: "ชลบุรี", nameEn: "Chon Buri", geographyId: 5 },
  { id: 5, nameTh: "ประจวบคีรีขันธ์", nameEn: "Prachuap Khiri Khan", geographyId: 4 },
  { id: 6, nameTh: "ภูเก็ต", nameEn: "Phuket", geographyId: 6 },
];

export const mockDistricts: District[] = [
  // กรุงเทพ
  { id: 1, nameTh: "วัฒนา", nameEn: "Watthana", provinceId: 1 },
  { id: 2, nameTh: "ดินแดง", nameEn: "Din Daeng", provinceId: 1 },
  { id: 3, nameTh: "บางรัก", nameEn: "Bang Rak", provinceId: 1 },
  { id: 4, nameTh: "ปทุมวัน", nameEn: "Pathum Wan", provinceId: 1 },
  // นนทบุรี
  { id: 5, nameTh: "เมืองนนทบุรี", nameEn: "Mueang Nonthaburi", provinceId: 2 },
  { id: 6, nameTh: "ปากเกร็ด", nameEn: "Pak Kret", provinceId: 2 },
  // เชียงใหม่
  { id: 7, nameTh: "เมืองเชียงใหม่", nameEn: "Mueang Chiang Mai", provinceId: 3 },
  // ชลบุรี
  { id: 8, nameTh: "บางละมุง", nameEn: "Bang Lamung", provinceId: 4 },
  // ประจวบฯ
  { id: 9, nameTh: "หัวหิน", nameEn: "Hua Hin", provinceId: 5 },
  // ภูเก็ต
  { id: 10, nameTh: "เมืองภูเก็ต", nameEn: "Mueang Phuket", provinceId: 6 },
];

export const mockSubDistricts: SubDistrict[] = [
  // วัฒนา
  { id: 1, nameTh: "คลองตันเหนือ", nameEn: "Khlong Tan Nuea", postalCode: "10110", districtId: 1 },
  { id: 2, nameTh: "คลองเตยเหนือ", nameEn: "Khlong Toei Nuea", postalCode: "10110", districtId: 1 },
  { id: 3, nameTh: "พระโขนงเหนือ", nameEn: "Phra Khanong Nuea", postalCode: "10110", districtId: 1 },
  // ดินแดง
  { id: 4, nameTh: "ดินแดง", nameEn: "Din Daeng", postalCode: "10400", districtId: 2 },
  { id: 5, nameTh: "รัชดาภิเษก", nameEn: "Ratchadaphisek", postalCode: "10400", districtId: 2 },
  // บางรัก
  { id: 6, nameTh: "สีลม", nameEn: "Si Lom", postalCode: "10500", districtId: 3 },
  // ปทุมวัน
  { id: 7, nameTh: "ลุมพินี", nameEn: "Lumphini", postalCode: "10330", districtId: 4 },
  // เมืองนนทบุรี
  { id: 8, nameTh: "สวนใหญ่", nameEn: "Suan Yai", postalCode: "11000", districtId: 5 },
  // ปากเกร็ด
  { id: 9, nameTh: "ปากเกร็ด", nameEn: "Pak Kret", postalCode: "11120", districtId: 6 },
  // เมืองเชียงใหม่
  { id: 10, nameTh: "ศรีภูมิ", nameEn: "Si Phum", postalCode: "50200", districtId: 7 },
  // บางละมุง (พัทยา)
  { id: 11, nameTh: "นาเกลือ", nameEn: "Na Klua", postalCode: "20150", districtId: 8 },
  // หัวหิน
  { id: 12, nameTh: "หัวหิน", nameEn: "Hua Hin", postalCode: "77110", districtId: 9 },
  // เมืองภูเก็ต
  { id: 13, nameTh: "ตลาดใหญ่", nameEn: "Talat Yai", postalCode: "83000", districtId: 10 },
];

// ─── Mock Notifications ───

export const mockNotifications: Notification[] = [
  { id: 1, message: "สมัครงานวิ่งสู้ฝุ่น 2026 สำเร็จ", time: "2 ชม.ที่แล้ว", read: false },
  { id: 2, message: "ชำระเงินสำเร็จ — BKK Mini Marathon", time: "1 วันที่แล้ว", read: false },
  { id: 3, message: "จัดส่งแล้ว — เลขพัสดุ TH123456789", time: "2 วันที่แล้ว", read: true },
  { id: 4, message: "ผลวิ่งผ่านการตรวจสอบ 3.5 km", time: "3 วันที่แล้ว", read: true },
  { id: 5, message: "งาน Chiang Mai Trail Run เปิดรับสมัครแล้ว!", time: "5 วันที่แล้ว", read: true },
];
