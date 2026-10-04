# POS Management System — Backend API Execution Progress Log (BACKEND_PROGRESS.md)

> File nhật ký và bằng chứng kiểm định (Gates) cho từng bước B0 -> B10 theo `docs/16_Backend_API_Implementation_Flow.md`.

---

## 📌 BẢNG TỔNG QUAN TIẾN ĐỘ

| Bước | Tên bước | Trạng thái | Maven Build | Angular Build | Flyway DB | Verification / Curl | Git Commit |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **B0** | Pre-requisites & Core Infrastructure Fixes | ✅ PASS | SUCCESS | SUCCESS | N/A | N/A | Completed |
| **B1** | Identity, Auth & System Core APIs | ✅ PASS | SUCCESS | SUCCESS | V5 PASS | Verified | Completed |
| **B2** | Catalog & Organization Master Data | ✅ PASS | SUCCESS | SUCCESS | V3 PASS | Verified | Completed |
| **B3** | Merchant & Terminal (TID/MID) Management | ✅ PASS | SUCCESS | SUCCESS | V4 PASS | Verified | Completed |
| **B4** | PO, Import, Devices & Stock Ledger | ✅ PASS | SUCCESS | SUCCESS | V6 PASS | Verified | Completed |
| **B5** | Approval Workflow Engine | ✅ PASS | SUCCESS | SUCCESS | V7 PASS | Verified | Completed |
| **B6** | Stock Export, Transfer & Logistics | ✅ PASS | SUCCESS | SUCCESS | V8 PASS | Verified | Completed |
| **B7** | Device Detail 8-Tabs, FSM, Repair & Dispose | ✅ PASS | SUCCESS | SUCCESS | V9 PASS | Verified | Completed |
| **B8** | Assignment, Idempotency & Concurrency | ✅ PASS | SUCCESS | SUCCESS | V10 PASS | Verified | Completed |
| **B9** | Audit Log, Notifications, Outbox & Reports | ✅ PASS | SUCCESS | SUCCESS | V11 PASS | Verified | Completed |
| **B10** | FE Cleanup & Integration Final Pass | ⏳ IN PROGRESS | – | – | – | – | Pending |

---

## 📝 BÁO CÁO CHI TIẾT TỪNG BƯỚC

### 🟢 BƯỚC B0: Pre-requisites & Core Infrastructure Fixes
- **Ngày hoàn thành:** 2026-10-04
- **Công việc đã làm:**
  1. G1: Tạo `frontend/proxy.conf.json` proxy `/api` sang `http://localhost:8080` và cấu hình `"proxyConfig": "proxy.conf.json"` trong `angular.json`.
  2. G2: Fix `BaseApiService.put/patch/delete` tránh sinh trailing slash `/` ở cuối URL khi `id` rỗng.
  3. G3: Tạo `PageResponse<T>` trong `pos-common` với các thuộc tính `content, pageNumber, pageSize, totalElements, totalPages, first, last` khớp 100% với FE interface.
  4. G4: Thêm field `code` vào `ApiResponse` (`SUCCESS`) và `ApiErrorResponse` (`code` alias của `errorCode`) trong `pos-common`.
  5. G5: Đã rà soát `QueryParams` chuẩn 0-based paging.
- **Kết quả Gate:**
  - `mvn clean verify` -> SUCCESS (0 lỗi Java)
  - `npm run build` -> SUCCESS (0 lỗi TypeScript / SCSS)
- **Commit:** `feat(backend): B0 - core infra, proxy config, PageResponse & ApiResponse code field`

---

### 🟢 BƯỚC B1: Identity, Auth & System Core APIs
- **Ngày hoàn thành:** 2026-10-04
- **Công việc đã làm:**
  1. Auth: Đã có sẵn `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`. Bổ sung `PUT /auth/me` (cập nhật hồ sơ) và `POST /auth/change-password` (đổi mật khẩu).
  2. Admin Users: Tạo `UserAdminController` (`/api/v1/admin/users`) hỗ trợ phân trang `PageResponse`, tìm kiếm `search`, lọc theo `status` & `businessUnitId`, tạo user, sửa user, khóa/mở khóa (`PATCH /{id}/lock`), reset password (`POST /{id}/reset-password`), xuất CSV/Excel (`GET /export`).
  3. Admin Roles & Permissions: Tạo `RoleAdminController` (`/api/v1/admin/roles` & `/permissions`) hỗ trợ phân trang role, tạo role, gán danh sách permissions (`PUT /{roleId}/permissions`), lấy danh sách tất cả permission (`GET /permissions`), xuất file export.
  4. System Configs: Tạo `V5__system_configs_schema.sql` migration, `SystemConfigJpaEntity`, `SystemConfigJpaRepository`, `SystemConfigController` (`/api/v1/admin/config`) hỗ trợ `GET` & `PUT` cấu hình hệ thống (General, Security, Session, Registration).
- **Kết quả Gate:**
  - `mvn clean verify` -> SUCCESS (0 lỗi Java)
  - `npm run build` -> SUCCESS (0 lỗi TypeScript / SCSS)
- **Commit:** `feat(backend): B1 - identity, auth profile, admin users, roles & system config APIs`

---

### 🟢 BƯỚC B2: Catalog & Organization Master Data
- **Ngày hoàn thành:** 2026-10-04
- **Công việc đã làm:**
  1. Catalog (6 resource):
     - `DeviceCategory`: Controller (`/api/v1/catalog/device-categories`), JPA Entity, Repository. Hỗ trợ CRUD, phân trang, filter `code/name/status`, soft delete (kiểm tra `POS-2008` nếu còn `DeviceType` active), export CSV.
     - `DeviceType`: Controller (`/api/v1/catalog/device-types`), JPA Entity, Repository. Hỗ trợ CRUD, filter `categoryId`, soft delete (kiểm tra `POS-2008` nếu còn `DeviceModel` active), export CSV.
     - `DeviceModel`: Controller (`/api/v1/catalog/device-models`), JPA Entity, Repository. Hỗ trợ CRUD, filter `deviceTypeId` & `vendorId`, soft delete, export CSV.
     - `Vendor`: Controller (`/api/v1/catalog/vendors`), JPA Entity, Repository. Hỗ trợ CRUD, search, soft delete, export CSV.
     - `MccCode`: Controller (`/api/v1/catalog/mcc`), JPA Entity, Repository. Hỗ trợ CRUD, search code/name/category, soft delete, export CSV.
     - `FeePolicy`: Controller (`/api/v1/catalog/fee-policies`), JPA Entity, Repository. Hỗ trợ CRUD, filter `effectiveDate`, soft delete, export CSV.
  2. Organization (2 resource):
     - `BusinessUnit`: Controller (`/api/v1/organization/business-units`), JPA Entity, Repository. Hỗ trợ CRUD, soft delete (kiểm tra `POS-2008` nếu còn `Warehouse` active), export CSV.
     - `Warehouse`: Controller (`/api/v1/organization/warehouses`), JPA Entity, Repository. Hỗ trợ CRUD, filter `businessUnitId`, soft delete, export CSV.
- **Kết quả Gate:**
  - `mvn clean verify` -> SUCCESS (0 lỗi Java)
  - `npm run build` -> SUCCESS (0 lỗi TypeScript / SCSS)
- **Commit:** `feat(backend): B2 - catalog (6 resources) & organization (2 resources) master data APIs`

---

### 🟢 BƯỚC B3: Merchant & Terminal (TID/MID) Management
- **Ngày hoàn thành:** 2026-10-04
- **Công việc đã làm:**
  1. Merchants (`/api/v1/merchants`): `MerchantController`, `MerchantJpaEntity`, `MerchantJpaRepository`.
     - `GET /api/v1/merchants`: Danh sách phân trang, filter `status, mccId, businessUnitId, search`.
     - `GET /api/v1/merchants/{id}`: Chi tiết Merchant.
     - `POST /api/v1/merchants`: Tạo mới (tự động sinh mã `Mxxxxxx` nếu không truyền).
     - `PUT /api/v1/merchants/{id}`: Cập nhật thông tin Merchant.
     - `PATCH /api/v1/merchants/{id}/status`: Cập nhật trạng thái (`{status, reason}`).
     - `POST /api/v1/merchants/{merchantId}/fee-policy`: Gán chính sách phí.
     - `GET /api/v1/merchants/export`: Xuất file CSV/Excel Merchant.
  2. Terminals (`/api/v1/terminals`): `TerminalController`, `TerminalJpaEntity`, `TerminalJpaRepository`.
     - `GET /api/v1/terminals`: Danh sách phân trang, filter `status, search`.
     - `GET /api/v1/terminals/{id}`: Chi tiết Terminal TID.
     - `POST /api/v1/terminals`: Cấp mới TID (tự động sinh mã `Txxxxxx` nếu không truyền).
     - `PATCH /api/v1/terminals/{id}/status`: Cập nhật trạng thái (`{status}`).
     - `GET /api/v1/terminals/export`: Xuất file CSV/Excel Terminal TID.
- **Kết quả Gate:**
  - `mvn clean verify` -> SUCCESS (0 lỗi Java)
  - `npm run build` -> SUCCESS (0 lỗi TypeScript / SCSS)
- **Commit:** `feat(backend): B3 - merchant & terminal (TID/MID) management APIs`

---

### 🟢 BƯỚC B4: PO, Import, Devices & Stock Ledger
- **Ngày hoàn thành:** 2026-10-04
- **Công việc đã làm:**
  1. Migration `V6__inventory_devices_stock_schema.sql`: tạo các bảng `purchase_orders`, `purchase_order_items`, `devices`, `stock_transactions`, `outbox_events`.
  2. JPA Entities & Repositories: `PurchaseOrderJpaEntity`, `PurchaseOrderItemJpaEntity`, `DeviceJpaEntity`, `StockTransactionJpaEntity`, `OutboxEventJpaEntity`.
  3. `InventoryController` (`/api/v1/inventory`):
     - Purchase Orders: `GET /purchase-orders` (phân trang, filter `status, vendorId, warehouseId`), `GET /{id}`, `POST` tạo mới (mã `PO-YYYYMMDD-xxx`), `POST /{id}/submit`, `POST /{id}/approve`, `POST /{id}/receive`, `POST /{id}/close`, `GET /purchase-orders/export`.
     - Imports & Serial Scanning: `GET /imports`, `POST /imports` (nhập kho số lượng lớn từ serials, validate trùng serial -> trả `409 CONFLICT`, ghi `devices` INSTOCK, ghi `stock_transactions` IMPORT, ghi `outbox_events` DEVICE_IMPORTED), `GET /imports/export`.
     - Stock Summary: `GET /stock` (tồn kho theo Kho x Model), `GET /stock/{warehouseId}/devices` (danh sách serial trong kho), `GET /stock/export`.
     - Stock Ledger: `GET /transactions` (nhật ký xuất/nhập/điều chuyển kho).
- **Kết quả Gate:**
  - `mvn clean verify` -> SUCCESS (0 lỗi Java)
  - `npm run build` -> SUCCESS (0 lỗi TypeScript / SCSS)
- **Commit:** `feat(backend): B4 - PO lifecycle, import serial scanning, devices & stock ledger APIs`

---

### 🟢 BƯỚC B5: Approval Workflow Engine
- **Ngày hoàn thành:** 2026-10-04
- **Công việc đã làm:**
  1. Migration `V7__approval_workflow_schema.sql`: tạo các bảng `approval_requests`, `approval_steps`.
  2. JPA Entities & Repositories: `ApprovalRequestJpaEntity`, `ApprovalStepJpaEntity`, `ApprovalRequestJpaRepository`.
  3. `ApprovalController` (`/api/v1/approvals`):
     - `GET /inbox`: Hòm việc cần duyệt (Pending).
     - `GET /my-requests`: Yêu cầu do người dùng hiện tại tạo.
     - `GET /all`: Tất cả hồ sơ phê duyệt.
     - `GET /stats`: Thống kê đếm `pendingCount, approvedCount, rejectedCount`.
     - `GET /{id}`: Chi tiết hồ sơ và các bước phê duyệt (Timeline).
     - `POST /{id}/approve`: Duyệt hồ sơ (Validate quy tắc Maker-Checker: Người tạo KHÔNG ĐƯỢC tự duyệt hồ sơ của mình -> trả lỗi `POS-5003`).
     - `POST /{id}/reject`: Từ chối hồ sơ kèm lý do.
     - `POST /{id}/return-for-edit`: Trả hồ sơ về cho người tạo chỉnh sửa.
     - `POST /{id}/cancel`: Hủy hồ sơ.
     - `GET /inbox/export` & `GET /export`: Xuất file Excel hòm thư phê duyệt.
- **Kết quả Gate:**
  - `mvn clean verify` -> SUCCESS (0 lỗi Java)
  - `npm run build` -> SUCCESS (0 lỗi TypeScript / SCSS)
- **Commit:** `feat(backend): B5 - approval workflow engine APIs & Maker-Checker rule`

---

### 🟢 BƯỚC B6: Stock Export, Transfer & Logistics
- **Ngày hoàn thành:** 2026-10-04
- **Công việc đã làm:**
  1. Migration `V8__stock_export_transfer_logistics_schema.sql`: tạo các bảng `stock_exports`, `stock_export_items`, `stock_transfers`, `stock_transfer_items`, `logistics_shipments`.
  2. JPA Entities & Repositories: `StockExportJpaEntity`, `StockExportItemJpaEntity`, `StockTransferJpaEntity`, `StockTransferItemJpaEntity`, `LogisticsShipmentJpaEntity`.
  3. `StockExportTransferController` (`/api/v1`):
     - `GET /inventory/exports` & `POST /inventory/exports`: Tạo phiếu xuất kho, tự động sinh Hồ sơ phê duyệt `STOCK_EXPORT` trong `approval_requests`. `GET /exports/export`.
     - `GET /inventory/transfers` & `POST /inventory/transfers`: Tạo Lệnh điều chuyển kho, tự động sinh Hồ sơ phê duyệt `STOCK_TRANSFER`. `GET /transfers/export`.
     - `GET /logistics/shipments` & `GET /logistics/shipments/export`: Danh sách vận đơn logistics và xuất Excel.
- **Kết quả Gate:**
  - `mvn clean verify` -> SUCCESS (0 lỗi Java)
  - `npm run build` -> SUCCESS (0 lỗi TypeScript / SCSS)
- **Commit:** `feat(backend): B6 - stock export, transfer & logistics APIs linked to approval engine`

---

### 🟢 BƯỚC B7: Device Detail 8-Tabs, FSM, Repair & Dispose
- **Ngày hoàn thành:** 2026-10-04
- **Công việc đã làm:**
  1. Migration `V9__device_lifecycle_repair_schema.sql`: tạo các bảng `device_lifecycle_history`, `repair_orders`.
  2. JPA Entities & Repositories: `DeviceLifecycleJpaEntity`, `RepairOrderJpaEntity`, `DeviceLifecycleJpaRepository`, `RepairOrderJpaRepository`.
  3. `DeviceDetailController` (`/api/v1`):
     - `GET /devices` (phân trang, filter `serialNumber, status, modelId, warehouseId, merchantId`).
     - `GET /devices/{serialNumber}` (chi tiết thiết bị kèm tên Model, Kho, Merchant).
     - `GET /devices/{serialNumber}/lifecycle`, `/assignments`, `/repairs`, `/stock-history`, `/audit-logs` (hỗ trợ 8 tabs màn hình chi tiết thiết bị).
     - `PATCH /devices/{serialNumber}/status` (chuyển trạng thái FSM, ghi nhật ký lịch sử `device_lifecycle_history`).
     - `POST /devices/{serialNumber}/repairs` (gửi bảo hành, tạo lệnh sửa chữa `RO-YYYYMMDD-xxxx`, chuyển trạng thái thiết bị sang `REPAIRING`).
     - `POST /devices/{serialNumber}/dispose` (thanh lý / tiêu hủy thiết bị, chuyển trạng thái `DISPOSED`).
     - `GET /devices/export` & `GET /devices/monitoring/export`.
     - `GET /repairs`: Danh sách phiếu bảo hành sửa chữa.
     - `PATCH /repairs/{id}/complete`: Hoàn thành sửa chữa -> trả thiết bị về `INSTOCK`.
     - `PATCH /repairs/{id}/fail`: Sửa chữa thất bại -> thanh lý thiết bị `DISPOSED`.
     - `GET /repairs/export`: Xuất Excel danh sách sửa chữa.
  4. FE Alignment: Bổ sung các endpoint trong `device-api.service.ts`.
- **Kết quả Gate:**
  - `mvn clean verify` -> SUCCESS (0 lỗi Java)
  - `npm run build` -> SUCCESS (0 lỗi TypeScript / SCSS)
- **Commit:** `feat(backend): B7 - device detail 8-tabs, FSM status transition, repair & dispose APIs`

---

### 🟢 BƯỚC B8: Assignment, Idempotency & Concurrency
- **Ngày hoàn thành:** 2026-10-04
- **Công việc đã làm:**
  1. Migration `V10__assignment_schema.sql`: tạo các bảng `assignments`, `assignment_history`.
  2. JPA Entities & Repositories: `AssignmentJpaEntity`, `AssignmentHistoryJpaEntity`, `AssignmentJpaRepository`, `AssignmentHistoryJpaRepository`.
  3. `AssignmentController` (`/api/v1/assignments`):
     - `GET /assignments`: Danh sách bàn giao (phân trang, filter `search, status, merchantId, terminalId`).
     - `GET /assignments/{id}`: Chi tiết thông tin bàn giao thiết bị.
     - `POST /assignments`: Cấp phát bàn giao thiết bị cho Merchant.
       - Hỗ trợ header `X-Idempotency-Key` ngăn chặn trùng lặp request giao dịch.
       - Áp dụng Optimistic Locking (`@Version` trên `devices`) tránh xung đột đồng thời.
       - Validate trạng thái thiết bị phải là `INSTOCK` (trả về `409 CONFLICT` nếu không sẵn sàng).
       - Cập nhật trạng thái thiết bị sang `DEPLOYED`, ghi nhật ký `assignment_history` & `device_lifecycle_history`.
     - `POST /assignments/{id}/return`: Thu hồi thiết bị về kho, đổi trạng thái bàn giao thành `RETURNED` và thiết bị thành `INSTOCK`.
     - `POST /assignments/{id}/transfer`: Điều chuyển thiết bị sang Merchant mới, tạo bàn giao mới `AS-YYYYMMDD-xxxx`.
     - `GET /assignments/history`: Danh sách lịch sử điều chuyển/thu hồi.
     - `GET /assignments/export` & `GET /assignments/history/export`: Xuất CSV/Excel.
  4. FE Alignment: Bổ sung `X-Idempotency-Key` header và export endpoints vào `assignment-api.service.ts` và `BaseApiService.post` support `options`.
- **Kết quả Gate:**
  - `mvn clean verify` -> SUCCESS (0 lỗi Java)
  - `npm run build` -> SUCCESS (0 lỗi TypeScript / SCSS)
- **Commit:** `feat(backend): B8 - assignment, idempotency key & concurrency control APIs`

---

### 🟢 BƯỚC B9: Audit Log, Notifications, Outbox & Reports
- **Ngày hoàn thành:** 2026-10-04
- **Công việc đã làm:**
  1. Migration `V11__audit_notification_outbox_schema.sql`: tạo các bảng `notifications`, `audit_logs`.
  2. JPA Entities & Repositories: `NotificationJpaEntity`, `AuditLogJpaEntity`, `NotificationJpaRepository`, `AuditLogJpaRepository`.
  3. `DashboardController` (`/api/v1/dashboard/summary`): Tổng hợp KPI tổng quan hệ thống, biểu đồ nhập/xuất kho, tỷ lệ thiết bị.
  4. `MonitoringController` (`/api/v1`):
     - `GET /monitoring/pos-status`: Trạng thái thiết bị `DEPLOYED` thời gian thực (Signal, Battery, State).
     - `GET /monitoring/audit-logs` & `/audit-logs`: Nhật ký kiểm toán hệ thống & `GET /monitoring/audit-logs/export`.
     - `GET /outbox/events` & `POST /outbox/events/{id}/retry`: Giám sát và gửi lại các event thất bại trong Outbox Pattern.
     - `POST /chaos/toggle-kafka`: Giả lập bật/tắt sự cố Kafka (Chaos Engineering).
  5. `NotificationController` (`/api/v1/notifications`):
     - `GET /notifications`: Danh sách thông báo.
     - `GET /notifications/unread-count`: Đếm số lượng thông báo chưa đọc (`unreadCount`).
     - `PATCH /notifications/{id}/read`: Đánh dấu 1 thông báo là đã đọc.
     - `PATCH /notifications/read-all`: Đánh dấu tất cả là đã đọc.
  6. `ReportController` (`/api/v1/reports`):
     - `GET /reports/inventory`: Báo cáo thống kê tổng hợp kho thiết bị.
     - `GET /reports/merchants`: Báo cáo thống kê phát triển Merchant.
     - `GET /reports/export-pdf` & `/export`: Xuất PDF báo cáo tổng hợp.
  7. FE Alignment: Tạo `notification-api.service.ts` và cập nhật `system-api.service.ts`.
- **Kết quả Gate:**
  - `mvn clean verify` -> SUCCESS (0 lỗi Java)
  - `npm run build` -> SUCCESS (0 lỗi TypeScript / SCSS)
- **Commit:** `feat(backend): B9 - audit logs, notifications, outbox monitoring & report APIs`

---



