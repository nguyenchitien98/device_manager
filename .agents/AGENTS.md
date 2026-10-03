# POS Management Project — AI Coding Rules & Constraints

> **QUY TẮC BẮT BUỘC DÀNH CHO TẤT CẢ AI AGENTS & LẬP TRÌNH VIÊN**
> Mọi thay đổi code trong dự án POS Management phải tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

## 1. TÁI SỬ DỤNG COMMON SHARED COMPONENTS (BẮT BUỘC 100%)

❌ **TUYỆT ĐỐI KHÔNG** tự viết lại các HTML tags thô hoặc CSS tùy biến cho Nút, Input, Select, Badge, Table, Pagination, Dropdown, Modal, Confirm Dialog... khi đã có Shared Component tương ứng.

| Thành phần UI | NGUYÊN TẮC BẮT BUỘC | KHÔNG ĐƯỢC LÀM ❌ |
| :--- | :--- | :--- |
| **Nút bấm** | Dùng `<pos-button variant="..." size="...">` | KHÔNG viết `<button class="btn...">` |
| **Input / Textarea / Search** | Dùng `<pos-input [(ngModel)]="..." label="...">` | KHÔNG viết `<input class="form-control">` hay `<textarea>` |
| **Select Dropdown** | Dùng `<pos-select [options]="..." [(ngModel)]="...">` | KHÔNG viết `<select>` thô |
| **Huy hiệu / Trạng thái** | Dùng `<pos-badge variant="success|danger|warning|primary">` | KHÔNG viết `<span class="badge">` |
| **Bảng dữ liệu** | Dùng `<pos-table [columns]="..." [data]="...">` | KHÔNG tự dựng `<table>` lặp lại |
| **Phân trang** | Dùng `<pos-pagination [totalItems]="..." [pageSize]="...">` | KHÔNG tự viết pagination controls |
| **Modal / Pop-up** | Dùng `<pos-modal [isOpen]="..." title="...">` | KHÔNG tự dựng backdrop overlay |
| **Context Menu** | Dùng `<pos-dropdown [items]="actions">` | KHÔNG tự toggle dropdown menu thủ công |
| **Hộp thoại xác nhận** | Dùng `<pos-confirm-dialog [isOpen]="..." type="danger">` | KHÔNG tự viết modal confirm lại từ đầu |
| **Loading Skeleton** | Dùng `<pos-skeleton type="table-row|line|card">` | KHÔNG tự làm shimmer animation lặp lại |
| **Trạng thái rỗng** | Dùng `<app-empty-state type="search|warning">` | KHÔNG tự dựng empty state layout |

---

## 2. QUY TẮC IMPORT BÀN TAY VÀ THUỘC TÍNH TEST

1. **Import từ Shared Barrel:** Tất cả shared components phải được import trực tiếp từ `@shared` hoặc `src/app/shared/index.ts`:
   ```typescript
   import {
     PosButtonComponent, PosInputComponent, PosSelectComponent,
     PosBadgeComponent, PosTableComponent, PosModalComponent
   } from '@shared'; // hoặc '../../shared'
   ```
2. **Bắt buộc ID cho Automation Test:** Mỗi component khởi tạo trên HTML bắt buộc phải truyền `btnId`, `inputId`, `selectId` để Cypress/Playwright automation test nhận diện.

---

## 3. CHUẨN ANGULAR & STATE MANAGEMENT

- **Standalone Components:** 100% components là standalone components.
- **Change Detection:** LUÔN DÙNG `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Signals First:** Sử dụng Angular Signals (`signal()`, `computed()`, `input()`, `output()`) cho reactive state.
- **Strict Typing:** TUYỆT ĐỐI KHÔNG DÙNG type `any`. Định nghĩa Interface/Type rõ ràng cho mọi DTO và Model.
- **ControlValueAccessor:** Form controls tùy chỉnh phải triển khai `ControlValueAccessor` và kết nối với ReactiveForms/ngModel.

---

## 4. DESIGN SYSTEM & DARK MODE

- Sử dụng CSS Variables được định nghĩa tại `styles.scss` (`:root` và `.theme-dark`).
- **KHÔNG hardcode màu hex/rgb** trong CSS của component trừ khi nằm trong token design system.
- Kiểm tra tính tương thích tức thì (instant switch) của Dark Mode & Light Mode. Không thêm `transition: background` làm chậm giật giao diện.

---

## 5. BÀN GIAO & VERIFICATION

Trước khi kết thúc bất kỳ lượt làm việc nào:
1. Chạy `npm run build` để đảm bảo 0 lỗi TypeScript & SCSS.
2. Không nuốt exception hay dùng fallback rỗng để che giấu lỗi.
