# POS Management System — VPBank Enterprise UI Standard & Refactor Plan (docs/19_VPBank_Enterprise_UI_Refactor_Plan.md)

> **Tài liệu Chuẩn hóa Giao diện Doanh nghiệp Ngân hàng (VPBank POS Lifecycle Management UI)**  
> **Phiên bản:** 2.0 (Enterprise Banking Grade)  
> **Tác giả:** AI Antigravity Team  
> **Áp dụng:** Toàn bộ Frontend POS Management System (`pos-management/frontend`)

---

## 🏛️ 1. TỔNG QUAN THIẾT KẾ GIAO DIỆN CHUẨN NGÂN HÀNG (VPBANK POS DESIGN SYSTEM)

Dựa trên hình ảnh chụp thực tế màn hình hệ thống **Quản lý thiết bị POS** tại ngân hàng VPBank (`pos-lifecycle.postal-sit.aws.vpbank.dev`), giao diện đạt chuẩn enterprise có các đặc trưng nhận diện thương hiệu và UX vượt trội như sau:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ BREADCRUMB: Quản lý thiết bị > Quản lý thiết bị > Tra cứu thiết bị                      │
│ TITLE: Tra cứu thiết bị                                                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ MODE TABS: [ 🟢 Quản lý theo serial ]  [ 📦 Quản lý theo số lượng ]                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 ĐIỀU KIỆN TRA CỨU (FILTER PANEL - 2 DÒNG 8 ITEMS - RESPONSIVE)                      │
│ [Serial/IMEI        ] [Danh mục thiết bị  ✖▼] [Loại thiết bị     ✖▼] [Model thiết bị  ✖▼]│
│ [Trạng thái        ✖▼][Kho hiện tại       ✖▼] [Tình trạng       ✖▼] [Mã Purchase Order] │
│                                                          [ ↺ Xóa bỏ ] [ 🔍 Tìm kiếm ] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 📊 THỐNG KÊ THEO TRẠNG THÁI (STATUS CARDS BAR)                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ... │
│ │Tổng số   │ │Trong kho │ │Đã xuất kho│ │Đang dùng │ │Đã thu hồi│ │Hư hỏng   │     │
│ │   21     │ │   15     │ │    6     │ │    0     │ │    0     │ │    0     │     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 📋 DANH SÁCH THIẾT BỊ QUẢN LÝ THEO SERIAL            [ 👁 8 items selected ▼ ]         │
│ ┌──────────┬─────┬─────────────┬──────────────┬──────────────┬────────────┬──────────┐ │
│ │ Thao tác │ STT │ Serial/IMEI │ Model        │ Loại thiết bị│ Trạng thái │ PO Code  │ │
│ ├──────────┼─────┼─────────────┼──────────────┼──────────────┼────────────┼──────────┤ │
│ │  👁      │  1  │ MOBILEPOS02 │ PAX A920 Pro │ Mobile POS   │ [Đã xuất]  │ PO_2026..│ │
│ └──────────┴─────┴─────────────┴──────────────┴──────────────┴────────────┴──────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 2. CÁC THÀNH PHẦN NÒNG CỐT CẦN NÂNG CẤP & NGUYÊN TẮC THIẾT KẾ

### 2.1. Thanh Chuyển Chế Độ Quản Lý (Mode Switch Tabs)
- Vị trí: Đặt ngay bên dưới Tiêu đề Màn hình (Page Title).
- Thiết kế: Dạng tab viên thuốc hoặc tab gạch chân phân biệt màu xanh VPBank (`#00b050` / Emerald Green).
- Phân loại 2 Chế độ chính:
  1. **Quản lý theo serial**: Hiển thị bảng chi tiết từng Serial / IMEI thiết bị cụ thể.
  2. **Quản lý theo số lượng**: Hiển thị bảng gom nhóm (Grouped View) theo Model/Kho với tổng số lượng thiết bị khả dụng.

### 2.2. Khung Điều Kiện Tra Cứu (Filter Panel)
- Card nền trắng / dark mode card với tiêu đề nhóm `Điều kiện tra cứu`.
- **Bố cục Grid 2 dòng 8 items**: Phân bổ 4 ô/dòng trên Desktop, 2 ô/dòng trên Tablet, 1 ô/dòng trên Mobile (Responsive).
- **Icon Xóa Trắng (`✖` Clear Button)**: Tất cả các Ô Chọn (`pos-select` / Select Box) có thuộc tính `[clearable]="true"`. Khi user đã chọn một giá trị, icon `✖` xuất hiện ngay trong ô giúp reset nhanh về trống chỉ với 1 cú click.
- Góc dưới bên phải bố cục 2 nút bấm:
  - **Nút Xóa bỏ** (`variant="secondary"`, icon `bi-arrow-counterclockwise` / `↺`): Reset toàn bộ bộ lọc về trạng thái ban đầu.
  - **Nút Tìm kiếm** (`variant="primary"`, icon `bi-search` / `🔍`): Thực hiện truy vấn backend.

### 2.3. Thanh Thẻ Thống Kê Số Lượng Theo Trạng Thái (Status Statistics Bar)
- Vị trí: Nằm ngang ngay trên bảng dữ liệu chính.
- Cấu trúc Card:
  - Viền trên hoặc viền trái nhấn màu sắc tương ứng theo từng trạng thái (Status Accent Color).
  - Tên trạng thái kèm icon minh họa.
  - Con số thống kê in đậm cỡ lớn (Bold 20-24px).
  - **Hành vi tương tác (Interactive):** Khi click vào bất kỳ card trạng thái nào, hệ thống sẽ tự động kích hoạt lọc bảng dữ liệu theo đúng trạng thái đó!

| Mã Trạng Thái | Tên Tiếng Việt | Màu Accent | Icon Minh Họa |
| :--- | :--- | :--- | :--- |
| `TOTAL` | **Tổng thiết bị** | Xám / Trung tính (`#64748b`) | `bi-boxes` |
| `IN_STOCK` | **Trong kho** | Xanh lá Emerald (`#00b050`) | `bi-inbox-fill` |
| `EXPORTED` | **Đã xuất kho** | Xanh dương Sapphire (`#2563eb`) | `bi-box-arrow-up-right` |
| `IN_USE` | **Đang sử dụng** | Xanh ngọc Cyan (`#06b6d4`) | `bi-check-circle-fill` |
| `RECALLED` | **Đã thu hồi** | Cam Amber (`#f59e0b`) | `bi-arrow-counterclockwise` |
| `INSPECTING` | **Kiểm tra** | Tím Violet (`#8b5cf6`) | `bi-search-heart` |
| `REPAIRING` | **Đang sửa chữa** | Vàng Warning (`#eab308`) | `bi-tools` |
| `BROKEN` | **Hư hỏng** | Đỏ Rose (`#ef4444`) | `bi-exclamation-triangle-fill` |

### 2.4. Bảng Dữ Liệu & Nút Chọn Cột Hiển Thị ("8 items selected")
- **Nút Ẩn/Hiển Thị Cột (`Column Selector Button`)**:
  - Nhãn hiển thị chính button là số lượng cột đang chọn: **`8 items selected`** (hoặc tiếng Việt: **`8 cột đang được chọn`**), đi kèm icon `bi-eye` và icon mũi tên sổ xuống `bi-chevron-down`.
  - Khi click vào nút này, mở popover chứa danh sách tất cả các cột kèm checkbox.
  - Khi bỏ chọn/tích chọn checkbox, bảng tự động ẩn/hiện cột tương ứng và nhãn button cập nhật động (vd từ `8 items selected` -> `7 items selected`).
- **Cột Thao Tác (Action Column)**: 
  - Chỉ hiển thị icon nút tròn (Circular Icon Action Button) như icon mắt `👁`.
  - Khi hover chuột vào icon mắt sẽ hiển thị tooltip tiếng Việt: `Xem chi tiết`.
- **Mã Purchase Order**: Hiển thị dạng text đường dẫn màu đỏ nổi bật (vd: `PO_20261001170736130`), có thể click để mở nhanh PO detail.

---

## 🗺️ 3. LỘ TRÌNH REFACTOR TOÀN BỘ HỆ THỐNG MÀN HÌNH POS MANAGER

AI Antigravity sẽ áp dụng chuẩn giao diện VPBank này cho 100% các màn hình quản lý trong hệ thống:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LỘ TRÌNH THỰC HIỆN CỦA AI ANTIGRAVITY AGENT:                                           │
│                                                                                        │
│ 1. Nâng cấp Shared Component `PosSelectComponent` (Thêm icon Xóa Trắng `✖` mặc định)   │
│ 2. Tạo mới Shared Component `PosStatusBarComponent` (Thanh thẻ thống kê trạng thái)   │
│ 3. Nâng cấp Shared Component `PosTableComponent` (Thêm nút toggle `8 items selected`)  │
│ 4. Xây dựng Màn hình Chuẩn VPBank `DeviceLookupComponent` (`/inventory/device-lookup`) │
│ 5. Tái cấu trúc toàn bộ các màn hình hiện có (Merchants, Terminals, Stock, SIMs...)    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 4. QUY TRÌNH KIỂM THỬ VÀ GATE NGHIỆM THU (VERIFICATION GATE)

1. `npm run build` trên frontend đạt resultado SUCCESS với 0 lỗi compilation.
2. `mvn clean verify -DskipTests` trên backend đạt BUILD SUCCESS.
3. Kiểm tra tính tương thích Dark Mode & Light Mode tức thì, không bị giật hay vỡ layout.
