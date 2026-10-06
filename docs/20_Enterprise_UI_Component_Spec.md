# POS Management System — Enterprise UI Component Specifications (docs/20_Enterprise_UI_Component_Spec.md)

> **Hướng Dẫn Kỹ Thuật Viết Code Shared UI Components Chuẩn VPBank Enterprise**  
> **Áp dụng cho AI Antigravity Agent & Developers**

---

## 🛠️ 1. NÂNG CẤP COMPONENT: `pos-select` (Clearable Select Box)

### 1.1. Cấu hình mặc định
- Thuộc tính `@Input() clearable = true` mặc định.
- Khi người dùng chọn một lựa chọn (Value khác `null`/`undefined`/`''`), một icon nút xóa (`✖`) xuất hiện ở bên phải ô chọn, trước icon mũi tên sổ xuống.
- Nhấp vào nút `✖` sẽ reset `selectedValue` về `null`, phát sự kiện `(ngModelChange)` và `(selectionChange)`.

### 1.2. Ví dụ cách gọi trong Template (Khung 2 dòng 8 items)
```html
<div class="row g-3">
  <!-- Dòng 1 (4 items) -->
  <div class="col-12 col-sm-6 col-lg-3">
    <pos-input label="Serial / IMEI" placeholder="Nhập serial hoặc IMEI" [(ngModel)]="serialFilter" />
  </div>
  <div class="col-12 col-sm-6 col-lg-3">
    <pos-select label="Danh mục thiết bị" [options]="categoryOptions" [(ngModel)]="categoryFilter" [clearable]="true" />
  </div>
  <div class="col-12 col-sm-6 col-lg-3">
    <pos-select label="Loại thiết bị" [options]="typeOptions" [(ngModel)]="typeFilter" [clearable]="true" />
  </div>
  <div class="col-12 col-sm-6 col-lg-3">
    <pos-select label="Model thiết bị" [options]="modelOptions" [(ngModel)]="modelFilter" [clearable]="true" />
  </div>

  <!-- Dòng 2 (4 items) -->
  <div class="col-12 col-sm-6 col-lg-3">
    <pos-select label="Trạng thái" [options]="statusOptions" [(ngModel)]="statusFilter" [clearable]="true" />
  </div>
  <div class="col-12 col-sm-6 col-lg-3">
    <pos-select label="Kho hiện tại" [options]="warehouseOptions" [(ngModel)]="warehouseFilter" [clearable]="true" />
  </div>
  <div class="col-12 col-sm-6 col-lg-3">
    <pos-select label="Tình trạng thiết bị" [options]="conditionOptions" [(ngModel)]="conditionFilter" [clearable]="true" />
  </div>
  <div class="col-12 col-sm-6 col-lg-3">
    <pos-input label="Mã Purchase Order" placeholder="Nhập mã Purchase Order" [(ngModel)]="poFilter" />
  </div>
</div>
```

---

## 📊 2. TẠO MỚI COMPONENT: `pos-status-bar` (Thẻ Thống Kê Số Lượng Theo Trạng Thái)

### 2.1. TypeScript Definition & Props
```typescript
export interface StatusCardItem {
  id: string;               // Mã trạng thái (vd: 'TOTAL', 'IN_STOCK', 'EXPORTED')
  label: string;            // Tên hiển thị (vd: 'Trong kho', 'Đã xuất kho')
  count: number;            // Số lượng thiết bị
  variant?: 'slate' | 'emerald' | 'blue' | 'cyan' | 'amber' | 'violet' | 'yellow' | 'rose';
  icon?: string;            // Class icon Bootstrap (vd: 'bi-inbox-fill')
}

@Component({
  selector: 'pos-status-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class PosStatusBarComponent {
  @Input() items: StatusCardItem[] = [];
  @Input() selectedStatus = 'TOTAL';
  @Output() statusSelect = new EventEmitter<string>();
}
```

---

## 📋 3. NÂNG CẤP COMPONENT: `pos-table` (Nút Hiển Thị Cột "8 items selected")

### 3.1. Nút Ẩn/Hiển Thị Cột chính là Nút hiển thị nhãn "8 items selected" (hoặc "8 cột đang được chọn")
- Thêm thuộc tính `@Input() enableColumnSelector = true`.
- Góc trên bên phải bảng dữ liệu hiển thị một nút dropdown nhỏ với nội dung:
  `<i class="bi bi-eye"></i> 8 items selected <i class="bi bi-chevron-down"></i>`
- Khi click vào nút này, mở popover chứa danh sách tất cả các cột kèm checkbox.
- Khi bỏ chọn/tích chọn checkbox, bảng tự động ẩn/hiện cột tương ứng và nhãn button cập nhật động (vd: `8 items selected` -> `7 items selected`).

```html
<div class="table-toolbar d-flex justify-content-between align-items-center mb-2">
  <div class="table-title font-semibold text-base">{{ tableTitle }}</div>
  
  @if (enableColumnSelector) {
    <div class="column-selector-wrap position-relative">
      <button class="column-selector-btn shadow-sm" (click)="toggleSelectorOpen()">
        <i class="bi bi-eye text-primary me-1"></i>
        <span>{{ visibleColumns().length }} items selected</span>
        <i class="bi bi-chevron-down ms-1"></i>
      </button>
      
      @if (isSelectorOpen()) {
        <div class="column-selector-dropdown shadow-lg">
          @for (col of columns; track col.field) {
            <label class="column-checkbox-item">
              <input
                type="checkbox"
                [checked]="!hiddenFields().has(col.field)"
                (change)="toggleColumn(col.field)"
              />
              <span>{{ col.header }}</span>
            </label>
          }
        </div>
      }
    </div>
  }
</div>
```

---

## 🎯 4. QUY TẮC ICON ACTION & TOOLTIP TRÊN CỘT THAO TÁC

Cột `Thao tác` trên bảng sử dụng icon nút tròn (Circular Icon Action Button) với tooltip tiếng Việt khi hover chuột:
```html
<ng-template #cellTemplate let-row let-col="column">
  @if (col.field === 'actions') {
    <div class="d-flex justify-content-center">
      <button
        type="button"
        class="circle-icon-btn shadow-sm"
        title="Xem chi tiết thiết bị"
        (click)="onViewDetail(row)"
      >
        <i class="bi bi-eye"></i>
      </button>
    </div>
  }
</ng-template>
```
