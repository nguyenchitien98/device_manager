---
name: pos-shared-components
description: Dướng dẫn bắt buộc về cách sử dụng thư viện UI dùng chung POS Management (PosButton, PosInput, PosSelect, PosBadge, PosModal, PosTable, PosPagination, PosDropdown, PosConfirmDialog, PosSkeleton). Tránh lặp code và tuân thủ Clean Code standards.
---

# POS Shared Components — Guidance & Standards

Skill này hướng dẫn chi tiết cách các AI Agent và Lập trình viên phải sử dụng **POS Shared UI Components Library** trong toàn bộ dự án POS Management System.

---

## Danh Sách Components & Hướng Dẫn Sử Dụng

### 1. `PosButtonComponent` (`<pos-button>`)
Nút bấm chuẩn hệ thống với loading spinner, disabled state, variants và sizes.

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning'` (default: `'secondary'`)
- `size`: `'xs' | 'sm' | 'md' | 'lg'` (default: `'md'`)
- `loading`: `boolean`
- `disabled`: `boolean`
- `btnId`: `string` (id cho test)
- `clicked`: `EventEmitter<MouseEvent>`

**Ví dụ:**
```html
<pos-button variant="primary" size="md" [loading]="saving()" btnId="btn-save" (clicked)="saveMerchant()">
  💾 Lưu thông tin
</pos-button>
```

---

### 2. `PosInputComponent` (`<pos-input>`)
Input, Textarea, Search box chuẩn hệ thống tích hợp `ControlValueAccessor` (dùng ngModel hoặc ReactiveForms).

**Props:**
- `label`: `string`
- `inputId`: `string` (BẮT BUỘC cho test)
- `placeholder`: `string`
- `type`: `'text' | 'email' | 'password' | 'number' | 'search' | 'textarea' | 'date'`
- `required`: `boolean`
- `clearable`: `boolean`
- `error`: `string` (thÔNG báo lỗi)
- `hint`: `string` (gợi ý)
- `enterPressed`: `EventEmitter<KeyboardEvent>`

**Ví dụ:**
```html
<pos-input
  label="Mã Merchant"
  inputId="inp-code"
  placeholder="Nhập mã..."
  [required]="true"
  [(ngModel)]="merchantCode"
  [error]="formErrors.code"
/>

<pos-input
  type="search"
  inputId="inp-search"
  placeholder="Tìm theo tên, email..."
  [(ngModel)]="searchKeyword"
  (enterPressed)="doSearch()"
/>
```

---

### 3. `PosSelectComponent` (`<pos-select>`)
Dropdown Select chuyên nghiệp có tìm kiếm, clear button, badge & icon support, tích hợp ControlValueAccessor.

**Props:**
- `label`: `string`
- `selectId`: `string`
- `options`: `SelectOption[]` (`{ label, value, icon?, badge?, disabled? }`)
- `searchable`: `boolean`
- `clearable`: `boolean`
- `placeholder`: `string`
- `error`: `string`

**Ví dụ:**
```typescript
statusOptions: SelectOption[] = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Hoạt động', value: 'ACTIVE', badge: 'Active' },
  { label: 'Tạm khóa', value: 'LOCKED', badge: 'Locked' }
];
```
```html
<pos-select
  label="Trạng thái"
  selectId="sel-status"
  [options]="statusOptions"
  [searchable]="true"
  [(ngModel)]="selectedStatus"
/>
```

---

### 4. `PosBadgeComponent` (`<pos-badge>`)
Nhãn trạng thái hiển thị màu sắc đồng bộ Design Tokens.

**Props:**
- `variant`: `'primary' | 'success' | 'danger' | 'warning' | 'info' | 'gray' | 'purple'`
- `size`: `'sm' | 'md' | 'lg'`
- `dot`: `boolean`
- `pill`: `boolean`

**Ví dụ:**
```html
<pos-badge variant="success" [dot]="true">Đang hoạt động</pos-badge>
<pos-badge variant="danger" size="sm">Đã hủy</pos-badge>
```

---

### 5. `PosModalComponent` (`<pos-modal>`)
Hộp thoại Modal overlay animation mượt mà, hỗ trợ backdrop click và header icons.

**Props:**
- `isOpen`: `boolean`
- `title`: `string`
- `subtitle`: `string`
- `size`: `'sm' | 'md' | 'lg' | 'xl' | 'full'`
- `icon`: `string`
- `closed`: `EventEmitter<void>`

**Slot layout:**
- Content chính nằm ở `<ng-content>`
- Nút bấm action nằm ở `<div modal-footer>`

**Ví dụ:**
```html
<pos-modal
  [isOpen]="showCreateModal()"
  title="Tạo Cửa Hàng Mới"
  subtitle="Điền thông tin cửa hàng chi nhánh"
  size="lg"
  (closed)="showCreateModal.set(false)"
>
  <form class="form-grid">
    <pos-input label="Tên cửa hàng" inputId="store-name" [(ngModel)]="storeForm.name" name="name" />
  </form>

  <div modal-footer>
    <pos-button variant="ghost" (clicked)="showCreateModal.set(false)">Hủy</pos-button>
    <pos-button variant="primary" (clicked)="submitStore()">Tạo mới</pos-button>
  </div>
</pos-modal>
```

---

### 6. `PosTableComponent` (`<pos-table>`)
Bảng dữ liệu đa năng tự động tích hợp Loading Skeleton & Empty State.

**Props:**
- `columns`: `TableColumn[]` (`{ field, header, width?, sortable?, align? }`)
- `data`: `T[]`
- `loading`: `boolean`
- `emptyTitle`: `string`
- `sortField`: `string`
- `sortOrder`: `'asc' | 'desc'`
- `sortChange`: `EventEmitter`

**Ví dụ:**
```html
<pos-table
  [columns]="columns"
  [data]="merchants()"
  [loading]="loading()"
  (sortChange)="onSort($event)"
>
  <ng-template #cellTemplate let-row let-col="column">
    @if (col.field === 'status') {
      <pos-badge [variant]="row.status === 'ACTIVE' ? 'success' : 'danger'">
        {{ row.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa' }}
      </pos-badge>
    } @else if (col.field === 'actions') {
      <pos-dropdown [items]="actionItems" (itemClick)="handleRowAction(row, $event)" />
    } @else {
      {{ row[col.field] }}
    }
  </ng-template>
</pos-table>
```

---

### 7. `PosPaginationComponent` (`<pos-pagination>`)
Bộ phân trang dữ liệu dùng chung.

**Props:**
- `totalItems`: `number`
- `pageSize`: `number`
- `currentPage`: `number`
- `pageSizeOptions`: `number[]`
- `pageChange`: `EventEmitter<number>`
- `pageSizeChange`: `EventEmitter<number>`

---

### 8. `PosDropdownComponent` (`<pos-dropdown>`)
Context menu (...) cho các thao tác trên dòng bảng hoặc header.

**Props:**
- `items`: `DropdownItem[]` (`{ id, label, icon?, danger?, disabled?, divider? }`)
- `align`: `'left' | 'right'`
- `itemClick`: `EventEmitter<DropdownItem>`

---

### 9. `PosConfirmDialogComponent` (`<pos-confirm-dialog>`)
Popup xác nhận các hành động nguy hiểm (Xóa, Ngừng hoạt động).

**Props:**
- `isOpen`: `boolean`
- `title`: `string`
- `message`: `string`
- `type`: `'danger' | 'warning' | 'info'`
- `confirmText`: `string`
- `cancelText`: `string`
- `loading`: `boolean`
- `confirm`: `EventEmitter<void>`
- `cancel`: `EventEmitter<void>`

---

## QUY TẮC VÀNG KHI VIẾT MÀN HÌNH MỚI
1. **LUÔN Import từ `@shared`** (barrel `src/app/shared/index.ts`).
2. **KHÔNG TỰ VIẾT LẠI** bất kỳ `<button>`, `<input>`, `<select>`, `<table>` thô nào trong HTML template.
3. **LUÔN DÙNG `ChangeDetectionStrategy.OnPush`** và Angular Signals trong ts file.
