# POS Management System — Product Backlog

> Backlog là danh sách toàn bộ tính năng cần xây dựng, được ưu tiên theo giá trị nghiệp vụ và độ phức tạp kỹ thuật. Mỗi item được gắn với Phase và Sprint tương ứng.

---

## 📊 Tổng Quan Backlog

| Phase | Chủ Đề | Sprint | Status |
|---|---|---|---|
| Phase 0 | Foundation & Infrastructure | Sprint 00 | `[ ]` Chưa bắt đầu |
| Phase 1 | Auth, RBAC & Catalog | Sprint 01–02 | `[ ]` Chưa bắt đầu |
| Phase 2 | Inventory & Organization | Sprint 03–04 | `[ ]` Chưa bắt đầu |
| Phase 3 | Merchant & TID | Sprint 05 | `[ ]` Chưa bắt đầu |
| Phase 4 | Device Lifecycle | Sprint 06–07 | `[ ]` Chưa bắt đầu |
| Phase 5 | Assignment & Concurrency | Sprint 08–09 | `[ ]` Chưa bắt đầu |
| Phase 6 | Approval Workflow | Sprint 10–11 | `[ ]` Chưa bắt đầu |
| Phase 7 | Kafka & Event-Driven | Sprint 12 | `[ ]` Chưa bắt đầu |
| Phase 8 | Monitoring & Hardening | Sprint 13–15 | `[ ]` Chưa bắt đầu |
| Phase 9 | Kiểm Kê & Excel Export | Sprint 14 | `[ ]` Chưa bắt đầu |

---

## 🔥 Epic 1: Foundation & Infrastructure

### [POS-001] Infrastructure Setup
**Priority:** P0 | **Sprint:** 00 | **Effort:** L

- `[ ]` Tạo cấu trúc monorepo `pos-management/`
- `[ ]` Docker Compose: PostgreSQL 16 + Redis 7 + Kafka + Kafka UI
- `[ ]` Docker Compose: Prometheus + Grafana + Jaeger
- `[ ]` Maven multi-module: `pos-api-gateway`, `pos-core`, `pos-common`
- `[ ]` Angular 22 project với Standalone Components + SCSS
- `[ ]` `docker-compose up` → tất cả services UP

---

## 🔐 Epic 2: Identity & RBAC

### [POS-002] Authentication Module
**Priority:** P0 | **Sprint:** 01 | **Effort:** L

- `[ ]` Domain: User, Role, Permission, UserRole
- `[ ]` Flyway V1: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`
- `[ ]` JWT generation (Access Token 15m + Refresh Token 7d)
- `[ ]` Refresh Token Rotation + Redis storage
- `[ ]` Rate limit login (5 lần/phút), Account Lock (30 phút)
- `[ ]` API: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`
- `[ ]` Audit log: `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`
- `[ ]` **Angular Login Screen:** Form đăng nhập (username/password), lỗi rõ ràng, loading state
- `[ ]` **Angular Auth Service + Token Service** (Signal-based state)
- `[ ]` **Angular JWT Interceptor** (tự động gắn Bearer Token)
- `[ ]` Test: Login success, sai mật khẩu, khóa tài khoản, token rotation

### [POS-003] RBAC & Permission Management
**Priority:** P0 | **Sprint:** 01 | **Effort:** M

- `[ ]` 9 Roles: SUPER_ADMIN, INVENTORY_MANAGER, INVENTORY_STAFF, MERCHANT_MANAGER, DEVICE_OPERATOR, ASSIGNMENT_OPERATOR, FEE_MANAGER, AUDITOR, VIEWER
- `[ ]` Permission-based authorization (`@PreAuthorize`)
- `[ ]` Data Scope: Business Unit filter trong mọi query
- `[ ]` Flyway V1 seed: Tạo role mặc định + SUPER_ADMIN user
- `[ ]` **Angular Route Guard** (authGuard + permissionGuard)
- `[ ]` **Angular Permission Directive** (ẩn element theo permission)
- `[ ]` **Admin UI — User Management:** Danh sách, tạo, chỉnh sửa, khóa user
- `[ ]` **Admin UI — Role Management:** Danh sách role, gán permission

---

## 📂 Epic 3: Catalog & Organization Management

### [POS-004] Catalog Management — Master Data
**Priority:** P1 | **Sprint:** 02 | **Effort:** M

- `[ ]` Flyway V2: `device_categories`, `device_types`, `device_models`, `vendors`
- `[ ]` Flyway V2 seed: Dữ liệu mẫu (PAX, Ingenico, Verifone; A920, iCT220, VX520)
- `[ ]` CRUD APIs: Device Category, Device Type, Device Model, Vendor
- `[ ]` Validate quan hệ danh mục (Model thuộc Type, Type thuộc Category)
- `[ ]` Search + Filter + Pagination cho tất cả danh mục
- `[ ]` **Angular — Danh mục thiết bị (Device Category):** Bảng danh sách, form tạo/sửa, xóa (có confirm)
- `[ ]` **Angular — Loại thiết bị (Device Type):** Bảng + filter theo Category
- `[ ]` **Angular — Model thiết bị (Device Model):** Bảng + filter theo Type, gắn Vendor
- `[ ]` **Angular — Nhà cung cấp (Vendor):** Bảng, form tạo/sửa, trạng thái Active/Inactive

### [POS-005] MCC & Fee Policy Management
**Priority:** P1 | **Sprint:** 02 | **Effort:** M

- `[ ]` Flyway V2: `mcc_codes`, `fee_policies`, `merchant_fee_assignments`
- `[ ]` Flyway V2 seed: Top 50 MCC codes chuẩn ISO 18245
- `[ ]` CRUD APIs: MCC, Fee Policy (với Effective Dating)
- `[ ]` Fee Policy có `effectiveFrom`, `effectiveTo` — nhiều policy cho cùng merchant, chỉ 1 active
- `[ ]` **Angular — MCC:** Bảng, search theo code/tên
- `[ ]` **Angular — Chính sách phí (Fee Policy):** Bảng, form tạo với effective date picker

### [POS-006] Organization Management
**Priority:** P1 | **Sprint:** 02 | **Effort:** S

- `[ ]` Flyway V2: `business_units`, `warehouses`
- `[ ]` Flyway V2 seed: Business Unit mẫu (Hà Nội, HCM, Đà Nẵng) + Kho tương ứng
- `[ ]` CRUD APIs: Business Unit, Warehouse (với quan hệ Business Unit)
- `[ ]` **Angular — Đơn vị kinh doanh (Business Unit):** Bảng, form tạo/sửa
- `[ ]` **Angular — Quản lý kho (Warehouse):** Bảng, filter theo Business Unit

---

## 📦 Epic 4: Inventory Management

### [POS-007] Purchase Order Management
**Priority:** P1 | **Sprint:** 03 | **Effort:** M

- `[ ]` Flyway V3: `purchase_orders`, `purchase_order_items`
- `[ ]` Purchase Order Lifecycle: DRAFT → SUBMITTED → APPROVED → RECEIVED → CLOSED
- `[ ]` API: `POST /api/v1/purchase-orders`, `PUT`, `GET`, `PATCH /{id}/submit`, `PATCH /{id}/approve`, `PATCH /{id}/receive`
- `[ ]` **Angular — Danh sách Purchase Order:** Bảng với filter status, vendor, date range
- `[ ]` **Angular — Tạo Purchase Order:** Form chọn Vendor, thêm items (model + số lượng)
- `[ ]` **Angular — Chi tiết Purchase Order:** Thông tin đơn, danh sách items, timeline trạng thái
- `[ ]` Test: Tạo PO, submit, approve, nhận hàng

### [POS-008] Stock Import (Nhập Kho)
**Priority:** P1 | **Sprint:** 03 | **Effort:** L

- `[ ]` Flyway V3: `devices`, `stock_transactions` (Stock Ledger — append only)
- `[ ]` Import thiết bị từ Purchase Order → tự động tạo Device record với serial + status `INSTOCK`
- `[ ]` Unique constraint: `serial_number` trong `devices`
- `[ ]` Stock Ledger ghi IMPORT transaction cho mỗi thiết bị nhập
- `[ ]` @Transactional: Tạo Device + ghi Stock Ledger + ghi Outbox Event
- `[ ]` API: `POST /api/v1/inventory/imports`, `GET /api/v1/inventory/imports`, `GET /api/v1/inventory/imports/{id}`
- `[ ]` **Angular — Thông tin nhập kho:** Form nhập kho liên kết PO, danh sách thiết bị nhập, upload serial
- `[ ]` **Angular — Danh sách lô nhập kho:** Bảng, filter theo ngày, kho, vendor
- `[ ]` Test: Nhập 100 thiết bị, kiểm tra stock ledger, duplicate serial rejected

### [POS-009] Stock Overview (Tồn Kho)
**Priority:** P1 | **Sprint:** 03 | **Effort:** M

- `[ ]` API: `GET /api/v1/inventory/stock` — aggregate tồn kho theo kho/model/status
- `[ ]` API: `GET /api/v1/inventory/stock/details` — chi tiết từng thiết bị
- `[ ]` Filter: theo Warehouse, Business Unit, Model, Status, Vendor
- `[ ]` **Angular — Tồn kho (Stock Overview):** Bảng tổng hợp + drilldown chi tiết từng serial
- `[ ]` **Angular — Dashboard Kho:** Cards: Tổng nhập / Tổng xuất / Đang tồn / Đang triển khai

### [POS-010] Stock Export & Transfer (Xuất Kho & Điều Chuyển)
**Priority:** P1 | **Sprint:** 04 | **Effort:** L

- `[ ]` Flyway V4: `stock_export_requests`, `stock_transfer_requests`
- `[ ]` Xuất kho: Tạo phiếu → Submit → Chờ duyệt → Thực hiện xuất
- `[ ]` Điều chuyển kho: Tạo phiếu → Submit → Chờ duyệt → Thực hiện chuyển
- `[ ]` Tích hợp Approval Module cho mọi phiếu xuất/chuyển
- `[ ]` Stock Ledger ghi EXPORT / TRANSFER transaction
- `[ ]` Device status: INSTOCK → OUT_OF_WAREHOUSE
- `[ ]` **Angular — Thông tin xuất kho:** Form tạo phiếu, chọn thiết bị từ kho, đơn vị nhận
- `[ ]` **Angular — Thông tin điều chuyển kho:** Form chọn kho nguồn/đích, danh sách serial

---

## 🏪 Epic 5: Merchant & TID Management

### [POS-011] Merchant Management
**Priority:** P1 | **Sprint:** 05 | **Effort:** L

- `[ ]` Flyway V5: `merchants`, `merchant_status_history`
- `[ ]` Merchant fields: merchantCode (auto-gen M+6digits), merchantName, taxCode, mccCode, businessUnitId, status
- `[ ]` Merchant Lifecycle: PENDING → ACTIVE → INACTIVE → SUSPENDED
- `[ ]` Gắn Fee Policy cho Merchant (Effective Dating)
- `[ ]` Data Scope: User chỉ thấy Merchant của Business Unit mình
- `[ ]` API: `POST`, `GET`, `PUT /{id}`, `PATCH /{id}/activate`, `PATCH /{id}/suspend`, `GET /{id}/fee-history`
- `[ ]` **Angular — Danh sách Merchant:** Bảng + filter theo status, MCC, Business Unit, search name
- `[ ]` **Angular — Tạo Merchant:** Form với auto-gen code, chọn MCC, Business Unit, gắn Fee Policy
- `[ ]` **Angular — Chi tiết Merchant:** Thông tin, danh sách TID, lịch sử trạng thái, lịch sử phí
- `[ ]` Test: Tạo Merchant, thay đổi trạng thái, gắn Fee Policy

### [POS-012] TID (Terminal ID) Management
**Priority:** P1 | **Sprint:** 05 | **Effort:** M

- `[ ]` Flyway V5: `terminals`, `terminal_status_history`
- `[ ]` Terminal fields: tid (auto-gen T+6digits), merchantId, status, effectiveFrom, effectiveTo
- `[ ]` Terminal Lifecycle: PENDING → ACTIVE → INACTIVE
- `[ ]` Một Merchant có nhiều Terminal; một Terminal gắn với 1 Merchant
- `[ ]` API: `POST /api/v1/terminals`, `GET`, `PUT /{id}`, `PATCH /{id}/activate`, `PATCH /{id}/deactivate`
- `[ ]` **Angular — Quản lý TID:** Bảng TID với filter Merchant, trạng thái; form tạo TID; lịch sử trạng thái

---

## 📱 Epic 6: Device Lifecycle Management

### [POS-013] Device Search & Detail
**Priority:** P0 | **Sprint:** 06 | **Effort:** L

- `[ ]` Flyway V6: `devices` (bổ sung fields), `device_lifecycle_history`
- `[ ]` Device Status: INSTOCK, OUT_OF_WAREHOUSE, DEPLOYED, RETURNED, REPAIRING, DISPOSED
- `[ ]` Device Status State Machine với allowed transitions
- `[ ]` `device_lifecycle_history` — append-only, không xóa/sửa
- `[ ]` API: `GET /api/v1/devices` (search + filter + paginate), `GET /api/v1/devices/{serial}`, `GET /api/v1/devices/{serial}/lifecycle`
- `[ ]` Redis cache: device status (TTL 60s)
- `[ ]` **Angular — Tra cứu thiết bị (Device Search):** Bảng + filter: serial, model, vendor, status, warehouse, merchant
- `[ ]` **Angular — Chi tiết thiết bị (Device Detail)** với 8 tabs:
  - Tab 1: Thông tin chung (Serial, Model, Vendor, Warehouse, Purchase Date, Warranty)
  - Tab 2: Trạng thái hiện tại (Status badge, actions theo trạng thái)
  - Tab 3: Thông tin Merchant (Merchant hiện tại, TID, Assignment ngày tháng)
  - Tab 4: Lịch sử vòng đời (Timeline từ INSTOCK đến hiện tại)
  - Tab 5: Lịch sử Assignment (Các lần cấp phát và thu hồi)
  - Tab 6: Lịch sử sửa chữa (Đơn sửa, kết quả nghiệm thu)
  - Tab 7: Lịch sử kho (Nhập, xuất, điều chuyển)
  - Tab 8: Audit Log (Ai làm gì, lúc nào)
- `[ ]` Test: Search theo nhiều tiêu chí, verify history

### [POS-014] Repair Management (Quản Lý Sửa Chữa)
**Priority:** P2 | **Sprint:** 07 | **Effort:** M

- `[ ]` Flyway V7: `repair_orders`
- `[ ]` Repair Order Lifecycle: CREATED → IN_PROGRESS → COMPLETED (success/fail) → (INSTOCK or DISPOSED)
- `[ ]` API: `POST /api/v1/devices/{serial}/repair-orders`, `GET`, `POST /{id}/complete`, `POST /{id}/fail`
- `[ ]` Khi repair thành công: Device → INSTOCK; khi fail: qua quy trình thanh lý
- `[ ]` **Angular — Đơn sửa chữa:** Form tạo đơn, danh sách đơn, form nghiệm thu kết quả
- `[ ]` Test: Tạo repair, complete, verify device về INSTOCK

---

## 🔗 Epic 7: Assignment Lifecycle

### [POS-015] Device Assignment (Cấp Phát Thiết Bị)
**Priority:** P0 | **Sprint:** 08 | **Effort:** L

- `[ ]` Flyway V8: `assignments`, `assignment_history`
- `[ ]` Assignment concurrent-safe: Optimistic Lock + Unique Partial Index (1 ACTIVE/device)
- `[ ]` Idempotency Key cho mọi assign request
- `[ ]` @Transactional: Tạo Assignment + Update Device status + Ghi lifecycle history + Ghi Outbox
- `[ ]` API: `POST /api/v1/assignments` (+ `X-Idempotency-Key` header), `GET /api/v1/assignments`, `GET /api/v1/assignments/{id}`, `GET /api/v1/devices/{serial}/assignments`
- `[ ]` **Angular — Cấp phát thiết bị (Assignment Create):** Form chọn Serial (search), chọn Merchant, chọn TID, confirm dialog
- `[ ]` **Angular — Danh sách Assignment:** Bảng với filter merchant, device, status
- `[ ]` Test: Happy path, concurrent assign same device, duplicate button click

### [POS-016] Device Return & Transfer
**Priority:** P1 | **Sprint:** 09 | **Effort:** M

- `[ ]` Return device: Assignment → RETURNED, Device → RETURNED status, tạo phiếu thu hồi (cần phê duyệt)
- `[ ]` Transfer device giữa Merchant: thu hồi khỏi Merchant A, cấp phát cho Merchant B (atomic)
- `[ ]` API: `POST /api/v1/assignments/{id}/return`, `POST /api/v1/assignments/{id}/transfer`
- `[ ]` **Angular — Thu hồi thiết bị:** Modal xác nhận + nhập lý do + chọn người phụ trách
- `[ ]` **Angular — Lịch sử Assignment:** Timeline đầy đủ mọi lần cấp phát, thu hồi, điều chuyển
- `[ ]` Test: Return device, verify status, verify history immutable

---

## ✅ Epic 8: Approval Workflow

### [POS-017] Approval Engine (Phê Duyệt Đa Cấp)
**Priority:** P0 | **Sprint:** 10 | **Effort:** XL

- `[ ]` Flyway V9: `approval_requests`, `approval_steps`, `approval_configs`
- `[ ]` Approval States: DRAFT → PENDING_APPROVAL → PENDING_LEVEL_2 → APPROVED → EXECUTING → COMPLETED / REJECTED / RETURNED_FOR_EDIT / CANCELLED
- `[ ]` Configurable approval levels per request type (xuất kho, thu hồi, điều chuyển, thanh lý)
- `[ ]` Business rule: Người tạo không tự duyệt yêu cầu của mình
- `[ ]` Optimistic Lock trên approval request để tránh duyệt trùng
- `[ ]` Kafka integration: Notify người duyệt khi có request mới
- `[ ]` API: `POST /api/v1/approvals/{id}/submit`, `POST /api/v1/approvals/{id}/approve`, `POST /api/v1/approvals/{id}/reject`, `POST /api/v1/approvals/{id}/return-for-edit`, `POST /api/v1/approvals/{id}/cancel`
- `[ ]` API: `GET /api/v1/approvals/inbox` (hộp việc cần duyệt), `GET /api/v1/approvals/my-requests`, `GET /api/v1/approvals` (all)
- `[ ]` **Angular — Hộp việc cần duyệt (Inbox):** Cards thống kê, danh sách cần duyệt, filter theo loại
- `[ ]` **Angular — Chi tiết phiếu phê duyệt:** Timeline approval steps, actions (Duyệt/Từ chối/Yêu cầu chỉnh sửa)
- `[ ]` **Angular — Tất cả yêu cầu:** Bảng toàn bộ requests, filter nhiều chiều
- `[ ]` **Angular — Yêu cầu tôi đã tạo:** Bảng requests của user hiện tại
- `[ ]` **Angular — Lịch sử phê duyệt:** Timeline đầy đủ quyết định của từng người duyệt
- `[ ]` Test: 2-level approval, reject, return for edit, người tạo không tự duyệt

### [POS-018] Approval Notification
**Priority:** P1 | **Sprint:** 11 | **Effort:** M

- `[ ]` Flyway V9: `notifications`
- `[ ]` Kafka Consumer: Listen `approval.submitted`, `approval.approved`, `approval.rejected`
- `[ ]` Idempotent Consumer Pattern (Redis check consumed_event:{id})
- `[ ]` In-App notification + Badge counter
- `[ ]` Mock Email Notification
- `[ ]` API: `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `PATCH /api/v1/notifications/{id}/read`
- `[ ]` **Angular — Notification Badge** trên Header (unread count)
- `[ ]` **Angular — Notification Center:** Danh sách thông báo, đánh dấu đã đọc

---

## ⚡ Epic 9: Kafka & Event-Driven

### [POS-019] Transactional Outbox & Kafka
**Priority:** P0 | **Sprint:** 12 | **Effort:** L

- `[ ]` Flyway V10: `outbox_events`
- `[ ]` Outbox Pattern: Mọi write operation quan trọng ghi event vào cùng DB transaction
- `[ ]` OutboxPollingService: `@Scheduled(fixedDelay = 2000)` đẩy PENDING events lên Kafka
- `[ ]` Kafka Topics: `device-assigned`, `device-returned`, `stock-issued`, `stock-transferred`, `approval-submitted`, `approval-completed`
- `[ ]` Idempotent Consumer: Redis check trước khi xử lý event
- `[ ]` Dead Letter Topic (DLT): Xử lý event thất bại sau 5 lần retry
- `[ ]` **Angular — Monitoring Outbox:** Bảng events, filter status, nút retry thủ công
- `[ ]` Test: Kafka DOWN → DB commit vẫn thành công → Events PENDING → Kafka UP → SENT

---

## 📊 Epic 10: Monitoring & Dashboard

### [POS-020] Main Dashboard
**Priority:** P1 | **Sprint:** 13 | **Effort:** M

- `[ ]` API: `GET /api/v1/dashboard/summary`
- `[ ]` KPIs: Tổng thiết bị / Đang tồn kho / Đang triển khai / Đang sửa chữa / Chờ thanh lý
- `[ ]` KPIs: Tổng Merchant Active / Merchant Inactive / Tổng TID
- `[ ]` KPIs: Phiếu chờ duyệt / Phiếu được duyệt hôm nay
- `[ ]` Top 5 Warehouse theo tồn kho
- `[ ]` Biểu đồ nhập/xuất kho theo tháng
- `[ ]` **Angular — Dashboard:** Cards KPI, Charts (ApexCharts), Quick Actions

### [POS-021] POS System Monitoring
**Priority:** P2 | **Sprint:** 13 | **Effort:** M

- `[ ]` API: `GET /api/v1/monitoring/pos-status` — real-time status of deployed devices
- `[ ]` Filter theo Business Unit, Merchant, Device Model
- `[ ]` Refresh auto mỗi 30s
- `[ ]` **Angular — Giám sát hệ thống POS:** Grid thiết bị với status indicator, filter, auto-refresh

### [POS-022] Audit Log
**Priority:** P1 | **Sprint:** 14 | **Effort:** M

- `[ ]` Flyway V11: `audit_logs` (append-only, không xóa/sửa)
- `[ ]` AOP `@Audit` annotation tự động ghi log trên mọi write endpoint quan trọng
- `[ ]` API: `GET /api/v1/audit-logs` với filter: user, action, resource, date range
- `[ ]` **Angular — Audit Log:** Bảng log, filter nhiều chiều, export CSV

### [POS-023] Reporting
**Priority:** P2 | **Sprint:** 14 | **Effort:** M

- `[ ]` Báo cáo tồn kho theo kho / model / thời gian
- `[ ]` Báo cáo thiết bị theo trạng thái
- `[ ]` Báo cáo assignment: cấp phát, thu hồi, điều chuyển theo tháng
- `[ ]` Báo cáo Merchant: số lượng, MCC, Business Unit
- `[ ]` Export PDF / Excel
- `[ ]` **Angular — Báo cáo (Reports):** Date picker, loại báo cáo, biểu đồ, nút export

---

## 🛡️ Epic 11: Hardening & Observability

### [POS-024] Redis Cache & Performance
**Priority:** P2 | **Sprint:** 15 | **Effort:** M

- `[ ]` Cache device status (TTL 60s) — evict khi device status change
- `[ ]` Cache approval inbox count (TTL 30s)
- `[ ]` Cache merchant info (TTL 5m)
- `[ ]` Test: Cache hit/miss, eviction

### [POS-025] OpenAPI 3 Documentation
**Priority:** P2 | **Sprint:** 15 | **Effort:** S

- `[ ]` OpenAPI config với JWT Bearer Auth
- `[ ]` @Tag và @Operation trên tất cả controllers
- `[ ]` Swagger UI tại `/swagger-ui/index.html`
- `[ ]` **Angular:** Nút link sang Swagger UI trong sidebar

### [POS-026] Prometheus + Grafana
**Priority:** P3 | **Sprint:** 15 | **Effort:** M

- `[ ]` Custom metrics: device assignments/hour, approval processing time, stock in/out
- `[ ]` Grafana dashboard cho POS Management
- `[ ]` Alert rules: approval queue > 10, device assignment failures spike

---

## 📦 Epic 12: Kiểm Kê & Supplement

### [POS-027] Physical Inventory Count (Kiểm Kê Định Kỳ)
**Priority:** P2 | **Sprint:** 14 | **Effort:** M

> **Mục đích:** Đối chiếu số lượng thiết bị thực tế tại kho với số lượng trong hệ thống, phát hiện sai lệch và ghi điều chỉnh (ADJUSTMENT) vào Stock Ledger.

- `[ ]` Flyway V5 (bổ sung): `inventory_counts`, `inventory_count_items`
  ```sql
  CREATE TABLE inventory_counts (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      count_number    VARCHAR(50) NOT NULL UNIQUE,  -- IC-2026-0001
      warehouse_id    UUID        NOT NULL REFERENCES warehouses(id),
      status          VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
      -- DRAFT, IN_PROGRESS, COMPLETED, CANCELLED
      count_date      DATE        NOT NULL,
      notes           TEXT,
      created_by      UUID        NOT NULL REFERENCES users(id),
      version         BIGINT      NOT NULL DEFAULT 0,
      created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE inventory_count_items (
      id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
      inventory_count_id  UUID    NOT NULL REFERENCES inventory_counts(id),
      device_id           UUID    NOT NULL REFERENCES devices(id),
      expected_status     VARCHAR(30),   -- Trạng thái hệ thống dự kiến
      actual_status       VARCHAR(30),   -- Trạng thái kiểm kê thực tế
      discrepancy         BOOLEAN NOT NULL DEFAULT FALSE,
      notes               TEXT,
      counted_by          UUID    REFERENCES users(id),
      created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  ```
- `[ ]` Kiểm kê flow: Tạo phiếu kiểm kê → Xuất danh sách dự kiến theo kho → Nhập kết quả thực tế → Hệ thống tự đối chiếu → Ghi ADJUSTMENT vào Stock Ledger cho các serial sai lệch
- `[ ]` Tố cáo số lượng: số có trong hệ thống vs số kiểm thực tế, sai lệch (%)
- `[ ]` API: `POST /api/v1/inventory/counts`, `GET /api/v1/inventory/counts`, `GET /api/v1/inventory/counts/{id}`, `POST /api/v1/inventory/counts/{id}/start`, `POST /api/v1/inventory/counts/{id}/submit-item`, `POST /api/v1/inventory/counts/{id}/complete`
- `[ ]` **Angular — Kiểm kê định kỳ:** Danh sách phiếu kiểm kê, form tạo phiếu, giao diện nhập kết quả từng serial (có barcode scanner support), báo cáo sai lệch
- `[ ]` Test: Tạo kiểm kê, phát hiện sai lệch, ghi ADJUSTMENT vào stock ledger, verify bất biến

---

### [POS-028] Excel Export Across Modules
**Priority:** P2 | **Sprint:** 14 | **Effort:** M

> **Mục đích:** Cho phép xuất dữ liệu ra file Excel (.xlsx) tại các màn hình danh sách chính, phục vụ báo cáo và kiểm toán nội bộ.

**Tech:** Apache POI `poi-ooxml:5.3.0` (backend), FileSaver.js / native `<a download>` (Angular)

**Backend Checklist:**
- `[ ]` Thêm dependency `poi-ooxml:5.3.0` vào `pos-core/pom.xml`
- `[ ]` Tạo `ExportService` chung với method `createWorkbook(List<T> data, ExportConfig<T> config)`
  ```java
  // ExportConfig khai báo columns và cách lấy value
  ExportConfig<DeviceResponse> config = ExportConfig.<DeviceResponse>builder()
      .sheetName("Thiết bị")
      .column("Serial Number", DeviceResponse::getSerialNumber)
      .column("Trạng thái", r -> translate(r.getStatus()))
      .column("Kho", r -> r.getWarehouse().getName())
      .build();
  ```
- `[ ]` Implement `ExportJobService` cho async export (> 10,000 bản ghi)
  - Background job với Spring `@Async` + ThreadPoolExecutor
  - Lưu kết quả tạm vào `/tmp/exports/{jobId}.xlsx`
  - API polling: `GET /api/v1/jobs/{jobId}`
- `[ ]` Export endpoints (xem `09_API_Contract.md` Section 15):
  - `GET /api/v1/devices/export` (`@PreAuthorize("hasAuthority('DEVICE_EXPORT')")`)
  - `GET /api/v1/assignments/export` (`ASSIGNMENT_EXPORT`)
  - `GET /api/v1/inventory/stock-transactions/export` (`INVENTORY_EXPORT`)
  - `GET /api/v1/inventory/exports/export` (`INVENTORY_EXPORT`)
  - `GET /api/v1/merchants/export` (`MERCHANT_EXPORT`)
  - `GET /api/v1/approvals/export` (`APPROVAL_EXPORT`)
  - `GET /api/v1/audit-logs/export` (`AUDIT_EXPORT` — chỉ AUDITOR + SUPER_ADMIN)
  - `GET /api/v1/jobs/{jobId}` (polling)
  - `GET /api/v1/jobs/{jobId}/download` (download kết quả)
- `[ ]` Excel format chuẩn:
  - Header row: bold, background `#1E3A5F`, text white
  - Zebra striping: white / `#F5F5F5`
  - Freeze panes row 1
  - Auto-fit column width (max 50 chars)
  - Sheet 2: "Thông tin xuất" (thời gian, người xuất, bộ lọc, số bản ghi)
- `[ ]` Giới hạn: < 10,000 → sync; 10,001–50,000 → async job; > 50,000 → từ chối
- `[ ]` Thêm permission seeds: `DEVICE_EXPORT`, `ASSIGNMENT_EXPORT`, `INVENTORY_EXPORT`, `MERCHANT_EXPORT`, `APPROVAL_EXPORT`, `AUDIT_EXPORT`

**Angular Checklist:**
- `[ ]` Tạo `ExportService` Angular:
  ```typescript
  export class ExportService {
    export(url: string, filters: any, filename: string): Observable<void> {
      return this.http.get(url, { params: filters, responseType: 'blob', observe: 'response' })
        .pipe(tap(response => {
          if (response.status === 200) {
            // Sync: download blob ngay
            saveAs(response.body!, filename);
          } else if (response.status === 202) {
            // Async: bắt đầu polling jobId
            const job = JSON.parse(await response.body!.text());
            this.pollJob(job.jobId, filename);
          }
        }));
    }
  }
  ```
- `[ ]` Nút `Export Excel` xuất hiện trên toolbar của các màn hình: Device List, Assignment List, Stock Ledger, Export Requests List, Merchant List, Approval History, Audit Log
- `[ ]` Button state: loading (`Đang tạo file...`) → disabled khi đang export
- `[ ]` Validation trước khi export:
  - `totalElements === 0` → snackbar "Đ NỔng CÓ DỮ LIỆU ĐỂ XUẤT"
  - `totalElements > 50000` → snackbar "QUÁ NHIỀU DỮ LIỆU"
- `[ ]` Async progress dialog: progress bar + "Đang xuất {processed}/{total} bản ghi..."
- `[ ]` Snackbar sau khi xuất xong: "✅ Đã xuất {count} bản ghi ra file Excel"

**Test:**
- `[ ]` Export 0 bản ghi → thông báo lỗi rõ ràng
- `[ ]` Export < 10,000 bản ghi → download ngay
- `[ ]` Export > 10,000 bản ghi → async job + polling + download khi xong
- `[ ]` Kiểm tra file Excel có format đúng (header bold, zebra, freeze row 1)
- `[ ]` Kiểm tra permission: user không có `DEVICE_EXPORT` không thấy nút Export
