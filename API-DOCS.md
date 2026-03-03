# Virtual Run API Documentation

เอกสาร API สำหรับทีม Frontend — ครอบคลุมทุก Endpoint, DTO, Business Logic

---

## สารบัญ

1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [วิธีขอ Token](#2-วิธีขอ-token)
3. [Endpoints ทั้งหมด](#3-endpoints-ทั้งหมด)
   - [Auth](#31-auth)
   - [Users](#32-users)
   - [Events](#33-events)
   - [Packages](#34-packages)
   - [Items](#35-items)
   - [Package Items](#36-package-items)
   - [Registrations](#37-registrations)
   - [Payments](#38-payments)
   - [Running Proofs](#39-running-proofs)
   - [Running Results](#310-running-results)
   - [Shipments](#311-shipments)
   - [Stock](#312-stock)
   - [Payouts](#313-payouts)
   - [Organizer Applications](#314-organizer-applications)
   - [System Settings](#315-system-settings)
   - [Files (Upload/Serve)](#316-files)
   - [Geography](#317-geography)
4. [Error Codes](#4-error-codes)
5. [Business Rules](#5-business-rules-สำคัญ)
6. [.env.local ที่ Frontend ต้องมี](#6-envlocal-ที่-frontend-ต้องมี)
7. [ตัวอย่าง curl](#7-ตัวอย่าง-curl)

---

## 1. ภาพรวมระบบ

### Base URL

```
Production: https://virtual-run-production.up.railway.app/api/v1
Local:      http://localhost:3000/api/v1
```

ทุก endpoint ขึ้นต้นด้วย `/api/v1/`

### ระบบ Authentication (2 แบบ)

| ประเภท | ใช้กับ | Token |
|--------|--------|-------|
| **Firebase Token** | User ทั่วไป + Organizer | Firebase ID Token จาก `firebase.auth().currentUser.getIdToken()` |
| **Admin JWT** | Admin (SystemAdmin) | JWT จาก `POST /auth/admin/login` |

### Role ในระบบ

| Role | คำอธิบาย |
|------|----------|
| `USER` | ผู้ใช้ทั่วไป สมัครงานวิ่ง, ส่งผลวิ่ง |
| `ORGANIZER` | ผู้จัดงาน สร้าง Event, จัดการ Shipment |
| `ADMIN` | (role ใน DB) มีสิทธิ์เท่า ORGANIZER |
| `SYSTEM_ADMIN` | ตาราง system_admins แยก ใช้ JWT, จัดการระบบทั้งหมด |

### ประเภท Auth ของ Endpoint

| ชื่อ | ความหมาย | Header |
|------|----------|--------|
| **Public** | ไม่ต้อง login | ไม่ต้องส่ง |
| **Firebase** | ต้อง login ด้วย Firebase | `Authorization: Bearer <firebase-id-token>` |
| **AdminJWT** | ต้อง login ด้วย Admin JWT | `Authorization: Bearer <jwt-token>` |

### Pagination Response (ทุก endpoint ที่มี pagination)

```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## 2. วิธีขอ Token

### 2.1 Firebase Token (สำหรับ User/Organizer)

```typescript
// Frontend ใช้ Firebase SDK
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Login
const result = await signInWithEmailAndPassword(auth, email, password);
const idToken = await result.user.getIdToken();

// ใช้ token กับ API
const res = await axios.post("/api/v1/auth/login", { idToken });
```

ใส่ Header ทุก request:
```
Authorization: Bearer <firebase-id-token>
```

### 2.2 Admin JWT (สำหรับ SystemAdmin)

```
POST /api/v1/auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

เก็บ `accessToken` ใน `localStorage("admin_token")` แล้วใส่ Header:
```
Authorization: Bearer <jwt-token>
```

JWT หมดอายุใน **24 ชั่วโมง**

---

## 3. Endpoints ทั้งหมด

### 3.1 Auth

#### `POST /auth/register` — ลงทะเบียนผู้ใช้ใหม่

| | |
|---|---|
| Auth | Public |
| Content-Type | application/json |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| idToken | string | ✅ | Firebase ID Token |
| username | string | ✅ | ต้องไม่ซ้ำ |
| firstName | string | ❌ | |
| lastName | string | ❌ | |
| email | string | ❌ | ถ้าไม่ส่งจะใช้ email จาก Firebase Token |
| phoneNumber | string | ❌ | สูงสุด 20 ตัวอักษร |

**Response (201):**
```json
{
  "id": 1,
  "firebaseUid": "abc123",
  "username": "john",
  "email": "john@example.com",
  "role": "USER",
  "firstName": "John",
  "lastName": "Doe"
}
```

**หมายเหตุ:** ถ้า firebaseUid หรือ username ซ้ำจะได้ 409

---

#### `POST /auth/login` — Login ด้วย Firebase Token

| | |
|---|---|
| Auth | Public |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| idToken | string | ✅ |

**Response (200):**
```json
{
  "id": 1,
  "firebaseUid": "abc123",
  "username": "john",
  "email": "john@example.com",
  "role": "ORGANIZER",
  "firstName": "John",
  "lastName": "Doe"
}
```

**หมายเหตุ:** ถ้า user ยังไม่ได้ register จะได้ 401

---

#### `POST /auth/admin/login` — Admin Login (ได้ JWT)

| | |
|---|---|
| Auth | Public |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| username | string | ✅ |
| password | string | ✅ |

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

---

### 3.2 Users

#### `GET /users/me` — ดูโปรไฟล์ตัวเอง

| | |
|---|---|
| Auth | Firebase |
| Role | USER, ORGANIZER, ADMIN |

**Response (200):**
```json
{
  "id": 1,
  "firebaseUid": "abc123",
  "username": "john",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "0812345678",
  "addressDetail": "123 ถนนสุขุมวิท",
  "subDistrictId": 100101,
  "role": "USER",
  "isOrganizerVerified": false,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### `PATCH /users/me` — แก้ไขโปรไฟล์ตัวเอง

| | |
|---|---|
| Auth | Firebase |
| Role | USER, ORGANIZER, ADMIN |

**Request Body (ทุก field เป็น optional):**

| Field | Type | หมายเหตุ |
|-------|------|----------|
| username | string | ต้องไม่ซ้ำกับคนอื่น |
| firstName | string | |
| lastName | string | |
| email | string | ต้องเป็น email format |
| phoneNumber | string | สูงสุด 20 ตัวอักษร |
| addressDetail | string | |
| subDistrictId | number | |

**หมายเหตุ:** ส่ง `role` หรือ `isOrganizerVerified` มาจะถูก **ตัดออกอัตโนมัติ** (user แก้ role ตัวเองไม่ได้)

---

#### `GET /users` — ดูรายชื่อ User ทั้งหมด (Admin)

| | |
|---|---|
| Auth | AdminJWT |

**Query Parameters:**

| Param | Type | Default | หมายเหตุ |
|-------|------|---------|----------|
| page | number | 1 | |
| limit | number | 10 | สูงสุด 100 |
| search | string | - | ค้นหาจาก username, firstName, lastName, email |
| role | string | - | กรอง: USER, ORGANIZER, ADMIN |

**Response:** Paginated `{ data: User[], meta }`

---

#### `GET /users/:id` — ดู User ตาม ID (Admin)

| | |
|---|---|
| Auth | AdminJWT |

---

#### `PATCH /users/:id` — แก้ไข User (Admin)

| | |
|---|---|
| Auth | AdminJWT |

**Request Body (ทุก field optional):**

| Field | Type | หมายเหตุ |
|-------|------|----------|
| username | string | |
| firstName | string | |
| lastName | string | |
| email | string | |
| phoneNumber | string | |
| addressDetail | string | |
| subDistrictId | number | |
| role | string | USER / ORGANIZER / ADMIN (Admin เท่านั้นที่แก้ได้) |
| isOrganizerVerified | boolean | Admin เท่านั้นที่แก้ได้ |

---

#### `DELETE /users/:id` — ลบ User (Soft Delete, Admin)

| | |
|---|---|
| Auth | AdminJWT |
| Response | 204 No Content |

---

### 3.3 Events

#### `GET /events` — ดู Event ทั้งหมด

| | |
|---|---|
| Auth | Public |

**Query Parameters:**

| Param | Type | Default | หมายเหตุ |
|-------|------|---------|----------|
| page | number | 1 | |
| limit | number | 10 | |
| search | string | - | ค้นหาจากชื่อ event |
| status | string | - | draft, pending_approval, approved, rejected, completed |

**Response:** Paginated, แต่ละ event มี:
```json
{
  "id": 1,
  "title": "Virtual Run 2025",
  "description": "...",
  "coverImage": "events/cover-1-1234567890.jpg",
  "detailImages": ["events/detail-1-1.jpg"],
  "status": "approved",
  "startDate": "2025-06-01T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z",
  "organizerId": 2,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "users": {
    "id": 2,
    "username": "organizer1"
  },
  "organizer": {
    "id": 2,
    "username": "organizer1"
  },
  "_count": {
    "registrations": 50
  }
}
```

---

#### `GET /events/my/events` — ดู Event ของตัวเอง (Organizer)

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**หมายเหตุ:** แสดงเฉพาะ event ที่ตัวเองสร้าง

---

#### `GET /events/:id` — ดู Event พร้อมรายละเอียด

| | |
|---|---|
| Auth | Public |

**Response:** Event + packages + items + itemVariants

---

#### `POST /events` — สร้าง Event

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| title | string | ✅ | สูงสุด 255 ตัวอักษร |
| description | string | ❌ | |
| coverImage | string | ❌ | path จาก upload API |
| detailImages | string[] | ❌ | array ของ path |
| startDate | string | ❌ | ISO 8601 format |
| endDate | string | ❌ | ISO 8601 format |

**หมายเหตุ:** สร้างแล้ว status จะเป็น `draft` เสมอ, organizerId จะถูก set อัตโนมัติจาก token

---

#### `PATCH /events/:id` — แก้ไข Event

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**หมายเหตุ:** ต้องเป็นเจ้าของ event หรือ ADMIN เท่านั้น

---

#### `DELETE /events/:id` — ลบ Event (Soft Delete)

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |
| Response | 204 No Content |

---

#### `PATCH /events/:id/submit` — ส่ง Event ให้ Admin ตรวจ

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER |

**เงื่อนไข:** status ต้องเป็น `draft` เท่านั้น → เปลี่ยนเป็น `pending_approval`

---

#### `PATCH /events/:id/approve` — อนุมัติ Event (Admin)

| | |
|---|---|
| Auth | AdminJWT |

**เงื่อนไข:** status ต้องเป็น `pending_approval` → เปลี่ยนเป็น `approved`

---

#### `PATCH /events/:id/reject` — ปฏิเสธ Event (Admin)

| | |
|---|---|
| Auth | AdminJWT |

**เงื่อนไข:** status ต้องเป็น `pending_approval` → เปลี่ยนเป็น `rejected`

---

### 3.4 Packages

#### `GET /packages/event/:eventId` — ดู Package ของ Event

| | |
|---|---|
| Auth | Public |

**Response:**
```json
[
  {
    "id": 1,
    "eventId": 1,
    "name": "Mini 5K",
    "image": "packages/pkg-1-123.jpg",
    "price": 590.00,
    "targetDistance": 5.00,
    "packageItems": [
      {
        "id": 1,
        "itemId": 1,
        "quantity": 1,
        "items": { "id": 1, "name": "เสื้อวิ่ง", "type": "shirt" }
      }
    ]
  }
]
```

---

#### `GET /packages/:id` — ดู Package ตาม ID

| | |
|---|---|
| Auth | Public |

---

#### `POST /packages` — สร้าง Package

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| eventId | number | ✅ | |
| name | string | ❌ | สูงสุด 150 ตัวอักษร |
| image | string | ❌ | path จาก upload API |
| price | number | ❌ | หน่วยบาท (เช่น 590.00) |
| targetDistance | number | ❌ | หน่วย km (เช่น 5.00) |

---

#### `PATCH /packages/:id` — แก้ไข Package

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**หมายเหตุ:** เปลี่ยน eventId ไม่ได้

---

#### `DELETE /packages/:id` — ลบ Package (Hard Delete)

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |
| Response | 204 No Content |

---

### 3.5 Items

#### `GET /items/event/:eventId` — ดู Item ของ Event

| | |
|---|---|
| Auth | Public |

---

#### `GET /items/:id` — ดู Item พร้อม Variants

| | |
|---|---|
| Auth | Public |

**Response:**
```json
{
  "id": 1,
  "eventId": 1,
  "name": "เสื้อวิ่ง",
  "type": "shirt",
  "image": "items/item-1-123.jpg",
  "itemVariants": [
    { "id": 1, "name": "S" },
    { "id": 2, "name": "M" },
    { "id": 3, "name": "L" }
  ]
}
```

---

#### `POST /items` — สร้าง Item พร้อม Variants

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| eventId | number | ✅ | |
| name | string | ❌ | สูงสุด 150 ตัวอักษร |
| type | string | ❌ | สูงสุด 50 ตัวอักษร เช่น shirt, medal |
| image | string | ❌ | |
| variants | array | ❌ | `[{ "name": "S" }, { "name": "M" }]` |

---

#### `PATCH /items/:id` — แก้ไข Item

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| name | string | ❌ |
| type | string | ❌ |

---

#### `DELETE /items/:id` — ลบ Item (Hard Delete)

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |
| Response | 204 No Content |

---

#### `POST /items/:id/variants` — เพิ่ม Variant ให้ Item

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| name | string | ❌ |

---

#### `DELETE /items/variants/:variantId` — ลบ Variant (Hard Delete)

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |
| Response | 204 No Content |

---

### 3.6 Package Items

#### `GET /package-items/package/:packageId` — ดู Item ใน Package

| | |
|---|---|
| Auth | Public |

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| page | number | 1 |
| limit | number | 20 |

---

#### `POST /package-items` — เพิ่ม Item เข้า Package

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| packageId | number | ✅ | |
| itemId | number | ✅ | |
| quantity | number | ❌ | default: 1 |

---

#### `DELETE /package-items/:id` — ลบ Item ออกจาก Package

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |
| Response | 204 No Content |

---

### 3.7 Registrations

#### `POST /registrations` — สมัคร Event (เลือก Package)

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| packageId | number | ✅ | |
| addressDetail | string | ❌ | ที่อยู่จัดส่ง |
| subDistrictId | number | ❌ | ตำบล/แขวง |
| itemVariants | array | ❌ | เลือก variant ของแต่ละ item |

**itemVariants format:**
```json
[
  { "itemId": 1, "itemVariantId": 3 },
  { "itemId": 2, "itemVariantId": 7 }
]
```

**Response (201):**
```json
{
  "id": 1,
  "userId": 1,
  "packageId": 1,
  "priceSnapshot": 590.00,
  "targetDistanceSnapshot": 5.00,
  "paymentStatus": "pending",
  "status": "active",
  "createdAt": "2025-06-01T12:00:00.000Z",
  "registrationItemVariants": [
    {
      "registrationId": 1,
      "itemId": 1,
      "itemVariantId": 3
    }
  ]
}
```

**เงื่อนไข:**
- Event ต้อง status `approved`
- วันปัจจุบันต้องอยู่ในช่วง startDate - endDate
- ห้ามสมัคร package เดิมซ้ำ (unique: userId + packageId)
- ถ้าไม่ส่ง itemVariants ระบบจะ auto-เลือก variant แรกของแต่ละ item

---

#### `GET /registrations/my` — ดูการสมัครของตัวเอง

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

**Response:** รวม package, event, registrationItemVariants

---

#### `GET /registrations` — ดูการสมัครทั้งหมด

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Query Parameters:**

| Param | Type | Default | หมายเหตุ |
|-------|------|---------|----------|
| page | number | 1 | |
| limit | number | 10 | |
| eventId | number | - | กรองตาม event |
| paymentStatus | string | - | pending, paid, rejected, pending_verification, confirmed |

---

#### `GET /registrations/:id` — ดูการสมัครตาม ID

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

---

#### `PATCH /registrations/:id` — แก้ไขการสมัคร

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| slipUrl | string | ❌ | |
| paymentStatus | string | ❌ | pending, paid, rejected |
| addressDetail | string | ❌ | |

---

### 3.8 Payments

#### `GET /payments/qr/:registrationId` — สร้าง QR Code PromptPay

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

**เงื่อนไข:** ต้องเป็นเจ้าของ registration, payment ต้องยังไม่ confirmed

**Response (200):**
```json
{
  "registrationId": 1,
  "amount": 590.00,
  "promptpayId": "0812345678",
  "promptpayName": "Virtual Run",
  "qrCode": "data:image/png;base64,...",
  "paymentStatus": "pending"
}
```

---

#### `POST /payments/:registrationId/submit-slip` — ส่งสลิปชำระเงิน

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| slipUrl | string | ✅ | URL ของรูปสลิป |

**หมายเหตุ:** เปลี่ยน paymentStatus เป็น `pending_verification`

---

#### `PATCH /payments/:registrationId/verify-slip` — ตรวจสลิป (Admin)

| | |
|---|---|
| Auth | AdminJWT |

**Request Body:**

| Field | Type | Required | ค่าที่รับ |
|-------|------|----------|----------|
| status | string | ✅ | `confirmed` หรือ `rejected` |

**หมายเหตุ:**
- ต้องเป็น status `pending_verification` เท่านั้น
- ถ้า confirmed: set `paidAt`, `slipVerifiedAt`, `slipVerifiedBy`
- ถ้า rejected: set `slipVerifiedAt`, `slipVerifiedBy`

---

### 3.9 Running Proofs

#### `POST /running-proofs` — ส่งหลักฐานการวิ่ง

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| imageUrl | string | ✅ | URL รูปหลักฐาน |
| distance | number | ✅ | หน่วย km (เช่น 5.2) ต้อง >= 0 |
| duration | string | ❌ | รูปแบบ HH:MM:SS (เช่น "00:30:00") |

---

#### `GET /running-proofs/my` — ดูหลักฐานการวิ่งของตัวเอง

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

---

#### `GET /running-proofs` — ดูหลักฐานทั้งหมด

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| page | number | 1 |
| limit | number | 10 |
| userId | number | - |

---

#### `GET /running-proofs/:id` — ดูหลักฐานพร้อมรายละเอียด

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

---

### 3.10 Running Results

#### `POST /running-results` — ส่งผลวิ่ง (เชื่อม Proof กับ Registration)

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| registrationId | number | ✅ | การสมัครที่ต้องการยื่นผล |
| runningProofId | number | ✅ | หลักฐานการวิ่ง |

**Response:**
```json
{
  "id": 1,
  "registrationId": 1,
  "runningProofId": 1,
  "status": "pending",
  "runningProofs": { "distance": 5.2, "duration": "00:30:00" },
  "registrations": { "packages": { "targetDistance": 5.0 } }
}
```

**ระบบตรวจ Pace อัตโนมัติ:**
- คำนวณ pace = duration / distance
- ถ้า pace < 2:50 นาที/km (เร็วกว่าสถิติโลก) → **auto-reject**
- Response จะมี `warning: "Auto-rejected: pace faster than world record (< 2:50 min/km)"`

---

#### `GET /running-results/my` — ดูผลวิ่งของตัวเอง

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

---

#### `GET /running-results` — ดูผลวิ่งทั้งหมด

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| page | number | 1 |
| limit | number | 10 |
| registrationId | number | - |
| status | string | - |
| eventId | number | - |

---

#### `PATCH /running-results/:id/review` — ตรวจผลวิ่ง (Staff/Organizer)

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Query Parameters:**

| Param | Type | Required |
|-------|------|----------|
| staffId | number | ✅ |

**Request Body:**

| Field | Type | Required | ค่าที่รับ |
|-------|------|----------|----------|
| status | string | ✅ | `approved` หรือ `rejected` |

---

### 3.11 Shipments

#### `POST /shipments` — สร้าง Shipment

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| registrationId | number | ✅ | |
| items | array | ❌ | ถ้าไม่ส่ง จะ auto-สร้างจาก package_items |

**items format:**
```json
[
  {
    "itemId": 1,
    "itemVariantId": 3,
    "quantity": 1,
    "packageItemId": 1
  }
]
```

**เงื่อนไข:** ตรวจ stock ก่อนสร้าง ถ้า stock ไม่พอจะได้ 400

---

#### `POST /shipments/batch` — สร้าง Shipment หลายรายการ

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**
```json
{
  "registrationIds": [1, 2, 3, 4, 5]
}
```

**Response:** Array ของผลลัพธ์แต่ละ registration
```json
[
  { "registrationId": 1, "shipment": { ... }, "success": true },
  { "registrationId": 2, "error": "Insufficient stock", "success": false }
]
```

---

#### `GET /shipments` — ดู Shipment ทั้งหมด

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| page | number | 1 |
| limit | number | 10 |
| registrationId | number | - |
| status | string | - |
| eventId | number | - |

---

#### `GET /shipments/:id` — ดู Shipment พร้อมรายละเอียด

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

---

#### `PATCH /shipments/:id` — อัปเดต Status ของ Shipment

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required | ค่าที่รับ |
|-------|------|----------|----------|
| status | string | ✅ | pending, preparing, shipped, delivered, cancelled |

**เงื่อนไข:**
- เปลี่ยนเป็น `preparing` → set preparedAt
- เปลี่ยนเป็น `shipped` → **ตรวจ stock + สร้าง stock_out อัตโนมัติ**

---

#### `PATCH /shipments/:id/confirm-delivery` — ยืนยันรับของ (User)

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

**เงื่อนไข:** ต้องเป็นเจ้าของ registration, status ต้องเป็น `shipped` → เปลี่ยนเป็น `delivered`

---

#### `POST /shipments/adjustments` — สร้างการปรับแก้ Shipment

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Query: `?staffId=N`**

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| shipmentId | number | ✅ |
| itemId | number | ✅ |
| itemVariantId | number | ❌ |
| quantity | number | ✅ |
| adjustmentType | string | ✅ |
| reason | string | ❌ |

adjustmentType: `add`, `remove`, `replace`

---

#### `POST /shipments/staff` — มอบหมาย Staff ให้ Shipment

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| shipmentId | number | ✅ |
| eventStaffId | number | ✅ |
| trackingNumber | string | ❌ |

---

#### `PATCH /shipments/staff/:id` — อัปเดต Staff ของ Shipment

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| trackingNumber | string | ❌ | |
| shipped | boolean | ❌ | true → set shippedAt |
| confirmed | boolean | ❌ | true → set confirmedAt |

---

#### `GET /shipments/:id/adjustments` — ดูรายการปรับแก้

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

---

#### `GET /shipments/:id/staff` — ดู Staff ที่ดูแล Shipment

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

---

### 3.12 Stock

ทุก endpoint ต้อง Auth: Firebase, Role: ORGANIZER หรือ ADMIN

#### `POST /stock/in` — บันทึก Stock เข้า

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| itemId | number | ✅ |
| itemVariantId | number | ❌ |
| quantity | number | ✅ |
| note | string | ❌ |

---

#### `GET /stock/in` — ดูรายการ Stock เข้า

**Query:** page, limit, itemId, itemVariantId

---

#### `POST /stock/out` — บันทึก Stock ออก

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| shipmentItemId | number | ✅ |
| quantity | number | ✅ |

---

#### `GET /stock/out` — ดูรายการ Stock ออก

**Query:** page, limit, itemId, itemVariantId

---

#### `GET /stock/summary/:itemId` — ดูยอด Stock คงเหลือ

**Query:** `?itemVariantId=N` (optional)

**Response:**
```json
{
  "itemId": 1,
  "itemVariantId": 3,
  "totalIn": 100,
  "totalOut": 25,
  "balance": 75
}
```

---

### 3.13 Payouts

#### `POST /payouts` — สร้าง Payout (Admin)

| | |
|---|---|
| Auth | AdminJWT |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| eventId | number | ✅ | |
| organizerId | number | ✅ | |
| totalAmount | number | ❌ | ถ้าไม่ส่ง/ส่ง 0 จะคำนวณอัตโนมัติจากยอดสมัคร |

**เงื่อนไข:**
- ทุก registration ที่ confirmed ต้องมี shipment
- ทุก shipment ต้อง status `delivered`
- ถ้าไม่ครบจะได้ 400

**ระบบคำนวณอัตโนมัติ:**
- `totalAmount` = ผลรวม priceSnapshot ของทุก confirmed registration
- `commissionAmount` = totalAmount * commissionRate / 100 (ดึงจาก SystemSettings)
- `netAmount` = totalAmount - commissionAmount

---

#### `GET /payouts/my` — ดู Payout ของตัวเอง (Organizer)

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER |

---

#### `GET /payouts` — ดู Payout ทั้งหมด (Admin)

| | |
|---|---|
| Auth | AdminJWT |

**Query:** page, limit, eventId, organizerId, status

---

#### `GET /payouts/:id` — ดู Payout ตาม ID

| | |
|---|---|
| Auth | Firebase |
| Role | ORGANIZER, ADMIN |

---

#### `PATCH /payouts/:id/confirm` — ยืนยัน/ปฏิเสธ Payout (Admin)

| | |
|---|---|
| Auth | AdminJWT |

**Request Body:**

| Field | Type | Required | ค่าที่รับ |
|-------|------|----------|----------|
| status | string | ❌ | `confirmed` หรือ `rejected` |

---

### 3.14 Organizer Applications

#### `POST /organizer-applications` — สมัครเป็น Organizer

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| documentProofUrl | string | ❌ | URL เอกสารยืนยัน |
| contactInfo | string | ❌ | ข้อมูลติดต่อ |

**เงื่อนไข:** ห้ามมี application ที่ status `pending` อยู่แล้ว

---

#### `GET /organizer-applications/my` — ดูใบสมัครของตัวเอง

| | |
|---|---|
| Auth | Firebase |
| Role | ทุก role |

---

#### `GET /organizer-applications` — ดูใบสมัครทั้งหมด (Admin)

| | |
|---|---|
| Auth | AdminJWT |

**Query:** page, limit, status (pending/approved/rejected)

---

#### `GET /organizer-applications/:id` — ดูใบสมัครตาม ID (Admin)

| | |
|---|---|
| Auth | AdminJWT |

---

#### `PATCH /organizer-applications/:id/review` — ตรวจใบสมัคร (Admin)

| | |
|---|---|
| Auth | AdminJWT |

**Request Body:**

| Field | Type | Required | ค่าที่รับ |
|-------|------|----------|----------|
| status | string | ✅ | `approved` หรือ `rejected` |

**หมายเหตุ:** ถ้า approved → เปลี่ยน user role เป็น `ORGANIZER` + set `isOrganizerVerified: true` อัตโนมัติ

---

### 3.15 System Settings

ทุก endpoint ต้อง Auth: AdminJWT

#### `GET /system-settings` — ดูการตั้งค่าระบบ

**Response:**
```json
{
  "promptpay_id": "0812345678",
  "promptpay_name": "Virtual Run",
  "commission_rate": "10"
}
```

---

#### `PATCH /system-settings` — อัปเดตการตั้งค่า

**Request Body:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| promptpayId | string | ❌ | เลขบัญชี PromptPay |
| promptpayName | string | ❌ | ชื่อบัญชี |
| commissionRate | number | ❌ | 0-100 (%) |

---

### 3.16 Files

#### Upload Endpoints

ทุก upload ต้อง Auth: Firebase, Role: ORGANIZER, ADMIN
ส่งแบบ `multipart/form-data`

| Endpoint | Field ใน Form | ข้อมูลเพิ่มใน Form | ขนาดสูงสุด |
|----------|---------------|---------------------|-----------|
| `POST /files/upload/events/cover` | `file` (1 ไฟล์) | `eventId` | 10 MB |
| `POST /files/upload/events/details` | `files` (สูงสุด 10 ไฟล์) | `eventId` | 10 MB ต่อไฟล์ |
| `POST /files/upload/packages` | `file` (1 ไฟล์) | `packageId` | 10 MB |
| `POST /files/upload/items` | `file` (1 ไฟล์) | `itemId` | 10 MB |

**ไฟล์ที่รับ:** jpg, jpeg, png, gif, webp เท่านั้น

**Response ตัวอย่าง:**
```json
{
  "path": "events/cover-1-1709876543.jpg",
  "thumbnailPath": "events/cover-1-1709876543-thumb.jpg"
}
```

**การ resize อัตโนมัติ:**
- Event cover: สูงสุด 1920x1080, JPEG 80%
- Event details: สูงสุด 1920x1080, JPEG 80%
- Package/Item: สูงสุด 800x800
- Thumbnail: 300x300 ทุกประเภท

---

#### Serve Endpoints (ดูรูป)

ทุก endpoint เป็น Public

| Endpoint | หมายเหตุ |
|----------|----------|
| `GET /files/events/:fileId` | เช่น `/files/events/cover-1-1709876543.jpg` |
| `GET /files/packages/:fileId` | |
| `GET /files/items/:fileId` | |

---

### 3.17 Geography

ทุก endpoint เป็น Public

#### `GET /geographies` — ดูภูมิภาค

**Response:**
```json
[
  { "id": 1, "name": "ภาคเหนือ" },
  { "id": 2, "name": "ภาคกลาง" }
]
```

---

#### `GET /provinces` — ดูจังหวัด

**Query:** `?geographyId=1`

```json
[
  { "id": 1, "nameTh": "กรุงเทพมหานคร", "nameEn": "Bangkok", "geographyId": 2 }
]
```

---

#### `GET /districts` — ดูอำเภอ/เขต

**Query:** `?provinceId=1`

```json
[
  { "id": 1, "nameTh": "พระนคร", "nameEn": "Phra Nakhon", "provinceId": 1 }
]
```

---

#### `GET /sub-districts` — ดูตำบล/แขวง

**Query:** `?districtId=1`

```json
[
  { "id": 1, "nameTh": "พระบรมมหาราชวัง", "nameEn": "Phra Borom...", "postalCode": "10200", "districtId": 1 }
]
```

---

## 4. Error Codes

| Status | ความหมาย | ตัวอย่าง |
|--------|----------|----------|
| **400** | ข้อมูลไม่ถูกต้อง / Validation Error | `{ "statusCode": 400, "message": ["price must be a number"], "error": "Bad Request" }` |
| **401** | ไม่มี Token / Token ไม่ถูกต้อง / Token หมดอายุ | `{ "statusCode": 401, "message": "Invalid Firebase ID token" }` |
| **403** | ไม่มีสิทธิ์เข้าถึง (role ไม่ตรง) | `{ "statusCode": 403, "message": "Forbidden resource" }` |
| **404** | ไม่พบข้อมูล | `{ "statusCode": 404, "message": "User not found" }` |
| **409** | ข้อมูลซ้ำ | `{ "statusCode": 409, "message": "Username already taken" }` |
| **500** | Server Error | `{ "statusCode": 500, "message": "Internal server error" }` |

### Validation Error Response (400)

```json
{
  "statusCode": 400,
  "message": [
    "idToken should not be empty",
    "idToken must be a string",
    "username should not be empty"
  ],
  "error": "Bad Request"
}
```

**หมายเหตุ:** Backend ใช้ `whitelist: true` + `forbidNonWhitelisted: true` ดังนั้นถ้าส่ง field ที่ไม่ได้ประกาศใน DTO จะได้ error 400

---

## 5. Business Rules สำคัญ

### 5.1 Event Approval Flow

```
draft → pending_approval → approved
                         → rejected
```

- Organizer สร้าง Event → status = `draft`
- Organizer กด Submit → `PATCH /events/:id/submit` → status = `pending_approval`
- Admin อนุมัติ → `PATCH /events/:id/approve` → status = `approved`
- Admin ปฏิเสธ → `PATCH /events/:id/reject` → status = `rejected`
- **User สมัครได้เฉพาะ Event ที่ status = `approved` และอยู่ในช่วงวันจัดงาน**

### 5.2 Registration + Payment Flow

```
สมัคร Event (เลือก Package)
    ↓
paymentStatus = "pending"
    ↓
สร้าง QR Code (GET /payments/qr/:registrationId)
    ↓
ส่งสลิป (POST /payments/:registrationId/submit-slip)
    ↓
paymentStatus = "pending_verification"
    ↓
Admin ตรวจสลิป (PATCH /payments/:registrationId/verify-slip)
    ↓
paymentStatus = "confirmed" ✓ หรือ "rejected" ✗
```

**สิ่งที่ระบบ snapshot ตอนสมัคร:**
- `priceSnapshot` — ราคา ณ ตอนสมัคร
- `targetDistanceSnapshot` — ระยะทางเป้าหมาย ณ ตอนสมัคร

### 5.3 Running Proof + Auto-check Pace

```
ส่งหลักฐาน (POST /running-proofs)
    ↓
เชื่อมกับ Registration (POST /running-results)
    ↓
ระบบตรวจ Pace อัตโนมัติ:
  pace = duration / distance
  ถ้า pace < 2:50 min/km → auto-reject ❌
  ถ้า pace >= 2:50 min/km → status = "pending"
    ↓
Staff/Organizer ตรวจ (PATCH /running-results/:id/review)
    ↓
status = "approved" ✓ หรือ "rejected" ✗
```

**เกณฑ์ Anti-cheat:**
- Pace < 170 วินาที/km (2 นาที 50 วินาที) = เร็วกว่าสถิติโลก → reject อัตโนมัติ
- Response จะมี field `warning` แจ้งเหตุผล

### 5.4 Shipment Flow

```
สร้าง Shipment (POST /shipments)
    ↓ (ตรวจ stock อัตโนมัติ)
status = "pending"
    ↓
เตรียมของ → PATCH status = "preparing" (set preparedAt)
    ↓
จัดส่ง → PATCH status = "shipped"
    ↓ (สร้าง stock_out อัตโนมัติ ← สำคัญ!)
    ↓
User ยืนยันรับของ → PATCH /shipments/:id/confirm-delivery
    ↓
status = "delivered"
```

**สิ่งที่ต้องรู้:**
- สร้าง Shipment ไม่ส่ง items → ระบบ auto-สร้างจาก package_items + variant ที่ user เลือก
- เปลี่ยนเป็น `shipped` → ระบบ **ตัด stock อัตโนมัติ** (สร้าง stock_out records)
- ก่อนสร้าง Shipment ระบบตรวจ stock ว่าเพียงพอหรือไม่

### 5.5 Payout Calculation

```
Admin สร้าง Payout (POST /payouts)
    ↓
ตรวจเงื่อนไข:
  ✓ ทุก confirmed registration มี shipment
  ✓ ทุก shipment status = "delivered"
    ↓
คำนวณอัตโนมัติ:
  totalAmount = SUM(priceSnapshot) ของทุก confirmed registration
  commissionRate = ดึงจาก SystemSettings (default 10%)
  commissionAmount = totalAmount × commissionRate / 100
  netAmount = totalAmount − commissionAmount
    ↓
status = "pending"
    ↓
Admin ยืนยัน → PATCH /payouts/:id/confirm { status: "confirmed" }
    ↓
status = "confirmed" + set confirmedAt
```

### 5.6 Organizer Application Flow

```
User สมัครเป็น Organizer (POST /organizer-applications)
    ↓
status = "pending"
    ↓
Admin ตรวจ (PATCH /organizer-applications/:id/review)
    ↓
ถ้า approved:
  ✓ เปลี่ยน user role → ORGANIZER
  ✓ set isOrganizerVerified = true
ถ้า rejected:
  ✗ user ยังเป็น USER
```

---

## 6. .env.local ที่ Frontend ต้องมี

```env
# API URL ของ Backend
NEXT_PUBLIC_API_URL=https://virtual-run-production.up.railway.app/api/v1

# ถ้าจะใช้ Mock Data แทน API จริง (สำหรับ dev)
NEXT_PUBLIC_USE_MOCK=false

# Firebase Config (จาก Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

| ตัวแปร | คำอธิบาย |
|--------|----------|
| `NEXT_PUBLIC_API_URL` | URL ของ Backend API (ต้องลงท้ายด้วย `/api/v1`) |
| `NEXT_PUBLIC_USE_MOCK` | `true` = ใช้ mock data ไม่เรียก API จริง, `false` = เรียก API จริง |
| `NEXT_PUBLIC_FIREBASE_*` | ค่า config จาก Firebase Console สำหรับ Firebase Auth |

---

## 7. ตัวอย่าง curl

### 7.1 Register (ลงทะเบียน)

```bash
curl -X POST https://virtual-run-production.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<firebase-id-token>",
    "username": "john_runner",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "0812345678"
  }'
```

### 7.2 Login (ล็อกอิน)

```bash
curl -X POST https://virtual-run-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<firebase-id-token>"
  }'
```

### 7.3 Admin Login

```bash
curl -X POST https://virtual-run-production.up.railway.app/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-admin-password"
  }'
```

### 7.4 สร้าง Event (Organizer)

```bash
curl -X POST https://virtual-run-production.up.railway.app/api/v1/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase-id-token>" \
  -d '{
    "title": "Virtual Run Bangkok 2025",
    "description": "งานวิ่ง Virtual Run ครั้งแรก",
    "startDate": "2025-07-01T00:00:00.000Z",
    "endDate": "2025-07-31T23:59:59.000Z"
  }'
```

### 7.5 สมัคร Event (User)

```bash
curl -X POST https://virtual-run-production.up.railway.app/api/v1/registrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase-id-token>" \
  -d '{
    "packageId": 1,
    "addressDetail": "123 ถนนสุขุมวิท แขวงคลองเตย",
    "subDistrictId": 100101,
    "itemVariants": [
      { "itemId": 1, "itemVariantId": 3 }
    ]
  }'
```

### 7.6 ส่งผลวิ่ง (User)

**ขั้นตอน 1: ส่งหลักฐาน**
```bash
curl -X POST https://virtual-run-production.up.railway.app/api/v1/running-proofs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase-id-token>" \
  -d '{
    "imageUrl": "https://example.com/my-run-screenshot.jpg",
    "distance": 5.2,
    "duration": "00:32:15"
  }'
```

**ขั้นตอน 2: เชื่อมกับ Registration**
```bash
curl -X POST https://virtual-run-production.up.railway.app/api/v1/running-results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase-id-token>" \
  -d '{
    "registrationId": 1,
    "runningProofId": 1
  }'
```

### 7.7 สร้าง QR Code PromptPay

```bash
curl -X GET https://virtual-run-production.up.railway.app/api/v1/payments/qr/1 \
  -H "Authorization: Bearer <firebase-id-token>"
```

### 7.8 ส่งสลิปชำระเงิน

```bash
curl -X POST https://virtual-run-production.up.railway.app/api/v1/payments/1/submit-slip \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase-id-token>" \
  -d '{
    "slipUrl": "https://example.com/my-payment-slip.jpg"
  }'
```

### 7.9 Upload รูป Event Cover (multipart)

```bash
curl -X POST https://virtual-run-production.up.railway.app/api/v1/files/upload/events/cover \
  -H "Authorization: Bearer <firebase-id-token>" \
  -F "file=@/path/to/cover.jpg" \
  -F "eventId=1"
```

### 7.10 ดู Event ทั้งหมด (Public)

```bash
curl "https://virtual-run-production.up.railway.app/api/v1/events?page=1&limit=10&status=approved"
```

---

> เอกสารนี้สร้างอัตโนมัติจากการอ่าน Backend source code ทั้งหมด
> อัปเดตล่าสุด: 2026-03-03
