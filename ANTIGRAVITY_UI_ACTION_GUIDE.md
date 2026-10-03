# POS Management System — Master Guide: UI Actions & REST API Mapping (ANTIGRAVITY_UI_ACTION_GUIDE.md)

> **KIM CHỈ NAM BẮT BUỘC DÀNH CHO ANTIGRAVITY AI & LẬP TRÌNH VIÊN**
> **QUY TẮC VÀNG:** KHÔNG MỘT NÚT BẤM/ACTION NÀO TRÊN GIAO DIỆN BỊ ĐƠ/CHẾT CỨNG!
> Đã có nút bấm hay phần tử tương tác trên HTML thì BẮT BUỘC phải khai báo handler trong `.ts`, kết nối REST API tương ứng, quản lý loading/disabled state và bật Toast Notification phản hồi người dùng.

---

## 🧭 BẢNG QUY ƯỚC XỬ LÝ TRẠNG THÁI NÚT BẤM (BUTTON STATE PROTOCOL)

| Loại Button / Interactive Element | Bắt buộc Event Handler trong TS | Trạng thái Loading / State | Hành động API & Navigation tương ứng | Toast Notification |
| :--- | :--- | :--- | :--- | :--- |
| **Nút [Tìm kiếm]** | `onSearch()` | `loading.set(true)` | `GET /api/v1/{module}?keyword=...&page=0` | Toast cảnh báo nếu filter sai |
| **Nút [Clear / Xóa bộ lọc]** | `onReset()` | - | Reset all signals -> Auto fetch page 0 | - |
| **Nút [Xuất Excel]** | `onExportExcel()` | `exporting.set(true)` | `GET /api/v1/{module}/export` -> Download Blob `.xlsx` | Toast "Tải file thành công" / Err |
| **Nút [Xuất PDF]** | `onExportPdf()` | `exporting.set(true)` | `GET /api/v1/reports/{type}/pdf` -> Preview/Download | Toast "Tải PDF thành công" |
| **Nút [+ Thêm mới] (Modal)** | `openCreateModal()` | - | Reset `formModel`, `isEditing = false`, `showModal = true` | - |
| **Nút [+ Tạo mới] (Trang)** | `openCreatePage()` | - | `router.navigate(['/{module}/new'])` | - |
| **Nút [Lưu / Submit] (Modal)**| `onSave()` | `saving.set(true)` | `POST /api/v1/{module}` hoặc `PUT /api/v1/{module}/{id}` | Toast Success + Reload Table |
| **Nút [Hủy bỏ / Close]** | `onCancel()` | - | `showModal.set(false)` | - |
| **Nút Row Action [✏️ Sửa]** | `openEditModal(row)` | - | Bind `formModel = { ...row }`, `showModal = true` | - |
| **Nút Row Action [🗑️ Xóa]** | `openDeleteConfirm(row)`| - | `selectedItem.set(row)`, `showConfirm = true` | - |
| **Nút Row Action [👁️ Xem]** | `onViewDetail(row)` | - | `router.navigate(['/{module}/detail', id])` | - |
| **Nút Confirm [Xác nhận Xóa]**| `onConfirmDelete()` | `deleting.set(true)` | `DELETE /api/v1/{module}/{id}` | Toast Success "Đã xóa bản ghi" |
| **Nút Row Action [🔒 Khóa]** | `onConfirmLock()` | `locking.set(true)` | `PATCH /api/v1/{module}/{id}/lock` | Toast Success "Đã khóa tài khoản" |
| **Nút [✓ Phê duyệt]** | `onApprove()` | `processing.set(true)`| `POST /api/v1/approvals/{id}/approve` | Toast Success + Redirect |
| **Nút [✕ Từ chối]** | `onReject()` | `processing.set(true)`| `POST /api/v1/approvals/{id}/reject` | Toast Warning "Đã từ chối" |
| **Nút Dropdown [Ẩn/Hiện cột]**| `toggleColumn(item)` | - | Update `hiddenColumns` signal state | - |
| **Status Tabs (Workflow)** | `onTabChange(tab)` | `loading.set(true)` | Update `activeTab` signal -> Fetch API by status | - |

---

## 📱 CHI TIẾT MAPPING MỌI MÀN HÌNH (38 SCREENS MASTER MAP)

---

### MODULE 1: CATALOG & ORGANIZATION (8 SCREENS)

#### 1.1 Quản Lý Danh Mục Thiết Bị (`/catalog/device-categories`)
- **Component:** `DeviceCategoryListPageComponent` (`device-category-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  1. `[filterCode]`, `[filterName]`, `[filterStatus]`, `[filterDate]`: Binding Signals.
  2. Nút **[🔍 Tìm kiếm]** `(clicked)="onSearch()"`:
     - **API:** `GET /api/v1/catalog/device-categories?code={code}&name={name}&status={status}`
     - **Response:** `ApiResponse<Page<DeviceCategoryResponse>>`
  3. Nút **[🔄 Xóa bộ lọc]** `(clicked)="onReset()"`: Reset all filter signals -> `onSearch()`.
  4. Nút **[📊 Xuất Excel]** `(clicked)="onExportExcel()"`:
     - **API:** `GET /api/v1/catalog/device-categories/export` -> Blob Download `device_categories_{date}.xlsx`.
  5. Nút **[➕ Thêm danh mục mới]** `(clicked)="openCreateModal()"`: Set `isEditing = false`, `showModal = true`.
  6. Nút **[👁️ Hiển thị cột]** `(itemClick)="toggleColumn($event)"`: Cập nhật `hiddenColumns` signal.
  7. Nút Row Action **[✏️ Sửa]** `(clicked)="openEditModal(item)"`: Set `isEditing = true`, load form, `showModal = true`.
  8. Nút Row Action **[🗑️ Xóa]** `(clicked)="selectedItem.set(item); showDeleteConfirm.set(true)"`: Mở `ConfirmDialog`.
  9. Modal Submit **[Lưu thông tin]** `(clicked)="onSave()"`:
     - **API (Create):** `POST /api/v1/catalog/device-categories`
     - **API (Update):** `PUT /api/v1/catalog/device-categories/{id}`
     - **Error Handlers:** `POS-8008` (Mã đã tồn tại) -> Toast Error.
  10. Confirm Dialog **[Xác nhận Xóa]** `(confirm)="onConfirmDelete()"`:
      - **API:** `DELETE /api/v1/catalog/device-categories/{id}`
      - **Error Handlers:** `POS-2008` (Còn thiết bị active) -> Toast Warning.

#### 1.2 Quản Lý Loại Thiết Bị (`/catalog/device-types`)
- **Component:** `DeviceTypeListPageComponent` (`device-type-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Nút **[🔍 Tìm kiếm]** -> `GET /api/v1/catalog/device-types?categoryId={id}&keyword={kw}`
  - Nút **[📊 Xuất Excel]** -> `GET /api/v1/catalog/device-types/export`
  - Modal Select **[Danh mục thiết bị]**: Dropdown fetch từ `CatalogApiService.getDeviceCategories()`
  - Modal Submit **[Lưu thông tin]** -> `POST /api/v1/catalog/device-types` hoặc `PUT /api/v1/catalog/device-types/{id}`
  - Confirm **[Xác nhận Xóa]** -> `DELETE /api/v1/catalog/device-types/{id}`

#### 1.3 Quản Lý Model POS (`/catalog/device-models`)
- **Component:** `DeviceModelListPageComponent` (`device-model-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Nút **[🔍 Tìm kiếm]** -> `GET /api/v1/catalog/device-models?deviceTypeId={id}&vendorId={vid}`
  - Nút **[📊 Xuất Excel]** -> `GET /api/v1/catalog/device-models/export`
  - Modal Select **[Vendor]** & **[Device Type]**: Fetch từ API Catalog.
  - Modal Submit **[Lưu thông tin]** -> `POST /api/v1/catalog/device-models`
  - Confirm **[Xác nhận Xóa]** -> `DELETE /api/v1/catalog/device-models/{id}` (Err `POS-2008`)

#### 1.4 Quản Lý Nhà Cung Cấp (`/catalog/vendors`)
- **Component:** `VendorListPageComponent` (`vendor-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Reset / Export -> `GET /api/v1/catalog/vendors`, `GET /api/v1/catalog/vendors/export`
  - CRUD Modal -> `POST /api/v1/catalog/vendors`, `PUT /api/v1/catalog/vendors/{id}`, `DELETE /{id}`

#### 1.5 Quản Lý Mã MCC (`/catalog/mcc`)
- **Component:** `MccListPageComponent` (`mcc-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Reset / Export -> `GET /api/v1/catalog/mcc?search={kw}`, `GET /api/v1/catalog/mcc/export`
  - CRUD Modal -> `POST /api/v1/catalog/mcc`, `PUT /api/v1/catalog/mcc/{id}`

#### 1.6 Quản Lý Chính Sách Phí (`/catalog/fee-policies`)
- **Component:** `FeePolicyListPageComponent` (`fee-policy-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Export -> `GET /api/v1/catalog/fee-policies`
  - Modal Submit -> `POST /api/v1/catalog/fee-policies` (Err `POS-3005` conflict date range)

#### 1.7 Đơn Vị Kinh Doanh (`/organization/business-units`)
- **Component:** `BusinessUnitListPageComponent` (`business-unit-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Reset / Export -> `GET /api/v1/organization/business-units`
  - CRUD Modal -> `POST /api/v1/organization/business-units`, `PUT /{id}`

#### 1.8 Quản Lý Kho Thiết Bị (`/organization/warehouses`)
- **Component:** `WarehouseListPageComponent` (`warehouse-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Filter BU -> `GET /api/v1/organization/warehouses?businessUnitId={buId}`
  - CRUD Modal -> `POST /api/v1/organization/warehouses`

---

### MODULE 2: MERCHANT & TERMINAL TID (4 SCREENS)

#### 2.1 Danh Sách Merchant (`/merchant/merchants`)
- **Component:** `MerchantListPageComponent` (`merchant-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  1. Status Tabs **[Tất cả | Chờ Duyệt | Đã Duyệt | Từ chối]**:
     - Event `(click)="onTabChange(tab)"`: Fetch `GET /api/v1/merchants?status={tab}`
  2. Nút **[🔍 Tìm kiếm]**: `GET /api/v1/merchants?merchantCode={mcode}&merchantName={mname}&businessUnitId={bu}`
  3. Nút **[📊 Xuất Excel]**: `GET /api/v1/merchants/export`
  4. Nút **[➕ Đăng ký Merchant mới]**: `openCreateModal()` -> `POST /api/v1/merchants`
  5. Nút Row Action **[👁️ Xem]**: `(clicked)="onViewMerchant(row)"` -> `router.navigate(['/merchant/detail', row.id])`
  6. Nút Row Action **[🔒 Khóa / Mở khóa]**: Mở ConfirmDialog -> `PATCH /api/v1/merchants/{id}/status`

#### 2.2 Chi Tiết Merchant (`/merchant/merchants/:id`)
- **Component:** `MerchantDetailPageComponent` (`merchant-detail.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  1. Header Info: Load `GET /api/v1/merchants/{id}`
  2. 4 Tabs **[1. Thông tin chung | 2. Danh sách TID | 3. Lịch sử cấp phát | 4. Chính sách phí]**:
     - Tab 2: `GET /api/v1/terminals?merchantId={id}`
     - Tab 3: `GET /api/v1/assignments?merchantId={id}`
     - Tab 4: `GET /api/v1/merchants/{id}/fee-policies`
  3. Nút **[← Quay lại]**: `router.navigate(['/merchant/merchants'])`

#### 2.3 Quản Lý TID Terminal (`/merchant/terminals`)
- **Component:** `TerminalListPageComponent` (`terminal-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Status Tabs -> `GET /api/v1/terminals?tid={tid}&merchantCode={mcode}&status={st}`
  - Nút **[➕ Cấp mã TID mới]** -> Modal `POST /api/v1/terminals` (Auto generate TXXXXXX)
  - Row Action **[👁️ Xem]** -> `router.navigate(['/merchant/terminal-detail', row.id])`

#### 2.4 Chi Tiết TID Terminal (`/merchant/terminal-detail/:id`)
- **Component:** `TerminalDetailPageComponent` (`terminal-detail.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Load detail -> `GET /api/v1/terminals/{id}`
  - Nút **[← Quay lại]** -> `router.navigate(['/merchant/terminals'])`

---

### MODULE 3: INVENTORY & LOGISTICS (8 SCREENS)

#### 3.1 Đơn Hàng Mua POS (PO) (`/inventory/purchase-orders`)
- **Component:** `PurchaseOrderListPageComponent` (`purchase-order-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Status Tabs (DRAFT, SUBMITTED, APPROVED, RECEIVED, CLOSED) -> `GET /api/v1/purchase-orders?status={tab}`
  - Nút **[➕ Tạo đơn mua PO mới]** -> Modal `POST /api/v1/purchase-orders`
  - Action Row **[Duyệt PO]** -> `POST /api/v1/purchase-orders/{id}/approve`

#### 3.2 Thông Tin Nhập Kho (`/inventory/imports`)
- **Component:** `ImportListPageComponent` (`import-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Export -> `GET /api/v1/inventory/imports`, `GET /api/v1/inventory/imports/export`
  - Nút **[➕ Tạo phiếu nhập kho mới]** -> `router.navigate(['/inventory/import-create'])`

#### 3.3 Tạo Phiếu Nhập Kho (`/inventory/import-create`)
- **Component:** `ImportCreatePageComponent` (`import-create.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  1. Textarea Serial Entry `(ngModelChange)="onSerialListChange($event)"`: Tự động parse đếm số dòng serial number.
  2. Nút **[Lưu & Gửi Phê Duyệt Nhập Kho]** `(clicked)="onSubmit()"`:
     - **API:** `POST /api/v1/inventory/imports` (Headers: `X-Idempotency-Key`)
     - **Body:** `{ purchaseOrderCode, warehouseId, serialNumbers: [...] }`
     - **Success:** Toast "Tạo phiếu nhập kho thành công" -> `router.navigate(['/inventory/imports'])`
  3. Nút **[← Quay lại danh sách]**: `router.navigate(['/inventory/imports'])`

#### 3.4 Thông Tin Xuất Kho (`/inventory/exports`)
- **Component:** `ExportListPageComponent` (`export-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Status Tabs -> `GET /api/v1/inventory/exports`
  - Nút **[➕ Tạo phiếu xuất kho mới]** -> `router.navigate(['/inventory/export-create'])`

#### 3.5 Tạo Phiếu Xuất Kho (`/inventory/export-create`)
- **Component:** `ExportCreatePageComponent` (`export-create.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Form Chọn kho & Chọn danh sách Serial INSTOCK.
  - Nút **[Lưu & Gửi Duyệt Xuất Kho]** -> `POST /api/v1/inventory/exports` -> Redirect `/inventory/exports`.

#### 3.6 Thông Tin Tồn Kho (`/inventory/stock`)
- **Component:** `StockListPageComponent` (`stock-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - KPI Cards (Tổng tồn kho, INSTOCK, DEPLOYED, REPAIRING).
  - Search / Export -> `GET /api/v1/inventory/stock`
  - Row Click / Xem -> Modal hiển thị chi tiết các Serial Number đang tồn trong kho đó.

#### 3.7 Điều Chuyển Kho (`/inventory/transfers`)
- **Component:** `TransferListPageComponent` (`transfer-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Status Tabs -> `GET /api/v1/inventory/transfers`
  - Nút **[➕ Tạo lệnh điều chuyển kho]** -> `router.navigate(['/inventory/transfer-create'])`

#### 3.8 Tạo Phiếu Điều Chuyển Kho (`/inventory/transfer-create`)
- **Component:** `TransferCreatePageComponent` (`transfer-create.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Form Kho Nguồn -> Kho Đích -> Serial Numbers.
  - Nút **[Lưu & Gửi Duyệt Điều Chuyển]** -> `POST /api/v1/inventory/transfers` -> Redirect `/inventory/transfers`.

#### 3.9 Theo Dõi Vận Chuyển (`/inventory/logistics`)
- **Component:** `LogisticsListPageComponent` (`logistics-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search Mã Vận Đơn -> `GET /api/v1/inventory/logistics?trackingNumber={code}`

---

### MODULE 4: DEVICE SEARCH & LIFECYCLE (2 SCREENS)

#### 4.1 Tra Cứu Thiết Bị POS (`/device/search`)
- **Component:** `DeviceSearchPageComponent` (`device-search.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  1. 6 Status Tabs **[Tất cả | INSTOCK | OUT_OF_WAREHOUSE | DEPLOYED | REPAIRING | DISPOSED]**:
     - Event `(click)="onTabChange(tab)"`: Fetch `GET /api/v1/devices?status={tab}`
  2. Nút **[🔍 Tra cứu ngay]**: `GET /api/v1/devices?serialNumber={sn}&modelCode={m}&warehouseId={w}`
  3. Nút **[📊 Xuất Excel]**: `GET /api/v1/devices/export`
  4. Nút Row Action **[👁️ Xem chi tiết]**: `(clicked)="onActionClick(row, { id: 'view' })"` -> `router.navigate(['/device/detail', row.serialNumber])`

#### 4.2 Chi Tiết Thiết Bị POS & Vòng Đời (`/device/detail/:serialNumber`)
- **Component:** `DeviceDetailPageComponent` (`device-detail.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  1. Load data: `GET /api/v1/devices/{serialNumber}` & `GET /api/v1/devices/{serialNumber}/lifecycle`
  2. Render 8 Tabs (Thông tin chung, Trạng thái FSM, Merchant, Vòng đời Timeline, Assignment History, Repair History, Stock Ledger, Audit Logs).
  3. Nút **[← Quay lại tra cứu]**: `router.navigate(['/device/search'])`

---

### MODULE 5: ASSIGNMENT & HANDOVER (3 SCREENS)

#### 5.1 Quản Lý Bàn Giao Terminal (`/assignment/list`)
- **Component:** `AssignmentListPageComponent` (`assignment-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Status Tabs (ACTIVE, RETURNED, TRANSFERRED) -> `GET /api/v1/assignments?status={tab}`
  - Nút **[➕ Tạo lệnh assignment mới]** -> `router.navigate(['/assignment/create'])`
  - Action Row **[Thu hồi POS]** -> Modal reason -> `POST /api/v1/assignments/{id}/return`

#### 5.2 Tạo Lệnh Bàn Giao POS (`/assignment/create`)
- **Component:** `AssignmentCreatePageComponent` (`assignment-create.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Form Chọn POS (INSTOCK) + Merchant (ACTIVE) + TID (ACTIVE).
  - Nút **[Lưu & Trình Phê Duyệt Assignment]**:
    - **API:** `POST /api/v1/assignments` (Headers: `X-Idempotency-Key`)
    - **Err Handlers:** `POS-1002` (Thiết bị không ở INSTOCK), `POS-1003` (Đã có assignment) -> Toast Error.

#### 5.3 Lịch Sử Bàn Giao (`/assignment/history`)
- **Component:** `AssignmentHistoryPageComponent` (`assignment-history.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Export -> `GET /api/v1/assignments/history`, `GET /api/v1/assignments/export`

---

### MODULE 6: APPROVAL WORKFLOW (2 SCREENS)

#### 6.1 Hòm Việc Cần Duyệt (`/approval/inbox`)
- **Component:** `ApprovalInboxPageComponent` (`approval-inbox.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  1. Stats Cards (Chờ duyệt, Đã duyệt hôm nay, Từ chối hôm nay).
  2. Tabs **[Chờ tôi duyệt | Tôi đã trình | Tất cả hồ sơ]**:
     - `GET /api/v1/approvals/inbox` / `GET /api/v1/approvals/my-requests`
  3. Action Row **[👁️ Xem]**: `router.navigate(['/approval/detail', row.id])`
  4. Quick Action **[✓ Duyệt]**: Mở confirm -> `POST /api/v1/approvals/{id}/approve`
  5. Quick Action **[✕ Từ chối]**: Mở confirm reason -> `POST /api/v1/approvals/{id}/reject`

#### 6.2 Chi Tiết Hồ Sơ Trình Duyệt (`/approval/detail/:id`)
- **Component:** `ApprovalDetailPageComponent` (`approval-detail.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  1. Load data: `GET /api/v1/approvals/{id}`
  2. Nút **[✓ Phê duyệt hồ sơ]**: `(clicked)="onApprove()"` -> Modal -> `POST /api/v1/approvals/{id}/approve`
  3. Nút **[✕ Từ chối]**: `(clicked)="onReject()"` -> Modal reason -> `POST /api/v1/approvals/{id}/reject`
  4. Nút **[↩️ Trả về chỉnh sửa]**: `(clicked)="onReturnForEdit()"` -> `POST /api/v1/approvals/{id}/return-for-edit`
  5. Nút **[← Quay lại Inbox]**: `router.navigate(['/approval/inbox'])`

---

### MODULE 7: MONITORING & REPORTS (4 SCREENS)

#### 7.1 Giám Sát Trạng Thái Realtime POS (`/monitoring/pos`)
- **Component:** `PosMonitoringPageComponent` (`pos-monitoring.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Realtime Grid / Search -> `GET /api/v1/monitoring/pos-status`
  - Auto-refresh 30s countdown timer signal handler.

#### 7.2 Nhật Ký Tác Động Hệ Thống (`/monitoring/audit-logs`)
- **Component:** `AuditLogListPageComponent` (`audit-log-list.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search User / Resource / Action / Date -> `GET /api/v1/audit-logs`
  - Row Click -> Modal hiển thị JSON Diff (Old Value vs New Value).

#### 7.3 Báo Cáo Tồn Kho POS (`/reports/inventory`)
- **Component:** `ReportInventoryPageComponent` (`report-inventory.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Filter Date / Warehouse / Vendor -> `GET /api/v1/reports/inventory`
  - Nút **[📊 Xuất Excel]** -> `GET /api/v1/reports/inventory/export?format=xlsx`
  - Nút **[📄 Xuất PDF]** -> `GET /api/v1/reports/inventory/export?format=pdf`

#### 7.4 Báo Cáo Hiệu Quả Merchant (`/reports/merchant`)
- **Component:** `ReportMerchantPageComponent` (`report-merchant.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Filter Date / BU / MCC -> `GET /api/v1/reports/merchant`
  - Nút **[📊 Xuất Excel]** -> `GET /api/v1/reports/merchant/export?format=xlsx`
  - Nút **[📄 Xuất PDF]** -> `GET /api/v1/reports/merchant/export?format=pdf`

---

### MODULE 8: SYSTEM ADMIN & USER PROFILE (5 SCREENS)

#### 8.1 Quản Lý Người Dùng (`/system/users`)
- **Component:** `UserManagementPageComponent` (`user-management.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Search / Filter BU & Role -> `GET /api/v1/admin/users`
  - Nút **[➕ Tạo Tài Khoản Mới]** -> Modal `POST /api/v1/admin/users`
  - Action Row **[🔒 Khóa / 🔓 Mở khóa]** -> `PATCH /api/v1/admin/users/{id}/lock`

#### 8.2 Quản Lý Vai Trò & Quyền Hạn (`/system/roles`)
- **Component:** `RoleManagementPageComponent` (`role-management.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Tab 1: List Roles -> `GET /api/v1/admin/roles`
  - Tab 2: Permission Matrix (Grid Checkbox) -> Auto-save `PUT /api/v1/admin/roles/{id}/permissions`

#### 8.3 Cấu Hình Hệ Thống (`/system/config`)
- **Component:** `SystemConfigPageComponent` (`system-config.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Tabs: General, SMTP, Security, Integration.
  - Nút **[💾 Lưu Tất Cả Cấu Hình]** `(clicked)="onSaveConfig()"` -> Modal Confirm -> `PUT /api/v1/admin/config`.

#### 8.4 Thông Tin Cá Nhân (`/system/profile`)
- **Component:** `UserProfilePageComponent` (`user-profile.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Form Hồ sơ -> Nút **[Lưu Thông Tin]** -> `PUT /api/v1/users/me`
  - Form Đổi mật khẩu -> Nút **[Cập Nhật Mật Khẩu]** -> `POST /api/v1/users/me/change-password`

#### 8.5 Đăng Nhập System (`/login`)
- **Component:** `LoginComponent` (`login.component.ts/html/scss`)
- **Interactive Elements & API Mapping:**
  - Form Username + Password + Show/Hide Password.
  - Nút **[Đăng nhập]** -> `POST /api/v1/auth/login` -> Save Token -> Redirect `/dashboard`.

---

## 🎯 CHECKLIST KIỂM THỬ KHÔNG ĐƠ/KHÔNG CHẾT NÚT (ZERO DEAD-BUTTON AUDIT)

Trước khi bàn giao bất kỳ màn hình nào, AI Agent phải đảm bảo các câu hỏi sau đều đạt "CÓ":
1. **Nút Tìm kiếm:** CÓ trigger gọi API và cập nhật lại bảng dữ liệu không?
2. **Nút Clear:** CÓ xóa sạch toàn bộ input filter và tự động load lại dữ liệu mặc định không?
3. **Nút Xuất Excel / PDF:** CÓ kích hoạt tải file thực tế không?
4. **Nút Thêm mới / Sửa:** CÓ mở Modal hoặc chuyển hướng route với đúng ID không?
5. **Nút Submit Form Modal:** CÓ quay spinner loading, disable nút khi đang chờ API và hiển thị Toast kết quả không?
6. **Nút Xóa / Khóa:** CÓ hiển thị Hộp thoại xác nhận (ConfirmDialog) trước khi gửi API không?
7. **Nút Quay lại / Hủy bỏ:** CÓ đóng Modal hoặc quay về trang trước đó không?

---

*Tài liệu này là Single Source of Truth cho toàn bộ hành động UI và API Mapping của dự án POS Management System.*
