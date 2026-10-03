# POS Management System — Master Guide: UI Actions & REST API Mapping (docs/15_UI_Action_API_Guide.md)

> **KIM CHỈ NAM BẮT BUỘC DÀNH CHO ANTIGRAVITY AI & LẬP TRÌNH VIÊN**
> Xem bản đầy đủ chi tiết tại [ANTIGRAVITY_UI_ACTION_GUIDE.md](../../ANTIGRAVITY_UI_ACTION_GUIDE.md).
> **QUY TẮC VÀNG:** KHÔNG MỘT NÚT BẤM/ACTION NÀO TRÊN GIAO DIỆN BỊ ĐƠ/CHẾT CỨNG!

---

## 🧭 NGUYÊN TẮC XỬ LÝ SỰ KIỆN NÚT BẤM

1. Tất cả button trong template (`.html`) BẮT BUỘC phải dùng `<pos-button>` hoặc `<pos-dropdown>` từ `@shared`.
2. Mọi `<pos-button>` bắt buộc khai báo `(clicked)="handler()"` hoặc `type="submit"`.
3. Mọi `<pos-dropdown>` bắt buộc khai báo `(itemClick)="onActionClick(row, $event)"`.
4. Nút bấm submit form bắt buộc gắn `[loading]="saving()"` và `[disabled]="saving()"`.
5. Mọi thao tác ghi/xóa dữ liệu (POST, PUT, DELETE, PATCH) thành công hoặc thất bại BẮT BUỘC bật Toast Message thông báo kết quả.
6. Mọi thao tác nguy hiểm (Xóa, Khóa tài khoản, Từ chối hồ sơ) BẮT BUỘC qua `<pos-confirm-dialog>`.

---

## 📊 DANH SÁCH 38 SCREENS & API ENDPOINTS TƯƠNG ỨNG

- xem chi tiết 38 màn hình & API Mapping đầy đủ trong file: `ANTIGRAVITY_UI_ACTION_GUIDE.md`
