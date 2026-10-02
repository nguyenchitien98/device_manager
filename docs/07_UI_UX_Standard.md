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

---

## 6. Chuẩn Layout 2 Khung — BẮT BUỘC Trên MỌI Màn Danh Sách

> **Nguyên tắc áp dụng cho TẤT CẢ màn có danh sách:** Catalog, Inventory, Merchant, Device, Assignment, Approval, Report...

### 6.1 Cấu Trúc Khung Chuẩn (Standard 2-Zone Layout)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  KHUNG TRÊN — TRA CỨU / FILTER (Search Zone)                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  [Input text]  [Dropdown 1]  [Dropdown 2]  [Date From] [Date To]│   │
│  │  [Input text]  [Dropdown 3]  [Dropdown 4]  [Date From] [Date To]│   │
│  │                                              [🔍 Tìm kiếm] [✕ Clear] [📥 Xuất Excel] │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  [Tuỳ chọn — CHỈ KHI MÀN CÓ TRẠNG THÁI] STATUS TABS:                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Tất cả(120)  |  Chờ Duyệt(8)  |  Đã Duyệt(45)  |  Từ chối(3) │   │
│  └──────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│  KHUNG DƯỚI — DANH SÁCH KẾT QUẢ (List Zone)                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  [+ Thêm mới]  hoặc  [+ Tạo yêu cầu]    [⚙ Chọn cột hiển thị] │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  BẢNG DỮ LIỆU (sau khi click Tìm kiếm)                        │   │
│  │  □  STT | Col1 | Col2 | Col3 | Trạng thái | Hành động          │   │
│  │  □   1  | ...  | ...  | ...  |  [badge]   | [Xem][Sửa][...]    │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  Hiển thị 1-20 của 120 kết quả  [< 1 2 3 ... 6 >]             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Khung Trên (Search Zone) — Quy Tắc Chi Tiết

```
BẮT BUỘC:
✅ Input text: placeholder mô tả rõ "Nhập mã, tên, serial..."
✅ Dropdown: có option "Tất cả" ở đầu
✅ Date picker: cặp From/To, validate From ≤ To
✅ Button layout (căn phải, cuối filter zone):
   - [🔍 Tìm kiếm]  → PRIMARY button (blue)
   - [✕ Clear]      → SECONDARY button (ghost/outline) — reset tất cả filter
   - [📥 Xuất Excel] → OUTLINE button với icon
✅ Grid layout filter: 3-4 cột, responsive xuống 2 cột trên tablet
✅ Khi màn có trạng thái: Status tabs nằm GIỮA 2 khung (thêm vào ngay phía trên khung dưới)
```

### 6.3 Status Tabs (Tabs Trạng Thái) — Màn Có Workflow

```scss
// Chỉ hiển thị khi màn có trạng thái (workflow/lifecycle)

.status-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid $border-color;
  margin-bottom: 16px;
}

.status-tab {
  padding: 6px 16px;
  border-radius: $radius-full;
  font-size: $text-sm;
  font-weight: $fw-medium;
  cursor: pointer;
  transition: all 0.2s;

  // Count badge trong tab
  .count {
    margin-left: 6px;
    padding: 2px 7px;
    border-radius: $radius-full;
    font-size: 11px;
    background: rgba(255,255,255,0.15);
  }
}
```

**Màu sắc status tabs theo module:**

| Module | Tabs | Màu sắc badge |
|---|---|---|
| Inventory (Xuất/Nhập kho) | Tất cả \| Chờ duyệt \| Đã duyệt \| Hoàn thành \| Từ chối \| Đã hủy | theo `$approval-*` |
| Device | Tất cả \| Trong kho \| Xuất kho \| Đang hoạt động \| Điều chuyển \| Sửa chữa \| Thanh lý | theo `$status-*` |
| Assignment | Tất cả \| Đang cấp phát \| Đã thu hồi \| Điều chuyển | |
| Merchant | Tất cả \| Đang hoạt động \| Tạm dừng \| Chờ duyệt | |
| Approval Inbox | Tất cả \| Cần duyệt \| Đã duyệt \| Đã từ chối | |

### 6.4 Khung Dưới (List Zone) — Quy Tắc Chi Tiết

```
BẮT BUỘC:
✅ Toolbar đầu bảng (trong card, trước table):
   - Trái: [+ Thêm mới] hoặc [+ Tạo yêu cầu] (tuỳ theo nghiệp vụ màn)
   - Phải: Dropdown [⚙ Chọn cột hiển thị] — cho phép ẩn/hiện từng cột

✅ Table:
   - Checkbox chọn nhiều (cột đầu tiên)
   - STT cột thứ 2 (số thứ tự, bắt đầu từ 1)
   - Cột Hành Động (Actions) nằm CUỐI cùng
   - Actions tuỳ màn: [Xem] [Sửa] [Duyệt] [Từ chối] [...]
   - Empty state: icon + "Không có dữ liệu. Vui lòng thay đổi điều kiện tìm kiếm"
   - Loading state: skeleton rows trong khi đang fetch

✅ Pagination:
   - Hiển thị: "Hiển thị {from}-{to} của {total} kết quả"
   - Page size selector: [10] [20] [50] [100]
   - Previous / Next / page numbers
   - Disabled prev khi trang 1, disabled next khi trang cuối

✅ Dropdown Chọn Cột:
   - Danh sách checkbox tất cả cột có thể hiện/ẩn
   - Lưu preference vào localStorage theo route
   - Tối thiểu 3 cột luôn visible (không ẩn được): STT, [main field], Hành Động
```

### 6.5 Angular Component Structure (theo chuẩn này)

```typescript
// Mỗi màn danh sách PHẢI có:
interface ListPageState {
  // Filter zone
  filters: FilterForm;

  // Status tabs (nếu có)
  activeStatus: string;          // 'ALL' | 'PENDING' | ...
  statusCounts: Record<string, number>;

  // List zone
  items: T[];
  pagination: PaginationState;
  visibleColumns: string[];      // Cột đang hiển thị (từ localStorage)
  isLoading: boolean;
  isEmpty: boolean;
}

// BẮT BUỘC 3 nút trong Search Zone:
onSearch(): void    // Gọi API với filter hiện tại
onClear(): void     // Reset tất cả filter → form.reset()
onExportExcel(): void // Xuất Excel kết quả hiện tại
```

---

## 7. Validation Nghiêm Ngặt — Áp Dụng MỌI Form/Danh Sách Nhập Liệu

> **Nguyên tắc:** Không cho phép user sang bước tiếp / submit / Enter / bấm nút khi form chưa hợp lệ.

### 7.1 Quy Tắc Validate Chung

```
✅ Real-time validation: Hiển thị lỗi ngay khi user blur khỏi field (không đợi submit)
✅ Button "Tiếp theo" / "Gửi yêu cầu" / "Xác nhận":
   - LUÔN disabled nếu form invalid
   - Chỉ enable khi TẤT CẢ required fields hợp lệ
✅ Phím Enter trong input: KHÔNG cho submit nếu form invalid
✅ Error message: hiển thị ngay dưới field bị lỗi, màu $error (#F44336), font 12px
✅ Field bị lỗi: border màu $error, highlight nhẹ
```

### 7.2 Validate Danh Sách Động (Dynamic List — VD: Danh sách TID)

Khi form có danh sách dòng được thêm động (ví dụ: thêm nhiều TID, thêm nhiều thiết bị):

```
QUY TẮC:
✅ Nếu đã nhập dòng thứ 2 (hoặc bất kỳ dòng mới nào):
   - Tất cả trường required của dòng đó PHẢI được điền đầy đủ và hợp lệ
   - Nếu có BẤT KỲ trường nào trống hoặc invalid → KHÔNG cho sang bước tiếp
   - KHÔNG cho bấm Enter để thêm dòng mới
   - Button "Thêm dòng" bị disabled khi dòng hiện tại chưa hợp lệ
   - Button "Tiếp theo" bị disabled

✅ Visual feedback:
   - Dòng chưa hoàn thiện: highlight border đỏ
   - Tooltip khi hover button disabled: "Vui lòng điền đầy đủ thông tin dòng hiện tại"

✅ Angular implementation:
   // FormArray với validation per-row
   get isRowValid(): boolean {
     return this.tidFormArray.controls.every(ctrl => ctrl.valid);
   }
   // [disabled]="!isRowValid" trên button Thêm dòng / Tiếp theo
```

### 7.3 Validate Theo Loại Dữ Liệu

| Trường | Validate | Error message |
|---|---|---|
| TID | 8 ký tự số, unique trong danh sách | "TID phải là 8 ký tự số" / "TID đã tồn tại" |
| MID | 15 ký tự, unique | "MID không hợp lệ" |
| Serial Number | Theo format của Model | "Serial không đúng định dạng model" |
| Số điện thoại | 10-11 số, bắt đầu 0 | "Số điện thoại không hợp lệ" |
| Email | RFC format | "Email không đúng định dạng" |
| Ngày | dd/MM/yyyy, không tương lai nếu historical | "Ngày không hợp lệ" |
| Số tiền | Dương, tối đa 15 chữ số | "Số tiền phải lớn hơn 0" |
| Code (các loại mã) | Không dấu, không space, uppercase | "Mã chỉ được chứa chữ hoa, số và dấu _" |

---

## 8. Luồng Nghiệp Vụ Gửi Yêu Cầu — Chuẩn Wizard Multi-Step

> Áp dụng cho: Tạo yêu cầu cấp phát thiết bị, Tạo yêu cầu xuất kho, Tạo yêu cầu phê duyệt...

### 8.1 Cấu Trúc Wizard Chuẩn (Multi-Step Form)

```
BƯỚC ĐI QUA:
  [1] Thông Tin MID → [2] Thông Tin TID → [3] Tài Khoản → [4] Tài Liệu Đính Kèm → [5] Xác Nhận & Gửi

Hiển thị:
  ┌──────────────────────────────────────────────────────────────────┐
  │  ● Thông Tin MID  ─── ● Thông Tin TID  ─── ○ Tài Khoản  ─── ... │
  │  (completed)          (active)               (pending)            │
  └──────────────────────────────────────────────────────────────────┘
```

### 8.2 Step 1 — Thông Tin MID

```
Content:
  - Tìm/chọn Merchant (autocomplete)
  - Hiển thị thông tin Merchant: Tên, MCC, Business Unit
  - Chọn MID từ danh sách MID của Merchant (dropdown)
  - Hoặc tạo MID mới (inline form nếu có quyền)

Validate trước khi sang Step 2:
  ✅ Đã chọn Merchant
  ✅ Đã chọn MID
```

### 8.3 Step 2 — Thông Tin TID

```
Content:
  - Danh sách TID của MID đã chọn (bảng)
  - Chọn TID hoặc thêm TID mới
  - VALIDATE NGHIÊM NGẶT (áp dụng section 7.2):
    * Mỗi dòng TID phải điền đầy đủ trước khi thêm dòng mới
    * Button "Thêm TID" disabled khi dòng hiện tại chưa valid

Validate trước khi sang Step 3:
  ✅ Ít nhất 1 TID được chọn/thêm
  ✅ TẤT CẢ dòng TID hợp lệ
```

### 8.4 Step 3 — Tài Khoản

```
Content:
  - Tài khoản thanh toán / tài khoản liên kết
  - Số tài khoản, tên chủ tài khoản, ngân hàng
  - Tích hợp T24: verify tài khoản realtime (có indicator loading)

Validate trước khi sang Step 4:
  ✅ Tài khoản được điền đầy đủ và verified
```

### 8.5 Step 4 — Tài Liệu Đính Kèm

```
Content:
  - Upload file (PDF, JPG, PNG — tối đa 10MB/file)
  - Danh sách loại tài liệu bắt buộc (nếu có)
  - Preview thumbnail cho ảnh, icon PDF cho file

Validate trước khi sang Step 5:
  ✅ Tất cả tài liệu bắt buộc đã upload
  ✅ Không có file lỗi (size/type)
```

### 8.6 Step 5 — Xác Nhận & Gửi Yêu Cầu

```
Content:
  - Tóm tắt đầy đủ tất cả thông tin đã nhập (read-only)
  - Accordion: MID Info | TID Info | Tài Khoản | Tài Liệu
  - Checkbox "Tôi xác nhận thông tin trên là chính xác"
  - [← Quay lại]   [Gửi Yêu Cầu →] (disabled cho đến khi tick checkbox)

Sau khi Gửi:
  - Loading spinner trên button
  - Success: Toast "Yêu cầu #REQ-001 đã được gửi thành công"
  - Navigate → /approvals/my-requests
  - Error: Toast error + giữ nguyên form để sửa
```

### 8.7 Navigation Controls (Wizard Navigation)

```
[← Quay Lại]  (ghost button — quay bước trước, KHÔNG xóa data đã nhập)
               ↔
[Tiếp Theo →] (primary button — sang bước sau — DISABLED nếu step invalid)

KHI Ở BƯỚC CUỐI:
[← Quay Lại]  ↔  [Gửi Yêu Cầu]  (primary, loading state khi đang submit)
```

---

## 9. Cấu Trúc Folder Backend — I18N & OpenAPI

> Áp dụng cho backend Spring Boot (`pos-core/src/main/resources/`)

### 9.1 Cấu Trúc Resources

```
pos-core/src/main/resources/
├── application.yml                      # Main config
├── application-dev.yml                  # Dev profile
├── application-prod.yml                 # Prod profile
│
├── db/migration/                        # Flyway migrations
│   ├── V1__init_base_schema.sql
│   ├── V2__create_identity_tables.sql
│   ├── V3__add_metadata_version_and_catalog_schema.sql
│   └── V4__merchant_tid_mid_schema.sql
│
├── i18n/                                # Internationalization messages
│   ├── messages.properties              # Default (Vietnamese)
│   ├── messages_vi.properties           # Vietnamese explicit
│   └── messages_en.properties           # English
│
└── openapi/                             # OpenAPI/Swagger specs
    ├── api-1.yml                        # Main API spec (v1)
    ├── components/                      # Reusable schemas
    │   ├── auth-schemas.yml
    │   ├── catalog-schemas.yml
    │   ├── device-schemas.yml
    │   └── merchant-schemas.yml
    └── paths/                           # API paths by module
        ├── auth-paths.yml
        ├── catalog-paths.yml
        └── device-paths.yml
```

### 9.2 I18N — Cấu Trúc Messages

```properties
# messages.properties (Vietnamese default)

# ─── Validation messages ───────────────────────────────
validation.required=Trường này không được để trống
validation.min-length={0} phải có ít nhất {1} ký tự
validation.max-length={0} không được vượt quá {1} ký tự
validation.pattern={0} không đúng định dạng
validation.unique={0} đã tồn tại trong hệ thống

# ─── Error messages ────────────────────────────────────
error.pos-1001=Tên đăng nhập hoặc mật khẩu không đúng
error.pos-1002=Tài khoản bị tạm khóa. Vui lòng thử lại sau 30 phút
error.pos-2008=Không thể vô hiệu hóa Model — còn thiết bị đang hoạt động

# ─── Business labels ───────────────────────────────────
label.device-status.instock=Trong kho
label.device-status.deployed=Đang hoạt động
label.device-status.returned=Đã thu hồi
label.device-status.repairing=Đang sửa chữa
label.device-status.disposed=Đã thanh lý
label.device-status.out_of_warehouse=Xuất kho
```

### 9.3 OpenAPI — api-1.yml (Template)

```yaml
# openapi/api-1.yml
openapi: "3.1.0"
info:
  title: POS Management System API
  version: "1.0.0"
  description: |
    API cho hệ thống quản lý vòng đời thiết bị POS và Merchant.
    Tích hợp WAY4 Card Management và Temenos T24 Core Banking.
  contact:
    name: POS Management Team
    email: pos-team@bank.vn

servers:
  - url: http://localhost:8080
    description: Local Development
  - url: https://pos-api.bank.vn
    description: Production

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  responses:
    BadRequest:
      description: Dữ liệu đầu vào không hợp lệ
    Unauthorized:
      description: Chưa xác thực / Token hết hạn
    Forbidden:
      description: Không có quyền thực hiện thao tác
    NotFound:
      description: Không tìm thấy tài nguyên

paths:
  # Auth
  /api/v1/auth/login:
    $ref: './paths/auth-paths.yml#/login'
  /api/v1/auth/refresh:
    $ref: './paths/auth-paths.yml#/refresh'
  /api/v1/auth/logout:
    $ref: './paths/auth-paths.yml#/logout'

  # Catalog
  /api/v1/catalog/device-categories:
    $ref: './paths/catalog-paths.yml#/deviceCategories'
```

---

*Tài liệu cập nhật lần cuối: 2026-10-02. Áp dụng cho tất cả 38 màn hình.*
