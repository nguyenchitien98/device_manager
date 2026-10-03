---
name: pos-clean-code
description: Tiêu chuẩn Clean Code, Angular 22 Signals, OnPush Change Detection, và UI/UX Standard cho hệ thống POS Management System.
---

# POS Clean Code & Architecture Standards

Skill này quy định các tiêu chuẩn viết code sạch (Clean Code), tối ưu hiệu năng và kiến trúc Angular cho POS Management System.

---

## 1. ANGULAR 22 BEST PRACTICES

### Change Detection
- Mọi component **BẮT BUỘC** khai báo `changeDetection: ChangeDetectionStrategy.OnPush`.
- Không sử dụng default change detection để tránh re-render thừa.

### State Management với Signals
- Ưu tiên dùng Angular Signals cho local & feature state:
  ```typescript
  // State variables
  readonly merchants = signal<MerchantDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly keyword = signal<string>('');

  // Computed state
  readonly filteredMerchants = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    if (!kw) return this.merchants();
    return this.merchants().filter(m => m.name.toLowerCase().includes(kw));
  });
  ```

### Control Flow Syntax
- Sử dụng cú pháp Angular control flow mới (`@if`, `@for`, `@switch`) thay vì `*ngIf`, `*ngFor`, `*ngSwitch`.
- Mọi `@for` phải chỉ định `track` (ví dụ `track item.id` hoặc `track $index`).

### TypeScript Strict Typing
- KHÔNG BAO GIỜ dùng `any`. Định nghĩa Interface/Type rõ ràng:
  ```typescript
  export interface MerchantDto {
    id: string;
    code: string;
    name: string;
    email: string;
    phone: string;
    status: 'ACTIVE' | 'LOCKED' | 'PENDING';
    createdAt: string;
  }
  ```

---

## 2. SHARING & REUSABILITY

### Shared Components First
- Trước khi thêm HTML element vào component, kiểm tra xem có component dùng chung trong `@shared` không:
  - `<pos-button>`
  - `<pos-input>`
  - `<pos-select>`
  - `<pos-badge>`
  - `<pos-modal>`
  - `<pos-table>`
  - `<pos-pagination>`
  - `<pos-dropdown>`
  - `<pos-confirm-dialog>`
  - `<pos-skeleton>`
  - `<app-empty-state>`

### Shared Styles
- Sử dụng CSS Variables được định nghĩa tại `styles.scss`:
  - `var(--bg-app)`
  - `var(--bg-card)`
  - `var(--text-color)`
  - `var(--text-secondary)`
  - `var(--border-color)`
  - `var(--input-border)`
- Các trang dạng danh sách (List Page) phải import và dùng lớp CSS từ `src/app/shared/styles/list-page.shared.scss`.

---

## 3. AUTOMATION TESTING READY

- Mọi nút bấm, ô nhập liệu, dropdown chọn bắt buộc phải có thuộc tính ID:
  - `btnId="btn-search"`
  - `inputId="inp-merchant-name"`
  - `selectId="sel-merchant-status"`
- Giúp Cypress / Playwright E2E automation tests dễ dàng chọn đúng element mà không bị gãy khi thay đổi giao diện.
