# POS Management System — UI/UX Standard & Screen Inventory

Tài liệu mô tả tiêu chuẩn thiết kế, bộ màu sắc, typography, component guidelines và 38 màn hình.

> ⚠️ **QUAN TRỌNG:** Mọi màu sắc và cấu trúc được **calibrate trực tiếp từ 2 ảnh chuẩn UI** (Light + Dark). AI Agent PHẢI bám sát ảnh chuẩn.

---

## 0. Nguyên Tắc — BẮT BUỘC ĐỌC TRƯỚC

### 0.1 Dual Theme

Hỗ trợ 2 chế độ toggle bằng nút Moon/Sun trên header:

| Theme | Đặc điểm |
|---|---|
| Light Mode | Nền trắng, sidebar trắng, text tối — từ ảnh Light Dashboard |
| Dark Mode | Nền navy #0E1726, sidebar #111827, card #1C2A3A — từ ảnh Dark Dashboard |

Angular: class `.theme-light` / `.theme-dark` trên `<body>`. ThemeService lưu localStorage.

### 0.2 Sidebar Structure — Từ Ảnh Chuẩn

```
POS Management  (Logo + Brand)
─────────────────────────────────
TỔNG QUAN
  Dashboard

QUẢN LÝ DANH MỤC  (collapsible)
  Device Category
  Device Type
  Device model
  Vendor
  Quản lý kho         (Warehouse — nằm trong Danh Mục)
  Chính sách phí
  Đơn vị Kinh doanh
  Purchase order
  Quản lý MCC

QUẢN LÝ MERCHANT  (collapsible)
  Danh sách merchant
  Quản lý TID

QUẢN LÝ XUẤT/NHẬP KHO  (collapsible)
  Thông tin Nhập kho
  Thông tin xuất kho
  Thông tin tồn kho
  Điều chuyển kho

QUẢN LÝ THIẾT BỊ  (collapsible)
  Tra cứu thiết bị

QUẢN LÝ ASSIGNMENT  (collapsible)
  Quản lý assignment
  Lịch sử assignment

QUY TRÌNH NGHIỆP VỤ  (collapsible)
  Hộp việc cần duyệt  [8]  ← badge đỏ

BÁO CÁO & HỆ THỐNG  (collapsible)
  Giám sát hệ thống
  Báo cáo
```

> ⚠️ Warehouse nằm trong **QUẢN LÝ DANH MỤC**. Nhập/Xuất/Tồn/Điều chuyển nằm trong **QUẢN LÝ XUẤT/NHẬP KHO**.

---

## 1. Design System

### 1.1 Color Palette — Light Mode

```scss
$lm-app-bg:         #F0F2F5;
$lm-sidebar-bg:     #FFFFFF;
$lm-header-bg:      #FFFFFF;
$lm-card-bg:        #FFFFFF;
$lm-text-primary:   #1A2332;
$lm-text-secondary: #6B7A8D;
$lm-text-muted:     #9CA3AF;
$lm-border:         #E5E7EB;
$lm-sidebar-section-label: #9CA3AF;
$lm-sidebar-item-text:     #374151;
$lm-sidebar-item-hover:    #F3F4F6;
$lm-sidebar-active-bg:     #1976D2;
$lm-sidebar-active-text:   #FFFFFF;
```

### 1.2 Color Palette — Dark Mode

```scss
$dm-app-bg:         #0E1726;
$dm-sidebar-bg:     #111827;
$dm-header-bg:      #111827;
$dm-card-bg:        #1C2A3A;
$dm-card-alt-bg:    #162032;
$dm-text-primary:   #FFFFFF;
$dm-text-secondary: #8899AA;
$dm-text-muted:     #5A6A7A;
$dm-border:         #1E3048;
$dm-sidebar-section-label: #6B7A8D;
$dm-sidebar-item-text:     #CBD5E1;
$dm-sidebar-item-hover:    rgba(255,255,255,0.05);
$dm-sidebar-active-bg:     #1976D2;
$dm-sidebar-active-text:   #FFFFFF;
```

### 1.3 Shared Color Tokens

```scss
// Device Status
$status-instock:     #2E7D32;
$status-deployed:    #1565C0;
$status-returned:    #F57C00;
$status-repairing:   #E65100;
$status-disposed:    #B71C1C;
$status-out-of-wh:   #6A1B9A;

// Approval Status
$approval-draft:     #757575;
$approval-pending:   #F57C00;
$approval-approved:  #2E7D32;
$approval-rejected:  #B71C1C;
$approval-executing: #1565C0;
$approval-completed: #1B5E20;

// Semantic
$success: #4CAF50;  $warning: #FF9800;
$error:   #F44336;  $info:    #2196F3;

// Primary Brand
$primary-500: #1976D2;  $primary-400: #42A5F5;
$primary-100: #E3F2FD;  $accent-500:  #F9A825;

// KPI Card Gradients
$kpi-blue:   linear-gradient(135deg, #1565C0, #1976D2);
$kpi-green:  linear-gradient(135deg, #1B5E20, #2E7D32);
$kpi-indigo: linear-gradient(135deg, #311B92, #512DA8);
$kpi-amber:  linear-gradient(135deg, #E65100, #F57C00);
$kpi-red:    linear-gradient(135deg, #B71C1C, #C62828);
```

### 1.4 Angular CSS Variables (Dual Theme)

```scss
// styles.scss
body, body.theme-light {
  --bg-app:              #F0F2F5;
  --bg-sidebar:          #FFFFFF;
  --bg-header:           #FFFFFF;
  --bg-card:             #FFFFFF;
  --text-primary:        #1A2332;
  --text-secondary:      #6B7A8D;
  --text-muted:          #9CA3AF;
  --border-color:        #E5E7EB;
  --sidebar-active-bg:   #1976D2;
  --sidebar-active-text: #FFFFFF;
  --sidebar-item-text:   #374151;
  --sidebar-hover:       #F3F4F6;
  --sidebar-section:     #9CA3AF;
  --shadow-card:         0 1px 3px rgba(0,0,0,0.08);
  --shadow-modal:        0 4px 24px rgba(0,0,0,0.15);
  --input-bg:            #FFFFFF;
  --input-border:        #D1D5DB;
  --table-header-bg:     #F9FAFB;
  --table-row-hover:     #F3F4F6;
}

body.theme-dark {
  --bg-app:              #0E1726;
  --bg-sidebar:          #111827;
  --bg-header:           #111827;
  --bg-card:             #1C2A3A;
  --text-primary:        #FFFFFF;
  --text-secondary:      #8899AA;
  --text-muted:          #5A6A7A;
  --border-color:        #1E3048;
  --sidebar-active-bg:   #1976D2;
  --sidebar-active-text: #FFFFFF;
  --sidebar-item-text:   #CBD5E1;
  --sidebar-hover:       rgba(255,255,255,0.05);
  --sidebar-section:     #6B7A8D;
  --shadow-card:         0 2px 8px rgba(0,0,0,0.4);
  --shadow-modal:        0 8px 48px rgba(0,0,0,0.6);
  --input-bg:            #162032;
  --input-border:        #1E3048;
  --table-header-bg:     #162032;
  --table-row-hover:     rgba(255,255,255,0.04);
}
```

### 1.5 Typography & Spacing

```scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
$font-primary: 'Inter', sans-serif;

$text-xs: 12px;  $text-sm: 13px;  $text-base: 14px;
$text-md: 16px;  $text-lg: 18px;  $text-2xl: 24px;  $text-3xl: 30px;

$fw-regular: 400;  $fw-medium: 500;  $fw-semibold: 600;  $fw-bold: 700;

$sidebar-width: 280px;  $sidebar-collapsed: 64px;
$header-height: 64px;  $content-padding: 24px;

$radius-sm: 4px;  $radius-md: 8px;  $radius-lg: 12px;  $radius-full: 9999px;
```

---

## 2. Layout Architecture

### 2.1 Main Layout

```
HEADER (64px, bg: var(--bg-header), border-bottom: 1px solid var(--border-color))
  LEFT:  [Hamburger] [Logo] "POS Management" | [Page Title - dynamic từ route]
  RIGHT: [Moon/Sun] [VIE] [Bell+badge] [Avatar+dropdown]

SIDEBAR (280px, bg: var(--bg-sidebar))  |  CONTENT (flex-1, bg: var(--bg-app))
  Collapsible to 64px                   |  Breadcrumb (trừ /dashboard)
  Menu theo structure Section 0.2       |  Page Header + Actions
                                        |  Content (padding: 24px)
```

### 2.2 Sidebar CSS

```scss
.sidebar {
  width: $sidebar-width;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  height: 100vh;  overflow-y: auto;
  transition: width 0.25s ease;

  &.collapsed { width: $sidebar-collapsed; }
}

.sidebar__section-label {
  font-size: 11px; font-weight: $fw-semibold;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--sidebar-section); padding: 16px 16px 6px;
}

.sidebar__item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px; border-radius: $radius-md;
  margin: 2px 8px; color: var(--sidebar-item-text);
  transition: background 0.15s;

  &:hover { background: var(--sidebar-hover); }
  &.active { background: var(--sidebar-active-bg); color: var(--sidebar-active-text); font-weight: $fw-semibold; }
}

.sidebar__badge {
  margin-left: auto; background: #E53E3E; color: #FFF;
  font-size: 11px; border-radius: $radius-full; padding: 2px 7px;
}
```

### 2.3 Breadcrumb — Bắt Buộc (Trừ Dashboard)

| URL | Breadcrumb |
|---|---|
| /dashboard | (không có) |
| /catalog/device-categories | Quản Lý Danh Mục > Danh mục thiết bị |
| /catalog/device-types | Quản Lý Danh Mục > Loại thiết bị |
| /catalog/device-models | Quản Lý Danh Mục > Model thiết bị |
| /catalog/vendors | Quản Lý Danh Mục > Nhà cung cấp |
| /catalog/mcc | Quản Lý Danh Mục > MCC |
| /organization/business-units | Quản Lý Danh Mục > Đơn vị kinh doanh |
| /organization/warehouses | Quản Lý Danh Mục > Kho |
| /catalog/fee-policies | Quản Lý Danh Mục > Chính sách phí |
| /inventory/purchase-orders | Quản Lý Danh Mục > Purchase Order |
| /inventory/imports/new | Quản Lý Xuất/Nhập Kho > Thông tin Nhập kho |
| /inventory/stock | Quản Lý Xuất/Nhập Kho > Thông tin tồn kho |
| /inventory/exports | Quản Lý Xuất/Nhập Kho > Thông tin xuất kho |
| /inventory/transfers | Quản Lý Xuất/Nhập Kho > Điều chuyển kho |
| /merchant/merchants | Quản Lý Merchant > Danh sách merchant |
| /merchant/merchants/:id | Quản Lý Merchant > Danh sách merchant > Chi tiết |
| /merchant/terminals | Quản Lý Merchant > Quản lý TID |
| /device/search | Quản Lý Thiết Bị > Tra cứu thiết bị |
| /device/:serial | Quản Lý Thiết Bị > Tra cứu thiết bị > {serial} |
| /assignment/create | Quản Lý Assignment > Cấp phát thiết bị |
| /assignment/list | Quản Lý Assignment > Quản lý assignment |
| /assignment/history | Quản Lý Assignment > Lịch sử assignment |
| /approval/inbox | Quy Trình Nghiệp Vụ > Hộp việc cần duyệt |
| /approval/:id | Quy Trình Nghiệp Vụ > Hộp việc cần duyệt > Chi tiết |
| /approval/my-requests | Quy Trình Nghiệp Vụ > Yêu cầu tôi đã tạo |
| /approval/all | Quy Trình Nghiệp Vụ > Tất cả yêu cầu |
| /approval/history | Quy Trình Nghiệp Vụ > Lịch sử phê duyệt |
| /monitoring/pos | Báo Cáo & Hệ Thống > Giám sát hệ thống |
| /monitoring/outbox | Báo Cáo & Hệ Thống > Outbox Monitor |
| /monitoring/audit | Báo Cáo & Hệ Thống > Audit Log |
| /reports | Báo Cáo & Hệ Thống > Báo cáo |
| /admin/users | Quản Trị > Quản lý User |
| /admin/roles | Quản Trị > Phân quyền |

---

## 3. Reusable Components — BUILD TRƯỚC KHI CODE PAGE

### 3.1 StatusBadgeComponent

```typescript
@Component({ selector: 'app-status-badge', standalone: true })
export class StatusBadgeComponent {
  @Input() status!: string;
  @Input() label!: string;
}
```

```scss
.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: $radius-full;
  font-size: 12px; font-weight: $fw-medium;

  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  // Device
  &--instock          { background: rgba(46,125,50,0.15);   color: #4CAF50; }
  &--deployed         { background: rgba(21,101,192,0.15);  color: #42A5F5; }
  &--out_of_warehouse { background: rgba(106,27,154,0.15);  color: #AB47BC; }
  &--returned         { background: rgba(245,124,0,0.15);   color: #FFA726; }
  &--repairing        { background: rgba(230,81,0,0.15);    color: #FF7043; }
  &--disposed         { background: rgba(183,28,28,0.15);   color: #EF5350; }
  // Approval
  &--draft            { background: rgba(117,117,117,0.15); color: #9E9E9E; }
  &--pending_approval { background: rgba(245,124,0,0.15);   color: #FFA726; }
  &--approved         { background: rgba(46,125,50,0.15);   color: #66BB6A; }
  &--rejected         { background: rgba(183,28,28,0.15);   color: #EF5350; }
  &--executing        { background: rgba(21,101,192,0.15);  color: #42A5F5; }
  &--completed        { background: rgba(27,94,32,0.15);    color: #4CAF50; }
  &--cancelled        { background: rgba(117,117,117,0.15); color: #9E9E9E; }
  // Merchant
  &--active           { background: rgba(46,125,50,0.15);   color: #4CAF50; }
  &--inactive         { background: rgba(245,124,0,0.15);   color: #FFA726; }
  &--suspended        { background: rgba(183,28,28,0.15);   color: #EF5350; }
  &--pending          { background: rgba(117,117,117,0.15); color: #9E9E9E; }
}
```

### 3.2 DataTableComponent

```typescript
export interface TableColumn {
  key: string; label: string; sortable?: boolean;
  width?: string; align?: 'left'|'center'|'right';
  type?: 'text'|'badge'|'date'|'number'|'action';
}

@Component({ selector: 'app-data-table', standalone: true })
export class DataTableComponent<T> {
  @Input() columns: TableColumn[] = [];
  @Input() data = signal<T[]>([]);
  @Input() totalItems = signal<number>(0);
  @Input() isLoading = signal<boolean>(false);
  @Input() pageSize = 20;
  @Output() pageChange = new EventEmitter<{page: number; size: number}>();
  @Output() sortChange = new EventEmitter<{column: string; direction: 'asc'|'desc'}>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() actionClick = new EventEmitter<{action: string; row: T}>();
  readonly skeletonRows = Array(5).fill(0);
}
// Template BẮT BUỘC: checkbox "chọn tất cả" | skeleton loading | empty state | pagination
```

### 3.3 ConfirmDialogComponent & ApprovalTimelineComponent

```typescript
// ConfirmDialog
@Component({ selector: 'app-confirm-dialog', standalone: true })
export class ConfirmDialogComponent {
  @Input() title = 'Xác nhận';
  @Input() message = '';
  @Input() confirmText = 'Xác nhận';
  @Input() type: 'danger'|'warning'|'info' = 'danger';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}

// ApprovalTimeline — hiển thị dạng timeline dọc
// Mỗi step: circle icon (check/x/number) + content + action buttons khi pending
```

---

## 4. Chuẩn Layout 2 Khung — BẮT BUỘC Trên MỌI Màn Danh Sách

### 4.1 Cấu Trúc

```
KHUNG TRÊN (Search Zone) — bg: var(--bg-card), padding: 20px, border-radius: 12px
  Input text | Dropdowns | Date range pickers
  Buttons (căn phải): [Tìm kiếm] PRIMARY | [Clear] ghost | [Xuất Excel] outline

  STATUS TABS (chỉ khi màn có workflow):
  [Tất cả (120)] [Chờ Duyệt (8)] [Đã Duyệt (45)] [Từ chối (3)]

KHUNG DƯỚI (List Zone) — bg: var(--bg-card), padding: 20px, border-radius: 12px
  Toolbar: [+ Thêm mới] [Chọn cột]              [Làm mới]
  Table: checkbox | STT | data cols | Actions
  Pagination: "Hiển thị X-Y của Z" | [10][20][50][100] | [< 1 2 3 ... >]
```

### 4.2 Search Zone Rules

```
Dropdown đầu tiên = "Tất cả"
Date: 2 picker (From/To), validate From <= To
Clear: reset ALL + auto search lại
Tìm kiếm: spinner -> load data vào bảng
```

### 4.3 Status Tabs CSS

```scss
.status-tabs { display: flex; gap: 8px; padding: 16px 0 12px; flex-wrap: wrap; }

.status-tab {
  padding: 6px 16px; border-radius: $radius-full;
  font-size: $text-sm; font-weight: $fw-medium;
  cursor: pointer; border: 1px solid transparent;
  color: var(--text-secondary); transition: all 0.2s;

  &.active { background: $primary-500; color: #FFF; }
  .tab-count { font-size: 11px; background: rgba(255,255,255,0.2); border-radius: $radius-full; padding: 1px 6px; }
}
```

**Status Tabs theo module:**

| Module | Tabs |
|---|---|
| Merchant | Tất cả \| Chờ Duyệt \| Đã Duyệt \| Từ chối |
| Purchase Order | Tất cả \| DRAFT \| Submitted \| Approved \| Received \| Closed |
| Xuất Kho | Tất cả \| Chờ duyệt \| Đã duyệt \| Hoàn thành \| Từ chối \| Đã hủy |
| Assignment | Tất cả \| Đang cấp phát \| Đã thu hồi \| Điều chuyển |
| Approval Inbox | Tất cả \| Xuất kho \| Thu hồi \| Điều chuyển \| Thanh lý |
| Device | Tất cả \| Trong kho \| Xuất kho \| Triển khai \| Sửa chữa \| Thanh lý |

### 4.4 List Zone Rules

```
Table:
  - Cột 1: Checkbox (chọn nhiều)
  - Cột 2: STT (từ 1 trên page hiện tại)
  - Data cols...
  - Cột cuối: Hành Động [Xem][Sửa][...dropdown]
  - Header: bg var(--table-header-bg), font-medium 13px
  - Row hover: bg var(--table-row-hover), cell padding 12px 16px
Empty: icon + "Không có dữ liệu. Vui lòng thay đổi điều kiện tìm kiếm."
Loading: 5 skeleton rows (animated shimmer)
Column preference: lưu localStorage theo route key
```

### 4.5 ListPage Angular Template

```typescript
@Component({ selector: 'app-[name]-list-page', standalone: true })
export class NameListPageComponent implements OnInit {
  filterForm = this.fb.group({ keyword: [''], status: [''], ... });
  activeTab    = signal<string>('ALL');
  statusCounts = signal<Record<string, number>>({});
  items        = signal<T[]>([]);
  totalItems   = signal<number>(0);
  isLoading    = signal<boolean>(false);
  currentPage  = signal<number>(1);
  pageSize     = signal<number>(20);

  ngOnInit() { this.loadData(); }
  onSearch(): void { this.currentPage.set(1); this.loadData(); }
  onClear(): void { this.filterForm.reset(); this.activeTab.set('ALL'); this.onSearch(); }
  onExportExcel(): void { /* API export + download */ }
  onTabChange(tab: string): void { this.activeTab.set(tab); this.onSearch(); }
  onPageChange(e: {page: number; size: number}): void {
    this.currentPage.set(e.page); this.pageSize.set(e.size); this.loadData();
  }
}
```

---

## 5. Dashboard — Chi Tiết

### 5.1 Layout (Từ Ảnh Chuẩn)

```
ROW 1 — 5 KPI Cards lớn (gradient, min-height 120px):
  [BLUE: Tổng thiết bị 1,245]   [GREEN: Tồn kho 423]
  [INDIGO: Đang triển khai 756] [AMBER: Đang sửa 42] [RED: Thanh lý 24]

ROW 2 — 3 KPI Cards nhỏ (bg card thường):
  [Merchant Active 238]  [Tổng TID 892]  [Chờ phê duyệt 8]

ROW 3 — 2 Charts (50/50):
  Bar "Nhập/Xuất kho theo tháng" (2 series: blue + green, 12 tháng)
  Donut "Phân bổ thiết bị theo trạng thái" (4 colors)

ROW 4 — 2 sections (50/50):
  Horizontal Bar "Top 5 Kho tồn nhiều nhất"
  Activity Feed "Hoạt động gần đây" (avatar + text + time, 10 items)
```

### 5.2 KPI Card CSS

```scss
.kpi-card {
  padding: 24px; border-radius: $radius-lg; min-height: 120px;
  display: flex; align-items: center; gap: 20px; color: #FFFFFF;

  &__icon { width: 56px; height: 56px; border-radius: $radius-lg; background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; }
  &__label { font-size: $text-sm; opacity: 0.85; margin-bottom: 6px; }
  &__value { font-size: $text-3xl; font-weight: $fw-bold; line-height: 1; }

  &--blue   { background: $kpi-blue; }
  &--green  { background: $kpi-green; }
  &--indigo { background: $kpi-indigo; }
  &--amber  { background: $kpi-amber; }
  &--red    { background: $kpi-red; }
}
```

### 5.3 ApexCharts Config

```typescript
barChartOptions: ApexCharts.ApexOptions = {
  chart: { type: 'bar', height: 280, background: 'transparent', toolbar: { show: false } },
  series: [{ name: 'Nhập kho', data: [] }, { name: 'Xuất kho', data: [] }],
  colors: ['#1976D2', '#4CAF50'],
  xaxis: { categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Okt','Nov','Dic'] },
  dataLabels: { enabled: false },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } }
};

donutChartOptions: ApexCharts.ApexOptions = {
  chart: { type: 'donut', height: 280, background: 'transparent' },
  labels: ['Tổng thiết bị', 'Đang kết hợp', 'Đang sửa chữa', 'Thanh lý'],
  colors: ['#1976D2', '#4CAF50', '#FF9800', '#F44336'],
  legend: { position: 'bottom' },
  plotOptions: { pie: { donut: { size: '65%' } } }
};
```

---

## 6. Danh Sách 38 Màn Hình

### Screen 01 — Login Page
```
URL: /login (full screen, NO sidebar/header)
Background: gradient #0D1B2A to #1E3A5F
Card center: glassmorphism (rgba + blur + border)
Form: [Username] [Password + toggle] [Dang nhap PRIMARY full-width]
Errors: "Sai mat khau" / "Tai khoan bi tam khoa..."
Footer: "He thong Quan ly POS — Danh cho noi bo ngan hang"
```

### Screen 02 — Main Layout (Shell)
```
Components: app-main-layout, app-sidebar, app-header, <router-outlet>
ThemeService: currentTheme signal<'light'|'dark'>, toggle() -> body class + localStorage
Sidebar: isSidebarCollapsed signal, 280px expanded / 64px collapsed (icon+tooltip)
```

### Screen 03 — User Management
```
URL: /admin/users
Filters: Status | Role | Business Unit | Keyword
Columns: STT | Ho ten | Username | Email | Role | BU | Trang thai | Lan dang nhap | Actions
Actions: [Xem] [Sua] [...] -> Khoa/Mo khoa | Dat lai mat khau
Dialog: Ho ten | Username | Email | Mat khau | Role (multi-select) | Business Unit
```

### Screen 04 — Role & Permission Management
```
URL: /admin/roles
Tab 1 Roles: STT | Ten | Mo ta | So user | [Sua]
Tab 2 Permission Matrix:
  Role (rows) x Permission (cols: View/Create/Update/Delete/Approve) x Module
  Checkbox tuong tac, auto-save
  Modules: CATALOG | INVENTORY | MERCHANT | DEVICE | ASSIGNMENT | APPROVAL | ADMIN
```

### Screen 05 — Device Category
```
URL: /catalog/device-categories
Filters: Keyword | Status
Columns: STT | Code | Ten | So loai | Trang thai | Actions
Dialog: Code (UPPERCASE) | Ten | Mo ta
Rule: KHONG deactivate khi con Device Type active
```

### Screen 06 — Device Type
```
URL: /catalog/device-types
Filters: Keyword | Category | Status
Columns: STT | Code | Ten loai | Danh muc | So model | Trang thai | Actions
Dialog: Code | Ten | Danh muc (dropdown) | Mo ta
```

### Screen 07 — Device Model
```
URL: /catalog/device-models
Filters: Keyword | Device Type | Vendor | Status
Columns: STT | Code | Ten model | Loai | Vendor | Thong so | Trang thai | Actions
Dialog: Code | Ten | Loai (dropdown) | Vendor (dropdown) | Specs | Serial Prefix
Rule: KHONG deactivate khi co Device INSTOCK/DEPLOYED/REPAIRING
```

### Screen 08 — Vendor
```
URL: /catalog/vendors
Columns: STT | Code | Ten | Email | SDT | So model | Trang thai | Actions
Dialog: Code | Ten | Email (RFC) | SDT | Website | Ghi chu
```

### Screen 09 — MCC
```
URL: /catalog/mcc
Columns: STT | MCC Code | Ten nganh | Danh muc | So Merchant | Trang thai | Actions
Dialog: MCC Code (4 digits) | Ten nganh | Danh muc | Mo ta
```

### Screen 10 — Fee Policy
```
URL: /catalog/fee-policies
Columns: STT | Code | Ten | Ty le (%) | Phi co dinh | Ngay hieu luc | Trang thai | Actions
Dialog: Code | Ten | Ty le % | Phi co dinh | Min/Max | Ngay hieu luc | Mo ta
```

### Screen 11 — Business Unit
```
URL: /organization/business-units
Columns: STT | Code | Ten | Khu vuc | So kho | So merchant | So user | Trang thai | Actions
Dialog: Code | Ten | Khu vuc | Mo ta | Manager (dropdown user)
```

### Screen 12 — Warehouse
```
URL: /organization/warehouses
Filters: Keyword | Business Unit | Status
Columns: STT | Code | Ten | Don vi KD | Dia chi | Ton kho | Trang thai | Actions
Dialog: Code | Ten | Business Unit | Dia chi | Quan ly kho (user)
```

### Screen 13 — Purchase Order List
```
URL: /inventory/purchase-orders
Filters: Keyword | Vendor | Kho | Status | Date range
Status Tabs: Tat ca | DRAFT | Submitted | Approved | Received | Closed
Columns: STT | So PO | Vendor | Kho nhan | SL | SL nhan | Trang thai | Ngay tao | Actions
Actions: [Xem] [Sua-chiDRAFT] [...] -> Submit | Approve | Nhap kho | Dong PO
```

### Screen 14 — Purchase Order Create & Detail
```
URL: /inventory/purchase-orders/new | /:id
CREATE (3 steps):
  Step 1: Vendor (required) | Kho nhan (required) | Ghi chu
  Step 2: Dynamic table: Model | Vendor | SL du kien | Don gia | [Xoa]
          [+ Them dong] DISABLED neu row hien tai chua valid
  Step 3: Summary + checkbox xac nhan + [Gui yeu cau]
DETAIL:
  Header + Status + Actions theo status
  Tab Thong tin | Tab Items | Tab Timeline
```

### Screen 15 — Nhap Kho
```
URL: /inventory/imports/new
Step 1: Chon PO (autocomplete)
Step 2: Nhap serial (thu cong hoac paste bulk)
        Validate real-time: OK(xanh) / Error(do)
Step 3: Summary SL hop le / SL loi
        [Xac nhan] chi enabled khi SL loi = 0
```

### Screen 16 — Ton Kho
```
URL: /inventory/stock
KPI Cards: Tong ton | Ha Noi | HCM | Da Nang | Khac
Columns: STT | Kho | Model | Vendor | INSTOCK | DEPLOYED | REPAIRING | DISPOSED | Tong
Click row -> Modal danh sach serial + export
```

### Screen 17 — Xuat Kho
```
URL: /inventory/exports (list) | /new (create)
CREATE: Kho nguon | Muc dich | Don vi nhan | Multi-select thiet bi INSTOCK
        [Gui yeu cau] -> Approval Request
LIST: Filters + Status Tabs + Table
```

### Screen 18 — Dieu Chuyen Kho
```
URL: /inventory/transfers (list) | /new (create)
CREATE: Kho nguon -> Kho dich (khac nhau) | Danh sach serial | Ly do
LIST: Filters + Status Tabs + Table
```

### Screen 19 — Danh Sach Merchant (Chuan tu anh)
```
URL: /merchant/merchants
Search Zone (2 rows, tu anh chuan):
  Row 1: [Nhap ma, ten, so thue...] | [Trang thai] | [Loai merchant] | [Ngay tao tu] [den]
  Row 2: [Khu vuc] | [Don vi kinh doanh] | [Nguoi phu trach]
  Buttons: [Tim kiem] [Clear] [Xuat Excel]
Status Tabs: Tat ca (120) | Cho Duyet (8) | Da Duyet (45) | Tu choi (3)
Toolbar: [+ Them moi] [Chon cot]                          [Lam moi]
Columns: STT | Ma merchant | Ten merchant | Loai | Khu vuc | Don vi KD | Trang thai | Ngay tao | Actions
Pagination: Hien thi 1-20 cua 120 | [10][20][50][100] | [< 1 2 3 ... 6 >]
```

### Screen 20 — Chi Tiet Merchant (4 Tabs)
```
URL: /merchant/merchants/:id
Header: MID | Status | [Sua] [Kich hoat/Dinh chi]
Tab 1 Thong tin: grid 2 cot all fields
Tab 2 TID: [+ Them TID] + Table TID | Status | Thiet bi | Actions
Tab 3 Lich su trang thai: Timeline (ngay | cu->moi | nguoi | ly do)
Tab 4 Chinh sach phi: [+ Gan chinh sach] + Table fee assignments
```

### Screen 21 — Quan Ly TID
```
URL: /merchant/terminals
Filters: TID | Merchant | Status
Columns: STT | TID | Merchant | MID | Trang thai | Thiet bi | Ngay hieu luc | Actions
```

### Screen 22 — Tra Cuu Thiet Bi
```
URL: /device/search
Prominent: [Tim theo Serial Number - full width]
Advanced filters (collapsible): Model | Vendor | Status (multi) | Warehouse | Merchant
Status Tabs: Tat ca | Trong kho | Xuat kho | Dang trien khai | Sua chua | Thanh ly
Columns: STT | Serial | Model | Vendor | Kho | Trang thai | Merchant | TID | Bao hanh | Actions
Row click -> /device/:serial  |  Toolbar: [Xuat CSV]
```

### Screen 23 — Chi Tiet Thiet Bi (8 Tabs)
```
URL: /device/:serial
Header: Serial [Copy] | [Status Badge lon] | Model | Vendor | Kho
Actions theo status:
  INSTOCK -> [Xuat kho] [Thanh ly]
  DEPLOYED -> [Thu hoi]
  RETURNED -> [Nhap lai kho] [Tao don sua chua]
  REPAIRING -> [Nghiem thu] [De nghi thanh ly]

Tab 1 Thong tin chung: grid 2 cot (Serial|Model|Vendor|Danh muc|Kho|Ngay nhap|Bao hanh|Firmware|Ghi chu)
Tab 2 Trang thai: Status badge + FSM Diagram visual + allowed transitions buttons
Tab 3 Merchant: Card (neu DEPLOYED) hoac "Chua cap phat"
Tab 4 Vong doi Timeline: moc su kien tung trang thai
Tab 5 Assignment History: table (Merchant|MID|TID|Ngay cap|Ngay thu|Nguoi|Ghi chu)
Tab 6 Sua chua: table (So don|Ngay|Mo ta loi|Don vi|Trang thai|Ket qua|Ngay xong)
Tab 7 Lich su kho: table (Thoi gian|Loai|Kho tu|Kho den|Phieu|Nguoi)
Tab 8 Audit Log: table (Thoi gian|User|Hanh dong|Chi tiet)
```

### Screen 24 — Quan Ly Don Sua Chua
```
URL: /repairs
Status Tabs: Tat ca | Dang sua | Hoan thanh | That bai
Columns: STT | So don | Serial | Model | Mo ta loi | Don vi | Trang thai | Ngay tao | Actions
Form Tao: Serial(readonly) | Mo ta loi | Don vi | Chi phi | Ghi chu
Form Nghiem Thu: Ket qua (Dat/Khong dat) | Mo ta | Ngay | Chi phi thuc te
  Neu Khong dat: [De nghi thanh ly] -> tao phieu thanh ly
```

### Screen 25 — Cap Phat Thiet Bi
```
URL: /assignment/create
Step 1: Chon thiet bi (search autocomplete INSTOCK or table chon)
Step 2: Chon Merchant (autocomplete) + TID (dropdown filter theo Merchant) + Ghi chu
Step 3: Summary + checkbox "Toi xac nhan..." + [Xac nhan cap phat] (loading)
Success: ASG ID + info + [Xem Assignment] [Cap phat tiep]
```

### Screen 26 — Danh Sach Assignment
```
URL: /assignment/list
Status Tabs: Tat ca | Dang cap phat | Da thu hoi | Dieu chuyen
Columns: STT | Ma | Serial | Model | Merchant | MID | TID | Ngay cap | Ngay thu | Nguoi | Status | Actions
Quick: [Thu hoi] chi ACTIVE
```

### Screen 27 — Lich Su Assignment
```
URL: /assignment/history
Columns: STT | Ma ASG | Serial | Merchant | TID | Loai | Ngay | Nguoi | Ghi chu
Toggle Table/Timeline view
```

### Screen 28 — Hop Viec Can Duyet (Inbox)
```
URL: /approval/inbox
Stats: [Cho duyet: 8] [Da duyet hom nay: 12] [Bi tu choi: 2]
Tabs: Tat ca | Xuat kho | Thu hoi | Dieu chuyen | Thanh ly
Items (card list):
  [Icon type]  Ten phieu  [Status badge]
  Mo ta ngan
  Nguoi tao + Thoi gian
  [Xem chi tiet]  [Phe duyet V dropdown -> Duyet|Tu choi|Yeu cau bo sung]
```

### Screen 29 — Chi Tiet Phieu Phe Duyet
```
URL: /approval/:id
Header: So phieu | Status | Loai
Section 1 Thong tin phieu (theo loai: Xuat kho/Thu hoi/Dieu chuyen/Thanh ly)
Section 2 Approval Timeline component
Section 3 Form hanh dong (khi pending + co quyen):
  Textarea y kien | [Phe duyet][Tu choi][Yeu cau bo sung] - all loading state
Section 4 Lich su: Thoi gian | Nguoi | Hanh dong | Y kien
```

### Screen 30 — Yeu Cau Toi Da Tao
```
URL: /approval/my-requests
Status Tabs: Tat ca | Cho duyet | Da duyet | Tu choi | Da huy
Columns: STT | So phieu | Loai | Tom tat | Trang thai | Ngay tao | Cap duyet | Actions [Xem][Huy-chiDRAFT]
```

### Screen 31 — Tat Ca Yeu Cau (Admin)
```
URL: /approval/all
Nhu Screen 30 + filter Nguoi tao | Business Unit + col Nguoi tao | Nguoi duyet
```

### Screen 32 — Lich Su Phe Duyet
```
URL: /approval/history
Filters: Loai | Ket qua | Date range | Nguoi duyet
Columns: STT | So phieu | Loai | Ket qua | Nguoi duyet | Ngay duyet | Y kien
```

### Screen 33 — Outbox Events Monitor
```
URL: /monitoring/outbox
KPI: [PENDING: X] [SENT: Y] [FAILED: Z]
[Toggle Kafka DOWN/UP] - chaos button (red warning)
Columns: STT | Event ID | Loai | Aggregate ID | Trang thai | Retry | Thoi gian | [Retry]
```

### Screen 34 — Main Dashboard
```
URL: /dashboard (xem Section 5)
API: GET /api/v1/dashboard/summary
```

### Screen 35 — Giam Sat He Thong POS
```
URL: /monitoring/pos
Filters: Business Unit | Merchant | Model
Auto-refresh 30s (countdown + toggle tat)
Search serial real-time
Card grid (4-6 cols): Serial | Model | Merchant | TID | Online/Offline
Online -> green border; Offline -> red border
```

### Screen 36 — Audit Log
```
URL: /monitoring/audit
Filters: User | Action type | Resource type | Date range
Columns: STT | Thoi gian | User | Hanh dong | Resource | IP | Actions
Row click -> Modal JSON diff (old/new side-by-side, green add / red remove)
[Xuat CSV]
```

### Screen 37 — Bao Cao
```
URL: /reports
Left sidebar: chon loai bao cao (4 loai)
Date range (max 1 nam)
[Xem bao cao] -> Chart + Table
[Xuat PDF] [Xuat Excel]
```

### Screen 38 — Notification Center
```
URL: /notifications
Header "Thong bao" + [Danh dau tat ca da doc]
Tabs: Tat ca | Chua doc | Da doc
Items: [dot xanh] [Icon] Tieu de / Noi dung / Time
Click: APPROVAL_REQUIRED->/approval/inbox | APPROVAL_RESULT->/approval/my-requests | SYSTEM->/dashboard
Load more 20/trang
Empty: "Ban da doc het thong bao"
```

---

## 7. Angular Naming Convention

| Loai | File | Selector |
|---|---|---|
| Page | `merchant-list.page.ts` | `app-merchant-list-page` |
| Feature Component | `approval-timeline.component.ts` | `app-approval-timeline` |
| Shared | `status-badge.component.ts` | `app-status-badge` |
| Dialog | `assign-device.dialog.ts` | `app-assign-device-dialog` |
| API Service | `merchant-api.service.ts` | - |
| Pipe | `device-status.pipe.ts` | `deviceStatus` |

**3 file bat buoc moi component:**
```
merchant-list/
 merchant-list.page.ts    (logic)
 merchant-list.page.html  (template)
 merchant-list.page.scss  (styles - NO inline)
```

---

## 8. Validation Rules

```
Real-time: loi hien sau blur
Submit/Next: LUON disabled khi form invalid
Dynamic list: [Them dong] disabled khi row hien tai chua valid
Error: mau #F44336, 12px, duoi field
```

| Truong | Validate |
|---|---|
| TID | 8 ky tu so |
| Email | RFC format |
| SDT | 10-11 so, bat dau 0 |
| Code | UPPERCASE, no space/dau |
| Serial | theo format model |

---

## 9. Multi-Step Wizard

```
Step indicator (horizontal, top):
  [1 completed] --- [2 active] --- [3 pending]

Navigation:
  [Quay Lai] ghost (KHONG xoa data)  <->  [Tiep Theo] primary (DISABLED neu invalid)
  Buoc cuoi: [Quay Lai]  <->  [Gui Yeu Cau] (loading)

After success: Toast + navigate
After error: Toast + giu form nguyen
```

---

*Cap nhat: 2026-10-03. Calibrated tu anh chuan UI Light + Dark Mode.*
