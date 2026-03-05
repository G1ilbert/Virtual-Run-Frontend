import type {
  Item,
  ItemVariant,
  Registration,
  RunningResult,
  Shipment,
  EventStaff,
  OrganizerApplication,
  Payout,
  StockIn,
  StockSummary,
  SenderInfo,
} from "@/types/api";
import { mockEvents } from "@/lib/mock-data";

// ─── Re-export organizer events (organizer userId=2 owns events 1–6) ───

export const mockOrganizerEvents = mockEvents;

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

export const mockItems: Item[] = [
  { id: 1, name: "เสื้อวิ่ง Dry-Fit", description: "เสื้อวิ่งระบายอากาศ", category: "เสื้อ", image: "https://placehold.co/400x400/f2cc0f/212121?text=เสื้อ+Dry-Fit", itemVariants: shirtVariants },
  { id: 2, name: "เหรียญ Finisher", description: "เหรียญที่ระลึก", category: "เหรียญ", image: "https://placehold.co/400x400/facc15/212121?text=เหรียญ+Finisher" },
  { id: 3, name: "เสื้อวิ่ง Premium", description: "เสื้อวิ่งพรีเมียม", category: "เสื้อ", image: "https://placehold.co/400x400/eab308/212121?text=เสื้อ+Premium", itemVariants: shirtVariants2 },
  { id: 4, name: "เหรียญทอง Limited", description: "เหรียญ Limited Edition", category: "เหรียญ", image: "https://placehold.co/400x400/ca8a04/ffffff?text=เหรียญทอง" },
  { id: 5, name: "BIB Number", description: "เบอร์วิ่ง", category: "อุปกรณ์", image: "https://placehold.co/400x400/a3a3a3/212121?text=BIB" },
  { id: 6, name: "ถุงผ้า Eco Bag", description: "ถุงผ้ารักษ์โลก", category: "ของแถม", image: "https://placehold.co/400x400/4ade80/212121?text=Eco+Bag" },
];

// ─── Mock Organizer Registrations ───
// 12 registrations from various users across organizer's events
// Payment statuses: 3 pending, 3 submitted, 4 confirmed, 2 rejected

export const mockOrganizerRegistrations: Registration[] = [
  // ── pending payment (3) ──
  {
    id: 101,
    userId: 10,
    packageId: 1,
    status: "active",
    paymentStatus: "pending",
    priceSnapshot: 500,
    targetDistanceSnapshot: 5,
    addressDetail: "88/12 ซ.ลาดพร้าว 71 แขวงลาดพร้าว",
    subDistrictId: 4,
    createdAt: "2026-02-25T09:15:00Z",
    users: { id: 10, username: "สมศักดิ์ ใจดี" },
    packages: {
      id: 1,
      eventId: 1,
      name: "Fun Run 5K",
      price: 500,
      targetDistance: 5,
      events: { id: 1, title: "วิ่งสู้ฝุ่น 2026", status: "approved" } as any,
    },
  },
  {
    id: 102,
    userId: 11,
    packageId: 3,
    status: "active",
    paymentStatus: "pending",
    priceSnapshot: 600,
    targetDistanceSnapshot: 5,
    addressDetail: "234 ถ.นิมมานเหมินท์ ซ.7 ต.สุเทพ",
    subDistrictId: 10,
    createdAt: "2026-02-26T14:30:00Z",
    users: { id: 11, username: "มานี มากมี" },
    packages: {
      id: 3,
      eventId: 2,
      name: "5K Fun",
      price: 600,
      targetDistance: 5,
      events: { id: 2, title: "BKK Mini Marathon", status: "approved" } as any,
    },
  },
  {
    id: 103,
    userId: 12,
    packageId: 8,
    status: "active",
    paymentStatus: "pending",
    priceSnapshot: 900,
    targetDistanceSnapshot: 10,
    addressDetail: "56/3 ม.5 ถ.ห้วยแก้ว ต.ช้างเผือก",
    subDistrictId: 10,
    createdAt: "2026-03-01T08:00:00Z",
    users: { id: 12, username: "สุกัญญา รุ่งเรือง" },
    packages: {
      id: 8,
      eventId: 4,
      name: "Trail 10K",
      price: 900,
      targetDistance: 10,
      events: { id: 4, title: "Chiang Mai Trail Run", status: "approved" } as any,
    },
  },

  // ── submitted / waiting verification (3) ──
  {
    id: 104,
    userId: 13,
    packageId: 2,
    status: "active",
    paymentStatus: "submitted",
    priceSnapshot: 800,
    targetDistanceSnapshot: 10,
    addressDetail: "19/8 ถ.สีลม แขวงสีลม เขตบางรัก",
    subDistrictId: 6,
    slipUrl: "https://placehold.co/400x600/facc15/212121?text=Slip+104",
    createdAt: "2026-02-20T11:00:00Z",
    users: { id: 13, username: "ปราโมทย์ วิ่งดี" },
    packages: {
      id: 2,
      eventId: 1,
      name: "Challenge 10K",
      price: 800,
      targetDistance: 10,
      events: { id: 1, title: "วิ่งสู้ฝุ่น 2026", status: "approved" } as any,
    },
  },
  {
    id: 105,
    userId: 14,
    packageId: 5,
    status: "active",
    paymentStatus: "submitted",
    priceSnapshot: 1200,
    targetDistanceSnapshot: 21,
    addressDetail: "77 ซ.สุขุมวิท 31 แขวงคลองตันเหนือ",
    subDistrictId: 1,
    slipUrl: "https://placehold.co/400x600/facc15/212121?text=Slip+105",
    createdAt: "2026-02-22T16:45:00Z",
    users: { id: 14, username: "วิภาดา เร็วจัง" },
    packages: {
      id: 5,
      eventId: 2,
      name: "Half Marathon 21K",
      price: 1200,
      targetDistance: 21,
      events: { id: 2, title: "BKK Mini Marathon", status: "approved" } as any,
    },
  },
  {
    id: 106,
    userId: 15,
    packageId: 12,
    status: "active",
    paymentStatus: "submitted",
    priceSnapshot: 700,
    targetDistanceSnapshot: 5,
    addressDetail: "45/2 ถ.พัทยาสาย 2 ต.นาเกลือ",
    subDistrictId: 11,
    slipUrl: "https://placehold.co/400x600/facc15/212121?text=Slip+106",
    createdAt: "2026-02-28T20:00:00Z",
    users: { id: 15, username: "กิตติพงศ์ แข็งแรง" },
    packages: {
      id: 12,
      eventId: 6,
      name: "5K Night",
      price: 700,
      targetDistance: 5,
      events: { id: 6, title: "Night Run พัทยา", status: "approved" } as any,
    },
  },

  // ── confirmed (4) ──
  {
    id: 107,
    userId: 16,
    packageId: 1,
    status: "active",
    paymentStatus: "confirmed",
    priceSnapshot: 500,
    targetDistanceSnapshot: 5,
    addressDetail: "120 ถ.รัชดาภิเษก แขวงดินแดง",
    subDistrictId: 4,
    slipUrl: "https://placehold.co/400x600/4ade80/ffffff?text=Slip+107",
    createdAt: "2026-02-10T08:30:00Z",
    users: { id: 16, username: "อนุชา สู้ไม่ถอย" },
    packages: {
      id: 1,
      eventId: 1,
      name: "Fun Run 5K",
      price: 500,
      targetDistance: 5,
      events: { id: 1, title: "วิ่งสู้ฝุ่น 2026", status: "approved" } as any,
    },
  },
  {
    id: 108,
    userId: 17,
    packageId: 4,
    status: "active",
    paymentStatus: "confirmed",
    priceSnapshot: 900,
    targetDistanceSnapshot: 10,
    addressDetail: "9/1 ม.3 ต.ปากเกร็ด อ.ปากเกร็ด",
    subDistrictId: 9,
    slipUrl: "https://placehold.co/400x600/4ade80/ffffff?text=Slip+108",
    createdAt: "2026-02-12T10:00:00Z",
    users: { id: 17, username: "นภัสสร วิ่งสวย" },
    packages: {
      id: 4,
      eventId: 2,
      name: "10K Challenge",
      price: 900,
      targetDistance: 10,
      events: { id: 2, title: "BKK Mini Marathon", status: "approved" } as any,
    },
  },
  {
    id: 109,
    userId: 18,
    packageId: 6,
    status: "active",
    paymentStatus: "confirmed",
    priceSnapshot: 400,
    targetDistanceSnapshot: 3,
    addressDetail: "55/7 ม.2 ถ.ราชพฤกษ์ ต.สวนใหญ่",
    subDistrictId: 8,
    slipUrl: "https://placehold.co/400x600/4ade80/ffffff?text=Slip+109",
    createdAt: "2026-02-15T13:00:00Z",
    users: { id: 18, username: "พัชรี ใจสู้" },
    packages: {
      id: 6,
      eventId: 3,
      name: "Kids Run 3K",
      price: 400,
      targetDistance: 3,
      events: { id: 3, title: "วิ่งการกุศล ช้างน้อย", status: "approved" } as any,
    },
  },
  {
    id: 110,
    userId: 19,
    packageId: 9,
    status: "active",
    paymentStatus: "confirmed",
    priceSnapshot: 1500,
    targetDistanceSnapshot: 25,
    addressDetail: "200/15 ถ.มหิดล ต.หายยา อ.เมือง",
    subDistrictId: 10,
    slipUrl: "https://placehold.co/400x600/4ade80/ffffff?text=Slip+110",
    createdAt: "2026-02-18T07:00:00Z",
    users: { id: 19, username: "ธนกฤต นักเทรล" },
    packages: {
      id: 9,
      eventId: 4,
      name: "Ultra Trail 25K",
      price: 1500,
      targetDistance: 25,
      events: { id: 4, title: "Chiang Mai Trail Run", status: "approved" } as any,
    },
  },

  // ── rejected (2) ──
  {
    id: 111,
    userId: 20,
    packageId: 7,
    status: "active",
    paymentStatus: "rejected",
    priceSnapshot: 600,
    targetDistanceSnapshot: 5,
    addressDetail: "33 ซ.ทองหล่อ 13 แขวงคลองตันเหนือ",
    subDistrictId: 1,
    slipUrl: "https://placehold.co/400x600/ef4444/ffffff?text=Slip+Blurry",
    createdAt: "2026-02-14T09:00:00Z",
    users: { id: 20, username: "สุภาพร จ่ายช้า" },
    packages: {
      id: 7,
      eventId: 3,
      name: "Family Run 5K",
      price: 600,
      targetDistance: 5,
      events: { id: 3, title: "วิ่งการกุศล ช้างน้อย", status: "approved" } as any,
    },
  },
  {
    id: 112,
    userId: 21,
    packageId: 2,
    status: "active",
    paymentStatus: "rejected",
    priceSnapshot: 800,
    targetDistanceSnapshot: 10,
    addressDetail: "8/2 ม.6 ต.ตลาดใหญ่ อ.เมืองภูเก็ต",
    subDistrictId: 13,
    slipUrl: "https://placehold.co/400x600/ef4444/ffffff?text=Slip+Wrong+Amount",
    createdAt: "2026-02-16T19:30:00Z",
    users: { id: 21, username: "ชาติชาย โอนผิด" },
    packages: {
      id: 2,
      eventId: 1,
      name: "Challenge 10K",
      price: 800,
      targetDistance: 10,
      events: { id: 1, title: "วิ่งสู้ฝุ่น 2026", status: "approved" } as any,
    },
  },
];

// ─── Mock Organizer Running Results ───
// 6 pending review (including 2 suspicious) + 4 already reviewed (2 approved, 2 rejected)

export const mockOrganizerRunningResults: RunningResult[] = [
  // ── pending review (4 normal) ──
  {
    id: 201,
    registrationId: 107,
    runningProofId: 201,
    status: "pending",
    createdAt: "2026-02-28T07:30:00Z",
    runningProofs: {
      id: 201,
      imageUrl: "https://placehold.co/600x800/60a5fa/ffffff?text=5.3km+32min",
      distance: 5.3,
      duration: "00:32:00",
      note: "วิ่งเช้ารอบสวนลุมพินี อากาศดี",
      userId: 16,
      createdAt: "2026-02-28T06:00:00Z",
    },
    registrations: {
      id: 107,
      userId: 16,
      packageId: 1,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 16, username: "อนุชา สู้ไม่ถอย" },
      packages: {
        id: 1,
        eventId: 1,
        name: "Fun Run 5K",
        price: 500,
        events: { id: 1, title: "วิ่งสู้ฝุ่น 2026" } as any,
      },
    } as Registration,
  },
  {
    id: 202,
    registrationId: 108,
    runningProofId: 202,
    status: "pending",
    createdAt: "2026-02-27T08:00:00Z",
    runningProofs: {
      id: 202,
      imageUrl: "https://placehold.co/600x800/4ade80/212121?text=10.5km+58min",
      distance: 10.5,
      duration: "00:58:00",
      note: "วิ่งรอบสวนรถไฟ เพซดีมาก",
      userId: 17,
      createdAt: "2026-02-27T06:15:00Z",
    },
    registrations: {
      id: 108,
      userId: 17,
      packageId: 4,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 17, username: "นภัสสร วิ่งสวย" },
      packages: {
        id: 4,
        eventId: 2,
        name: "10K Challenge",
        price: 900,
        events: { id: 2, title: "BKK Mini Marathon" } as any,
      },
    } as Registration,
  },
  {
    id: 203,
    registrationId: 109,
    runningProofId: 203,
    status: "pending",
    createdAt: "2026-02-26T09:00:00Z",
    runningProofs: {
      id: 203,
      imageUrl: "https://placehold.co/600x800/f59e0b/212121?text=3.2km+22min",
      distance: 3.2,
      duration: "00:22:00",
      note: "วิ่งกับลูก รอบหมู่บ้าน",
      userId: 18,
      createdAt: "2026-02-26T07:30:00Z",
    },
    registrations: {
      id: 109,
      userId: 18,
      packageId: 6,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 18, username: "พัชรี ใจสู้" },
      packages: {
        id: 6,
        eventId: 3,
        name: "Kids Run 3K",
        price: 400,
        events: { id: 3, title: "วิ่งการกุศล ช้างน้อย" } as any,
      },
    } as Registration,
  },
  {
    id: 204,
    registrationId: 110,
    runningProofId: 204,
    status: "pending",
    createdAt: "2026-03-01T10:00:00Z",
    runningProofs: {
      id: 204,
      imageUrl: "https://placehold.co/600x800/a855f7/ffffff?text=12.8km+1h15m",
      distance: 12.8,
      duration: "01:15:00",
      note: "เทรลดอยสุเทพ ขึ้นเขาหนักมาก",
      userId: 19,
      createdAt: "2026-03-01T06:00:00Z",
    },
    registrations: {
      id: 110,
      userId: 19,
      packageId: 9,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 19, username: "ธนกฤต นักเทรล" },
      packages: {
        id: 9,
        eventId: 4,
        name: "Ultra Trail 25K",
        price: 1500,
        events: { id: 4, title: "Chiang Mai Trail Run" } as any,
      },
    } as Registration,
  },

  // ── suspicious pending (2) — unrealistic pace ──
  {
    id: 205,
    registrationId: 107,
    runningProofId: 205,
    status: "pending",
    createdAt: "2026-03-01T12:00:00Z",
    runningProofs: {
      id: 205,
      imageUrl: "https://placehold.co/600x800/ef4444/ffffff?text=42km+1h20m+SUS",
      distance: 42.0,
      duration: "01:20:00",
      note: "Full marathon ทดสอบ",
      userId: 16,
      createdAt: "2026-03-01T05:00:00Z",
    },
    registrations: {
      id: 107,
      userId: 16,
      packageId: 1,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 16, username: "อนุชา สู้ไม่ถอย" },
      packages: {
        id: 1,
        eventId: 1,
        name: "Fun Run 5K",
        price: 500,
        events: { id: 1, title: "วิ่งสู้ฝุ่น 2026" } as any,
      },
    } as Registration,
  },
  {
    id: 206,
    registrationId: 108,
    runningProofId: 206,
    status: "pending",
    createdAt: "2026-03-02T08:00:00Z",
    runningProofs: {
      id: 206,
      imageUrl: "https://placehold.co/600x800/ef4444/ffffff?text=30km+45min+SUS",
      distance: 30.0,
      duration: "00:45:00",
      note: "วิ่งเช้าสนามบิน",
      userId: 17,
      createdAt: "2026-03-02T05:30:00Z",
    },
    registrations: {
      id: 108,
      userId: 17,
      packageId: 4,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 17, username: "นภัสสร วิ่งสวย" },
      packages: {
        id: 4,
        eventId: 2,
        name: "10K Challenge",
        price: 900,
        events: { id: 2, title: "BKK Mini Marathon" } as any,
      },
    } as Registration,
  },

  // ── approved (2) ──
  {
    id: 207,
    registrationId: 109,
    runningProofId: 207,
    status: "approved",
    createdAt: "2026-02-20T10:00:00Z",
    reviewedAt: "2026-02-21T09:00:00Z",
    runningProofs: {
      id: 207,
      imageUrl: "https://placehold.co/600x800/22c55e/ffffff?text=3.1km+20min",
      distance: 3.1,
      duration: "00:20:00",
      note: "วิ่งรอบสวนสาธารณะกับลูก",
      userId: 18,
      createdAt: "2026-02-20T06:30:00Z",
    },
    registrations: {
      id: 109,
      userId: 18,
      packageId: 6,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 18, username: "พัชรี ใจสู้" },
      packages: {
        id: 6,
        eventId: 3,
        name: "Kids Run 3K",
        price: 400,
        events: { id: 3, title: "วิ่งการกุศล ช้างน้อย" } as any,
      },
    } as Registration,
  },
  {
    id: 208,
    registrationId: 110,
    runningProofId: 208,
    status: "approved",
    createdAt: "2026-02-22T08:00:00Z",
    reviewedAt: "2026-02-23T10:00:00Z",
    runningProofs: {
      id: 208,
      imageUrl: "https://placehold.co/600x800/22c55e/ffffff?text=8.5km+52min",
      distance: 8.5,
      duration: "00:52:00",
      note: "วิ่งเทรลดอยอินทนนท์ เส้นทางสวยมาก",
      userId: 19,
      createdAt: "2026-02-22T05:45:00Z",
    },
    registrations: {
      id: 110,
      userId: 19,
      packageId: 9,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 19, username: "ธนกฤต นักเทรล" },
      packages: {
        id: 9,
        eventId: 4,
        name: "Ultra Trail 25K",
        price: 1500,
        events: { id: 4, title: "Chiang Mai Trail Run" } as any,
      },
    } as Registration,
  },

  // ── rejected (2) ──
  {
    id: 209,
    registrationId: 107,
    runningProofId: 209,
    status: "rejected",
    reviewNote: "ภาพหน้าจอไม่ชัด ไม่สามารถยืนยันระยะทางได้ กรุณาส่งใหม่",
    createdAt: "2026-02-18T09:00:00Z",
    reviewedAt: "2026-02-19T11:00:00Z",
    runningProofs: {
      id: 209,
      imageUrl: "https://placehold.co/600x800/ef4444/ffffff?text=Blurry+Image",
      distance: 5.0,
      duration: "00:30:00",
      note: "วิ่งเย็น",
      userId: 16,
      createdAt: "2026-02-18T17:00:00Z",
    },
    registrations: {
      id: 107,
      userId: 16,
      packageId: 1,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 16, username: "อนุชา สู้ไม่ถอย" },
      packages: {
        id: 1,
        eventId: 1,
        name: "Fun Run 5K",
        price: 500,
        events: { id: 1, title: "วิ่งสู้ฝุ่น 2026" } as any,
      },
    } as Registration,
  },
  {
    id: 210,
    registrationId: 108,
    runningProofId: 210,
    status: "rejected",
    reviewNote: "Pace เร็วเกินจริง (1:30 min/km) เร็วกว่า world record มาก กรุณาตรวจสอบข้อมูล",
    createdAt: "2026-02-24T08:00:00Z",
    reviewedAt: "2026-02-25T09:30:00Z",
    runningProofs: {
      id: 210,
      imageUrl: "https://placehold.co/600x800/ef4444/ffffff?text=45km+1h10m+FAKE",
      distance: 45.0,
      duration: "01:10:00",
      note: "วิ่งยาวเช้า",
      userId: 17,
      createdAt: "2026-02-24T05:00:00Z",
    },
    registrations: {
      id: 108,
      userId: 17,
      packageId: 4,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 17, username: "นภัสสร วิ่งสวย" },
      packages: {
        id: 4,
        eventId: 2,
        name: "10K Challenge",
        price: 900,
        events: { id: 2, title: "BKK Mini Marathon" } as any,
      },
    } as Registration,
  },
];

// ─── Mock Organizer Shipments ───
// 8 shipments: 2 pending, 2 preparing, 2 shipped (with tracking), 2 delivered

export const mockOrganizerShipments: (Shipment & { registrations?: any })[] = [
  // ── pending (2) ──
  {
    id: 301,
    registrationId: 107,
    status: "pending",
    createdAt: "2026-02-20T10:00:00Z",
    shipmentItems: [
      {
        id: 301,
        shipmentId: 301,
        itemId: 1,
        itemVariantId: 2,
        quantity: 1,
        items: { id: 1, name: "เสื้อวิ่ง Dry-Fit", category: "เสื้อ" },
        itemVariants: { id: 2, itemId: 1, variantName: "ไซส์", variantValue: "M" },
      },
      {
        id: 302,
        shipmentId: 301,
        itemId: 2,
        quantity: 1,
        items: { id: 2, name: "เหรียญ Finisher", category: "เหรียญ" },
      },
    ],
    shipmentStaff: [],
    registrations: {
      id: 107,
      userId: 16,
      packageId: 1,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 16, username: "อนุชา สู้ไม่ถอย" },
      packages: { id: 1, eventId: 1, name: "Fun Run 5K", price: 500 },
    } as any,
  },
  {
    id: 302,
    registrationId: 109,
    status: "pending",
    createdAt: "2026-02-22T08:00:00Z",
    shipmentItems: [
      {
        id: 303,
        shipmentId: 302,
        itemId: 1,
        itemVariantId: 1,
        quantity: 1,
        items: { id: 1, name: "เสื้อวิ่ง Dry-Fit", category: "เสื้อ" },
        itemVariants: { id: 1, itemId: 1, variantName: "ไซส์", variantValue: "S" },
      },
      {
        id: 304,
        shipmentId: 302,
        itemId: 2,
        quantity: 1,
        items: { id: 2, name: "เหรียญ Finisher", category: "เหรียญ" },
      },
    ],
    shipmentStaff: [],
    registrations: {
      id: 109,
      userId: 18,
      packageId: 6,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 18, username: "พัชรี ใจสู้" },
      packages: { id: 6, eventId: 3, name: "Kids Run 3K", price: 400 },
    } as any,
  },

  // ── preparing (2) ──
  {
    id: 303,
    registrationId: 108,
    status: "preparing",
    createdAt: "2026-02-18T08:00:00Z",
    preparedAt: "2026-02-25T14:00:00Z",
    shipmentItems: [
      {
        id: 305,
        shipmentId: 303,
        itemId: 3,
        itemVariantId: 6,
        quantity: 1,
        items: { id: 3, name: "เสื้อวิ่ง Premium", category: "เสื้อ" },
        itemVariants: { id: 6, itemId: 3, variantName: "ไซส์", variantValue: "M" },
      },
      {
        id: 306,
        shipmentId: 303,
        itemId: 4,
        quantity: 1,
        items: { id: 4, name: "เหรียญทอง Limited", category: "เหรียญ" },
      },
    ],
    shipmentStaff: [
      { id: 301, shipmentId: 303, eventStaffId: 1 },
    ],
    registrations: {
      id: 108,
      userId: 17,
      packageId: 4,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 17, username: "นภัสสร วิ่งสวย" },
      packages: { id: 4, eventId: 2, name: "10K Challenge", price: 900 },
    } as any,
  },
  {
    id: 304,
    registrationId: 110,
    status: "preparing",
    createdAt: "2026-02-20T08:00:00Z",
    preparedAt: "2026-02-27T10:00:00Z",
    shipmentItems: [
      {
        id: 307,
        shipmentId: 304,
        itemId: 3,
        itemVariantId: 8,
        quantity: 1,
        items: { id: 3, name: "เสื้อวิ่ง Premium", category: "เสื้อ" },
        itemVariants: { id: 8, itemId: 3, variantName: "ไซส์", variantValue: "XL" },
      },
      {
        id: 308,
        shipmentId: 304,
        itemId: 4,
        quantity: 1,
        items: { id: 4, name: "เหรียญทอง Limited", category: "เหรียญ" },
      },
      {
        id: 309,
        shipmentId: 304,
        itemId: 6,
        quantity: 1,
        items: { id: 6, name: "ถุงผ้า Eco Bag", category: "ของแถม" },
      },
    ],
    shipmentStaff: [
      { id: 302, shipmentId: 304, eventStaffId: 2 },
    ],
    registrations: {
      id: 110,
      userId: 19,
      packageId: 9,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 19, username: "ธนกฤต นักเทรล" },
      packages: { id: 9, eventId: 4, name: "Ultra Trail 25K", price: 1500 },
    } as any,
  },

  // ── shipped with tracking (2) ──
  {
    id: 305,
    registrationId: 107,
    status: "shipped",
    createdAt: "2026-02-12T08:00:00Z",
    preparedAt: "2026-02-14T10:00:00Z",
    updatedAt: "2026-02-16T09:00:00Z",
    shipmentItems: [
      {
        id: 310,
        shipmentId: 305,
        itemId: 5,
        quantity: 1,
        items: { id: 5, name: "BIB Number", category: "อุปกรณ์" },
      },
    ],
    shipmentStaff: [
      {
        id: 303,
        shipmentId: 305,
        eventStaffId: 1,
        trackingNumber: "TH2026030001",
        shippedAt: "2026-02-16T09:00:00Z",
      },
    ],
    registrations: {
      id: 107,
      userId: 16,
      packageId: 1,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 16, username: "อนุชา สู้ไม่ถอย" },
      packages: { id: 1, eventId: 1, name: "Fun Run 5K", price: 500 },
    } as any,
  },
  {
    id: 306,
    registrationId: 108,
    status: "shipped",
    createdAt: "2026-02-15T08:00:00Z",
    preparedAt: "2026-02-17T14:00:00Z",
    updatedAt: "2026-02-19T10:00:00Z",
    shipmentItems: [
      {
        id: 311,
        shipmentId: 306,
        itemId: 5,
        quantity: 1,
        items: { id: 5, name: "BIB Number", category: "อุปกรณ์" },
      },
      {
        id: 312,
        shipmentId: 306,
        itemId: 6,
        quantity: 1,
        items: { id: 6, name: "ถุงผ้า Eco Bag", category: "ของแถม" },
      },
    ],
    shipmentStaff: [
      {
        id: 304,
        shipmentId: 306,
        eventStaffId: 3,
        trackingNumber: "TH2026030002",
        shippedAt: "2026-02-19T10:00:00Z",
      },
    ],
    registrations: {
      id: 108,
      userId: 17,
      packageId: 4,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 17, username: "นภัสสร วิ่งสวย" },
      packages: { id: 4, eventId: 2, name: "10K Challenge", price: 900 },
    } as any,
  },

  // ── delivered (2) ──
  {
    id: 307,
    registrationId: 109,
    status: "delivered",
    createdAt: "2026-02-05T08:00:00Z",
    preparedAt: "2026-02-06T11:00:00Z",
    updatedAt: "2026-02-12T15:00:00Z",
    shipmentItems: [
      {
        id: 313,
        shipmentId: 307,
        itemId: 1,
        itemVariantId: 1,
        quantity: 1,
        items: { id: 1, name: "เสื้อวิ่ง Dry-Fit", category: "เสื้อ" },
        itemVariants: { id: 1, itemId: 1, variantName: "ไซส์", variantValue: "S" },
      },
      {
        id: 314,
        shipmentId: 307,
        itemId: 2,
        quantity: 1,
        items: { id: 2, name: "เหรียญ Finisher", category: "เหรียญ" },
      },
    ],
    shipmentStaff: [
      {
        id: 305,
        shipmentId: 307,
        eventStaffId: 1,
        trackingNumber: "TH2026020015",
        shippedAt: "2026-02-07T09:00:00Z",
        confirmedAt: "2026-02-12T15:00:00Z",
      },
    ],
    registrations: {
      id: 109,
      userId: 18,
      packageId: 6,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 18, username: "พัชรี ใจสู้" },
      packages: { id: 6, eventId: 3, name: "Kids Run 3K", price: 400 },
    } as any,
  },
  {
    id: 308,
    registrationId: 110,
    status: "delivered",
    createdAt: "2026-02-08T08:00:00Z",
    preparedAt: "2026-02-09T14:00:00Z",
    updatedAt: "2026-02-15T12:00:00Z",
    shipmentItems: [
      {
        id: 315,
        shipmentId: 308,
        itemId: 3,
        itemVariantId: 8,
        quantity: 1,
        items: { id: 3, name: "เสื้อวิ่ง Premium", category: "เสื้อ" },
        itemVariants: { id: 8, itemId: 3, variantName: "ไซส์", variantValue: "XL" },
      },
      {
        id: 316,
        shipmentId: 308,
        itemId: 4,
        quantity: 1,
        items: { id: 4, name: "เหรียญทอง Limited", category: "เหรียญ" },
      },
      {
        id: 317,
        shipmentId: 308,
        itemId: 6,
        quantity: 1,
        items: { id: 6, name: "ถุงผ้า Eco Bag", category: "ของแถม" },
      },
    ],
    shipmentStaff: [
      {
        id: 306,
        shipmentId: 308,
        eventStaffId: 2,
        trackingNumber: "TH2026020022",
        shippedAt: "2026-02-10T10:00:00Z",
        confirmedAt: "2026-02-15T12:00:00Z",
      },
    ],
    registrations: {
      id: 110,
      userId: 19,
      packageId: 9,
      status: "active",
      paymentStatus: "confirmed",
      users: { id: 19, username: "ธนกฤต นักเทรล" },
      packages: { id: 9, eventId: 4, name: "Ultra Trail 25K", price: 1500 },
    } as any,
  },
];

// ─── Mock Payouts ───
// 1 pending, 1 confirmed, 1 rejected

export const mockPayouts: Payout[] = [
  {
    id: 1,
    eventId: 1,
    organizerId: 2,
    totalAmount: 45000,
    commission: 4500,
    netAmount: 40500,
    status: "pending",
    createdAt: "2026-02-28T12:00:00Z",
    events: { id: 1, title: "วิ่งสู้ฝุ่น 2026" },
  },
  {
    id: 2,
    eventId: 5,
    organizerId: 2,
    totalAmount: 120000,
    commission: 12000,
    netAmount: 108000,
    status: "confirmed",
    createdAt: "2026-02-15T10:00:00Z",
    events: { id: 5, title: "วิ่งริมทะเล หัวหิน" },
  },
  {
    id: 3,
    eventId: 3,
    organizerId: 2,
    totalAmount: 32000,
    commission: 3200,
    netAmount: 28800,
    status: "rejected",
    createdAt: "2026-02-20T09:00:00Z",
    events: { id: 3, title: "วิ่งการกุศล ช้างน้อย" },
  },
];

// ─── Mock Event Staff ───

export const mockEventStaff: EventStaff[] = [
  {
    id: 1,
    eventId: 1,
    userId: 30,
    assignedAt: "2026-01-15T08:00:00Z",
    users: { id: 30, username: "staff_lek", email: "lek@virtualrun.com" },
  },
  {
    id: 2,
    eventId: 1,
    userId: 31,
    assignedAt: "2026-01-16T08:00:00Z",
    users: { id: 31, username: "staff_nong", email: "nong@virtualrun.com" },
  },
  {
    id: 3,
    eventId: 2,
    userId: 32,
    assignedAt: "2026-01-20T08:00:00Z",
    users: { id: 32, username: "staff_fah", email: "fah@virtualrun.com" },
  },
  {
    id: 4,
    eventId: 2,
    userId: 30,
    assignedAt: "2026-01-22T08:00:00Z",
    users: { id: 30, username: "staff_lek", email: "lek@virtualrun.com" },
  },
];

// ─── Mock Organizer Application ───

export const mockOrganizerApplication: OrganizerApplication = {
  id: 1,
  userId: 2,
  documentProofUrl: "https://placehold.co/800x600/4ade80/ffffff?text=Business+Registration+Doc",
  contactInfo: "สมชาย จัดงาน โทร 089-999-8888 Line: @organizer_run อีเมล organizer@example.com",
  status: "approved",
  createdAt: "2025-01-05T08:00:00Z",
  users: { id: 2, username: "organizer_run", email: "organizer@example.com" },
};

// ─── Mock Stock Summaries ───
// Item 1 (เสื้อวิ่ง Dry-Fit) variants S/M/L/XL + Item 3 (เสื้อวิ่ง Premium) variants S/M/L/XL

export const mockStockSummaries: StockSummary[] = [
  // Item 1 – เสื้อวิ่ง Dry-Fit
  { itemId: 1, itemVariantId: 1, totalIn: 50, totalOut: 12, balance: 38 },   // S
  { itemId: 1, itemVariantId: 2, totalIn: 100, totalOut: 45, balance: 55 },  // M
  { itemId: 1, itemVariantId: 3, totalIn: 100, totalOut: 62, balance: 38 },  // L
  { itemId: 1, itemVariantId: 4, totalIn: 60, totalOut: 28, balance: 32 },   // XL

  // Item 3 – เสื้อวิ่ง Premium
  { itemId: 3, itemVariantId: 5, totalIn: 30, totalOut: 8, balance: 22 },    // S
  { itemId: 3, itemVariantId: 6, totalIn: 80, totalOut: 35, balance: 45 },   // M
  { itemId: 3, itemVariantId: 7, totalIn: 80, totalOut: 50, balance: 30 },   // L
  { itemId: 3, itemVariantId: 8, totalIn: 40, totalOut: 18, balance: 22 },   // XL
];

// ─── Mock Stock Ins ───

export const mockStockIns: StockIn[] = [
  { id: 1, itemId: 1, quantity: 500, note: "รับเข้าสต็อกล็อตแรก", createdAt: "2026-01-15T08:00:00Z", items: mockItems[0] },
  { id: 2, itemId: 2, quantity: 500, note: "รับเข้าสต็อก", createdAt: "2026-01-15T08:00:00Z", items: mockItems[1] },
  { id: 3, itemId: 3, quantity: 300, note: "รับเข้าสต็อก", createdAt: "2026-01-20T08:00:00Z", items: mockItems[2] },
  { id: 4, itemId: 1, itemVariantId: 2, quantity: 50, note: "เพิ่มไซส์ M", createdAt: "2026-02-01T08:00:00Z", items: mockItems[0], itemVariants: shirtVariants[1] },
];

// ─── Backward compat alias (plural) ───

export const mockOrganizerApplications: OrganizerApplication[] = [mockOrganizerApplication];

// ─── Mock Sender Info ───
export const mockSenderInfo: SenderInfo = {
  shopName: "เก่าต่อไป Running Club",
  phone: "0891234567",
  address: "99/9 ถ.รัชดาภิเษก",
  district: "ห้วยขวาง",
  province: "กรุงเทพฯ",
  zipCode: "10310",
};

// ─── Mock Users for Staff Search ───
export const mockSearchableUsers = [
  { id: 30, username: "staff_lek", email: "lek@virtualrun.com" },
  { id: 31, username: "staff_nong", email: "nong@virtualrun.com" },
  { id: 32, username: "staff_fah", email: "fah@virtualrun.com" },
  { id: 33, username: "staff_pop", email: "pop@virtualrun.com" },
  { id: 34, username: "staff_nam", email: "nam@virtualrun.com" },
];
