# POS Management System — UI/UX Standard & Screen Inventory

Tài liệu này mô tả tiêu chuẩn thiết kế giao diện, bộ màu sắc, typography, component guidelines và danh sách đầy đủ **38 màn hình** cần xây dựng cho hệ thống POS Management.

---

## 1. Design System

### 1.1 Color Palette

```scss
// Primary — Banking Blue
$primary-900: #0D1B2A;
$primary-800: #1B2B3A;
$primary-700: #1E3A5F;
$primary-600: #1565C0;
$primary-500: #1976D2;      // Primary brand color
$primary-400: #42A5F5;
$primary-100: #E3F2FD;

// Accent — Banking Gold
$accent-500: #F9A825;
$accent-400: #FBC02D;

// Status Colors
$status-instock:     #2E7D32;    // Xanh lá — INSTOCK
$status-deployed:    #1565C0;    // Xanh dương — DEPLOYED
$status-returned:    #F57C00;    // Cam — RETURNED
$status-repairing:   #E65100;    // Đỏ cam — REPAIRING
$status-disposed:    #B71C1C;    // Đỏ tối — DISPOSED
$status-out-of-wh:   #6A1B9A;    // Tím — OUT_OF_WAREHOUSE

// Approval Status Colors
$approval-draft:     #757575;    // Xám
$approval-pending:   #F57C00;    // Cam — chờ duyệt
$approval-approved:  #2E7D32;    // Xanh lá
$approval-rejected:  #B71C1C;    // Đỏ
$approval-executing: #1565C0;    // Xanh dương
$approval-completed: #1B5E20;    // Xanh lá tối

// Neutral — Calibrated từ ảnh chuẩn
$app-background:   #0E1726;    // Nền tổng thể (dark navy, bên ngoài sidebar)
$sidebar-bg:       #111827;    // Nền sidebar (tối hơn background một chút)
$header-bg:        #111827;    // Nền header (cùng màu sidebar)
$card-bg:          #1C2A3A;    // Nền card / content area
$card-bg-alt:      #162032;    // Nền card KPI lớn
$border-color:     #1E3048;    // Màu border giữa các vùng
$text-primary:     #FFFFFF;    // Tiêu đề, label chính
$text-secondary:   #8899AA;    // Label phụ, mô tả
$text-muted:       #5A6A7A;    // Section label, placeholder
$sidebar-active-bg: #1976D2;  // Background item đang active trong sidebar (blue)
$sidebar-active-text: #FFFFFF; // Text item active
$sidebar-hover-bg: rgba(255,255,255,0.05); // Hover state
$sidebar-section-label: #6B7A8D; // TỔNG QUAN, QUẢN LÝ DANH MỤC...

// Neutral legacy
$gray-900: #0E1726;
$gray-800: #111827;
$gray-700: #1C2A3A;
$gray-600: #1E3048;
$gray-100: #F5F5F5;
$white:    #FFFFFF;

// Semantic
$success: #4CAF50;
$warning: #FF9800;
$error:   #F44336;
$info:    #2196F3;
```

### 1.2 Typography

```scss
// Import Google Fonts
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

$font-primary: 'Inter', sans-serif;
$font-mono: 'JetBrains Mono', monospace;

// Font Scale
$text-xs:   12px;
$text-sm:   13px;
$text-base: 14px;   // Default body
$text-md:   16px;
$text-lg:   18px;
$text-xl:   20px;
$text-2xl:  24px;
$text-3xl:  30px;

// Font Weight
$fw-light:    300;
$fw-regular:  400;
$fw-medium:   500;
$fw-semibold: 600;
$fw-bold:     700;
```

### 1.3 Spacing & Layout

```scss
// Spacing
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 20px;
$space-6: 24px;
$space-8: 32px;
$space-10: 40px;

// Layout — Calibrated từ ảnh chuẩn 1920×1080
$sidebar-width: 280px;          // Sidebar mở rộng
$sidebar-collapsed: 64px;       // Sidebar thu gọn (icon only)
$header-height: 64px;           // Header top
$content-padding: 24px;         // Padding nội dung bên phải
$content-max-width: 1440px;     // Max width content area
$card-border-radius: 12px;      // Bo góc card KPI
$kpi-card-height: 120px;        // Chiều cao card KPI hàng trên

// Border Radius
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-xl: 16px;
$radius-full: 9999px;

// Shadow
$shadow-card: 0 2px 8px rgba(0, 0, 0, 0.4);
$shadow-modal: 0 8px 48px rgba(0, 0, 0, 0.6);
$shadow-sidebar: 2px 0 8px rgba(0, 0, 0, 0.3);

// KPI Card Gradient Backgrounds (từ ảnh chuẩn)
$kpi-blue:    linear-gradient(135deg, #1565C0, #1976D2);   // Tổng thiết bị
$kpi-green:   linear-gradient(135deg, #1B5E20, #2E7D32);   // Tồn kho
$kpi-indigo:  linear-gradient(135deg, #311B92, #512DA8);   // Đang triển khai
$kpi-amber:   linear-gradient(135deg, #E65100, #F57C00);   // Đang sửa chữa
$kpi-red:     linear-gradient(135deg, #B71C1C, #C62828);   // Thanh lý
```

---

## 2. Layout Architecture

### 2.1 Main Layout Structure — Theo Ảnh Chuẩn

> Đã cập nhật: Bỏ Global Search khỏi header, thay bằng **Dark Mode Toggle** (🌙/☀️) và **i18n Language Switcher** (🌐).

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  HEADER (height: 64px, bg: #111827, border-bottom: 1px solid #1E3048)           │
│  ┌─────────────────────────────────┐           ┌──────────────────────────────┐  │
│  │ ☰  📊 POS Management  Dashboard │  ← flex-1 │ 🌙    🌐    🔔(8)  [●] ▼  │  │
│  │  [hamburger]  [logo + name]     │           │Dark  VIE   Bell  Avatar     │  │
│  │  + current page title inline    │           │                Admin User   │  │
│  └─────────────────────────────────┘           │                SUPER_ADMIN  │  │
│                                                └──────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────────┤
│  SIDEBAR (280px, bg: #111827)    │  MAIN CONTENT AREA (flex-1, bg: #0E1726)     │
│  ─────────────────────────────  │  ────────────────────────────────────────     │
│  🏠 POS Management (logo+name)  │  ┌────────────────────────────────────────┐   │
│                                 │  │  BREADCRUMB (khi không phải Dashboard) │   │
│  TỔNG QUAN (section label)      │  │  Quản Lý Danh Mục  >  Loại thiết bị   │   │
│  [🏠 Dashboard]  ← active=blue  │  └────────────────────────────────────────┘   │
│                                 │                                               │
│  QUẢN LÝ DANH MỤC ▲ (expanded) │  ┌────────────────────────────────────────┐   │
│    Device Category              │  │  PAGE HEADER                           │   │
│    Device Type                  │  │  [Page Title]           [Action Btns]  │   │
│    Device Model                 │  └────────────────────────────────────────┘   │
│    Vendor                       │                                               │
│    MCC                          │  ┌────────────────────────────────────────┐   │
│    Business Unit                │  │  CONTENT AREA (padding: 24px)          │   │
│    Fee Policy                   │  │  Table / Form / Detail / Dashboard     │   │
│                                 │  │                                        │   │
│  QUẢN LÝ KHO ▼ (collapsed)      │  └────────────────────────────────────────┘   │
│  QUẢN LÝ MERCHANT ▼             │                                               │
│  QUẢN LÝ THIẾT BỊ ▼             │                                               │
│  QUẢN LÝ ASSIGNMENT ▼           │                                               │
│  QUY TRÌNH NGHIỆP VỤ            │                                               │
│    Hộp việc cần duyệt [8]       │                                               │
│  BÁO CÁO & HỆ THỐNG ▼           │                                               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Breadcrumb Navigation — Bắt Buộc Trên Mọi Trang (Trừ Dashboard)

Breadcrumb nằm ở **vị trí đầu tiên trong main content area**, phía trên Page Header, font 13px màu `$text-secondary`.

```
 Trang hiện tại → URL → Breadcrumb hiển thị
 ─────────────────────────────────────────────────────────────────────────────
 /dashboard                    →  (không có breadcrumb)
 /catalog/device-categories    →  Quản Lý Danh Mục  >  Danh mục thiết bị
 /catalog/device-types         →  Quản Lý Danh Mục  >  Loại thiết bị
 /catalog/device-models        →  Quản Lý Danh Mục  >  Model thiết bị
 /catalog/vendors              →  Quản Lý Danh Mục  >  Nhà cung cấp
 /catalog/mcc                  →  Quản Lý Danh Mục  >  MCC
 /organization/business-units  →  Quản Lý Danh Mục  >  Đơn vị kinh doanh
 /organization/warehouses      →  Quản Lý Danh Mục  >  Kho
 /catalog/fee-policies         →  Quản Lý Danh Mục  >  Chính sách phí
 /inventory/purchase-orders    →  Quản Lý Kho  >  Thông tin nhập kho
 /inventory/stock-export       →  Quản Lý Kho  >  Thông tin xuất kho
 /inventory/stock              →  Quản Lý Kho  >  Tồn kho
 /inventory/transfers          →  Quản Lý Kho  >  Điều chuyển kho
 /merchant/merchants           →  Quản Lý Merchant  >  Danh sách Merchant
 /merchant/merchants/:id       →  Quản Lý Merchant  >  Danh sách Merchant  >  Chi tiết
 /merchant/terminals           →  Quản Lý Merchant  >  TID (Terminal)
 /device/search                →  Quản Lý Thiết Bị  >  Tra cứu thiết bị
 /device/:serial               →  Quản Lý Thiết Bị  >  Tra cứu thiết bị  >  SN-POS-XXXXXX
 /assignment/create            →  Quản Lý Assignment  >  Cấp phát thiết bị
 /assignment/list              →  Quản Lý Assignment  >  Danh sách assignment
 /assignment/history           →  Quản Lý Assignment  >  Lịch sử assignment
 /approval/inbox               →  Quy Trình Nghiệp Vụ  >  Hộp việc cần duyệt
 /approval/:id                 →  Quy Trình Nghiệp Vụ  >  Hộp việc cần duyệt  >  Chi tiết
 /approval/my-requests         →  Quy Trình Nghiệp Vụ  >  Yêu cầu tôi đã tạo
 /approval/all                 →  Quy Trình Nghiệp Vụ  >  Tất cả yêu cầu
 /approval/history             →  Quy Trình Nghiệp Vụ  >  Lịch sử phê duyệt
 /monitoring/dashboard         →  Báo Cáo & Hệ Thống  >  Giám sát POS
 /monitoring/audit             →  Báo Cáo & Hệ Thống  >  Audit Log
 /reports                      →  Báo Cáo & Hệ Thống  >  Báo cáo
 /admin/users                  →  Quản Trị  >  Quản lý User
 /admin/roles                  →  Quản Trị  >  Phân quyền
```

**Angular implementation:**
```typescript
// breadcrumb.service.ts — tự động generate từ route data
export const ROUTES_WITH_BREADCRUMB: Routes = [
  {
    path: 'catalog',
    data: { breadcrumb: 'Quản Lý Danh Mục' },
    children: [
      { path: 'device-types', data: { breadcrumb: 'Loại thiết bị' } },
      { path: 'device-models', data: { breadcrumb: 'Model thiết bị' } },
      // ...
    ]
  },
  {
    path: 'device',
    data: { breadcrumb: 'Quản Lý Thiết Bị' },
    children: [
      { path: 'search', data: { breadcrumb: 'Tra cứu thiết bị' } },
      // Route :serial sẽ lấy breadcrumb động từ signal: device().serialNumber
      { path: ':serial', data: { breadcrumb: null } } // null = dùng dynamic value
    ]
  }
];

// Breadcrumb component hiển thị:
// Quản Lý Danh Mục  ›  Loại thiết bị
// [parent link]     ›  [current page - không có link]
```

**HTML template:**
```html
<!-- breadcrumb.component.html -->
<nav class="breadcrumb" aria-label="Breadcrumb" *ngIf="breadcrumbs().length > 0">
  <ol>
    <li *ngFor="let crumb of breadcrumbs(); let last = last">
      <a *ngIf="!last" [routerLink]="crumb.url" class="breadcrumb__link">
        {{ crumb.label }}
      </a>
      <span *ngIf="last" class="breadcrumb__current">{{ crumb.label }}</span>
      <span *ngIf="!last" class="breadcrumb__separator">›</span>
    </li>
  </ol>
</nav>
```

**CSS:**
```scss
.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  ol { display: flex; align-items: center; gap: 6px; list-style: none; padding: 0; }

  &__link {
    font-size: 13px;
    color: $text-secondary;   // #8899AA
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: $primary-400; text-decoration: underline; }
  }

  &__separator {
    font-size: 13px;
    color: $text-muted;       // #5A6A7A
  }

  &__current {
    font-size: 13px;
    color: $text-primary;     // #FFFFFF
    font-weight: 500;
  }
}
```

### 2.3 Sidebar Menu Structure — Theo Ảnh Chuẩn

Sidebar dùng **collapsible accordion** — mỗi section có thể mở/đóng bằng chevron `▲`/`▼`.
Sidebar item active (đang xem) được highlight bằng background blue `#1976D2`.

```
┌─────────────────────────────────────────┐
│  📊 POS Management          (logo + text)│  ← header sidebar, height 64px
├─────────────────────────────────────────┤
│                                         │
│  TỔNG QUAN                  (label mờ)  │
│  🏠 Dashboard               [active]   │  ← full-width, bg #1976D2, radius 8px
│                                         │
│  QUẢN LÝ DANH MỤC           (label) ▲  │  ← có chevron, click để collapse
│    □ Device Category                    │  ← indent 16px, icon nhỏ
│    □ Device Type                        │
│    □ Device Model                       │
│    □ Vendor                             │
│    □ MCC                                │
│    □ Business Unit                      │
│    □ Fee Policy                         │
│                                         │
│  QUẢN LÝ KHO                (label) ▼  │  ← collapsed
│  QUẢN LÝ MERCHANT           (label) ▼  │
│  QUẢN LÝ THIẾT BỊ           (label) ▼  │
│  QUẢN LÝ ASSIGNMENT         (label) ▼  │
│                                         │
│  QUY TRÌNH NGHIỆP VỤ        (label)    │  ← không có chevron (luôn hiện)
│    □ Hộp việc cần duyệt    [8]         │  ← badge counter màu đỏ/cam
│                                         │
│  BÁO CÁO & HỆ THỐNG        (label) ▼  │
│                                         │
└─────────────────────────────────────────┘
```

**Màu sắc sidebar chi tiết (từ ảnh chuẩn):**

| Element | Màu / Style |
|---|---|
| Sidebar background | `#111827` |
| Section label (TỔNG QUAN...) | `#6B7A8D`, font-size 11px, uppercase, letter-spacing 0.08em |
| Menu item text | `#CBD5E1`, font-size 14px |
| Menu item hover | background `rgba(255,255,255,0.05)` |
| Active item background | `#1976D2` (blue solid) |
| Active item text | `#FFFFFF`, font-weight 600 |
| Chevron icon | `#6B7A8D` (mở: ▲, đóng: ▼) |
| Badge (Hộp việc cần duyệt) | background `#E53E3E`, text `#FFF`, font-size 11px, border-radius full |
| Sidebar separator line | `1px solid #1E3048` |
| Logo icon | blue gradient icon `#1976D2` |

---

## 3. Reusable Components

### 3.1 Status Badge Component

```html
<!-- device-status.badge.component.html -->
<span class="status-badge" [class]="'status-badge--' + status.toLowerCase()">
  <span class="status-dot"></span>
  {{ status | deviceStatus }}
</span>

<!-- Styles -->
.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 500;

  &--instock        { background: rgba(46,125,50,0.15); color: #4CAF50; }
  &--deployed       { background: rgba(21,101,192,0.15); color: #42A5F5; }
  &--out_of_warehouse { background: rgba(106,27,154,0.15); color: #AB47BC; }
  &--returned       { background: rgba(245,124,0,0.15); color: #FFA726; }
  &--repairing      { background: rgba(230,81,0,0.15); color: #FF7043; }
  &--disposed       { background: rgba(183,28,28,0.15); color: #EF5350; }
}
```

### 3.2 Data Table Component (Reusable)

```typescript
// shared/components/data-table/data-table.component.ts
@Component({
  selector: 'app-data-table',
  standalone: true,
  ...
})
export class DataTableComponent<T> {
  // Inputs
  @Input() columns: TableColumn[] = [];
  @Input() dataSource = signal<T[]>([]);
  @Input() totalCount = signal<number>(0);
  @Input() isLoading = signal<boolean>(false);
  @Input() pageSize = 20;

  // Outputs
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() actionClick = new EventEmitter<{action: string, row: T}>();
}
```

### 3.3 Approval Timeline Component

```html
<!-- approval-timeline.component.html -->
<div class="approval-timeline">
  <div class="timeline-step" *ngFor="let step of steps; let i = index"
       [class.completed]="step.action" [class.current]="!step.action && i === currentStep">
    <div class="step-connector" *ngIf="i > 0"></div>
    <div class="step-circle">
      <mat-icon *ngIf="step.action === 'APPROVED'">check_circle</mat-icon>
      <mat-icon *ngIf="step.action === 'REJECTED'">cancel</mat-icon>
      <span *ngIf="!step.action">{{ i + 1 }}</span>
    </div>
    <div class="step-content">
      <h4>Cấp duyệt {{ step.level }}</h4>
      <p *ngIf="step.performedBy">{{ step.performedBy }} — {{ step.occurredAt | date:'dd/MM/yyyy HH:mm' }}</p>
      <p class="step-comment" *ngIf="step.comment">{{ step.comment }}</p>
    </div>
  </div>
</div>
```

---

## 4. Danh Sách Đầy Đủ 38 Màn Hình

### 4.1 Authentication & Layout (Sprint 01)

#### 01 — Login Page
```
URL: /login
Components:
  - Form: username (text), password (password + toggle)
  - Button: Đăng nhập (loading spinner khi submit)
  - Error alert: sai mật khẩu / tài khoản khóa
  - Footer: "Hệ thống Quản lý POS — Dành cho nội bộ ngân hàng"
Design: Dark theme, logo ngân hàng, gradient background #0D1B2A → #1E3A5F
```

#### 02 — Main Layout (Shell)
```
Components:
  - Sidebar (collapsible, 280px → 64px icon-only)
  - Header: Logo | Page breadcrumb | Search global | Notification bell | User menu
  - Content area (scrollable)
  - Route animation transition
```

### 4.2 Admin (Sprint 01)

#### 03 — User Management
```
URL: /admin/users
Columns: Họ tên | Username | Email | Role | Business Unit | Trạng thái | Lần đăng nhập cuối | Actions
Filters: Status, Role, Business Unit
Actions: Tạo user, Chỉnh sửa, Khóa/Mở khóa, Đặt lại mật khẩu
Form tạo user: Họ tên, Username, Email, Mật khẩu, Role (multi-select), Business Unit
```

#### 04 — Role & Permission Management
```
URL: /admin/roles
Tab 1 — Roles: Danh sách role, tạo role, chỉnh sửa mô tả
Tab 2 — Permission Matrix: Checkbox matrix Role × Permission (group by module)
```

### 4.3 Catalog (Sprint 02)

#### 05 — Device Category
```
URL: /catalog/device-categories
Table: Code | Tên | Số loại thiết bị | Trạng thái | Actions
Dialog Add/Edit: Code, Tên, Mô tả
```

#### 06 — Device Type
```
URL: /catalog/device-types
Filters: Device Category
Table: Code | Tên | Danh mục | Trạng thái | Actions
```

#### 07 — Device Model
```
URL: /catalog/device-models
Filters: Device Type, Vendor
Table: Code | Tên | Loại | Vendor | Thông số | Trạng thái | Actions
Dialog: Code, Tên, Loại thiết bị (dropdown), Vendor (dropdown), Thông số kỹ thuật (JSON editor)
```

#### 08 — Vendor
```
URL: /catalog/vendors
Table: Code | Tên | Email liên hệ | Số model | Trạng thái | Actions
```

#### 09 — MCC
```
URL: /catalog/mcc
Search: code, tên ngành
Table: Code | Tên ngành nghề | Danh mục | Trạng thái
```

#### 10 — Fee Policy
```
URL: /catalog/fee-policies
Table: Code | Tên | Tỷ lệ phí | Phí cố định | Trạng thái | Actions
Dialog: Code, Tên, Tỷ lệ %, Phí cố định, Min/Max, Mô tả
```

#### 11 — Business Unit
```
URL: /organization/business-units
Table: Code | Tên | Khu vực | Số kho | Số merchant | Trạng thái | Actions
```

#### 12 — Warehouse
```
URL: /organization/warehouses
Filters: Business Unit
Table: Code | Tên | Đơn vị KD | Địa chỉ | Tồn kho hiện tại | Trạng thái | Actions
```

### 4.4 Inventory (Sprint 03–04)

#### 13 — Purchase Order List
```
URL: /inventory/purchase-orders
Filters: Status, Vendor, Kho, Date range
Table: Số PO | Vendor | Kho nhận | Tổng SL | Đã nhận | Trạng thái | Ngày tạo | Actions
Status badges: DRAFT(xám) | SUBMITTED(cam) | APPROVED(xanh lá) | RECEIVED(xanh dương) | CLOSED(tối)
```

#### 14 — Purchase Order Create & Detail
```
URL: /inventory/purchase-orders/new | /inventory/purchase-orders/:id
Create (multi-step):
  Step 1: Chọn Vendor, Kho nhận, Ghi chú
  Step 2: Thêm items (Device Model + Số lượng)
  Step 3: Review & Submit
Detail:
  - Header: Số PO | Status badge | Vendor | Kho | Actions (Submit/Approve/Receive)
  - Table items: Model | Vendor | SL đặt | SL nhận
  - Timeline: Tạo → Submit → Approve → Receive
```

#### 15 — Nhập Kho (Stock Import)
```
URL: /inventory/imports/new
Sections:
  1. Chọn Purchase Order
  2. Danh sách thiết bị nhập (bảng: Serial Number | Model | Vendor | Tình trạng)
     - Nhập từng serial hoặc paste bulk (textarea)
     - Validate real-time: duplicate, format
  3. Preview tổng (SL hợp lệ / lỗi)
  4. Confirm & Submit
```

#### 16 — Tồn Kho (Stock Overview)
```
URL: /inventory/stock
KPI Cards: Tổng tồn | Hà Nội | HCM | Đà Nẵng
Table tổng hợp: Kho | Model | Vendor | SL INSTOCK | SL DEPLOYED | SL REPAIRING | Tổng
Drilldown: Click row → Modal danh sách serial chi tiết
Filters: Warehouse, Model, Vendor, Status
```

#### 17 — Xuất Kho
```
URL: /inventory/exports/new | /inventory/exports
Create form:
  - Kho nguồn
  - Thiết bị cần xuất (bảng chọn từ INSTOCK, multi-select)
  - Đơn vị nhận / Mục đích xuất
  - Ghi chú
  → Submit → Tạo Approval Request → Redirect sang phiếu phê duyệt
List: Bảng phiếu xuất kho + status
```

#### 18 — Điều Chuyển Kho
```
URL: /inventory/transfers/new | /inventory/transfers
Create form:
  - Kho nguồn → Kho đích
  - Danh sách serial điều chuyển
  → Submit → Approval Request
List: Bảng phiếu điều chuyển + status
```

### 4.5 Merchant (Sprint 05)

#### 19 — Danh Sách Merchant
```
URL: /merchant/merchants
Filters: Status, MCC, Business Unit, search name/code
Table: MID | Tên | Mã số thuế | MCC | Đơn vị KD | Số TID | Trạng thái | Ngày tạo | Actions
Status badge: PENDING(xám) | ACTIVE(xanh lá) | INACTIVE(cam) | SUSPENDED(đỏ)
Quick actions: View, Edit, Activate, Suspend
FAB button: + Tạo Merchant
```

#### 20 — Chi Tiết Merchant (4 Tabs)
```
URL: /merchant/merchants/:id
Header: MID | Tên Merchant | Status badge | [Edit] [Activate/Suspend]
Tab 1 — Thông tin:    MID, Tên, Mã thuế, MCC, Business Unit, Địa chỉ, Liên hệ, Ngày tạo
Tab 2 — TID:          Bảng TID (TID | Status | Ngày tạo | Actions) + Nút thêm TID
Tab 3 — Lịch sử:      Timeline thay đổi trạng thái Merchant
Tab 4 — Chính sách phí: Danh sách fee assignments với effective dating
```

#### 21 — Quản Lý TID
```
URL: /merchant/terminals
Filters: Merchant, Status
Table: TID | Merchant | MID | Trạng thái | Thiết bị đang gắn | Ngày hiệu lực | Actions
```

### 4.6 Device (Sprint 06)

#### 22 — Tra Cứu Thiết Bị
```
URL: /device/search
Search bar: Tìm theo Serial Number (prominent)
Advanced filters: Model, Vendor, Status (multi-select), Warehouse, Merchant
Table: Serial | Model | Vendor | Kho | Trạng thái | Merchant | TID | Warranty | Actions
Row click → Device Detail
Export CSV button
```

#### 23 — Chi Tiết Thiết Bị (8 Tabs) ⭐
```
URL: /device/:serial
Header:
  - Serial Number (bold, copy button)
  - Status Badge (lớn, màu nổi)
  - Model | Vendor | Kho hiện tại
  - Action buttons (theo trạng thái):
    INSTOCK: [Xuất kho] [Thanh lý]
    DEPLOYED: [Thu hồi]
    RETURNED: [Nhập lại kho] [Tạo đơn sửa chữa]
    REPAIRING: [Nghiệm thu] [Đề nghị thanh lý]

Tab 1 — Thông tin chung:
  Grid 2 cột: Serial | Model | Vendor | Kho | Purchase Date | Warranty | Firmware | Notes

Tab 2 — Trạng thái hiện tại:
  FSM diagram hiển thị trạng thái hiện tại được highlight
  Allowed transitions hiển thị dạng button

Tab 3 — Thông tin Merchant:
  Card: Merchant Name | MID | TID | Ngày cấp phát
  (Nếu không có assignment → "Thiết bị chưa được cấp phát")

Tab 4 — Lịch sử vòng đời:
  Timeline dọc:
  ● INSTOCK (01/01/2026) — Nhập kho từ PO-2026-001
  ● OUT_OF_WAREHOUSE (05/01/2026) — Xuất kho theo EX-2026-001
  ● DEPLOYED (06/01/2026) — Cấp phát cho Merchant ABC / TID T100001
  ● RETURNED (10/06/2026) — Thu hồi từ Merchant ABC
  ● REPAIRING (11/06/2026) — Lỗi màn hình
  ● INSTOCK (15/06/2026) — Sửa thành công

Tab 5 — Lịch sử Assignment:
  Table: STT | Merchant | MID | TID | Ngày cấp | Ngày thu hồi | Người cấp | Người thu | Ghi chú

Tab 6 — Lịch sử sửa chữa:
  Table: Số đơn | Ngày tạo | Mô tả lỗi | Đơn vị sửa | Trạng thái | Kết quả | Ngày hoàn thành

Tab 7 — Lịch sử kho:
  Table: Thời gian | Loại (IMPORT/EXPORT/TRANSFER) | Kho từ | Kho đến | Phiếu liên quan | Người thực hiện

Tab 8 — Audit Log:
  Table: Thời gian | Người thực hiện | Hành động | Chi tiết thay đổi
```

### 4.7 Repair Management (Sprint 07)

#### 24 — Quản Lý Đơn Sửa Chữa
```
URL: /device/:serial/repairs | /repairs
Table: Số đơn | Serial | Mô tả lỗi | Đơn vị sửa | Trạng thái | Ngày tạo | Actions
Form tạo (từ Device Detail): Serial (readonly), Mô tả lỗi, Đơn vị sửa, Ghi chú
Form nghiệm thu: Kết quả, Tình trạng sau sửa (Đạt/Không đạt), Ghi chú
```

### 4.8 Assignment (Sprint 08–09)

#### 25 — Cấp Phát Thiết Bị
```
URL: /assignment/create
Multi-step form:
  Step 1 — Chọn thiết bị:
    - Search serial number (autocomplete từ INSTOCK devices)
    - Hoặc: Chọn từ bảng (filter model, vendor, warehouse)
  Step 2 — Chọn Merchant & TID:
    - Search merchant (name/MID)
    - Chọn TID của merchant đó
    - Ghi chú
  Step 3 — Xác nhận:
    - Summary: Serial → Merchant → TID
    - [Xác nhận cấp phát]
Result: Success card với Assignment ID + confetti animation
```

#### 26 — Danh Sách Assignment
```
URL: /assignment/list
Filters: Status, Merchant, Business Unit, Date range
Table: Mã | Serial | Model | Merchant | TID | Ngày cấp | Ngày thu hồi | Người cấp | Trạng thái | Actions
Status: ACTIVE(xanh) | RETURNED(cam) | TRANSFERRED(tím)
Quick action: Thu hồi (chỉ với ACTIVE)
```

#### 27 — Lịch Sử Assignment
```
URL: /assignment/history
Filters: Device serial, Merchant, Date range
Timeline hoặc table toàn bộ lịch sử cấp phát/thu hồi
```

### 4.9 Approval Workflow (Sprint 10)

#### 28 — Hộp Việc Cần Duyệt (Inbox) ⭐
```
URL: /approval/inbox
Header stats:
  [ Chờ duyệt: 8 ] [ Đã duyệt hôm nay: 12 ] [ Bị từ chối: 2 ]

Tabs: Tất cả | Xuất kho | Thu hồi | Điều chuyển | Thanh lý

Mỗi card trong list:
  ┌─────────────────────────────────────────────────────────┐
  │ 📤 Yêu cầu xuất kho EX-2026-0081          [Chờ duyệt cấp 1] │
  │ Kho Hà Nội · 5 thiết bị POS PAX A920                   │
  │ 👤 Nguyễn Văn A · 09:32 hôm nay                         │
  │                           [Xem chi tiết] [Phê duyệt ▼]  │
  └─────────────────────────────────────────────────────────┘

Actions nhanh từ card: Duyệt | Từ chối | Yêu cầu bổ sung
```

#### 29 — Chi Tiết Phiếu Phê Duyệt ⭐
```
URL: /approval/:id
Sections:
  1. Header: Số phiếu | Loại | Trạng thái badge | Actions
  2. Thông tin phiếu (tùy loại):
     Xuất kho: Kho nguồn, Thiết bị xuất (list serial), Đơn vị nhận, Lý do
     Thu hồi: Serial, Merchant, TID, Lý do thu hồi, Người phụ trách
  3. Approval Timeline (component):
     ● Step 1 — Chờ duyệt cấp 1: [Duyệt] [Từ chối] [Yêu cầu bổ sung]
     ● Step 2 — Chờ duyệt cấp 2: (disabled nếu chưa qua step 1)
  4. Form hành động (khi pending):
     - Textarea: Ý kiến / Lý do từ chối
     - Buttons: [✓ Phê duyệt] [✗ Từ chối] [↩ Yêu cầu bổ sung]
  5. Lịch sử hành động: Table các step đã thực hiện
```

#### 30 — Yêu Cầu Tôi Đã Tạo
```
URL: /approval/my-requests
Filters: Status, Loại yêu cầu, Date range
Table: Số phiếu | Loại | Tóm tắt | Trạng thái | Ngày tạo | Cấp duyệt hiện tại | Actions
Action: Hủy (nếu DRAFT), Xem chi tiết
```

#### 31 — Tất Cả Yêu Cầu (Admin)
```
URL: /approval/all
Filters: Status, Loại, Người tạo, Business Unit, Date range
Table như trên + cột Người tạo + Người duyệt
```

#### 32 — Lịch Sử Phê Duyệt
```
URL: /approval/history
Filters: Loại, Kết quả (Approved/Rejected), Date range, Người duyệt
Table: Số phiếu | Loại | Kết quả | Người duyệt | Ngày duyệt | Ý kiến
```

### 4.10 Monitoring (Sprint 12–14)

#### 33 — Outbox Events Monitor
```
URL: /monitoring/outbox
KPI: PENDING(🔴) | SENT(🟢) | FAILED(🔴)
Table: Event ID | Loại | Aggregate | Trạng thái | Retry | Thời gian | Actions
Actions: [Retry] (cho FAILED), [Toggle Kafka DOWN/UP] (chaos button)
```

#### 34 — Main Dashboard ⭐
```
URL: /dashboard
Row 1 — Device KPIs (Cards):
  [🟢 Tổng thiết bị: 1,245] [📦 Tồn kho: 423] [🚀 Đang triển khai: 756] [🔧 Đang sửa: 42] [🗑️ Thanh lý: 24]

Row 2 — Merchant KPIs:
  [🏪 Merchant Active: 238] [❌ Inactive: 15] [🔌 Tổng TID: 892]

Row 3 — Approval KPIs:
  [⏳ Chờ duyệt: 8] [✅ Đã duyệt hôm nay: 12]

Row 4 — Charts (2 columns):
  Left: Bar chart "Nhập/Xuất kho theo tháng" (12 tháng gần nhất)
  Right: Donut chart "Phân bổ thiết bị theo trạng thái"

Row 5 — Bottom (2 columns):
  Left: Horizontal bar "Top 5 Kho tồn nhiều nhất"
  Right: "10 hoạt động gần nhất" (activity feed)
```

#### 35 — Giám Sát Hệ Thống POS
```
URL: /monitoring/pos
Filters: Business Unit, Merchant, Model
Auto-refresh: mỗi 30s (countdown indicator)
Grid thiết bị DEPLOYED:
  - Search serial
  - Card grid: Serial | Model | Merchant | TID | Trạng thái online/offline (mock)
```

#### 36 — Audit Log
```
URL: /monitoring/audit
Filters: User, Action type, Resource type, Date range
Table: Thời gian | User | Hành động | Resource | Chi tiết | IP
Row click → Modal chi tiết: Old value / New value (JSON diff)
Export CSV
```

#### 37 — Báo Cáo
```
URL: /reports
Sidebar chọn loại báo cáo:
  - Báo cáo tồn kho
  - Báo cáo thiết bị theo trạng thái
  - Báo cáo assignment (cấp phát/thu hồi)
  - Báo cáo merchant
Date picker: From → To
Chart + Table + Export (PDF / Excel) buttons
```

#### 38 — Notification Center ⭐ (Sprint 11)
```
URL: /notifications
Layout:
  - Header: "Thông báo" + [Mark all as read] button
  - Filter tabs: Tất cả | Chưa đọc | Đã đọc
Mỗi thông báo hiển thị:
  - Icon theo loại (APPROVAL_REQUIRED / APPROVAL_RESULT / SYSTEM)
  - Tiêu đề + Nội dung tóm tắt
  - Thời gian ("vừa xong", "2 phút trước", "09:32 hôm nay")
  - Dấu chưa đọc (dot xanh trái)
Click thông báo → navigate tới phiếu/tài nguyên liên quan:
  - APPROVAL_REQUIRED → /approval/inbox (chi tiết phiếu)
  - APPROVAL_RESULT   → /approval/my-requests
  - SYSTEM            → /dashboard
Pagination: Load more (20 items/page)
Empty state: "Đã đọc hết thông báo" với icon
Design: Unread items có background nhạt hơn (rgba(25, 118, 210, 0.08))
```

---

## 5. Angular Component Naming Convention

| Loại | Tên File | Selector |
|---|---|---|
| Page/Screen | `device-search.page.ts` | `app-device-search-page` |
| Feature Component | `approval-timeline.component.ts` | `app-approval-timeline` |
| Shared Component | `status-badge.component.ts` | `app-status-badge` |
| Dialog | `assign-device.dialog.ts` | `app-assign-device-dialog` |
| API Service | `device-api.service.ts` | - |
| State Service | `device-state.service.ts` | - |
| Pipe | `device-status.pipe.ts` | `deviceStatus` |
| Guard | `auth.guard.ts` | - |
| Interceptor | `jwt.interceptor.ts` | - |
