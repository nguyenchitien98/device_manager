# POS Management System — Progress Tracker (Task.md)

> Cập nhật file này sau mỗi task hoàn thành. Format: `[x]` done, `[/]` in progress, `[ ]` todo.

---

## 📦 Sprint 00 — Infrastructure Foundation

- `[ ]` Tạo cấu trúc thư mục monorepo `pos-management/`
- `[ ]` Docker Compose với PostgreSQL 16 + Redis 7 + Kafka + Kafka UI
- `[ ]` Docker Compose với Prometheus + Grafana + Jaeger
- `[ ]` Maven multi-module `pom.xml` (pos-gateway, pos-core, pos-common)
- `[ ]` `pos-common`: ApiResponse<T>, ApiErrorResponse, GlobalExceptionHandler
- `[ ]` Angular 22 project với Standalone Components + SCSS (compile sạch)
- `[ ]` Health check endpoint `GET /api/v1/health`
- `[ ]` Flyway V1: `V1__init_base_schema.sql` (uuid extension)
- `[ ]` Đọc và review tất cả docs trong `POS_Managermant/docs/`

---

## 🔐 Sprint 01 — Auth, RBAC & Admin Layout

- `[ ]` Flyway V2: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `refresh_tokens`, `auth_audit_logs`
- `[ ]` Seed: 9 roles mặc định + admin user (`admin@pos.vn` / `Admin@123`)
- `[ ]` JWT generation: Access Token 15m + Refresh Token 7d
- `[ ]` Refresh Token Rotation (Redis + DB)
- `[ ]` Rate limit login (5 lần/phút) + Account Lock (30 phút sau 5 sai)
- `[ ]` Spring Security 6 filter chain (`JwtAuthenticationFilter`)
- `[ ]` Data Scope Service (inject businessUnitId vào mọi list query)
- `[ ]` @PreAuthorize cơ bản
- `[ ]` APIs: `POST /api/v1/auth/login`, `/refresh`, `/logout`
- `[ ]` APIs: `GET /api/v1/admin/users`, `POST`, `PATCH /{id}/lock`
- `[ ]` APIs: `GET /api/v1/admin/roles`, `POST`, `PUT /{id}/permissions`
- `[ ]` Audit log: LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT
- `[ ]` **Angular — Login Page** (tách `.ts`, `.html`, `.scss`)
- `[ ]` **Angular — Auth Service + Token Service** (Signal-based)
- `[ ]` **Angular — JWT Interceptor + Error Interceptor**
- `[ ]` **Angular — Auth Guard + Permission Guard**
- `[ ]` **Angular — Main Layout** (Header + Sidebar + Content area)
- `[ ]` **Angular — Sidebar** với đầy đủ menu items theo role
- `[ ]` **Angular — User Management Page**
- `[ ]` **Angular — Role & Permission Matrix Page**
- `[ ]` Test: Login success, sai pass, account lock, token rotation (Compile 100% SUCCESS)

---

## 📂 Sprint 02 — Catalog & Organization

- `[ ]` Flyway V3: `device_categories`, `device_types`, `device_models`, `vendors`
- `[ ]` Flyway V3: `mcc_codes`, `fee_policies`
- `[ ]` Flyway V3: `business_units`, `warehouses`
- `[ ]` Flyway V3 seed: Dữ liệu mẫu đầy đủ (3 BU, 4 Kho, PAX/Ingenico/Verifone, A920/iCT220...)
- `[ ]` CRUD APIs: Device Category, Device Type, Device Model, Vendor (pagination + filter)
- `[ ]` CRUD APIs: MCC, Fee Policy (effective dating)
- `[ ]` CRUD APIs: Business Unit, Warehouse
- `[ ]` Validate hierarchy: Model → Type → Category
- `[ ]` Soft delete với data validation
- `[ ]` **Angular — Reusable DataTableComponent** (server-side pagination, sort, filter)
- `[ ]` **Angular — ConfirmDialogComponent**
- `[ ]` **Angular — Device Category Page**
- `[ ]` **Angular — Device Type Page**
- `[ ]` **Angular — Device Model Page**
- `[ ]` **Angular — Vendor Page**
- `[ ]` **Angular — MCC Page**
- `[ ]` **Angular — Fee Policy Page**
- `[ ]` **Angular — Business Unit Page**
- `[ ]` **Angular — Warehouse Page**
- `[ ]` Test: CRUD tất cả catalog, validate hierarchy (Compile 100% SUCCESS)

---

## 📦 Sprint 03 — Inventory: Nhập Kho

- `[ ]` Flyway V4: `purchase_orders`, `purchase_order_items`, `devices`, `stock_transactions`, `outbox_events`
- `[ ]` Purchase Order Lifecycle: DRAFT → SUBMITTED → APPROVED → RECEIVED → CLOSED
- `[ ]` Stock Ledger: `stock_transactions` append-only (IMPORT type)
- `[ ]` Nhập kho từ PO: Tạo Device record per serial + IMPORT stock_transaction + Outbox Event
- `[ ]` Unique constraint: `serial_number` trong `devices`
- `[ ]` Outbox Pattern: `DeviceReceivedEvent` publisher
- `[ ]` OutboxPollingService: `@Scheduled(fixedDelay = 2000)` đẩy events lên Kafka
- `[ ]` APIs: Purchase Order CRUD + lifecycle transitions
- `[ ]` APIs: `POST /api/v1/inventory/imports`, `GET /api/v1/inventory/stock`, `GET /api/v1/inventory/transactions`
- `[ ]` **Angular — Purchase Order List Page**
- `[ ]` **Angular — Purchase Order Create/Detail Page**
- `[ ]` **Angular — Nhập Kho Page** (bulk serial input, validation)
- `[ ]` **Angular — Tồn Kho (Stock Overview) Page**
- `[ ]` Test: Nhập 50 thiết bị, duplicate serial rejected, outbox event SENT (Compile 100% SUCCESS)

---

## 📤 Sprint 04 — Inventory: Xuất Kho & Điều Chuyển

- `[ ]` Flyway V5: `stock_export_requests`, `stock_transfer_requests`, `approval_requests` (basic)
- `[ ]` Approval basic (1-level): DRAFT → PENDING_APPROVAL → APPROVED/REJECTED → EXECUTING → COMPLETED
- `[ ]` Xuất kho: Device INSTOCK → OUT_OF_WAREHOUSE (sau khi approved)
- `[ ]` Điều chuyển: Device giữ INSTOCK, đổi warehouse
- `[ ]` Stock Ledger: EXPORT, TRANSFER_OUT, TRANSFER_IN transactions
- `[ ]` Device Lifecycle History: ghi khi status thay đổi
- `[ ]` **Angular — Xuất Kho Page** (multi-select devices)
- `[ ]` **Angular — Điều Chuyển Kho Page**
- `[ ]` **Angular — Approval Basic Page** (danh sách phiếu chờ duyệt, detail + action)
- `[ ]` Test: Xuất kho → duyệt → Device OUT_OF_WAREHOUSE (Compile 100% SUCCESS)

---

## 🏪 Sprint 05 — Merchant & TID

- `[ ]` Flyway V6: `merchants`, `terminals`, `merchant_fee_assignments`
- `[ ]` Auto-generate MerchantCode (M + 6 digits), TID (T + 6 digits)
- `[ ]` Merchant Lifecycle: PENDING → ACTIVE → INACTIVE → SUSPENDED
- `[ ]` Fee Policy Effective Dating: Unique partial index (1 active policy/merchant)
- `[ ]` Data Scope: Merchant filter theo Business Unit
- `[ ]` APIs: Merchant CRUD + lifecycle transitions + fee policy
- `[ ]` APIs: Terminal CRUD + status management
- `[ ]` **Angular — Merchant List Page**
- `[ ]` **Angular — Merchant Detail Page** (4 tabs)
- `[ ]` **Angular — TID Management Page**
- `[ ]` Test: Tạo merchant, thay đổi trạng thái, gắn fee policy (Compile 100% SUCCESS)

---

## 📱 Sprint 06 — Device Lifecycle & Detail

- `[ ]` Flyway V7: `device_lifecycle_history` (append-only)
- `[ ]` Device Status State Machine (enum với allowed transitions)
- `[ ]` DeviceLifecycleHistoryService (ghi mỗi khi status thay đổi)
- `[ ]` Redis cache: `device:status:{serial}` (TTL 60s) + evict on update
- `[ ]` APIs: `GET /api/v1/devices` (search/filter/paginate), `GET /api/v1/devices/{serial}`, `GET /api/v1/devices/{serial}/lifecycle`
- `[ ]` **Angular — Device Search Page**
- `[ ]` **Angular — Device Detail Page** (8 tabs đầy đủ)
  - Tab 1: Thông tin chung
  - Tab 2: Trạng thái + FSM visualization
  - Tab 3: Merchant hiện tại
  - Tab 4: Lịch sử vòng đời (timeline)
  - Tab 5: Lịch sử Assignment
  - Tab 6: Lịch sử sửa chữa
  - Tab 7: Lịch sử kho
  - Tab 8: Audit Log
- `[ ]` **Angular — Device Status Badge Component** (reusable)
- `[ ]` **Angular — Lifecycle Timeline Component** (reusable)
- `[ ]` Test: Search, detail 8 tabs, FSM invalid transition rejected (Compile 100% SUCCESS)

---

## 🔧 Sprint 07 — Repair Management

- `[ ]` Flyway V8: `repair_orders`
- `[ ]` Repair Order Lifecycle: CREATED → IN_PROGRESS → COMPLETED/FAILED
- `[ ]` Repair complete → Device REPAIRING → INSTOCK
- `[ ]` Repair fail → Tạo phiếu thanh lý (qua Approval)
- `[ ]` Thanh lý: INSTOCK → DISPOSED (qua Approval)
- `[ ]` APIs: Repair Order CRUD + lifecycle
- `[ ]` APIs: `POST /api/v1/devices/{serial}/dispose` (tạo phiếu thanh lý)
- `[ ]` **Angular — Repair Order Management Page**
- `[ ]` **Angular — Form Nghiệm Thu**
- `[ ]` Test: RETURNED → Repair → INSTOCK; fail → Dispose (Compile 100% SUCCESS)

---

## 🔗 Sprint 08 — Assignment & Concurrency

- `[ ]` Flyway V9: `assignments` (với @Version), `assignment_history`
- `[ ]` Partial unique index: `assignments(device_id) WHERE status = 'ACTIVE'`
- `[ ]` Optimistic Lock trên DeviceJpaEntity (`@Version`) + Retry 3 lần
- `[ ]` Idempotency: `X-Idempotency-Key` header + Redis SETNX
- `[ ]` @Transactional: Tạo Assignment + Update Device → DEPLOYED + History + Outbox
- `[ ]` APIs: `POST /api/v1/assignments` (idempotent), `GET`, `GET /{id}`, `GET /devices/{serial}/assignments`
- `[ ]` **Angular — Idempotency Interceptor** (auto-generate UUID cho POST/PATCH)
- `[ ]` **Angular — Assignment Create Page** (multi-step form)
- `[ ]` **Angular — Assignment List Page**
- `[ ]` Test: Assign success, 2 concurrent → chỉ 1 thành công, duplicate click idempotent (Compile 100% SUCCESS)

---

## ↩️ Sprint 09 — Return & Transfer

- `[ ]` Return device: Assignment → RETURNED, Device → RETURNED, Outbox
- `[ ]` Transfer device: atomic return + re-assign (cùng @Transactional)
- `[ ]` APIs: `POST /api/v1/assignments/{id}/return`, `POST /api/v1/assignments/{id}/transfer`
- `[ ]` **Angular — Thu Hồi Modal** (confirm + lý do)
- `[ ]` **Angular — Assignment History Page** (timeline)
- `[ ]` Test: Return, Transfer atomic, history immutable (Compile 100% SUCCESS)

---

## ✅ Sprint 10 — Approval Workflow Full

- `[ ]` Flyway V10: `approval_requests`, `approval_steps`, `approval_configs`
- `[ ]` Full Approval States: DRAFT → PENDING_APPROVAL → PENDING_LEVEL_2 → APPROVED → EXECUTING → COMPLETED (+ REJECTED, RETURNED_FOR_EDIT, CANCELLED)
- `[ ]` Business rule: Người tạo KHÔNG tự duyệt
- `[ ]` Optimistic Lock trên `approval_requests`
- `[ ]` Configurable levels per request type
- `[ ]` Tích hợp Inventory, Assignment, Device execute khi APPROVED
- `[ ]` Kafka: `approval.submitted` → notify người duyệt
- `[ ]` APIs: Full approval actions + `/inbox` + `/my-requests` + `/all`
- `[ ]` **Angular — Approval Inbox Page** (Hộp việc cần duyệt)
- `[ ]` **Angular — Approval Detail Page** (timeline + actions)
- `[ ]` **Angular — My Requests Page**
- `[ ]` **Angular — All Requests Page**
- `[ ]` **Angular — Approval History Page**
- `[ ]` **Angular — Badge counter trên Sidebar** (real-time unread count)
- `[ ]` **Angular — Approval Timeline Component** (reusable)
- `[ ]` Test: 2-level approval, reject, return for edit, người tạo không tự duyệt (Compile 100% SUCCESS)

---

## 🔔 Sprint 11 — Notification

- `[ ]` Flyway V10: `notifications`
- `[ ]` Kafka Consumer: `@KafkaListener` trên approval events
- `[ ]` Idempotent Consumer: Redis key `consumed_event:{eventId}` (TTL 1h)
- `[ ]` Mock Email Sender + Mock Push Sender
- `[ ]` APIs: `GET /api/v1/notifications`, `/unread-count`, `PATCH /{id}/read`, `PATCH /read-all`
- `[ ]` **Angular — Notification Badge** trên Header
- `[ ]` **Angular — Notification Panel/Dropdown**
- `[ ]` Test: Kafka event → Redis check → Notification ghi DB → Badge update (Compile 100% SUCCESS)

---

## ⚡ Sprint 12 — Kafka & Outbox Hardening

- `[ ]` OutboxPollingService: `FOR UPDATE SKIP LOCKED` (tránh duplicate publish)
- `[ ]` Retry max 5 lần → FAILED
- `[ ]` Dead Letter Topic: `device-assigned.DLT`, `stock-issued.DLT`
- `[ ]` Idempotent Consumer pattern cho tất cả consumers
- `[ ]` Event ordering: serialNumber/deviceId làm Kafka partition key
- `[ ]` Chaos toggle: bật/tắt Kafka giả lập
- `[ ]` APIs: `GET /api/v1/outbox/events`, `POST /api/v1/outbox/events/{id}/retry`, `POST /api/v1/outbox/chaos/toggle-kafka`
- `[ ]` **Angular — Outbox Events Monitor Page**
- `[ ]` Test: Kafka DOWN → DB commit OK → Events PENDING → Kafka UP → SENT (Compile 100% SUCCESS)

---

## 📊 Sprint 13 — Dashboard & POS Monitoring

- `[ ]` API: `GET /api/v1/dashboard/summary` — aggregate KPIs
- `[ ]` API: `GET /api/v1/monitoring/pos-status` — DEPLOYED devices realtime
- `[ ]` **Angular — Main Dashboard Page** (KPI cards + Bar chart + Donut chart + Top 5 kho + Activity feed)
- `[ ]` **Angular — Giám Sát POS Page** (Grid thiết bị, auto-refresh 30s)
- `[ ]` Test: Dashboard KPIs chính xác (Compile 100% SUCCESS)

---

## 📝 Sprint 14 — Audit Log & Reports

- `[ ]` Flyway V11: `audit_logs` (append-only)
- `[ ]` `@Audit` AOP annotation tự động ghi log
- `[ ]` Report APIs: tồn kho, thiết bị, assignment, merchant
- `[ ]` **Angular — Audit Log Page** (table + filter + modal diff)
- `[ ]` **Angular — Reports Page** (date picker + chart + export)
- `[ ]` Test: Audit log ghi đủ, export hoạt động (Compile 100% SUCCESS)

---

## 🛡️ Sprint 15 — Hardening & Production Ready

- `[ ]` Redis cache: device status, approval inbox count, merchant info
- `[ ]` Cache eviction policy cho mọi resource
- `[ ]` OpenAPI 3 config + @Tag/@Operation trên tất cả controllers
- `[ ]` Swagger UI tại `/swagger-ui/index.html`
- `[ ]` Resilience4j: Circuit Breaker + Retry
- `[ ]` Prometheus custom metrics: assignments/hour, approval processing time
- `[ ]` Grafana dashboard cho POS Management
- `[ ]` Docker Compose optimization: healthcheck, resource limits
- `[ ]` **Angular — Swagger UI link** trong sidebar
- `[ ]` Load test k6: concurrent assignment, approval throughput
- `[ ]` Test: Circuit Breaker trip to OPEN, fallback, metrics visible in Grafana (Compile 100% SUCCESS)

---

## 📊 Progress Summary

```
Phase 0 (Sprint 00):    0/9   tasks  [  0%]
Phase 1 (Sprint 01):    0/23  tasks  [  0%]
Phase 2 (Sprint 02):    0/19  tasks  [  0%]
Phase 3 (Sprint 03):    0/15  tasks  [  0%]
Phase 4 (Sprint 04):    0/11  tasks  [  0%]
Phase 5 (Sprint 05):    0/12  tasks  [  0%]
Phase 6 (Sprint 06):    0/14  tasks  [  0%]
Phase 7 (Sprint 07):    0/9   tasks  [  0%]
Phase 8 (Sprint 08):    0/13  tasks  [  0%]
Phase 9 (Sprint 09):    0/7   tasks  [  0%]
Phase 10 (Sprint 10):   0/19  tasks  [  0%]
Phase 11 (Sprint 11):   0/9   tasks  [  0%]
Phase 12 (Sprint 12):   0/10  tasks  [  0%]
Phase 13 (Sprint 13):   0/6   tasks  [  0%]
Phase 14 (Sprint 14):   0/7   tasks  [  0%]
Phase 15 (Sprint 15):   0/12  tasks  [  0%]

OVERALL: 0/195 tasks completed (0% — Ready to start!)
```

---

## 📝 Ghi Chú / Blockers

> Thêm ghi chú, vấn đề gặp phải, quyết định đột xuất vào đây.

- [2026-10-01] Khởi tạo dự án POS Management — Planning & Documentation phase
- [2026-10-01] Đã tạo đầy đủ bộ tài liệu docs (00 → 07), prompt.md, task.md, architecture_diagrams.md
