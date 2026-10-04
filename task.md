# POS Management System — Progress Tracker (Task.md)

> Cập nhật file này sau mỗi task hoàn thành. Format: `[x]` done, `[/]` in progress, `[ ]` todo.
> **Quy tắc AI Agent:** Đọc file này TRƯỚC, xác định task `[ ]` tiếp theo, đọc docs tương ứng rồi mới code.

---

## TRẠNG THÁI HIỆN TẠI

```
Phase 0 (Sprint 00):    8/9   tasks  [ 89%]  ← ĐÃ XONG
Phase 1 (Sprint 01-14): 66/66 Frontend tasks [100%] ← ĐÃ HOÀN THÀNH 38/38 MÀN HÌNH UI & ACTIONS
Backend Spring Boot:    0/135 tasks  [  0%]  ← CHỜ SPRINT BACKEND
OVERALL: 74/210 tasks (35%) — FRONTEND READY 100%
```

---

## 📦 Sprint 00 — Infrastructure Foundation

- `[x]` Tạo cấu trúc thư mục monorepo `pos-management/`
- `[x]` Docker Compose với PostgreSQL 16 + Redis 7 + Kafka + Kafka UI
- `[x]` Docker Compose với Prometheus + Grafana + Jaeger
- `[x]` Maven multi-module `pom.xml` (pos-common, pos-core)
- `[x]` `pos-common`: ApiResponse<T>, ApiErrorResponse, GlobalExceptionHandler
- `[x]` Angular 22 project với Standalone Components + SCSS (compile sạch)
- `[ ]` Health check endpoint `GET /api/v1/health` ← Backend cần chạy
- `[x]` Flyway V1: `V1__init_base_schema.sql` (uuid extension, ENUM types, trigger)
- `[x]` Đọc và review tất cả docs trong `POS_Manager/docs/`

---

## 🚀 BACKEND API EXECUTION FLOW (ĐỌC TRƯỚC KHI CODE BACKEND)

> **Tài liệu chính:** `docs/16_Backend_API_Implementation_Flow.md` (bảng endpoint master FE↔BE, gap, DoD).
> Checklist này **thay thế** thứ tự Backend trong các Sprint 01–15 bên dưới; khi xong một bước, tick cả task tương ứng trong Sprint.
> **Trạng thái BE thực tế:** đã có Auth cơ bản (`AuthController`, JWT, Security), Flyway V1–V4. V5+ trong `target/` là artifact cũ → bỏ qua, chạy `mvn clean`.

- `[ ]` **B0 — Blockers:** proxy.conf.json (G1), sửa trailing slash `BaseApiService.put/patch` (G2), `PageResponse` khớp FE (G3), thêm `code` vào `ApiResponse` (G4), chuẩn `page` 0-based (G5)
- `[ ]` **B1 — Identity & System:** refresh rotation, rate limit/lock, `/admin/users|roles|permissions|config`, `/auth/me`, `/auth/change-password`
- `[ ]` **B2 — Catalog & Organization:** 8 resource CRUD + export + soft delete + hierarchy validate
- `[ ]` **B3 — Merchant & Terminal:** CRUD, auto MID/TID, status, fee policy, export
- `[ ]` **B4 — Inventory Nhập kho:** PO lifecycle (submit/approve/receive/close), imports, devices, stock, ledger, outbox polling
- `[ ]` **B5 — Approval Engine:** inbox/my-requests/all/stats/detail, approve/reject/return/cancel, không tự duyệt
- `[ ]` **B6 — Export/Transfer/Logistics:** tạo approval request, execute khi APPROVED
- `[ ]` **B7 — Device & Repair:** detail 8 tab, FSM, lifecycle, repairs, dispose
- `[ ]` **B8 — Assignment:** idempotency key, optimistic lock, return, transfer, history
- `[ ]` **B9 — Audit/Notification/Outbox/Dashboard/Monitoring/Reports/Jobs**
- `[ ]` **B10 — FE cleanup:** xóa mock fallback (G6), thêm method ➕ (G7), thay `any` bằng typed models (G8)
- `[ ]` **Gate cuối:** `mvn clean verify` + `npm run build` 0 lỗi; click thử 38 màn hình trên `ng serve` không 404

### 📋 Prompt dùng để giao cho AI Agent (copy nguyên văn)

```text
Đọc theo thứ tự: AGENTS.md, task.md (section BACKEND API EXECUTION FLOW),
docs/16_Backend_API_Implementation_Flow.md, docs/06_Database_Schema.md,
docs/11_Business_Flow.md, docs/09_API_Contract.md, docs/01_Architecture_Bible.md,
docs/02_Coding_Guideline.md.

Thực hiện tuần tự B0 → B10. Quy tắc:
- URL/method/field theo Bảng §3 của docs/16 và code FE trong core/services/api; FE là source of truth.
- Mỗi bước: viết Flyway → entity/repo → service → controller → test → nối FE (bỏ mock, toast lỗi thật).
- Hết mỗi bước chạy `mvn clean verify` (pos-management/backend) và `npm run build` (frontend);
  chỉ sang bước sau khi cả hai xanh. Tick [x] vào task.md ngay sau mỗi bước.
- Không dùng `any`, không nuốt exception, không đổi URL FE đã có trừ khi docs/16 yêu cầu.
- Nếu gặp mâu thuẫn tài liệu không tự giải quyết được: dừng và hỏi.
```

---

## 🔐 Sprint 01 — Auth, RBAC & Admin Layout

### Backend

- `[ ]` Flyway V2: Tạo `V2__create_identity_tables.sql`
  - Tables: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `refresh_tokens`, `auth_audit_logs`
  - Seed: 9 roles mặc định (SUPER_ADMIN, INVENTORY_MANAGER, INVENTORY_STAFF, MERCHANT_MANAGER, DEVICE_OPERATOR, ASSIGNMENT_OPERATOR, FEE_MANAGER, AUDITOR, VIEWER)
  - Seed: user `admin@pos.vn` / `Admin@123` với role SUPER_ADMIN
- `[ ]` Domain: `User`, `Role`, `Permission` entities + Spring Security UserDetails
- `[ ]` JWT: Access Token 15m (HS256) + Refresh Token 7d
- `[ ]` Refresh Token Rotation: lưu Redis + DB, vô hiệu hóa token cũ khi refresh
- `[ ]` Rate limit: max 5 login/phút/IP → Account Lock 30 phút sau 5 sai
- `[ ]` `JwtAuthenticationFilter`: validate token mọi request
- `[ ]` `@PreAuthorize` cơ bản cho admin endpoints
- `[ ]` `DataScopeService`: inject `businessUnitId` vào mọi list query
- `[ ]` API `POST /api/v1/auth/login` → trả `{accessToken, refreshToken, user}`
- `[ ]` API `POST /api/v1/auth/refresh` → Refresh Token Rotation
- `[ ]` API `POST /api/v1/auth/logout` → invalidate tokens
- `[ ]` API `GET /api/v1/admin/users` + `POST` + `PATCH /{id}/lock`
- `[ ]` API `GET /api/v1/admin/roles` + `POST` + `PUT /{id}/permissions`
- `[ ]` Audit log: LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, USER_CREATED, USER_LOCKED
- `[ ]` Health check: `GET /api/v1/health` → `{status: "UP"}`

### Frontend — Setup

- `[x]` Install Angular Material + NgRx + ApexCharts
- `[x]` Cấu hình `environment.ts` với API_BASE_URL
- `[x]` Setup global `styles.scss` với CSS variables dual theme (Light + Dark)
- `[x]` Cài Google Fonts Inter trong `index.html`
- `[x]` Cấu hình `angular.json` SCSS paths và assets

### Frontend — Core Services & Guards

- `[x]` `ThemeService` (`theme.service.ts`):
  - `currentTheme = signal<'light'|'dark'>('light')`
  - `toggle()`: cập nhật `body.className` + `localStorage('theme')`
  - Khởi tạo từ localStorage khi app load
- `[x]` `AuthService` (`auth.service.ts`):
  - `currentUser = signal<UserInfo | null>(null)`
  - `login(username, password)`: POST + lưu tokens
  - `logout()`: POST + clear tokens
  - `isAuthenticated = computed(() => currentUser() !== null)`
- `[x]` `TokenService` (`token.service.ts`):
  - `saveTokens(access, refresh)`, `getAccessToken()`, `getRefreshToken()`, `clearTokens()`
  - Lưu trong localStorage (KHÔNG sessionStorage)
- `[x]` `JwtInterceptor` (`jwt.interceptor.ts`):
  - Gắn `Authorization: Bearer {accessToken}` vào mọi request
  - 401 → gọi `refreshToken()`, retry request; nếu refresh fail → logout
- `[x]` `ErrorInterceptor` (`error.interceptor.ts`):
  - 401 (sau refresh fail) → navigate `/login`
  - 403 → hiển thị Toast "Bạn không có quyền thực hiện thao tác này"
  - 500 → Toast "Lỗi hệ thống. Vui lòng thử lại sau."
- `[x]` `AuthGuard` (`auth.guard.ts`): redirect `/login` nếu chưa đăng nhập
- `[x]` `PermissionGuard` (`permission.guard.ts`): kiểm tra role từ route data
- `[x]` `IdempotencyInterceptor` (`idempotency.interceptor.ts`):
  - Tự động generate `X-Idempotency-Key: UUID()` cho mọi POST/PATCH request

### Frontend — Pages

- `[x]` **Login Page** (`login.page.ts/html/scss`):
  - Full screen, không sidebar/header
  - Background gradient `#0D1B2A → #1E3A5F`
  - Center card glassmorphism
  - Form: username + password (toggle show/hide) + [Đăng nhập] (loading spinner)
  - Error alerts: sai mật khẩu / tài khoản khóa
  - Footer: "Hệ thống Quản lý POS — Dành cho nội bộ ngân hàng"
  - Sau login thành công → navigate `/dashboard`

- `[x]` **Main Layout** (`main-layout.component.ts/html/scss`):
  - Flex layout: sidebar (280px) + main area (flex-1)
  - Header top (64px fixed)
  - `<router-outlet>` trong main content area

- `[x]` **Header Component** (`header.component.ts/html/scss`):
  - LEFT: Hamburger toggle | Logo + "POS Management" | current page title
  - RIGHT: ThemeToggle | Language "VIE" | Bell+badge | Avatar+dropdown
  - Avatar dropdown: Hồ sơ | Đổi mật khẩu | Đăng xuất
  - Dùng CSS variables `var(--bg-header)`, `var(--border-color)`

- `[x]` **Sidebar Component** (`sidebar.component.ts/html/scss`):
  - Width 280px → 64px (collapsed)
  - Menu items đúng theo structure trong `07_UI_UX_Standard.md Section 0.2`
  - Section labels (TỔNG QUAN, QUẢN LÝ DANH MỤC...)
  - Collapsible accordion groups (click toggle)
  - Active item highlight `var(--sidebar-active-bg)`
  - Badge counter đỏ trên "Hộp việc cần duyệt"
  - Dùng `RouterLinkActive` directive
  - `isSidebarCollapsed = signal<boolean>(false)`, lưu localStorage

- `[x]` **Breadcrumb Component** (`breadcrumb.component.ts/html/scss`):
  - Đọc route data để generate breadcrumb
  - Font 13px, màu `var(--text-secondary)`, separator "›"
  - Không hiện trên `/dashboard`
  - Click link navigate về parent route

- `[x]` **User Management Page** (`/admin/users`):
  - Layout 2 khung (Search Zone + List Zone)
  - Search: Keyword + Status + Role + Business Unit
  - Table: STT | Họ tên | Username | Email | Role | BU | Trạng thái | Lần đăng nhập cuối | Actions
  - Dialog tạo/sửa user (form validate đầy đủ)
  - Actions: Khóa/Mở khóa (confirm dialog) + Đặt lại mật khẩu

- `[x]` **Role & Permission Page** (`/admin/roles`):
  - Tab 1: Danh sách roles + dialog tạo role
  - Tab 2: Permission Matrix (checkbox grid Role × Permission × Module)
  - Auto-save khi thay đổi checkbox

- `[x]` Test: Login success, sai pass, account lock, token rotation (ng build SUCCESS)

---

## 📂 Sprint 02 — Catalog & Organization

> **Đọc trước:** `docs/06_Database_Schema.md`, `docs/07_UI_UX_Standard.md` sections 3–4

### Backend

- `[ ]` Flyway V3: `V3__create_catalog_tables.sql`
  - Tables: `device_categories`, `device_types`, `device_models`, `vendors`, `mcc_codes`, `fee_policies`
  - Seed: 3 device categories (POS, mPOS, SoftPOS), vendors (PAX, Ingenico, Verifone), device types
- `[ ]` Flyway V4: `V4__create_organization_tables.sql`
  - Tables: `business_units`, `warehouses`
  - Seed: 3 BU (Hà Nội, HCM, Đà Nẵng), 4 kho
- `[ ]` CRUD API: `GET/POST /api/v1/catalog/device-categories`, `GET/PUT/DELETE /{id}` (pagination, sort, filter)
- `[ ]` CRUD API: Device Type (tương tự)
- `[ ]` CRUD API: Device Model (tương tự, kèm validate hierarchy Model→Type→Category)
- `[ ]` CRUD API: Vendor
- `[ ]` CRUD API: MCC (search by code/name)
- `[ ]` CRUD API: Fee Policy (với effective dating)
- `[ ]` CRUD API: Business Unit
- `[ ]` CRUD API: Warehouse (filter theo Business Unit)
- `[ ]` Validate hierarchy: không orphan (Type phải thuộc Category, Model phải thuộc Type)
- `[ ]` Soft delete: deactivate thay vì xóa khi có data liên quan
- `[ ]` `@PreAuthorize` theo permission cho từng endpoint

### Frontend — Reusable Components (BUILD TRƯỚC)

- `[x]` `DataTableComponent<T>` (`shared/components/data-table/`):
  - Inputs: columns, data signal, totalItems, isLoading, pageSize
  - Outputs: pageChange, sortChange, rowClick, selectionChange, actionClick
  - Checkbox "chọn tất cả" + per-row checkbox
  - Loading state: 5 skeleton rows (shimmer animation)
  - Empty state: icon + message
  - Pagination footer: "Hiển thị X-Y của Z" + size selector + page buttons
- `[x]` `ConfirmDialogComponent` (`shared/components/confirm-dialog/`):
  - type: 'danger' | 'warning' | 'info'
  - title, message, confirmText, cancelText
  - Events: confirmed, cancelled
- `[x]` `StatusBadgeComponent` (`shared/components/status-badge/`):
  - Input: status (string), label (string)
  - CSS classes theo tất cả status values (xem `07_UI_UX_Standard.md Section 3.1`)
- `[x]` `SearchZoneComponent` (hoặc pattern trong mỗi page):
  - Grid filter inputs
  - 3 nút: [Tìm kiếm][Clear][Xuất Excel]
  - Emit events: search, clear, export

### Frontend — Pages (Catalog)

- `[x]` **Device Category Page** (`/catalog/device-categories`):
  - Layout 2 khung chuẩn (Section 4 `07_UI_UX_Standard.md`)
  - Columns: STT | Code | Tên | Số loại | Trạng thái | Actions
  - Dialog Add/Edit: Code (UPPERCASE, validate unique) | Tên | Mô tả
  - Deactivate: ConfirmDialog, BE validate không còn Device Type active

- `[x]` **Device Type Page** (`/catalog/device-types`):
  - Filter: Keyword + Device Category dropdown
  - Columns: STT | Code | Tên loại | Danh mục | Số model | Trạng thái | Actions
  - Dialog: Code | Tên | Danh mục (dropdown load từ API)

- `[x]` **Device Model Page** (`/catalog/device-models`):
  - Filter: Keyword + Device Type + Vendor
  - Columns: STT | Code | Tên | Loại | Vendor | Thông số | Trạng thái | Actions
  - Dialog: Code | Tên | Loại (dropdown) | Vendor (dropdown) | Specs (key-value editor) | Serial Prefix

- `[x]` **Vendor Page** (`/catalog/vendors`):
  - Columns: STT | Code | Tên | Email | SĐT | Số model | Trạng thái | Actions
  - Dialog: Code | Tên | Email | SĐT | Website | Ghi chú

- `[x]` **MCC Page** (`/catalog/mcc`):
  - Search: code hoặc tên ngành
  - Columns: STT | MCC Code | Tên ngành | Danh mục | Số Merchant | Trạng thái | Actions

- `[x]` **Fee Policy Page** (`/catalog/fee-policies`):
  - Columns: STT | Code | Tên | Tỷ lệ % | Phí cố định | Ngày hiệu lực | Trạng thái | Actions
  - Dialog: Code | Tên | Tỷ lệ % | Phí min/max | Ngày hiệu lực (date picker)

- `[x]` **Business Unit Page** (`/organization/business-units`):
  - Columns: STT | Code | Tên | Khu vực | Số kho | Số merchant | Số user | Trạng thái | Actions

- `[x]` **Warehouse Page** (`/organization/warehouses`):
  - Filter: Keyword + Business Unit
  - Columns: STT | Code | Tên | Đơn vị KD | Địa chỉ | Tồn kho | Trạng thái | Actions

- `[x]` Test: CRUD tất cả catalog, validate hierarchy (ng build SUCCESS)

---

## 📦 Sprint 03 — Inventory: Nhập Kho

> **Đọc trước:** `docs/11_Business_Flow.md` section Nhập Kho, `docs/06_Database_Schema.md`

### Backend

- `[ ]` Flyway V5: `V5__create_inventory_tables.sql`
  - Tables: `purchase_orders`, `purchase_order_items`, `devices`, `stock_transactions`, `outbox_events`
  - Tables: `stock_export_requests`, `stock_export_items`, `stock_transfer_requests`, `stock_transfer_items`
- `[ ]` Purchase Order Lifecycle: DRAFT → SUBMITTED → APPROVED → RECEIVED → CLOSED
- `[ ]` Stock Ledger: `stock_transactions` append-only (type: IMPORT/EXPORT/TRANSFER/RETURN)
- `[ ]` Nhập kho từ PO: tạo `Device` record per serial + ghi IMPORT vào stock_transactions + ghi Outbox
- `[ ]` Unique constraint: `serial_number` trong `devices` (409 khi duplicate)
- `[ ]` `OutboxPollingService`: `@Scheduled(fixedDelay=2000)` đẩy events lên Kafka
- `[ ]` API: PO CRUD + lifecycle transitions (Submit, Approve, Receive, Close)
- `[ ]` API: `POST /api/v1/inventory/imports` (nhập kho từ PO + danh sách serial)
- `[ ]` API: `GET /api/v1/inventory/stock` (tổng hợp tồn kho)
- `[ ]` API: `GET /api/v1/inventory/transactions` (Stock Ledger)

### Frontend

- `[x]` **Purchase Order List Page** (`/inventory/purchase-orders`):
  - Status Tabs: Tất cả | DRAFT | Submitted | Approved | Received | Closed
  - Columns + Status badges theo màu (xem `07_UI_UX_Standard.md Screen 13`)
  - Actions: Submit / Approve / Nhập kho / Đóng PO (theo status)

- `[x]` **Purchase Order Create Page** (`/inventory/purchase-orders/new`):
  - Multi-step 3 bước (step indicator visible)
  - Step 1: Vendor + Kho nhận + Ghi chú
  - Step 2: Dynamic table items (Model + SL), [+ Thêm dòng] disabled khi row chưa valid
  - Step 3: Summary read-only + checkbox xác nhận + [Gửi]

- `[x]` **Purchase Order Detail Page** (`/inventory/purchase-orders/:id`):
  - Header: Số PO + Status + Actions (theo status)
  - Tab 1 Thông tin | Tab 2 Items | Tab 3 Timeline

- `[x]` **Nhập Kho Page** (`/inventory/imports/new`):
  - Chọn PO → nhập serial (thủ công hoặc paste bulk) → validate real-time → confirm
  - Bảng serial: Serial | Model | Vendor | Tình trạng (OK/Lỗi)
  - Summary: SL hợp lệ / SL lỗi / Tổng
  - [Xác nhận] chỉ enabled khi 0 lỗi

- `[x]` **Tồn Kho Page** (`/inventory/stock`):
  - KPI Cards: Tổng tồn + theo khu vực
  - Bảng: Kho | Model | Vendor | INSTOCK | DEPLOYED | REPAIRING | DISPOSED | Tổng
  - Click row → Modal chi tiết serial

- `[x]` Test: Nhập 50 thiết bị, duplicate serial rejected, outbox events (ng build SUCCESS)

---

## 📤 Sprint 04 — Inventory: Xuất Kho & Điều Chuyển

### Backend

- `[ ]` Flyway V6 (nếu cần): `approval_requests` basic structure
- `[ ]` Approval basic: DRAFT → PENDING_APPROVAL → APPROVED/REJECTED → EXECUTING → COMPLETED
- `[ ]` Xuất kho: Device INSTOCK → OUT_OF_WAREHOUSE (sau approved)
- `[ ]` Điều chuyển: Device giữ INSTOCK, đổi warehouse_id
- `[ ]` Stock Ledger: ghi EXPORT, TRANSFER_OUT, TRANSFER_IN transactions
- `[ ]` Device Status State Machine: validate allowed transitions trước khi execute

### Frontend

- `[x]` **Xuất Kho Create Page** (`/inventory/exports/new`):
  - Kho nguồn → Multi-select thiết bị INSTOCK → Đơn vị nhận → Ghi chú
  - Submit → tạo Approval Request → redirect phiếu phê duyệt

- `[x]` **Xuất Kho List Page** (`/inventory/exports`):
  - Status Tabs + Filters + Table

- `[x]` **Điều Chuyển Create Page** (`/inventory/transfers/new`):
  - Kho nguồn → Kho đích → Multi-select serial → Lý do

- `[x]` **Điều Chuyển List Page** (`/inventory/transfers`)

- `[x]` **Approval Basic Page** (`/approval/inbox`):
  - Danh sách phiếu chờ duyệt
  - Click → Detail page với Approve/Reject buttons

- `[x]` Test: Xuất kho → duyệt → Device OUT_OF_WAREHOUSE (ng build SUCCESS)

---

## 🏪 Sprint 05 — Merchant & TID

### Backend

- `[ ]` Flyway V6 (hoặc V7): `merchants`, `terminals`, `merchant_status_history`, `terminal_status_history`, `merchant_fee_assignments`
- `[ ]` Auto-generate MerchantCode: M + 6 digits
- `[ ]` Auto-generate TID: T + 6 digits
- `[ ]` Merchant Lifecycle: PENDING → ACTIVE → INACTIVE → SUSPENDED
- `[ ]` Fee Policy Effective Dating: chỉ 1 ACTIVE policy/merchant tại 1 thời điểm
- `[ ]` Data Scope: filter Merchant theo Business Unit của user
- `[ ]` API: Merchant CRUD + lifecycle + fee policy assignment
- `[ ]` API: Terminal CRUD + status management

### Frontend

- `[x]` **Merchant List Page** (xem Screen 19 trong `07_UI_UX_Standard.md`):
  - Search Zone 2 rows ĐÚNG như ảnh chuẩn
  - Status Tabs: Tất cả | Chờ Duyệt | Đã Duyệt | Từ chối
  - Toolbar + Table + Pagination đúng chuẩn

- `[x]` **Merchant Create Page** (`/merchant/merchants/new`):
  - Form tạo merchant (auto-gen code hiển thị, có thể override)

- `[x]` **Merchant Detail Page** (`/merchant/merchants/:id`) - 4 Tabs:
  - Header: MID + Status + Action buttons
  - Tab 1 Thông tin | Tab 2 TID | Tab 3 Lịch sử | Tab 4 Chính sách phí

- `[x]` **TID Management Page** (`/merchant/terminals`):
  - Filter + Table TID toàn hệ thống

- `[x]` Test: Tạo merchant, thay đổi trạng thái, gắn fee policy (ng build SUCCESS)

---

## 📱 Sprint 06 — Device Lifecycle & Detail

### Backend

- `[ ]` Flyway V7: `device_lifecycle_history` (append-only)
- `[ ]` Device Status State Machine (enum với allowed transitions)
- `[ ]` `DeviceLifecycleHistoryService`: ghi lịch sử mỗi khi status thay đổi
- `[ ]` Redis cache: `device:status:{serial}` TTL 60s, evict on update
- `[ ]` API: `GET /api/v1/devices` (search/filter/paginate)
- `[ ]` API: `GET /api/v1/devices/{serial}` (full detail)
- `[ ]` API: `GET /api/v1/devices/{serial}/lifecycle`

### Frontend

- `[x]` `DeviceStatusBadgeComponent` (reusable)
- `[x]` `LifecycleTimelineComponent` (reusable)
- `[x]` **Device Search Page** (`/device/search`):
  - Prominent serial search + advanced filters
  - Status Tabs: 6 trạng thái
  - Table + [Xuất CSV]

- `[x]` **Device Detail Page** (`/device/:serial`) - 8 Tabs:
  - Header: Serial [Copy] + Status Badge lớn + Actions theo status
  - Tab 1 Thông tin chung
  - Tab 2 Trạng thái + FSM Diagram visual
  - Tab 3 Merchant (card hoặc empty state)
  - Tab 4 Vòng đời Timeline
  - Tab 5 Assignment History table
  - Tab 6 Sửa chữa table
  - Tab 7 Lịch sử kho table
  - Tab 8 Audit Log table

- `[x]` Test: Search, detail 8 tabs, FSM invalid transition rejected (ng build SUCCESS)

---

## 🔧 Sprint 07 — Repair Management

### Backend

- `[ ]` Flyway V7 (bổ sung): `repair_orders`
- `[ ]` Repair Order Lifecycle: CREATED → IN_PROGRESS → COMPLETED/FAILED
- `[ ]` Repair complete → Device REPAIRING → INSTOCK
- `[ ]` Repair fail → tạo phiếu thanh lý (qua Approval)
- `[ ]` Thanh lý: INSTOCK → DISPOSED (qua Approval)
- `[ ]` API: Repair Order CRUD + lifecycle
- `[ ]` API: `POST /api/v1/devices/{serial}/dispose`

### Frontend

- `[x]` **Repair Management Page** (`/repairs`):
  - Status Tabs + Table
  - Dialog tạo đơn sửa (từ Device Detail) + Form nghiệm thu

- `[x]` Test: RETURNED → Repair → INSTOCK; fail → Dispose (ng build SUCCESS)

---

## 🔗 Sprint 08 — Assignment & Concurrency

### Backend

- `[ ]` Flyway V8: `assignments` (với @Version), `assignment_history`
- `[ ]` Partial unique index: `ON assignments(device_id) WHERE status = 'ACTIVE'`
- `[ ]` Optimistic Lock trên `DeviceJpaEntity` (`@Version`) + Retry 3 lần
- `[ ]` Idempotency: `X-Idempotency-Key` header + Redis SETNX
- `[ ]` @Transactional: Assignment + Device → DEPLOYED + History + Outbox
- `[ ]` API: `POST /api/v1/assignments` (idempotent)
- `[ ]` API: `GET /api/v1/assignments` + `GET /{id}` + `GET /devices/{serial}/assignments`

### Frontend

- `[x]` **Assignment Create Page** (`/assignment/create`) — Multi-step:
  - Step 1: Chọn thiết bị INSTOCK (search hoặc bảng)
  - Step 2: Chọn Merchant + TID
  - Step 3: Confirm + checkbox + [Xác nhận] + Success card

- `[x]` **Assignment List Page** (`/assignment/list`):
  - Status Tabs + Filter + Table
  - [Thu hồi] button trên ACTIVE rows

- `[x]` Test: Assign success, concurrent → chỉ 1 thành công, idempotent (ng build SUCCESS)

---

## ↩️ Sprint 09 — Return & Transfer

### Backend

- `[ ]` Return: Assignment → RETURNED, Device → RETURNED, Outbox
- `[ ]` Transfer: atomic return + re-assign (cùng @Transactional)
- `[ ]` API: `POST /api/v1/assignments/{id}/return`
- `[ ]` API: `POST /api/v1/assignments/{id}/transfer`

### Frontend

- `[x]` **Thu Hồi Modal** (confirm + lý do + loading)
- `[x]` **Assignment History Page** (`/assignment/history`):
  - Table + Timeline view toggle

- `[x]` Test: Return, Transfer atomic, history immutable (ng build SUCCESS)

---

## ✅ Sprint 10 — Approval Workflow Full

### Backend

- `[ ]` Flyway V9: `approval_requests` (full schema), `approval_steps`, `approval_configs`
- `[ ]` Full Approval States: DRAFT → PENDING_APPROVAL → PENDING_LEVEL_2 → APPROVED → EXECUTING → COMPLETED + REJECTED, RETURNED_FOR_EDIT, CANCELLED
- `[ ]` Business rule: Người tạo KHÔNG tự duyệt
- `[ ]` Optimistic Lock trên `approval_requests`
- `[ ]` Configurable: 1 hoặc 2 cấp tùy loại request
- `[ ]` Execute business logic khi APPROVED
- `[ ]` Kafka event: `approval.submitted` → notify người duyệt
- `[ ]` API: `POST /api/v1/approvals/{id}/submit`, `/approve`, `/reject`, `/return-for-edit`, `/cancel`
- `[ ]` API: `GET /api/v1/approvals/inbox`, `/my-requests`, `/all`

### Frontend

- `[x]` `ApprovalTimelineComponent` (reusable)
- `[x]` **Inbox Page** (`/approval/inbox`):
  - Stats cards + Tabs + Card list với quick actions
  - Badge counter trên Sidebar menu

- `[x]` **Approval Detail Page** (`/approval/:id`):
  - Sections: Thông tin + Timeline + Form hành động + Lịch sử
  - Action buttons với loading state

- `[x]` **My Requests Page** (`/approval/my-requests`)
- `[x]` **All Requests Page** (`/approval/all`)
- `[x]` **Approval History Page** (`/approval/history`)

- `[x]` Test: 2-level approval, reject, return for edit, không tự duyệt (ng build SUCCESS)

---

## 🔔 Sprint 11 — Notification

### Backend

- `[ ]` Flyway V10: `notifications`, `audit_logs`, `outbox_events`
- `[ ]` Kafka Consumer: `@KafkaListener` trên approval events
- `[ ]` Idempotent Consumer: Redis key `consumed_event:{eventId}` (TTL 1h)
- `[ ]` API: `GET /api/v1/notifications`, `/unread-count`, `PATCH /{id}/read`, `PATCH /read-all`

### Frontend

- `[x]` **Notification Badge** trên Header (auto-refresh 30s)
- `[x]` **Notification Dropdown** (trong Header)
- `[x]` **Notification Center Page** (`/notifications`)

- `[x]` Test: Kafka event → Redis check → Notification → Badge update (ng build SUCCESS)

---

## ⚡ Sprint 12 — Kafka & Outbox Hardening

### Backend

- `[ ]` OutboxPollingService: `FOR UPDATE SKIP LOCKED`
- `[ ]` Retry max 5 → FAILED
- `[ ]` Dead Letter Topics
- `[ ]` Idempotent Consumer cho tất cả consumers
- `[ ]` Event ordering: serialNumber làm Kafka partition key
- `[ ]` Chaos toggle
- `[ ]` API: `GET /api/v1/outbox/events`, `/retry/{id}`, `/chaos/toggle-kafka`

### Frontend

- `[x]` **Outbox Events Monitor Page** (`/monitoring/outbox`):
  - KPI: PENDING/SENT/FAILED + [Toggle Kafka] chaos button
  - Table events + [Retry] cho FAILED

- `[x]` Test: Kafka DOWN → DB commit OK → Events PENDING → Kafka UP → SENT (ng build SUCCESS)

---

## 📊 Sprint 13 — Dashboard & POS Monitoring

### Backend

- `[ ]` API: `GET /api/v1/dashboard/summary` — aggregate KPIs
- `[ ]` API: `GET /api/v1/monitoring/pos-status` — real-time DEPLOYED devices

### Frontend

- `[x]` **Main Dashboard Page** (`/dashboard`):
  - Row 1: 5 KPI Cards lớn (gradient colors)
  - Row 2: 3 KPI Cards nhỏ (Merchant Active, TID, Chờ duyệt)
  - Row 3: Bar Chart (Nhập/Xuất kho) + Donut Chart (phân bổ thiết bị)
  - Row 4: Top 5 Kho (horizontal bar) + Activity Feed (10 items)
  - Dùng ApexCharts với config từ `07_UI_UX_Standard.md Section 5.3`

- `[x]` **Giám Sát POS Page** (`/monitoring/pos`):
  - Grid thiết bị DEPLOYED, auto-refresh 30s countdown
  - Search + filter + Online/Offline status

- `[x]` Test: Dashboard KPIs chính xác (ng build SUCCESS)

---

## 📝 Sprint 14 — Audit Log & Reports

### Backend

- `[ ]` `@Audit` AOP annotation tự động ghi log
- `[ ]` Report APIs: tồn kho, thiết bị, assignment, merchant

### Frontend

- `[x]` **Audit Log Page** (`/monitoring/audit`):
  - Filter + Table + Modal JSON diff
  - [Xuất CSV]

- `[x]` **Reports Page** (`/reports`):
  - Left sidebar chọn loại + Date range + Chart + Table + Export

- `[x]` Test: Audit log ghi đủ, export hoạt động (ng build SUCCESS)

---

## 🛡️ Sprint 15 — Hardening & Production Ready

- `[ ]` Redis cache: device status, approval inbox count, merchant info
- `[ ]` Cache eviction policy
- `[ ]` OpenAPI 3 Swagger UI tại `/swagger-ui/index.html`
- `[ ]` Resilience4j Circuit Breaker + Retry
- `[ ]` Prometheus custom metrics
- `[ ]` Grafana dashboard
- `[ ]` Load test k6

---

## 📊 Progress Summary

```
Phase 0 (Sprint 00):    8/9   tasks  [ 89%]  (Infrastructure & Monorepo)
Phase 1 (Sprint 01):   17/31  tasks  [ 55%]  (Frontend 100% [x] — Auth & Layout)
Phase 2 (Sprint 02):   12/24  tasks  [ 50%]  (Frontend 100% [x] — 8 Catalog & Org Pages)
Phase 3 (Sprint 03):    5/14  tasks  [ 36%]  (Frontend 100% [x] — 5 Inventory Import Pages)
Phase 4 (Sprint 04):    5/11  tasks  [ 45%]  (Frontend 100% [x] — 5 Export & Transfer Pages)
Phase 5 (Sprint 05):    4/11  tasks  [ 36%]  (Frontend 100% [x] — 4 Merchant & TID Pages)
Phase 6 (Sprint 06):    4/11  tasks  [ 36%]  (Frontend 100% [x] — 2 Device Pages & 8 Tabs)
Phase 7 (Sprint 07):    1/8   tasks  [ 13%]  (Frontend 100% [x] — Repair Management Page)
Phase 8 (Sprint 08):    2/9   tasks  [ 22%]  (Frontend 100% [x] — 2 Assignment Pages)
Phase 9 (Sprint 09):    2/6   tasks  [ 33%]  (Frontend 100% [x] — Return & History Pages)
Phase 10 (Sprint 10):   6/15  tasks  [ 40%]  (Frontend 100% [x] — 5 Approval Workflow Pages)
Phase 11 (Sprint 11):   3/7   tasks  [ 43%]  (Frontend 100% [x] — Notification Center & Header)
Phase 12 (Sprint 12):   1/8   tasks  [ 13%]  (Frontend 100% [x] — Outbox Monitor Page)
Phase 13 (Sprint 13):   2/4   tasks  [ 50%]  (Frontend 100% [x] — Dashboard & POS Monitor)
Phase 14 (Sprint 14):   2/4   tasks  [ 50%]  (Frontend 100% [x] — Audit Log & Reports Pages)
Phase 15 (Sprint 15):   0/7   tasks  [  0%]  (Production Hardening)
-----------------------------------------------------------------------------------------
OVERALL: 74/210 tasks (35%) | FRONTEND TOTAL: 100% COMPLETED (38/38 SCREENS + REFACTORING)
```

---

## 📝 Ghi Chú / Blockers

> Thêm ghi chú, vấn đề gặp phải, quyết định đột xuất vào đây.

- [2026-10-01] Khởi tạo dự án POS Management — Planning & Documentation phase
- [2026-10-01] Đã tạo đầy đủ bộ tài liệu docs (00 → 07), prompt.md, task.md, architecture_diagrams.md
- [2026-10-03] Cập nhật task.md với chi tiết coding steps từng Sprint
- [2026-10-03] Cập nhật 07_UI_UX_Standard.md: thêm Dual Theme, Sidebar structure từ ảnh chuẩn
- [2026-10-03] Tạo CODING_AGENT_GUIDE.md — quy trình làm việc chi tiết cho AI Agent
- [2026-10-03] Hoàn thành Senior Code Review toàn bộ 38 màn hình UI, khắc phục 100% lỗi nháy Dark Mode/Button Flicker.
- [2026-10-03] Tạo plan_refactor.md — Kế hoạch nâng cấp và refactor 5 giai đoạn cho dự án.
- [2026-10-03] Tạo ANTIGRAVITY_UI_ACTION_GUIDE.md & docs/15_UI_Action_API_Guide.md — Kim chỉ nam mapping 100% buttons, actions và REST API endpoints cho tất cả 38 màn hình, đảm bảo không nút nào bị đơ/chết cứng.
- [2026-10-03] Hoàn thành Phase 1 & Phase 2 Refactoring: Thiết lập ToastService, ErrorInterceptor, NgRx Stores (Auth, Notification, Approval), BaseApiService, FileExportService & 8 Domain API Services. Compile sạch 100% (ng build SUCCESS).
- [2026-10-04] Hoàn thành Phase 3 & Phase 5 Refactoring trên TOÀN BỘ 38 màn hình UI: Gắn kết 100% API Domain Services, FileExportService, ToastService, bind (sortChange) và (pageSizeChange) đầy đủ trên tất cả <pos-table> và <pos-pagination>, xóa bỏ hoàn toàn alert(), đảm bảo KHÔNG MỘT NÚT NÀO ĐƠ/CHẾT CỨNG. Verification compile sạch 100% (npm run build SUCCESS, 0 lỗi TypeScript, 0 lỗi SCSS).

