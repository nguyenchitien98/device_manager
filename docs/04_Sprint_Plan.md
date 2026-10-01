# POS Management System — Lộ Trình Sprint Chi Tiết (Sprint Plan)

Tài liệu này là chỉ mục lộ trình 15 Sprint của dự án POS Management. Mỗi Sprint được thiết kế để học được một hoặc nhiều kỹ thuật banking-grade quan trọng, với đầy đủ: Backend Java, Frontend Angular, Database, và Test.

> 📌 **Nguyên tắc:** Kết thúc mỗi Sprint → Hệ thống phải compile, pass tests, chạy được qua Docker Compose.

---

## 🗺️ Tổng Quan Roadmap

| Phase | Sprint | Chủ Đề | Kỹ Thuật Học Được |
|---|---|---|---|
| **Phase 0** | Sprint 00 | Foundation & Infrastructure | Docker, Kafka, Redis, PostgreSQL, Maven, Angular setup |
| **Phase 1** | Sprint 01 | Auth, RBAC & Admin Layout | JWT, Refresh Token, RBAC, Data Scope, Angular Material |
| **Phase 2** | Sprint 02 | Catalog & Organization | Master Data CRUD, Hierarchical data, Search/Filter/Pagination |
| **Phase 3** | Sprint 03 | Inventory — Nhập Kho | Purchase Order, Stock Ledger, Outbox Pattern, Flyway |
| **Phase 4** | Sprint 04 | Inventory — Xuất/Điều Chuyển | Approval Workflow basics, State Machine |
| **Phase 5** | Sprint 05 | Merchant & TID | Merchant Lifecycle, Effective Dating, Fee Policy, Multi-TID |
| **Phase 6** | Sprint 06 | Device Lifecycle | Device FSM, Lifecycle History, Device Detail 8 Tabs |
| **Phase 7** | Sprint 07 | Repair Management | Repair Order, State transition, Disposition |
| **Phase 8** | Sprint 08 | Assignment & Concurrency | Optimistic Lock, Idempotency, Concurrent Assignment |
| **Phase 9** | Sprint 09 | Return & Transfer | Assignment Lifecycle, Atomic Transfer, History |
| **Phase 10** | Sprint 10 | Approval Workflow Engine | Maker-Checker, Multi-level, Kafka Notify |
| **Phase 11** | Sprint 11 | Notification & Events | Kafka Consumer, Idempotent Consumer, In-App Notification |
| **Phase 12** | Sprint 12 | Outbox & Kafka Hardening | Transactional Outbox, DLT, Event Ordering, Monitoring |
| **Phase 13** | Sprint 13 | Dashboard & Monitoring | KPI Dashboard, POS Monitor, ApexCharts |
| **Phase 14** | Sprint 14 | Audit Log & Reports | Immutable Audit, AOP, Export, CQRS Read Model |
| **Phase 15** | Sprint 15 | Hardening & Production | Redis Cache, OpenAPI, Prometheus, Load Test |

---

## 🏗️ Phase 0: Foundation

### Sprint 00: Infrastructure Setup
**Trạng thái:** `[ ]` Chưa bắt đầu
**Kỹ thuật học:** Docker Compose, Kafka, Redis, PostgreSQL, Maven multi-module, Angular 22 Standalone

**Mục tiêu:** Dựng toàn bộ hạ tầng local, khởi tạo cấu trúc dự án.

**Backend Checklist:**
- `[ ]` Tạo thư mục monorepo `pos-management/`
  ```
  pos-management/
  ├── backend/              # Java Spring Boot (Maven multi-module)
  │   ├── pos-gateway/      # Spring Boot API Gateway (port 8080)
  │   ├── pos-core/         # Core Spring Boot app
  │   └── pos-common/       # Shared library (ApiResponse, Exceptions)
  ├── frontend/             # Angular 22 Web Admin
  ├── infrastructure/       # Docker, k8s configs
  └── docs/                 # Tài liệu dự án
  ```
- `[ ]` `docker-compose.yml` khởi chạy:
  - PostgreSQL 16 (port 5432, db: `pos_db`)
  - Redis 7 (port 6379)
  - Apache Kafka + KRaft (port 9092)
  - Kafka UI (port 8090)
  - Prometheus (port 9090)
  - Grafana (port 3000)
  - Jaeger (port 16686)
- `[ ]` Maven multi-module `pom.xml` với dependency management
- `[ ]` `pos-common`: `ApiResponse<T>`, `ApiErrorResponse`, `GlobalExceptionHandler`
- `[ ]` `pos-gateway`: Spring Boot App với `@SpringBootApplication`
- `[ ]` `pos-core`: Spring Boot App với Flyway enabled
- `[ ]` Health check: `GET /api/v1/health`
- `[ ]` Flyway V1: `V1__init_base_schema.sql` — tạo extension `uuid-ossp`, function `gen_random_uuid()`

**Frontend Checklist:**
- `[ ]` Khởi tạo Angular 22 project (Standalone Components, SCSS)
- `[ ]` Install Angular Material, NgRx, ApexCharts
- `[ ]` `environment.ts` với API base URL
- `[ ]` Compile clean `ng build` — 0 errors

**Kết quả bàn giao:**
```
docker-compose up → Tất cả 7 services UP ✅
mvn compile → 0 errors ✅
ng build → 0 errors ✅
GET http://localhost:8080/api/v1/health → 200 OK ✅
```

---

## 🔐 Phase 1: Auth & RBAC

### Sprint 01: Authentication, RBAC & Admin Layout
**Trạng thái:** `[ ]` Chưa bắt đầu
**Kỹ thuật học:** Spring Security 6, JWT, Refresh Token Rotation, RBAC, Data Scope, Angular Material Sidebar

**Checklist Backend:**
- `[ ]` Flyway V2: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `refresh_tokens`
- `[ ]` Seed data: 9 roles mặc định + user `admin@pos.vn` / `Admin@123` (SUPER_ADMIN)
- `[ ]` Domain: `User`, `Role`, `Permission` với Spring Security UserDetails
- `[ ]` JWT generation: Access Token 15m (RS256/HS256), Refresh Token 7d
- `[ ]` Refresh Token Rotation: lưu Redis + DB, vô hiệu hóa token cũ khi refresh
- `[ ]` Rate limit login: max 5 lần/phút/IP, Account Lock 30 phút sau 5 sai liên tiếp
- `[ ]` `JwtAuthenticationFilter` — validate token mọi request
- `[ ]` `@PreAuthorize` cơ bản cho admin endpoints
- `[ ]` **Data Scope Service:** Inject `businessUnitId` vào mọi query list
- `[ ]` APIs: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`
- `[ ]` APIs: `GET /api/v1/admin/users`, `POST /api/v1/admin/users`, `PATCH /api/v1/admin/users/{id}/lock`
- `[ ]` APIs: `GET /api/v1/admin/roles`, `POST /api/v1/admin/roles`, `PUT /api/v1/admin/roles/{id}/permissions`
- `[ ]` Audit log: LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, USER_CREATED, USER_LOCKED

**Checklist Frontend:**
- `[ ]` **Login Page** (`login.page.ts/html/scss`):
  - Form đăng nhập username/password
  - Hiển thị lỗi rõ ràng (sai pass / tài khoản khóa)
  - Loading state khi submit
  - Design: Dark theme, logo POS, gradient background
- `[ ]` **Auth Service** (`auth.service.ts`): login(), logout(), refreshToken(), currentUser Signal
- `[ ]` **Token Service** (`token.service.ts`): lưu/đọc token từ localStorage
- `[ ]` **JWT Interceptor** (`jwt.interceptor.ts`): tự động gắn `Authorization: Bearer {token}`
- `[ ]` **Error Interceptor** (`error.interceptor.ts`): 401 → redirect login, 403 → show error
- `[ ]` **Auth Guard** (`auth.guard.ts`): redirect về login nếu chưa đăng nhập
- `[ ]` **Permission Guard** (`permission.guard.ts`): kiểm tra role trước khi vào route
- `[ ]` **Main Layout** (`main-layout.component.ts/html/scss`):
  - Sidebar navigation (collapsible)
  - Top header: user avatar, role badge, notifications bell, logout
  - Responsive layout
- `[ ]` **Sidebar** với đầy đủ menu items (theo phân quyền):
  - TỔNG QUAN: Dashboard
  - QUẢN LÝ DANH MỤC: Danh mục, Loại, Model, Vendor, MCC, Đơn vị kinh doanh, Chính sách phí, Kho
  - QUẢN LÝ KHO: Nhập kho, Xuất kho, Tồn kho, Điều chuyển kho
  - QUẢN LÝ MERCHANT: Merchant, TID
  - QUẢN LÝ THIẾT BỊ: Tra cứu thiết bị
  - QUẢN LÝ ASSIGNMENT: Assignment, Lịch sử
  - QUY TRÌNH NGHIỆP VỤ: Hộp việc cần duyệt (badge), Tất cả yêu cầu, Yêu cầu tôi tạo, Lịch sử phê duyệt
  - BÁO CÁO & HỆ THỐNG: Báo cáo, Giám sát POS, Audit Log, Quản trị (User, Role)
- `[ ]` **Admin — User Management Page**: Bảng danh sách user, tạo user, khóa/mở khóa
- `[ ]` **Admin — Role Management Page**: Danh sách role, gán permission checkbox matrix

**Kỹ thuật phỏng vấn cần giải thích:**
- JWT stateless vs Session stateful — ưu/nhược điểm?
- Refresh Token Rotation là gì? Tại sao cần?
- RBAC vs ABAC — khi nào dùng cái nào?
- Data Scope: làm sao filter dữ liệu theo Business Unit mà không ảnh hưởng performance?

**Kết quả bàn giao:**
```
POST /api/v1/auth/login → 200 OK {accessToken, refreshToken} ✅
POST /api/v1/auth/login (sai 5 lần) → 429 Account Locked ✅
POST /api/v1/auth/refresh → 200 OK {newAccessToken, newRefreshToken} ✅
Angular Login → nhập đúng → redirect Dashboard ✅
Angular Sidebar hiển thị menu theo role ✅
Maven & Angular Build 100% SUCCESS ✅
```

---

## 📂 Phase 2: Catalog & Organization

### Sprint 02: Catalog Management & Organization
**Trạng thái:** `[ ]` Chưa bắt đầu
**Kỹ thuật học:** Master Data management, Hierarchical relationships, Server-side Pagination, Flyway seeding

**Checklist Backend:**
- `[ ]` Flyway V3: `device_categories`, `device_types`, `device_models`, `vendors`, `mcc_codes`, `fee_policies`
- `[ ]` Flyway V4: `business_units`, `warehouses`
- `[ ]` Flyway V2 seed: Dữ liệu mẫu đầy đủ
- `[ ]` CRUD APIs với server-side pagination: Device Category, Device Type, Device Model, Vendor
- `[ ]` CRUD APIs: MCC (search by code/name), Fee Policy (với effective dating)
- `[ ]` CRUD APIs: Business Unit, Warehouse
- `[ ]` Validate hierarchy: Model → Type → Category (không orphan)
- `[ ]` Soft delete: deactivate thay vì xóa khi có dữ liệu liên quan
- `[ ]` @PreAuthorize theo role cho từng endpoint

**Checklist Frontend:**
- `[ ]` **Danh mục thiết bị (Device Category):** Bảng + Add/Edit Dialog + Deactivate
- `[ ]` **Loại thiết bị (Device Type):** Bảng + filter theo Category + Dialog
- `[ ]` **Model thiết bị (Device Model):** Bảng + filter theo Type + Dialog (gắn Vendor)
- `[ ]` **Nhà cung cấp (Vendor):** Bảng + Dialog + status toggle
- `[ ]` **MCC:** Bảng + search + Dialog
- `[ ]` **Chính sách phí (Fee Policy):** Bảng + Dialog với date picker cho effective dating
- `[ ]` **Đơn vị kinh doanh (Business Unit):** Bảng + Dialog
- `[ ]` **Kho (Warehouse):** Bảng + filter theo Business Unit + Dialog
- `[ ]` Reusable `DataTableComponent` với: server-side sort, filter, pagination, loading state
- `[ ]` Reusable `ConfirmDialogComponent` cho xóa/deactivate

**Kết quả bàn giao:**
```
CRUD tất cả catalog items ✅
Server-side pagination hoạt động ✅
Angular Build 100% SUCCESS ✅
```

---

## 📦 Phase 3: Inventory — Nhập Kho

### Sprint 03: Purchase Order & Stock Import
**Trạng thái:** `[ ]` Chưa bắt đầu
**Kỹ thuật học:** Purchase Order lifecycle, Stock Ledger (append-only), Transactional Outbox (lần đầu), Flyway migration cho large schema

**Checklist Backend:**
- `[ ]` Flyway V5: `purchase_orders`, `purchase_order_items`, `devices`, `stock_transactions`, `stock_export_requests`, `stock_export_items`, `stock_transfer_requests`, `stock_transfer_items`
- `[ ]` (V10 sẽ được tạo ở Sprint 11: `outbox_events`)
- `[ ]` Purchase Order Lifecycle: DRAFT → SUBMITTED → APPROVED → RECEIVED → CLOSED
- `[ ]` Stock Ledger: `stock_transactions` table — IMPORT type, không xóa/sửa
- `[ ]` Nhập kho: tạo Device record mỗi serial + ghi IMPORT vào stock_transactions + ghi Outbox
- `[ ]` Unique constraint: `serial_number` trong `devices`
- `[ ]` Tích hợp Outbox Pattern lần đầu: `DeviceReceivedEvent`
- `[ ]` API: Purchase Order CRUD + lifecycle transitions
- `[ ]` API: `POST /api/v1/inventory/imports` (nhập kho từ PO)
- `[ ]` API: `GET /api/v1/inventory/stock` (tổng hợp tồn kho)
- `[ ]` API: `GET /api/v1/inventory/transactions` (lịch sử Stock Ledger)

**Checklist Frontend:**
- `[ ]` **Purchase Order — Danh sách:** Bảng + filter status/vendor/date + status badge
- `[ ]` **Purchase Order — Tạo mới:** Multi-step form (chọn Vendor, thêm items, xem tổng)
- `[ ]` **Purchase Order — Chi tiết:** Thông tin + items table + timeline trạng thái + action buttons
- `[ ]` **Nhập kho:** Form liên kết PO, nhập/upload danh sách serial, preview trước khi submit
- `[ ]` **Tồn kho (Stock Overview):** Cards KPI + bảng tồn kho theo kho/model, drilldown chi tiết

**Kỹ thuật phỏng vấn:**
- Tại sao Stock Ledger không UPDATE/DELETE? Ảnh hưởng thế nào đến thiết kế?
- Outbox Pattern giải quyết bài toán gì?

**Kết quả bàn giao:**
```
Tạo PO → Nhập 50 thiết bị → Stock Ledger ghi 50 IMPORT rows ✅
Duplicate serial → 409 Conflict ✅
Outbox event PENDING → Kafka publish → SENT ✅
Maven & Angular Build 100% SUCCESS ✅
```

---

## 📤 Phase 4: Inventory — Xuất Kho & Điều Chuyển

### Sprint 04: Stock Export, Transfer & Basic Approval
**Trạng thái:** `[ ]` Chưa bắt đầu
**Kỹ thuật học:** Approval Workflow basic, Device State Machine lần đầu (INSTOCK → OUT_OF_WAREHOUSE)

**Checklist Backend:**
> 📌 **Lưu ý Flyway:** `stock_export_requests` và `stock_transfer_requests` đã được định nghĩa trong `V5__create_inventory_tables.sql` từ Sprint 03. Sprint 04 implement business logic sử dụng các bảng này.
- `[ ]` Flyway V9 (partial, toàn bộ sẽ hoàn thành Sprint 10): `approval_requests` (basic structure)
- `[ ]` Approval basic: DRAFT → PENDING_APPROVAL → APPROVED/REJECTED → EXECUTING → COMPLETED
- `[ ]` Xuất kho flow: Tạo phiếu → Submit → Chờ duyệt → Thực hiện xuất (Device → OUT_OF_WAREHOUSE)
- `[ ]` Điều chuyển flow: Tạo phiếu → Submit → Chờ duyệt → Thực hiện chuyển (Device vẫn INSTOCK nhưng đổi warehouse)
- `[ ]` Stock Ledger: EXPORT, TRANSFER transactions
- `[ ]` Device Status State Machine: validate allowed transitions
- `[ ]` Device Lifecycle History: ghi mỗi khi status thay đổi

**Checklist Frontend:**
- `[ ]` **Xuất kho — Tạo phiếu:** Chọn kho, chọn thiết bị (multi-select từ danh sách INSTOCK), đơn vị nhận
- `[ ]` **Xuất kho — Danh sách phiếu:** Bảng + filter status, date
- `[ ]` **Điều chuyển kho — Tạo phiếu:** Chọn kho nguồn, kho đích, danh sách thiết bị
- `[ ]` **Approval Basic — Pending Requests:** Danh sách phiếu chờ mình duyệt
- `[ ]` **Approval Detail:** Xem chi tiết + Approve/Reject buttons + nhập lý do khi Reject

**Kết quả bàn giao:**
```
Xuất kho → phiếu PENDING_APPROVAL → Approve → Device OUT_OF_WAREHOUSE ✅
Reject với lý do → phiếu REJECTED ✅
Stock Ledger ghi EXPORT rows ✅
Maven & Angular Build 100% SUCCESS ✅
```

---

## 🏪 Phase 5: Merchant & TID

### Sprint 05: Merchant Lifecycle & Terminal Management
**Trạng thái:** `[ ]` Chưa bắt đầu
**Kỹ thuật học:** Merchant lifecycle, Effective Dating cho Fee Policy, Multi-TID

**Checklist Backend:**
- `[ ]` Flyway V6: `merchants`, `terminals`, `merchant_status_history`, `terminal_status_history`
- `[ ]` Flyway V11: `merchant_fee_assignments`
- `[ ]` Merchant Lifecycle: PENDING → ACTIVE → INACTIVE → SUSPENDED
- `[ ]` Auto-generate MerchantCode: M + 6 digits (unique)
- `[ ]` Auto-generate TID: T + 6 digits (unique)
- `[ ]` Fee Policy Effective Dating: nhiều policy cho một Merchant, chỉ 1 ACTIVE tại một thời điểm
- `[ ]` Data Scope: Merchant chỉ hiện cho user có Business Unit phù hợp
- `[ ]` APIs: Merchant CRUD + lifecycle transitions + fee policy assignment
- `[ ]` APIs: Terminal CRUD + status management

**Checklist Frontend:**
- `[ ]` **Danh sách Merchant:** Bảng + filter status/MCC/Business Unit + search name/code
- `[ ]` **Tạo Merchant:** Form (auto-gen code, chọn MCC, Business Unit, địa chỉ)
- `[ ]` **Chi tiết Merchant:** 4 tabs: Thông tin | TID | Lịch sử trạng thái | Lịch sử phí
- `[ ]` **Quản lý TID:** Bảng TID của Merchant + tạo TID mới + activate/deactivate

**Kết quả bàn giao:**
```
Tạo Merchant → auto MID → Active ✅
Gắn Fee Policy với effective dating ✅
Tạo 3 TID cho 1 Merchant ✅
Maven & Angular Build 100% SUCCESS ✅
```

---

## 📱 Phase 6: Device Lifecycle

### Sprint 06: Device Search, Detail & Lifecycle State Machine
**Trạng thái:** `[ ]` Chưa bắt đầu
**Kỹ thuật học:** Device FSM full, Device History, 8-tab Detail Page, Redis cache device status

**Checklist Backend:**
- `[ ]` Flyway V7: `device_lifecycle_history` (append-only)
- `[ ]` Device Status State Machine: 6 states + validate transitions via enum
- `[ ]` `DeviceLifecycleHistoryService`: ghi lịch sử mỗi khi status thay đổi
- `[ ]` Redis cache: `device:status:{serial}` (TTL 60s) — evict khi status change
- `[ ]` APIs: `GET /api/v1/devices` (search + filter + paginate), `GET /api/v1/devices/{serial}` (full detail), `GET /api/v1/devices/{serial}/lifecycle`

**Checklist Frontend:**
- `[ ]` **Tra cứu thiết bị (Device Search):** Bảng + filter: serial (search), model, vendor, status, warehouse, merchant + export
- `[ ]` **Chi tiết thiết bị (Device Detail)** — 8 tabs đầy đủ:
  - **Tab 1 — Thông tin chung:** Serial, Model, Vendor, Warehouse hiện tại, Purchase Date, Warranty Expiry, các thông số kỹ thuật
  - **Tab 2 — Trạng thái:** Badge trạng thái hiện tại + Timeline FSM + action buttons (Xuất kho / Thu hồi / Yêu cầu sửa / Thanh lý theo trạng thái)
  - **Tab 3 — Merchant:** Merchant hiện tại, TID, ngày cấp phát, lịch sử merchant
  - **Tab 4 — Lịch sử vòng đời:** Timeline toàn bộ: từ INSTOCK → DEPLOYED → RETURNED → ...
  - **Tab 5 — Lịch sử Assignment:** Mọi lần cấp phát và thu hồi với ngày, Merchant, người thực hiện
  - **Tab 6 — Lịch sử sửa chữa:** Đơn sửa chữa, mô tả lỗi, kết quả nghiệm thu
  - **Tab 7 — Lịch sử kho:** Nhập kho, xuất kho, điều chuyển theo ngày
  - **Tab 8 — Audit Log:** Ai làm gì, lúc nào với thiết bị này

**Kết quả bàn giao:**
```
Search thiết bị theo nhiều tiêu chí ✅
Device Detail 8 tabs hiển thị đầy đủ ✅
State Machine reject invalid transition ✅
Maven & Angular Build 100% SUCCESS ✅
```

---

## 🔧 Phase 7: Repair Management

### Sprint 07: Repair Order & Disposition
**Trạng thái:** `[ ]` Chưa bắt đầu
**Kỹ thuật học:** Repair Order lifecycle, Disposition process, Integration với Device FSM

**Checklist Backend:**
- `[ ]` Flyway V7 (bổ sung): `repair_orders` (thêm vào cùng migration với device_lifecycle_history)
- `[ ]` Repair Order Lifecycle: CREATED → IN_PROGRESS → COMPLETED/FAILED
- `[ ]` Repair complete → Device REPAIRING → INSTOCK (success) hoặc DISPOSED (fail + duyệt thanh lý)
- `[ ]` Thanh lý: INSTOCK → DISPOSED (qua Approval Workflow)
- `[ ]` APIs: `POST /api/v1/devices/{serial}/repair-orders`, `GET`, `POST /{id}/start`, `POST /{id}/complete`, `POST /{id}/fail`
- `[ ]` APIs: `POST /api/v1/devices/{serial}/dispose` — tạo phiếu đề nghị thanh lý (cần approval)

**Checklist Frontend:**
- `[ ]` **Đơn sửa chữa (Repair Order):** Form tạo (mô tả lỗi, vendor sửa), danh sách, form nghiệm thu kết quả
- `[ ]` **Thanh lý thiết bị:** Form đề nghị (lý do, tài sản), workflow duyệt

**Kết quả bàn giao:**
```
RETURNED → tạo Repair Order → complete → INSTOCK ✅
REPAIRING → fail → tạo phiếu thanh lý → duyệt → DISPOSED ✅
Maven & Angular Build 100% SUCCESS ✅
```

---

## 🔗 Phase 8: Assignment & Concurrency

### Sprint 08: Device Assignment với Concurrent Safety
**Trạng thái:** `[ ]` Chưa bắt đầu
**Kỹ thuật học:** Optimistic Lock, Partial Unique Index, Idempotency, Distributed Lock

**Checklist Backend:**
- `[ ]` Flyway V8: `assignments` (với @Version), `assignment_history`
- `[ ]` Partial unique index: `CREATE UNIQUE INDEX idx_one_active_assignment ON assignments(device_id) WHERE status = 'ACTIVE'`
- `[ ]` Optimistic Lock trên `DeviceJpaEntity` (`@Version`) + Retry 3 lần khi OptimisticLockException
- `[ ]` Idempotency Key: `X-Idempotency-Key` header + Redis SETNX
- `[ ]` @Transactional: Tạo Assignment + Update Device → DEPLOYED + ghi Lifecycle History + ghi Outbox
- `[ ]` API: `POST /api/v1/assignments` (idempotent), `GET /api/v1/assignments`, `GET /api/v1/assignments/{id}`, `GET /api/v1/devices/{serial}/assignments`

**Checklist Frontend:**
- `[ ]` **Cấp phát thiết bị (Assignment Create):** Form chọn Serial (search dropdown), Merchant (search), TID (filter theo Merchant), lý do → Confirm Dialog
- `[ ]` **Danh sách Assignment:** Bảng + filter merchant/device/status/date
- `[ ]` **Angular Idempotency Interceptor:** Tự động generate `X-Idempotency-Key: UUID` cho mọi POST/PATCH

**Kỹ thuật phỏng vấn:**
- Optimistic Lock vs Pessimistic Lock — khi nào dùng loại nào trong POS System?
- Idempotency Key hoạt động như thế nào? Redis SETNX là gì?
- Partial Unique Index giải quyết bài toán gì?
- Hai nhân viên cùng assign thiết bị: kịch bản lỗi và cách xử lý từng bước?

**Kết quả bàn giao:**
```
Assign thiết bị thành công ✅
2 request concurrent assign same device → chỉ 1 thành công ✅
Duplicate click → Idempotency trả về cached response ✅
Maven & Angular Build 100% SUCCESS ✅
```

---

## ↩️ Phase 9: Return & Transfer

### Sprint 09: Device Return, Transfer & Assignment History
**Trạng thái:** `[ ]` Chưa bắt đầu

**Checklist Backend:**
- `[ ]` Return device: Assignment → RETURNED, Device → RETURNED, ghi Outbox
- `[ ]` Transfer device: Atomic return từ A + assign cho B trong cùng @Transactional
- `[ ]` Assignment History: append-only, ghi lại mọi thay đổi
- `[ ]` APIs: `POST /api/v1/assignments/{id}/return`, `POST /api/v1/assignments/{id}/transfer`

**Checklist Frontend:**
- `[ ]` **Thu hồi thiết bị:** Modal xác nhận, nhập lý do, chọn người nhận thiết bị
- `[ ]` **Lịch sử Assignment:** Timeline đầy đủ mọi lần assign/return/transfer, filter theo device/merchant

**Kết quả bàn giao:**
```
Return device → Assignment RETURNED → Device RETURNED ✅
Transfer device → atomic: return A, assign B, history ghi đầy đủ ✅
Maven & Angular Build 100% SUCCESS ✅
```

---

## ✅ Phase 10: Approval Workflow Engine

### Sprint 10: Full Approval Workflow & Inbox
**Trạng thái:** `[ ]` Chưa bắt đầu
**Kỹ thuật học:** Maker-Checker Pattern, Saga cơ bản, Kafka Notification trigger

**Checklist Backend:**
- `[ ]` Flyway V9 (hoàn chỉnh): `approval_requests` (full schema), `approval_steps`, `approval_configs`
- `[ ]` Approval States: DRAFT → PENDING_APPROVAL → PENDING_LEVEL_2 → APPROVED → EXECUTING → COMPLETED (và REJECTED, RETURNED_FOR_EDIT, CANCELLED)
- `[ ]` Configurable: 1 cấp hoặc 2 cấp tùy loại request
- `[ ]` Business rule: Người tạo KHÔNG thể duyệt yêu cầu của chính mình
- `[ ]` Optimistic Lock trên `approval_requests` (tránh duyệt trùng)
- `[ ]` Tích hợp với Inventory, Assignment, Device: khi APPROVED → execute business logic
- `[ ]` Kafka event: `approval.submitted` → notify người duyệt
- `[ ]` APIs: `POST /api/v1/approvals/{id}/submit`, `/approve`, `/reject`, `/return-for-edit`, `/cancel`
- `[ ]` APIs: `GET /api/v1/approvals/inbox`, `/my-requests`, `/all` (với filter, pagination)

**Checklist Frontend:**
- `[ ]` **Hộp việc cần duyệt (Inbox):** Cards: Chờ duyệt / Đã duyệt hôm nay / Bị từ chối — Tabs: Tất cả / Xuất kho / Thu hồi / Điều chuyển / Thanh lý — Mỗi item: preview info + actions
- `[ ]` **Chi tiết phiếu phê duyệt:** Timeline approval steps, chi tiết request, form nhập lý do, buttons: Phê duyệt / Từ chối / Yêu cầu bổ sung
- `[ ]` **Yêu cầu tôi đã tạo:** Bảng với status tracking
- `[ ]` **Tất cả yêu cầu (Admin):** Bảng toàn bộ, filter đa chiều
- `[ ]` **Lịch sử phê duyệt:** Timeline ai duyệt gì, lúc nào, lý do
- `[ ]` Badge counter trên Sidebar menu "Hộp việc cần duyệt"

**Kỹ thuật phỏng vấn:**
- Maker-Checker Pattern là gì? Tại sao Banking cần?
- Tại sao cần Optimistic Lock trên approval request?
- Khi approve xong → execute business logic: dùng synchronous call hay Kafka? Trade-off?

**Kết quả bàn giao:**
```
Submit phiếu xuất kho → Inbox của Manager 1 tăng badge ✅
Manager 1 Approve → Inbox của Manager 2 tăng badge ✅
Manager 2 Approve → Tự động execute xuất kho ✅
Người tạo không thể tự duyệt ✅
Maven & Angular Build 100% SUCCESS ✅
```

---

## 🔔 Phase 11: Notification

### Sprint 11: In-App Notification & Idempotent Consumer
**Trạng thái:** `[ ]` Chưa bắt đầu

**Checklist Backend:**
- `[ ]` Flyway V10: `notifications`
- `[ ]` Kafka Consumer: `@KafkaListener` trên `approval.submitted`, `approval.approved`, `approval.rejected`
- `[ ]` Idempotent Consumer: Redis key `consumed_event:{eventId}` (TTL 1 giờ)
- `[ ]` Mock Email sender, Mock Push sender
- `[ ]` APIs: `GET /api/v1/notifications`, `/unread-count`, `PATCH /{id}/read`, `PATCH /read-all`

**Checklist Frontend:**
- `[ ]` **Notification Badge** trên Header (unread count, auto-refresh 30s)
- `[ ]` **Notification Dropdown / Panel:** List thông báo, click → navigate tới phiếu liên quan

---

## ⚡ Phase 12: Kafka Hardening

### Sprint 12: Outbox Hardening, DLT & Monitoring
**Trạng thái:** `[ ]` Chưa bắt đầu

**Checklist Backend:**
- `[ ]` OutboxPollingService: `@Scheduled(fixedDelay = 2000)` + `FOR UPDATE SKIP LOCKED`
- `[ ]` Retry max 5 lần, sau đó chuyển FAILED
- `[ ]` Dead Letter Topic (DLT): `device-assigned.DLT`, `stock-issued.DLT`
- `[ ]` Idempotent Consumer trên tất cả Kafka consumers
- `[ ]` Event Ordering: dùng `serialNumber` làm Kafka partition key
- `[ ]` Chaos Simulation: toggle Kafka DOWN/UP
- `[ ]` APIs: `GET /api/v1/outbox/events`, `POST /api/v1/outbox/events/{id}/retry`, `POST /api/v1/outbox/chaos/toggle-kafka`

**Checklist Frontend:**
- `[ ]` **Monitoring — Outbox Events:** Bảng events (PENDING/SENT/FAILED), nút retry thủ công, toggle Kafka chaos

---

## 📊 Phase 13: Dashboard & Monitoring

### Sprint 13: Main Dashboard & POS Monitoring
**Trạng thái:** `[ ]` Chưa bắt đầu

**Checklist Backend:**
- `[ ]` API: `GET /api/v1/dashboard/summary` — aggregate KPIs
- `[ ]` API: `GET /api/v1/monitoring/pos-status` — real-time device status

**Checklist Frontend:**
- `[ ]` **Main Dashboard:**
  - KPI Cards: Tổng thiết bị / Tồn kho / Đang triển khai / Đang sửa / Chờ thanh lý
  - KPI Cards: Merchant Active / Merchant Inactive / Tổng TID
  - KPI Cards: Phiếu chờ duyệt / Đã duyệt hôm nay
  - Chart: Nhập/Xuất kho theo tháng (Bar Chart)
  - Chart: Phân bổ thiết bị theo trạng thái (Donut Chart)
  - Top 5 Kho tồn nhiều nhất (Horizontal Bar)
  - Recent Activities: 10 hoạt động gần nhất
- `[ ]` **Giám sát hệ thống POS:** Grid thiết bị DEPLOYED, status indicator, filter, auto-refresh 30s

---

## 📝 Phase 14: Audit & Reports

### Sprint 14: Audit Log, Reports & CQRS Read Model
**Trạng thái:** `[ ]` Chưa bắt đầu

**Checklist:**
> 📌 **Lưu ý Flyway:** `audit_logs` và `outbox_events` đã được định nghĩa trong `V10__create_notification_tables.sql` (Sprint 11). Sprint 14 chỉ implement AOP `@Audit` annotation và bật ghi audit log.
- `[ ]` `@Audit` AOP annotation tự động ghi log
- `[ ]` Report APIs: tồn kho, thiết bị, assignment, merchant
- `[ ]` **Audit Log Page:** Bảng + filter: user, action, resource, date range
- `[ ]` **Reports Page:** Date picker + loại báo cáo + biểu đồ + export

---

## 🛡️ Phase 15: Hardening & Production

### Sprint 15: Cache, OpenAPI, Prometheus & Load Test
**Trạng thái:** `[ ]` Chưa bắt đầu

**Checklist:**
- `[ ]` Redis cache: device status, approval inbox count, merchant info
- `[ ]` OpenAPI 3 với Swagger UI
- `[ ]` Prometheus custom metrics
- `[ ]` Grafana dashboard cho POS Management
- `[ ]` Resilience4j Circuit Breaker
- `[ ]` Load test với k6: assignment concurrency, approval throughput
- `[ ]` Final Docker Compose optimization

**Kết quả bàn giao:**
```
100% Sprint Roadmap Completed ✅
All services UP với Docker Compose ✅
Swagger UI accessible ✅
Grafana dashboard showing metrics ✅
```
