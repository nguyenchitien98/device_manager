# POS Management System — Plan Refactor & Core Architecture Alignment (plan_refactor.md)

> **Mục tiêu:** Nâng cấp toàn bộ codebase Frontend từ mức "Prototype UI Mockup" lên mức "Production-Ready Enterprise Architecture".
> Đảm bảo 100% các màn hình tuân thủ Angular 22 Signals, Clean Architecture, không có code lặp lại, không có nút bấm bị đơ/chết cứng, sẵn sàng kết nối liền mạch với Spring Boot Backend REST APIs.

---

## 🎯 ĐÁNH GIÁ TRẠNG THÁI HIỆN TẠI (SENIOR CODE REVIEW)

### ✅ Ưu điểm đã đạt được:
1. **Design System & Visual Quality:** 100% 38 màn hình được dựng theo chuẩn 2 khung (Search Zone + List Zone) với Dual Theme (Light Mode / Dark Mode) hoàn toàn không nháy background hay border.
2. **Angular Standalone Components:** 100% components là Standalone, sử dụng `ChangeDetectionStrategy.OnPush`.
3. **Common UI Library (`@shared`):** Tái sử dụng triệt để `<pos-button>`, `<pos-input>`, `<pos-select>`, `<pos-badge>`, `<pos-table>`, `<pos-pagination>`, `<pos-modal>`, `<pos-dropdown>`, `<pos-confirm-dialog>`.
4. **Build Clean:** `npm run build` thành công 100% với 0 lỗi TypeScript & SCSS.

### ⚠️ Hạn chế & Nợ kỹ thuật (Technical Debt) cần Refactor:
1. **Mock Data Inline trong Component:** Dữ liệu mẫu đang được gán cứng trực tiếp trong Signal local của từng Component (`categories = signal<...>([...])`), chưa bóc tách ra Feature API Services.
2. **Thiếu Tầng Base Service & API Integration Layer:** Chưa có các Angular Injectable Services đại diện cho từng domain (`DeviceCategoryService`, `MerchantService`, `InventoryService`, v.v.) kết nối với `HttpClient`.
3. **Các nút Xuất Excel / Thao tác phụ sử dụng `alert()`:** Một số button như [Xuất Excel], [Làm mới] còn đang gọi `alert(...)` thay vì kết nối với Blob API Download hoặc Toast Message.
4. **Lặp code xử lý Ẩn/Hiện cột và Reset Filter:** Xử lý `hiddenColumns` và `columnToggleItems` đang bị lặp lại ở hơn 23 màn hình danh sách.
5. **Chưa gắn `pageSizeChange` & `sortChange` liên kết với API Server-side:** `PosTableComponent` và `PosPaginationComponent` đã có Output event nhưng một số màn chưa binding `(pageSizeChange)` và `(sortChange)`.

---

## 🚀 KẾ HOẠCH REFACTOR CHI TIẾT (HYBRID NGRX STORE + ANGULAR 22 SIGNALS)

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Core Infrastructure & NgRx Global Store Setup                 │
│ - Notification Service (Toast/Alert) & Base API Service                │
│ - NgRx Global Store: AuthStore, NotificationStore, ApprovalStore       │
│ - NgRx Effects & DevTools Setup trong app.config.ts                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 2: NgRx Feature Stores & Domain API Services                      │
│ - CatalogStore, InventoryStore, MerchantStore, DeviceStore (@ngrx/entity)│
│ - Mapping 100% REST Endpoints theo docs/09_API_Contract.md              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 3: Refactor All 38 Feature Components                            │
│ - Bóc tách local state thành Signal Selectors từ NgRx Store            │
│ - Gắn loading, error handling, toast notification                      │
│ - Gắn 100% Handlers cho mọi Button (CRUD, Filter, Export, Workflow)   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 4: File Export & File Download Engine Integration                │
│ - Excel Export Service (Sync < 10k & Async Polling > 10k)              │
│ - PDF Preview / Print Handler                                          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 5: End-to-End Verification & Verification Gate                   │
│ - Zero Dead Buttons Audit                                              │
│ - Production Build & Browser Smoke Test với NgRx DevTools              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 CHI TIẾT TỪNG GIAI ĐOẠN (TASK CHECKLIST)

### 🔹 PHASE 1: Core Infrastructure & NgRx Global Store Setup
- [x] **Task 1.1: Tạo `ToastService` (`src/app/core/services/toast.service.ts`)**
  - Quản lý hiển thị thông báo floating toast (`success`, `error`, `warning`, `info`) thời gian 3s-5s.
  - Tích hợp với `ErrorInterceptor` để tự động bật Toast đỏ khi nhận lỗi API (`POS-xxxx`).
- [x] **Task 1.2: Cấu hình NgRx Global Store (`src/app/core/store/`)**
  - **`AuthStore`** (`auth.actions.ts`, `auth.reducer.ts`, `auth.effects.ts`, `auth.selectors.ts`): Đồng bộ JWT Token, User Info, User Permissions & Business Unit Scope toàn ứng dụng.
  - **`NotificationStore`**: Đồng bộ số lượng thông báo chưa đọc (`unreadCount`), hỗ trợ auto-polling 30s & WebSocket notification.
  - **`ApprovalStore`**: Đồng bộ đếm Hòm việc cần duyệt (`approvalBadge`) tự động cập nhật badge đỏ trên Sidebar & Header khi có phiếu mới được gửi.
- [x] **Task 1.3: Tạo `BaseApiService<T>` (`src/app/core/services/base-api.service.ts`)**
  - Cung cấp các hàm chuẩn `getList(params)`, `getById(id)`, `create(dto)`, `update(id, dto)`, `delete(id)`, `exportExcel(params)`.
  - Tự động bóc tách `ApiResponse<T>` & `ApiResponse<PageResponse<T>>`.
- [x] **Task 1.4: Refactor `PosTableComponent` & `PosPaginationComponent` Binding**
  - Đảm bảo 100% các bảng danh sách đều bind đủ:
    `[sortField]="sortField()"`
    `[sortOrder]="sortOrder()"`
    `(sortChange)="onSortChange($event)"`
    `(pageSizeChange)="onPageSizeChange($event)"`

---

### 🔹 PHASE 2: NgRx Feature Stores & Domain API Services Layer
Tạo 8 Injectable Data Services & NgRx Feature Stores tương ứng với 8 Modules nghiệp vụ trong `src/app/core/store/features/` & `src/app/core/services/api/`:
- [x] **Task 2.1: `CatalogStore` & `CatalogApiService`** (`device-category`, `device-type`, `device-model`, `vendor`, `mcc`, `fee-policy`)
- [x] **Task 2.2: `OrganizationStore` & `OrganizationApiService`** (`business-unit`, `warehouse`)
- [x] **Task 2.3: `InventoryStore` & `InventoryApiService`** (`purchase-order`, `imports`, `exports`, `transfers`, `stock`, `logistics`)
- [x] **Task 2.4: `MerchantStore` & `MerchantApiService`** (`merchant`, `terminal/tid`)
- [x] **Task 2.5: `DeviceStore` & `DeviceApiService`** (`search`, `detail`, `lifecycle`)
- [x] **Task 2.6: `AssignmentStore` & `AssignmentApiService`** (`create`, `list`, `history`, `return`, `transfer`)
- [x] **Task 2.7: `ApprovalStore` & `ApprovalApiService`** (`inbox`, `detail`, `approve`, `reject`, `return-for-edit`)
- [x] **Task 2.8: `SystemStore` & `SystemApiService`** (`users`, `roles`, `config`, `audit-logs`, `dashboard`, `reports`)

---

### 🔹 PHASE 3: Refactor 38 Feature Components (Gắn Actions & State)

#### 1. Nhóm Catalog & Organization (8 Màn):
- [x] Refactor `DeviceCategoryListPageComponent`: Thay inline mock bằng `CatalogApiService.getDeviceCategories()`. Gắn action `onSave()`, `onConfirmDelete()`, `onExportExcel()`.
- [x] Refactor `DeviceTypeListPageComponent`: Gắn API filter theo `categoryId`, modal CRUD real-time.
- [x] Refactor `DeviceModelListPageComponent`: Gắn API filter theo `deviceTypeId` & `vendorId`.
- [x] Refactor `VendorListPageComponent`: Gắn API CRUD Vendor.
- [x] Refactor `MccListPageComponent`: Gắn API tra cứu & CRUD MCC.
- [x] Refactor `FeePolicyListPageComponent`: Gắn API quản lý chính sách phí.
- [x] Refactor `BusinessUnitListPageComponent`: Gắn API đơn vị kinh doanh & đếm kho/merchant/user.
- [x] Refactor `WarehouseListPageComponent`: Gắn API kho bãi & filter theo BU.

#### 2. Nhóm Merchant & TID (4 Màn):
- [x] Refactor `MerchantListPageComponent`: Gắn API `searchMerchants`, filter 2 hàng, Status Tabs, button [Đăng ký Merchant mới], [Khóa/Mở khóa].
- [x] Refactor `MerchantDetailPageComponent`: Read route param `:id`, gọi API `getMerchantDetail`, load 4 tabs (Thông tin, TID, Lịch sử, Phí).
- [x] Refactor `TerminalListPageComponent`: Gắn API `getTerminals`, modal Cấp TID mới, Action [Xem]/[Sửa]/[Khóa].
- [x] Refactor `TerminalDetailPageComponent`: Read route param `:id`, load chi tiết TID & thiết bị POS đang gán.

#### 3. Nhóm Inventory & Logistics (8 Màn):
- [x] Refactor `PurchaseOrderListPageComponent`: Gắn API PO list + Status Tabs (DRAFT, SUBMITTED, APPROVED, RECEIVED, CLOSED).
- [x] Refactor `ImportListPageComponent`: Gắn API danh sách nhập kho.
- [x] Refactor `ImportCreatePageComponent`: Form dán danh sách Serial (textarea lines) → Parse count → POST `inventory/imports` → Redirect về `/inventory/imports`.
- [x] Refactor `ExportListPageComponent`: Gắn API danh sách xuất kho + Trình duyệt.
- [x] Refactor `ExportCreatePageComponent`: Form chọn kho & chọn Serial → POST `inventory/exports` → Redirect.
- [x] Refactor `StockListPageComponent`: Gắn API tồn kho, KPI summary cards, modal xem danh sách Serial trong kho.
- [x] Refactor `TransferListPageComponent`: Gắn API điều chuyển kho.
- [x] Refactor `TransferCreatePageComponent`: Form chọn kho đi/đến & Serial → POST `inventory/transfers` → Redirect.
- [x] Refactor `LogisticsListPageComponent`: Gắn API theo dõi vận chuyển & tra cứu mã vận đơn.

#### 4. Nhóm Device & Assignment (5 Màn):
- [x] Refactor `DeviceSearchPageComponent`: Gắn API tra cứu Serial Number, filter nâng cao, 6 Status Tabs, click row/button [Xem] navigate `/device/detail/:serial`.
- [x] Refactor `DeviceDetailPageComponent`: Read route param `:serialNumber`, gọi API `getDeviceDetail` & `getDeviceLifecycle`, render 8 Tabs thông tin vòng đời.
- [x] Refactor `AssignmentListPageComponent`: Gắn API danh sách cấp phát Terminal/POS, Status Tabs, Action [Thu hồi]/[Đổi máy].
- [x] Refactor `AssignmentCreatePageComponent`: Form chọn POS INSTOCK + Merchant + TID → POST `assignments` với `X-Idempotency-Key`.
- [x] Refactor `AssignmentHistoryPageComponent`: Gắn API lịch sử cấp phát toàn hệ thống.

#### 5. Nhóm Approval Workflow (2 Màn):
- [x] Refactor `ApprovalInboxPageComponent`: Gắn API `getApprovalInbox`, Stats cards, Tabs loại hồ sơ, quick action [✓ Duyệt] / [✕ Từ chối].
- [x] Refactor `ApprovalDetailPageComponent`: Read route param `:id`, gọi API `getApprovalDetail`, action `onApprove()` (POST `/approve`), `onReject()` (POST `/reject`), `onReturnForEdit()`.

#### 6. Nhóm Monitoring, System & Profile (9 Màn):
- [x] Refactor `DashboardComponent`: Gắn API `/dashboard/summary`, nạp dữ liệu realtime cho 5 KPI lớn, 3 KPI nhỏ, 2 biểu đồ ApexCharts, Top 5 Kho, Activity Feed.
- [x] Refactor `PosMonitoringPageComponent`: Gắn API `/monitoring/pos-status`, grid thiết bị online/offline, auto-refresh 30s countdown indicator.
- [x] Refactor `AuditLogListPageComponent`: Gắn API `/audit-logs`, filter theo User/Resource/Date, modal xem JSON Diff trước/sau tác động.
- [x] Refactor `ReportInventoryPageComponent` & `ReportMerchantPageComponent`: Gắn API báo cáo, nút [Xuất Excel], [Xuất PDF].
- [x] Refactor `UserManagementPageComponent`: Gắn API CRUD User, gán Role, nút [Khóa/Mở khóa].
- [x] Refactor `RoleManagementPageComponent`: Gắn API CRUD Role + Permission Matrix (Checkbox grid auto-save).
- [x] Refactor `SystemConfigPageComponent`: Gắn API get/save system configs (General, SMTP, Security, Integration).
- [x] Refactor `UserProfilePageComponent`: Gắn API user profile & Đổi mật khẩu.

---

### 🔹 PHASE 4: File Export & File Download Engine Integration
- [x] **Task 4.1: Xây dựng `FileExportService` (`src/app/core/services/file-export.service.ts`)**
  - Xử lý tải xuống file nhị phân `.xlsx` / `.pdf` trực tiếp bằng Blob Object URL.
  - Tự động đọc header `Content-Disposition` để lấy tên file chuẩn từ Backend.
  - Nếu Backend trả về Async Export Job (`202 Accepted` + `jobId`), tự động bật polling tiến độ 0% -> 100% trước khi mở link download.
- [x] **Task 4.2: Gắn `FileExportService` vào 100% Nút [Xuất Excel] / [Xuất PDF] trên 38 màn hình.**

---

### 🔹 PHASE 5: Verification & Zero Dead-Button Audit
- [x] **Task 5.1: Chạy `npm run build`** đảm bảo 0 lỗi TypeScript, 0 lỗi SCSS.
- [x] **Task 5.2: Audit kiểm tra toàn bộ Button:**
  - Kiểm tra 100% `<pos-button>`, `<pos-dropdown>`, `<a [routerLink]>` có gán event handler hoặc link chuyển hướng.
  - Kiểm tra 100% các nút Submit Form có loading spinner khi chờ API response và disabled khi Form invalid.
  - Kiểm tra 100% modal confirm có xử lý hủy/đồng ý rõ ràng.

---

*File này là kế hoạch refactor chính thức cho hệ thống POS Management System. AI Agent cần thực hiện nghiêm ngặt từng bước theo thứ tự.*
