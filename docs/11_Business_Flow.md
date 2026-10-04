# POS Management System — Business Flow Guide

> Tài liệu này là **kim chỉ nam nghiệp vụ** dành cho lập trình viên và AI Agent trước khi code bất kỳ tính năng nào.
> Đọc tài liệu này để hiểu: dữ liệu nào cần tồn tại trước, flow nào phụ thuộc flow nào, và Angular hiển thị gì khi không có dữ liệu.
>
> 🎓 **Người mới làm banking?** Đọc [11a_Business_Onboarding_Guide.md](./11a_Business_Onboarding_Guide.md) trước — giải thích *tại sao* đằng sau mỗi flow, glossary, và danh sách các điểm còn mâu thuẫn trong tài liệu này (§6).

---

## 1. Giới Thiệu Dự Án

### 1.1 POS Management System là gì?

**POS Management System** là hệ thống nội bộ của ngân hàng dùng để quản lý toàn bộ vòng đời của máy POS (Point of Sale — máy quẹt thẻ). Hệ thống này **KHÔNG xử lý giao dịch thanh toán** — đó là nhiệm vụ của Core Banking. Hệ thống này quản lý **thiết bị** và **quan hệ thương mại**.

| Điều Hệ Thống Làm | Điều Hệ Thống KHÔNG Làm |
|---|---|
| Nhập kho máy POS từ nhà cung cấp | Xử lý giao dịch thẻ (Core Banking làm) |
| Cấp phát máy POS cho Merchant | Quản lý tài khoản thẻ khách hàng |
| Theo dõi vị trí và trạng thái từng máy | Settle thanh toán, đối soát |
| Phê duyệt đa cấp (Maker-Checker) | Tích hợp VISA/Mastercard |
| Kiểm kê định kỳ, thanh lý | Báo cáo doanh thu |

### 1.2 Ai Dùng Hệ Thống Này?

| Vai Trò | Tên Role | Làm Gì |
|---|---|---|
| **Quản trị hệ thống** | `SUPER_ADMIN` | Toàn quyền, quản lý user, config hệ thống |
| **Quản lý kho** | `INVENTORY_MANAGER` | Phê duyệt nhập/xuất/điều chuyển kho |
| **Nhân viên kho** | `INVENTORY_STAFF` | Tạo phiếu nhập/xuất/điều chuyển, nhập kho thực tế |
| **Quản lý Merchant** | `MERCHANT_MANAGER` | Tạo Merchant, kích hoạt, phân phí |
| **Nhân viên thiết bị** | `DEVICE_OPERATOR` | Quản lý vòng đời thiết bị, sửa chữa, thanh lý |
| **Nhân viên cấp phát** | `ASSIGNMENT_OPERATOR` | Cấp phát, thu hồi, điều chuyển thiết bị cho Merchant |
| **Quản lý phí** | `FEE_MANAGER` | Cài đặt chính sách phí |
| **Kiểm soát nội bộ** | `AUDITOR` | Xem audit log, báo cáo, không thay đổi dữ liệu |
| **Xem báo cáo** | `VIEWER` | Chỉ xem, không tác động |

> **Quy tắc Data Scope:** Người dùng thuộc Business Unit nào chỉ thấy dữ liệu của Business Unit đó. `SUPER_ADMIN` thấy tất cả.

### 1.3 Quan Hệ Cốt Lõi

> **Mô hình chuẩn banking: 1 Merchant → Nhiều MID → Nhiều TID → 1 Device**

```
Ngân hàng (Bank)
├── Chi nhánh Hà Nội (Business Unit)
│   ├── Kho HN-01 (Warehouse) ← máy POS tồn kho
│   ├── Kho HN-02 (Warehouse)
│   └── Merchant Siêu thị A (Merchant)
│         ├── MID: M000001 (Hội sở)            ← Merchant ID (MID)
│         │     ├── TID: T100001 (Tại cử́a chính) ← Terminal ID gắn TID
│         │     │     └── Device: SN-PAX-000001 (PAX A920)  ← thiết bị vật lý
│         │     └── TID: T100002 (Tại cử́a phụ)
│         │           └── Device: SN-ING-000002 (Ingenico iCT220)
│         └── MID: M000002 (Chi nhánh Đống Đa)    ← MID thứ 2 của cùng Merchant
│               └── TID: T100003
│                     └── Device: SN-VFN-000003 (Verifone VX520)
└── Chi nhánh HCM (Business Unit)
    ├── Kho HCM-01 (Warehouse)
    └── Merchant Cửa hàng B (Merchant)
```

> **Lưu ý tích hợp ngoài:**
> - **WAY4** Card Management đồng bộ MID/TID khi kích hoạt — cột `way4_mid`, `way4_tid`
> - **T24** Core Banking liên kết Merchant với tài khoản quyết toán — cột `t24_customer_id`, `t24_account_id`

---

## 2. Master Data — Dữ Liệu Nền Tảng

### 2.1 Master Data là gì?

**Master Data** (Dữ liệu Nền) là tập hợp dữ liệu **phải tồn tại trong hệ thống trước khi bất kỳ nghiệp vụ nào có thể diễn ra**. Không có Master Data = không có dropdown = form không thể submit = nghiệp vụ tê liệt.

> **Ví dụ:** Bạn không thể tạo Purchase Order nếu chưa có Vendor nào trong hệ thống. Bạn không thể tạo Merchant nếu chưa có MCC Code.

**Phân biệt 3 loại dữ liệu:**

| Loại | Ví Dụ | Tạo Bởi | Thay Đổi |
|---|---|---|---|
| **Master Data** | Vendor, MCC Code, Device Model, Role | Seed script / Admin | Rất hiếm |
| **Operational Data** | Merchant, Terminal, User, Purchase Order | Nghiệp vụ hàng ngày | Thường xuyên |
| **Transaction Data** | Assignment, Stock Transaction, Approval | Auto-generated | Không sửa |

### 2.2 Sơ Đồ Phụ Thuộc Master Data

```
                    ┌─────────────────┐
                    │  Permissions    │  (seed)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Roles       │  (seed: 9 roles)
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼──────┐  ┌────▼────────┐ ┌──▼──────────────┐
    │  Business Units │  │    Users    │ │  Approval Configs│
    │  (seed/UI)      │  │  (UI, Admin)│ │  (seed: 5 types) │
    └─────────┬───────┘  └─────────────┘ └──────────────────┘
              │
    ┌─────────▼───────┐
    │   Warehouses    │  (seed/UI)
    └─────────────────┘

    ┌──────────────────┐
    │ Device Categories│  (seed)
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │  Device Types    │  (seed)
    └────────┬─────────┘
             │
    ┌────────▼─────────┐     ┌──────────┐
    │  Device Models   │◄────│ Vendors  │  (seed)
    └──────────────────┘     └──────────┘

    ┌──────────────────┐
    │    MCC Codes     │  (seed: ISO 18245 top 50)
    └────────┬─────────┘
             │
    ┌────────▼─────────┐     ┌──────────────────┐
    │    Merchants     │     │   Fee Policies    │  (seed/UI)
    └────────┬─────────┘     └────────┬──────────┘
             │                        │
    ┌────────▼─────────┐     ┌────────▼──────────┐
    │    Terminals     │     │ Merchant Fee Asmt  │
    └──────────────────┘     └───────────────────┘
```

### 2.3 Thứ Tự Tạo Master Data (Setup Mới Hệ Thống)

Khi deploy hệ thống lần đầu, thực hiện theo thứ tự sau:

#### Bước 1 — Seed Tự Động (Flyway chạy khi khởi động)
```
✅ Flyway V1: Base schema (UUID, Trigger hàm update_updated_at_column)
✅ Flyway V2: Roles + Permissions (9 roles, ~50 permissions)
             RefreshTokens, AuthAuditLogs
✅ Flyway V3: Device Categories, Device Types, Device Models mẫu
             Vendors mẫu (PAX, Ingenico, Verifone, VinaLab)
             MCC Codes (Top 50 ngành phổ biến)
             Fee Policies mẫu
             Business Units mẫu (HN, HCM)
             Warehouses mẫu (KHO-HN-01, KHO-HCM-01)
             Logistics Trackings table
✅ Flyway V4: merchants, merchant_ids (MID), terminal_ids (TID)
             Mô hình: 1 Merchant → N MID → N TID → 1 Device
✅ Flyway V9: Approval Configs mặc định (5 loại phiếu)
✅ Flyway V14: SUPER_ADMIN user (admin@pos.vn / Admin@123)
```

#### Bước 2 — Admin Tạo Qua UI (Ngay sau khi đăng nhập lần đầu)
```
1. Đổi mật khẩu admin ngay lập tức
2. Tạo Business Units thực tế (nếu cần thêm ngoài seed)
3. Tạo Warehouses thực tế
4. Tạo Users cho các phòng ban
5. Thêm Device Models, Vendors nếu cần
6. Tạo Fee Policies thực tế
```

#### Bước 3 — Nghiệp Vụ Có Thể Bắt Đầu
```
Sau bước 1+2, system sẵn sàng cho:
→ Tạo Purchase Order + Nhập kho
→ Tạo Merchant + Terminal
→ Cấp phát thiết bị
→ Luồng phê duyệt
```

### 2.4 Bảng Nguồn Dữ Liệu Dropdown (Dropdown Data Source Map)

> **Quy tắc Angular:** Mọi dropdown phải load từ API, KHÔNG hardcode. Phải xử lý loading state và error state.

| Màn Hình / Form | Field Dropdown | API Endpoint | Điều Kiện Filter |
|---|---|---|---|
| **Tạo Device Model** | Danh mục (Category) | `GET /api/v1/catalog/device-categories` | `status=ACTIVE` |
| **Tạo Device Model** | Loại thiết bị (Type) | `GET /api/v1/catalog/device-types?categoryId={id}` | theo Category đã chọn |
| **Tạo Device Model** | Nhà cung cấp (Vendor) | `GET /api/v1/catalog/vendors` | `status=ACTIVE` |
| **Tạo Purchase Order** | Vendor | `GET /api/v1/catalog/vendors` | `status=ACTIVE` |
| **Tạo Purchase Order** | Kho đích | `GET /api/v1/organizations/warehouses` | theo Business Unit user |
| **Tạo Purchase Order — Items** | Device Model | `GET /api/v1/catalog/device-models` | `status=ACTIVE`, search by name |
| **Nhập kho — Serial** | Model (auto-fill từ PO) | (từ Purchase Order Item đã chọn) | — |
| **Tạo Merchant** | Business Unit | `GET /api/v1/organizations/business-units` | theo scope user |
| **Tạo Merchant** | MCC Code | `GET /api/v1/catalog/mcc-codes?search={keyword}` | search by code hoặc name |
| **Tạo Merchant** | Fee Policy | `GET /api/v1/catalog/fee-policies` | `status=ACTIVE` |
| **Tạo MID** | Merchant | `GET /api/v1/merchants?status=ACTIVE` | chọn Merchant trước |
| **Tạo TID** | MID | `GET /api/v1/merchants/{id}/mids?status=ACTIVE` | load sau khi chọn Merchant |
| **Cấp phát thiết bị (Bước 1)** | Merchant | `GET /api/v1/merchants?status=ACTIVE` | chỉ Merchant ACTIVE |
| **Cấp phát thiết bị (Bước 1)** | MID | `GET /api/v1/merchants/{id}/mids?status=ACTIVE` | load sau khi chọn Merchant |
| **Cấp phát thiết bị (Bước 2)** | TID | `GET /api/v1/mids/{midId}/tids?status=UNASSIGNED` | chỉ TID chưa có device |
| **Cấp phát thiết bị (Bước 2)** | Serial (Device) | `GET /api/v1/devices?status=INSTOCK` | chỉ INSTOCK |
| **Tạo Repair Order** | Thiết bị | (từ context device đang xem) | — |
| **Tạo Repair Order** | Vendor sửa chữa | `GET /api/v1/catalog/vendors` | `status=ACTIVE` |
| **Filter Danh sách Device** | Trạng thái | (hardcoded: INSTOCK/OUT\_OF\_WAREHOUSE/DEPLOYED/RETURNED/REPAIRING/DISPOSED) | — |
| **Filter Danh sách Device** | Kho | `GET /api/v1/organizations/warehouses` | theo scope user |
| **Filter Danh sách Device** | Vendor | `GET /api/v1/catalog/vendors` | — |
| **Filter Danh sách Device** | Model | `GET /api/v1/catalog/device-models` | — |
| **Filter Approval Inbox** | Loại phiếu | (hardcoded: STOCK\_EXPORT/STOCK\_TRANSFER/DEVICE\_RETURN/...) | — |
| **Logistics Tracking** | Trạng thái | (hardcoded: PREPARING/IN\_TRANSIT/DELIVERED/FAILED/RETURNED) | — |
| **Báo cáo** | Business Unit | `GET /api/v1/organizations/business-units` | theo scope user |
| **Báo cáo** | Kho | `GET /api/v1/organizations/warehouses` | theo Business Unit chọn |

---

## 3. Luồng Nghiệp Vụ Chi Tiết (End-to-End Flows)

### 3.1 Flow A: Nhập Kho Thiết Bị Mới

**Điều kiện tiên quyết:** Vendor, Device Model, Warehouse đã tồn tại.

**Ai thực hiện:** INVENTORY_STAFF (tạo PO), INVENTORY_MANAGER (duyệt PO)

```
Bước 1: Tạo Purchase Order (PO)
        ↓  INVENTORY_STAFF điền: Vendor, Warehouse, danh sách model + số lượng + giá
        ↓  Status: DRAFT
        ↓  Action: Submit PO → SUBMITTED

Bước 2: Phê duyệt Purchase Order
        ↓  INVENTORY_MANAGER review PO → Approve hoặc Reject
        ↓  Status: APPROVED (nếu approve) hoặc REJECTED

Bước 3: Nhập kho thực tế (Receiving)
        ↓  Khi hàng về, INVENTORY_STAFF mở PO → "Nhập kho"
        ↓  Nhập từng Serial Number cho từng model
           (có thể dùng barcode scanner, hoặc import file CSV serial)
        ↓  Hệ thống tạo Device record cho mỗi serial
        ↓  Ghi stock_transactions: type=IMPORT
        ↓  Mỗi Device: status = INSTOCK, warehouse = kho đã chọn
        ↓  PO status → RECEIVED / CLOSED (khi đủ số lượng)

Bước 4: Sự kiện (Kafka)
        → Kafka event: "stock.imported" (OutboxPollingService publish)
        → Notification: INVENTORY_MANAGER nhận thông báo "Đã nhập kho X thiết bị từ PO-2026-0001"

[Kết quả: Hệ thống có thiết bị status=INSTOCK, sẵn sàng xuất kho/cấp phát]
```

**Màn hình liên quan:** #13 Purchase Orders → #14 Import Device

---

### 3.2 Flow B: Xuất Kho và Cấp Phát Thiết Bị

**Điều kiện tiên quyết:** Device status=INSTOCK, Merchant status=ACTIVE, Terminal status=ACTIVE

**Ai thực hiện:** INVENTORY_STAFF (tạo phiếu xuất), INVENTORY_MANAGER (duyệt), ASSIGNMENT_OPERATOR (cấp phát)

```
Giai đoạn 1: Xuất Kho (Warehouse Out)
────────────────────────────────────────
Bước 1: Tạo Phiếu Xuất Kho
        ↓  INVENTORY_STAFF chọn: Kho xuất, Thiết bị cần xuất (multi-select), Đối tượng nhận
        ↓  Status phiếu: DRAFT

Bước 2: Submit phiếu → Approval Workflow
        ↓  Status phiếu: PENDING_APPROVAL
        ↓  Hệ thống tạo approval_request type=STOCK_EXPORT
        ↓  INVENTORY_MANAGER nhận notification "Có phiếu xuất kho cần duyệt"

Bước 3: INVENTORY_MANAGER phê duyệt cấp 1
        ↓  Xem chi tiết phiếu, danh sách thiết bị
        ↓  Approve → PENDING_LEVEL_2 (nếu 2 cấp) hoặc APPROVED (nếu 1 cấp)

Bước 4: SUPER_ADMIN phê duyệt cấp 2 (nếu cấu hình 2 cấp)
        ↓  Approve → APPROVED

Bước 5: Thực hiện xuất kho (Execute)
        ↓  Hệ thống tự động: Device status INSTOCK → OUT_OF_WAREHOUSE
        ↓  Ghi stock_transactions: type=EXPORT
        ↓  Ghi device_lifecycle_history

Giai đoạn 2: Cấp Phát Cho Merchant (Assignment)
────────────────────────────────────────────────
Bước 6: ASSIGNMENT_OPERATOR tạo cấp phát
        ↓  Tìm thiết bị theo serial (status=OUT_OF_WAREHOUSE hoặc INSTOCK)
        ↓  Chọn Merchant (phải ACTIVE), Chọn TID (phải ACTIVE)
        ↓  Submit với X-Idempotency-Key
        ↓  Hệ thống check: 3 lớp bảo vệ (Idempotency → Optimistic Lock → Partial Unique Index)

Bước 7: Ghi nhận cấp phát
        ↓  Tạo assignment record (status=ACTIVE)
        ↓  Device status → DEPLOYED
        ↓  Ghi assignment_history: action=ASSIGNED
        ↓  Ghi stock_transactions: type=ASSIGN
        ↓  Kafka event: "device.assigned"

[Kết quả: Device status=DEPLOYED, có assignment ACTIVE với Merchant+TID]
```

**Màn hình liên quan:** #25 Stock Export → #21 Device Detail → #22 Assignment

---

### 3.3 Flow C: Thu Hồi Thiết Bị

**Điều kiện tiên quyết:** Device status=DEPLOYED, Assignment status=ACTIVE

```
Bước 1: ASSIGNMENT_OPERATOR tìm assignment cần thu hồi
        ↓  Tìm theo Serial hoặc Merchant Code
        ↓  Click "Thu hồi"

Bước 2: Xác nhận thu hồi
        ↓  Dialog: "Xác nhận thu hồi SN-POS-000001 từ Merchant ABC?"
        ↓  Nhập lý do thu hồi (bắt buộc)

Bước 3: Hệ thống xử lý
        ↓  Assignment status → RETURNED
        ↓  Device status DEPLOYED → RETURNED
        ↓  Ghi assignment_history: action=RETURNED
        ↓  Ghi device_lifecycle_history
        ↓  Kafka event: "device.returned"

Bước 4: DEVICE_OPERATOR kiểm tra thiết bị
        ↓  Thiết bị vật lý được chuyển về kho
        ↓  DEVICE_OPERATOR mở màn hình Device Detail
        ↓  Kiểm tra tình trạng:
           - Bình thường → "Chuyển về INSTOCK" (có thể cấp phát lại)
           - Có lỗi → "Tạo Repair Order" → Device → REPAIRING

[Kết quả: Device status=INSTOCK (tái sử dụng) hoặc REPAIRING (sửa chữa)]
```

**Màn hình liên quan:** #22 Assignment → #20 Device Detail

---

### 3.4 Flow D: Tạo và Kích Hoạt Merchant

**Điều kiện tiên quyết:** Business Unit, MCC Code, Fee Policy đã tồn tại

```
Bước 1: Tạo Merchant
        ↓  MERCHANT_MANAGER điền: Tên, Mã số thuế, MCC Code, Business Unit
        ↓  Địa chỉ, Liên hệ, Email
        ↓  Merchant Code được auto-generate: M000001
        ↓  Status: PENDING
        ↓  Ghi merchant_status_history: null → PENDING

Bước 2: KYC & Thẩm định (ngoài hệ thống)
        ↓  Phòng thẩm định thực hiện offline

Bước 3: Kích hoạt Merchant
        ↓  MERCHANT_MANAGER sau khi KYC xong → Activate
        ↓  Status: PENDING → ACTIVE
        ↓  Ghi merchant_status_history

Bước 4: Tạo Terminal (TID)
        ↓  Trong Merchant Detail → Tab "Terminals" → Tạo TID
        ↓  TID được auto-generate: T100001
        ↓  Status: PENDING → Activate → ACTIVE
        ↓  Effective From: ngày bắt đầu sử dụng

Bước 5: Gắn Fee Policy
        ↓  Trong Merchant Detail → Tab "Phí" → Gán Fee Policy
        ↓  Chọn Fee Policy, nhập effective date
        ↓  Lưu Merchant Fee Assignment

[Kết quả: Merchant ACTIVE với TID ACTIVE, sẵn sàng nhận thiết bị]
```

**Màn hình liên quan:** #16 Merchant List → #17 Merchant Detail → #18 Terminal

---

### 3.5 Flow E: Approval Workflow (Maker-Checker Chi Tiết)

```
[MAKER — người tạo]
         ↓ Tạo phiếu (DRAFT)
         ↓ Điền đầy đủ thông tin
         ↓ Submit → PENDING_APPROVAL

[Hệ thống gửi notification]
         ↓ Kafka event: "approval.submitted"
         ↓ NotificationService → INVENTORY_MANAGER nhận notification
         ↓ Badge số trên góc bell icon tăng lên

[CHECKER CẤP 1 — INVENTORY_MANAGER]
         ↓ Mở /approval/inbox
         ↓ Thấy phiếu mới → click xem chi tiết
         ↓ Review toàn bộ nội dung phiếu
         ↓
         ├── [Phê duyệt] → PENDING_LEVEL_2 (nếu 2 cấp) hoặc APPROVED
         │                  Kafka event: "approval.approved.level1"
         │
         ├── [Từ chối] → REJECTED (hệ thống kết thúc flow)
         │               Kafka event: "approval.rejected"
         │               MAKER nhận notification "Phiếu bị từ chối: {lý do}"
         │
         └── [Trả lại sửa] → RETURNED_FOR_EDIT
                             MAKER nhận notification "Phiếu cần bổ sung: {comment}"
                             MAKER sửa → Submit lại → PENDING_APPROVAL

[CHECKER CẤP 2 — SUPER_ADMIN] (nếu max_level = 2)
         ↓ Tương tự Checker cấp 1
         ↓ Approve → APPROVED

[EXECUTE — Hệ thống tự động]
         ↓ Khi APPROVED: Hệ thống thực thi business logic
         ↓ STOCK_EXPORT: Device → OUT_OF_WAREHOUSE, ghi stock_transactions
         ↓ Status phiếu: APPROVED → EXECUTING → COMPLETED
         ↓ Kafka event: "approval.completed"
         ↓ MAKER nhận notification "Phiếu đã hoàn thành"

⚠️ CÁC QUY TẮC BẤT BIẾN:
   - Người tạo KHÔNG THỂ phê duyệt phiếu của mình (SelfApprovalException)
   - Nếu 2 Manager cùng duyệt cùng lúc → Optimistic Lock bảo vệ
   - Phiếu đã APPROVED/REJECTED/COMPLETED không thể thay đổi
```

**Màn hình liên quan:** #28 Create Approval → #29 Approval Inbox → #30 Approval Detail

---

### 3.6 Flow F: Sửa Chữa và Thanh Lý Thiết Bị

```
[Sửa Chữa]
Bước 1: DEVICE_OPERATOR nhận thiết bị lỗi (status=RETURNED)
Bước 2: Tạo Repair Order → Device: RETURNED → REPAIRING
Bước 3: Gửi thiết bị cho Vendor sửa
Bước 4a: Sửa thành công → Device: REPAIRING → INSTOCK + đóng Repair Order (COMPLETED)
Bước 4b: Không sửa được → Tạo phiếu phê duyệt thanh lý

[Thanh Lý]
Bước 5: DEVICE_OPERATOR tạo phiếu Dispose → Approval Workflow (type=DEVICE_DISPOSE)
Bước 6: INVENTORY_MANAGER + SUPER_ADMIN phê duyệt
Bước 7: Thực thi → Device: REPAIRING/RETURNED → DISPOSED (trạng thái kết thúc, KHÔNG thể phục hồi)
```

---

## 4. Angular UX — Message Library

> **Nguyên tắc:** Không bao giờ để màn hình trống không có giải thích. Mọi trạng thái đều phải có message rõ ràng.

### 4.1 Empty States — Không Có Dữ Liệu

Dùng component `<app-empty-state>` với các props: `icon`, `title`, `subtitle`, `actionLabel` (optional), `actionRoute` (optional).

#### 🖥️ Device Search (Screen 10 — /inventory/devices)
```typescript
// Chưa filter, data rỗng
{ icon: '📦', title: 'Hệ thống chưa có thiết bị nào',
  subtitle: 'Bắt đầu bằng cách tạo Purchase Order và nhập kho',
  actionLabel: 'Tạo Purchase Order', actionRoute: '/inventory/purchase-orders/new' }

// Đã filter, không ra kết quả
{ icon: '🔍', title: 'Không tìm thấy thiết bị nào',
  subtitle: 'Thử thay đổi điều kiện lọc hoặc tìm kiếm với từ khóa khác' }

// Tìm theo serial cụ thể
{ icon: '🔍', title: `Không tìm thấy thiết bị có serial "${searchTerm}"`,
  subtitle: 'Kiểm tra lại serial number. Serial phải có định dạng SN-POS-XXXXXX' }

// Filter theo kho + status không có kết quả
{ icon: '📭', title: 'Kho này không có thiết bị nào ở trạng thái INSTOCK',
  subtitle: 'Tất cả thiết bị đã được xuất kho hoặc cấp phát' }
```

#### 📋 Purchase Order List (Screen 13)
```typescript
{ icon: '📄', title: 'Chưa có Purchase Order nào',
  subtitle: 'Tạo PO khi cần nhập thiết bị từ nhà cung cấp',
  actionLabel: 'Tạo Purchase Order', actionRoute: '/inventory/purchase-orders/new' }

{ icon: '🔍', title: 'Không tìm thấy Purchase Order phù hợp',
  subtitle: 'Thử thay đổi khoảng thời gian hoặc trạng thái tìm kiếm' }
```

#### 🏪 Merchant List (Screen 16)
```typescript
{ icon: '🏪', title: 'Chưa có Merchant nào trong hệ thống',
  subtitle: 'Tạo Merchant mới để bắt đầu quản lý điểm chấp nhận thanh toán',
  actionLabel: 'Tạo Merchant', actionRoute: '/merchants/new' }

{ icon: '🔍', title: `Không tìm thấy Merchant nào với tên "${searchTerm}"`,
  subtitle: 'Thử tìm theo mã Merchant (M000001) hoặc tên đầy đủ' }
```

#### 📲 Terminal List (trong Merchant Detail — Tab Terminals)
```typescript
{ icon: '📲', title: 'Merchant này chưa có Terminal nào',
  subtitle: 'Tạo Terminal (TID) để có thể cấp phát thiết bị POS',
  actionLabel: 'Tạo Terminal', actionOnClick: 'openCreateTerminalDialog' }
```

#### 🔗 Assignment List (Screen 22)
```typescript
{ icon: '🔗', title: 'Chưa có cấp phát nào',
  subtitle: 'Thiết bị được cấp phát khi xuất kho và giao cho Merchant' }

{ icon: '🔍', title: 'Không tìm thấy cấp phát phù hợp',
  subtitle: 'Thử tìm theo serial number hoặc mã Merchant' }

// Tab "Đã thu hồi" rỗng
{ icon: '✅', title: 'Không có thiết bị nào đã thu hồi',
  subtitle: 'Các thiết bị thu hồi sẽ xuất hiện tại đây' }
```

#### ✅ Approval Inbox (Screen 29)
```typescript
{ icon: '🎉', title: 'Không có phiếu nào cần phê duyệt',
  subtitle: 'Tuyệt vời! Bạn đã xử lý hết hàng đợi phê duyệt' }

{ icon: '🔍', title: 'Không tìm thấy phiếu nào',
  subtitle: 'Thử thay đổi loại phiếu hoặc khoảng thời gian tìm kiếm' }
```

#### 📋 My Requests (Phiếu của tôi — Screen 31)
```typescript
{ icon: '📝', title: 'Bạn chưa tạo phiếu nào',
  subtitle: 'Các phiếu bạn tạo (xuất kho, thu hồi...) sẽ xuất hiện tại đây' }
```

#### 🔔 Notification Center (Screen 38)
```typescript
// All tab
{ icon: '🔔', title: 'Chưa có thông báo nào',
  subtitle: 'Thông báo sẽ xuất hiện khi có phiếu cần duyệt hoặc nghiệp vụ hoàn thành' }

// Unread tab
{ icon: '✅', title: 'Bạn đã đọc hết thông báo',
  subtitle: 'Không có thông báo chưa đọc' }
```

#### 📊 Audit Log (Screen 36)
```typescript
{ icon: '📋', title: 'Không tìm thấy nhật ký hoạt động nào',
  subtitle: 'Thử thay đổi người dùng, loại hành động hoặc khoảng thời gian' }
```

#### 🔧 Repair Orders (trong Device Detail — Tab Sửa chữa)
```typescript
{ icon: '🔧', title: 'Thiết bị này chưa có lịch sử sửa chữa nào',
  subtitle: 'Repair Order được tạo khi thiết bị có lỗi phần cứng' }
```

#### 📦 Stock Transactions — Lịch Sử Biến Động Kho (Screen 27)
```typescript
{ icon: '📦', title: 'Kho này chưa có giao dịch nào',
  subtitle: 'Giao dịch xuất hiện khi nhập/xuất/điều chuyển thiết bị' }

{ icon: '🔍', title: 'Không tìm thấy giao dịch nào trong khoảng thời gian này',
  subtitle: 'Thử mở rộng khoảng thời gian tìm kiếm' }
```

---

### 4.2 Success Messages (Snackbar/Toast — duration: 4s)

```typescript
// Màu: SUCCESS_GREEN (#2E7D32), icon ✅

// Authentication
'Đăng nhập thành công. Chào mừng {fullName}!'
'Đăng xuất thành công'
'Mật khẩu đã được đổi thành công'

// Device
`Thiết bị ${serial} đã được nhập kho thành công`
`Đã cập nhật thông tin thiết bị ${serial}`

// Assignment
`✅ Thiết bị ${serial} đã được cấp phát thành công cho ${merchantName} — TID: ${tid}`
`✅ Thu hồi thành công thiết bị ${serial} từ ${merchantName}`
`✅ Điều chuyển thiết bị ${serial} từ ${fromMerchant} sang ${toMerchant} thành công`

// Stock
`✅ Nhập kho thành công ${count} thiết bị từ ${poNumber}`
`✅ Phiếu xuất kho ${requestNumber} đã được tạo và gửi phê duyệt`
`✅ Phiếu điều chuyển ${requestNumber} đã được tạo và gửi phê duyệt`

// Approval
`✅ Đã phê duyệt phiếu ${requestNumber}`
`✅ Đã từ chối phiếu ${requestNumber}`
`✅ Đã trả phiếu ${requestNumber} về để chỉnh sửa`

// Merchant
`✅ Merchant ${merchantName} đã được tạo thành công. Mã: ${merchantCode}`
`✅ Merchant ${merchantName} đã được kích hoạt`
`✅ Terminal ${tid} đã được tạo và gắn vào ${merchantName}`

// Admin
`✅ Đã tạo tài khoản cho ${fullName} thành công`
`✅ Đã cập nhật quyền cho role ${roleName}`

// Export
`✅ File Excel đang được tạo. Tải xuống sẽ bắt đầu trong vài giây...`
`✅ Đã xuất ${count} bản ghi ra file Excel`
```

---

### 4.3 Confirmation Dialogs (Modal xác nhận)

```typescript
// ⚠️ Màu nền: WARNING_AMBER, icon ⚠️

// Thu hồi thiết bị
{
  title: 'Xác nhận thu hồi thiết bị',
  message: `Bạn có chắc muốn thu hồi thiết bị **${serial}**
             hiện đang cấp phát cho **${merchantName}** (TID: ${tid})?
             Hành động này không thể hoàn tác.`,
  confirmLabel: 'Thu hồi', confirmColor: 'warn',
  cancelLabel: 'Hủy'
}

// Thanh lý thiết bị
{
  title: '⚠️ Xác nhận thanh lý thiết bị',
  message: `Thiết bị **${serial}** sẽ bị THANH LÝ vĩnh viễn.
             Trạng thái DISPOSED không thể khôi phục.
             Vui lòng xác nhận bằng cách nhập serial: ___`,
  requireTextConfirm: serial,  // Phải gõ lại serial để xác nhận
  confirmLabel: 'Thanh lý', confirmColor: 'warn'
}

// Hủy phiếu (Approval)
{
  title: 'Hủy phiếu phê duyệt',
  message: `Bạn có chắc muốn hủy phiếu **${requestNumber}**?
             Phiếu đã hủy không thể khôi phục.`,
  confirmLabel: 'Hủy phiếu', confirmColor: 'warn'
}

// Khóa tài khoản
{
  title: 'Khóa tài khoản',
  message: `Khóa tài khoản **${username}** sẽ ngăn người này đăng nhập.`,
  confirmLabel: 'Khóa', confirmColor: 'warn'
}

// Xóa Master Data (Catalog)
{
  title: 'Xóa mục danh mục',
  message: `Bạn có chắc muốn xóa **${itemName}**?
             Nếu đã có dữ liệu tham chiếu đến mục này, hệ thống sẽ từ chối và hiển thị lỗi.`,
  confirmLabel: 'Xóa', confirmColor: 'warn'
}
```

---

### 4.4 Error Messages — Từ API Backend

```typescript
// Mapping từ Error Code → Message tiếng Việt thân thiện
const ERROR_MESSAGES: Record<string, string> = {

  // Device
  'POS-1001': (ctx) => `Không tìm thấy thiết bị có serial "${ctx.serial}"`,
  'POS-1002': (ctx) => `Thiết bị ${ctx.serial} không ở trạng thái sẵn sàng cấp phát
                        (Trạng thái hiện tại: ${translate(ctx.currentStatus)})`,
  'POS-1003': (ctx) => `Thiết bị ${ctx.serial} đã được cấp phát cho ${ctx.merchantName}.
                        Vui lòng thu hồi trước khi cấp phát lại.`,
  'POS-1004': (ctx) => `Không thể chuyển trạng thái thiết bị từ
                        ${translate(ctx.fromStatus)} sang ${translate(ctx.toStatus)}`,
  'POS-1005': ()   => 'Thiết bị đã THANH LÝ. Không thể thực hiện thao tác trên thiết bị này.',

  // Idempotency / Concurrency
  'POS-2001': ()   => 'Yêu cầu đang được xử lý. Vui lòng không thực hiện thao tác này lần nữa.',
  'POS-2002': ()   => 'Dữ liệu đã thay đổi bởi người khác. Vui lòng tải lại trang và thử lại.',

  // Approval
  'POS-3001': ()   => 'Bạn không thể phê duyệt phiếu do chính mình tạo ra (Maker-Checker Rule)',
  'POS-3002': ()   => 'Phiếu này đã được xử lý bởi người khác. Vui lòng tải lại trang.',
  'POS-3003': (ctx) => `Không thể thực hiện thao tác này. Phiếu đang ở trạng thái: ${translate(ctx.status)}`,

  // Merchant
  'POS-4001': (ctx) => `Không tìm thấy Merchant có mã "${ctx.merchantCode}"`,
  'POS-4002': (ctx) => `Merchant ${ctx.merchantName} chưa được kích hoạt
                        (Trạng thái: ${translate(ctx.status)})`,
  'POS-4003': (ctx) => `Không tìm thấy Terminal có TID "${ctx.tid}"`,
  'POS-4004': (ctx) => `Terminal ${ctx.tid} chưa được kích hoạt`,

  // Inventory
  'POS-5001': (ctx) => `Serial "${ctx.serial}" đã tồn tại trong hệ thống.
                        Kiểm tra lại hoặc tìm thiết bị có serial này.`,
  'POS-5002': ()   => 'Không tìm thấy Purchase Order này',
  'POS-5003': (ctx) => `Kho không đủ thiết bị. Yêu cầu ${ctx.requested} thiết bị nhưng chỉ có ${ctx.available} thiết bị INSTOCK.`,

  // Permission
  'POS-6001': ()   => 'Bạn không có quyền truy cập dữ liệu của đơn vị kinh doanh này.',
  'POS-6002': ()   => 'Bạn không có quyền thực hiện thao tác này. Liên hệ quản trị viên.',

  // Validation
  'POS-7001': ()   => 'Serial Number không đúng định dạng. Định dạng đúng: SN-POS-XXXXXX',
  'POS-7002': ()   => 'Khoảng ngày không hợp lệ. Ngày bắt đầu phải trước ngày kết thúc.',
  'POS-7003': ()   => 'Tham số phân trang không hợp lệ.',

  // Auth
  'POS-9001': ()   => 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'POS-9002': ()   => 'Phiên đăng nhập đã hết hạn. Đang đăng nhập lại...',  // auto-refresh
  'POS-9003': ()   => 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  'POS-9004': ()   => 'Tài khoản bị tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 30 phút.',
  'POS-9005': ()   => 'Bạn đang thao tác quá nhanh. Vui lòng chờ vài giây rồi thử lại.',

  // Generic fallback
  'UNKNOWN':  ()   => 'Đã xảy ra lỗi. Vui lòng thử lại hoặc liên hệ quản trị viên.',
};

// Helper dịch status sang tiếng Việt
const DEVICE_STATUS_VI = {
  'INSTOCK': 'Tồn kho', 'OUT_OF_WAREHOUSE': 'Đã xuất kho',
  'DEPLOYED': 'Đang cấp phát', 'RETURNED': 'Đã thu hồi',
  'REPAIRING': 'Đang sửa chữa', 'DISPOSED': 'Đã thanh lý',
};
```

---

### 4.5 Loading States (Skeleton / Spinner)

```typescript
// 1. Table loading → Dùng skeleton rows (không dùng spinner toàn trang)
// Hiển thị 5 row skeleton mờ khi đang fetch

// 2. Button loading → Spinner trong button, disable button
// <button [disabled]="isLoading" mat-raised-button>
//   <mat-spinner *ngIf="isLoading" diameter="18"></mat-spinner>
//   {{ isLoading ? 'Đang xử lý...' : 'Cấp phát' }}
// </button>

// 3. Dropdown loading
// <mat-select [placeholder]="isLoadingMerchants ? 'Đang tải Merchant...' : 'Chọn Merchant'">

// 4. Form submit → Global loading overlay (nếu > 2s)
// Overlay với spinner + "Đang xử lý yêu cầu của bạn, vui lòng chờ..."

// MESSAGES
const LOADING_MESSAGES = {
  tableDefault: 'Đang tải dữ liệu...',
  deviceList: 'Đang tìm kiếm thiết bị...',
  merchantList: 'Đang tải danh sách Merchant...',
  assignSubmit: 'Đang xử lý cấp phát thiết bị...',
  approvalSubmit: 'Đang ghi nhận quyết định phê duyệt...',
  exportExcel: 'Đang tạo file Excel, vui lòng chờ...',
  importDevices: 'Đang nhập kho thiết bị ({current}/{total})...',
};
```

---

### 4.6 Form Validation Messages (Reactive Forms)

```typescript
// Dùng cho tất cả form trong hệ thống — consistent messages
const VALIDATION_MESSAGES = {
  required: (fieldName: string) => `${fieldName} là bắt buộc`,
  minlength: (fieldName: string, min: number) =>
    `${fieldName} phải có ít nhất ${min} ký tự`,
  maxlength: (fieldName: string, max: number) =>
    `${fieldName} không được vượt quá ${max} ký tự`,
  pattern: {
    serialNumber: 'Serial Number phải có định dạng SN-POS-XXXXXX (6 chữ số)',
    merchantCode: 'Mã Merchant phải có định dạng M + 6 chữ số (VD: M000001)',
    terminalId: 'Terminal ID phải có định dạng T + 6 chữ số (VD: T100001)',
    email: 'Email không hợp lệ',
    taxCode: 'Mã số thuế phải có 10 hoặc 13 chữ số',
    phone: 'Số điện thoại không hợp lệ (10-11 chữ số)',
    percentage: 'Tỷ lệ phải từ 0 đến 100%',
  },
  min: (fieldName: string, min: number) =>
    `${fieldName} phải lớn hơn hoặc bằng ${min}`,
  max: (fieldName: string, max: number) =>
    `${fieldName} phải nhỏ hơn hoặc bằng ${max}`,
  dateRange: 'Ngày kết thúc phải sau ngày bắt đầu',
  duplicateSerial: (serial: string) =>
    `Serial "${serial}" đã tồn tại trong hệ thống`,
  requireTextConfirm: (expected: string) =>
    `Vui lòng nhập chính xác "${expected}" để xác nhận`,
};
```

---

### 4.7 Status Badge Labels (Hiển Thị Trạng Thái)

```typescript
// Device Status
const DEVICE_STATUS_CONFIG = {
  'INSTOCK':            { label: 'Tồn kho',          color: 'success',  icon: '✅' },
  'OUT_OF_WAREHOUSE':   { label: 'Đã xuất kho',       color: 'warning',  icon: '📤' },
  'DEPLOYED':           { label: 'Đang cấp phát',      color: 'primary',  icon: '🔗' },
  'RETURNED':           { label: 'Đã thu hồi',         color: 'default',  icon: '↩️' },
  'REPAIRING':          { label: 'Đang sửa chữa',      color: 'warning',  icon: '🔧' },
  'DISPOSED':           { label: 'Đã thanh lý',        color: 'error',    icon: '🗑️' },
};

// Approval Status
const APPROVAL_STATUS_CONFIG = {
  'DRAFT':              { label: 'Nháp',               color: 'default'  },
  'PENDING_APPROVAL':   { label: 'Chờ duyệt cấp 1',   color: 'warning'  },
  'PENDING_LEVEL_2':    { label: 'Chờ duyệt cấp 2',   color: 'warning'  },
  'APPROVED':           { label: 'Đã phê duyệt',       color: 'success'  },
  'EXECUTING':          { label: 'Đang thực thi',       color: 'primary'  },
  'COMPLETED':          { label: 'Hoàn thành',          color: 'success'  },
  'REJECTED':           { label: 'Bị từ chối',          color: 'error'    },
  'RETURNED_FOR_EDIT':  { label: 'Cần chỉnh sửa',      color: 'warning'  },
  'CANCELLED':          { label: 'Đã hủy',              color: 'error'    },
};

// Merchant Status
const MERCHANT_STATUS_CONFIG = {
  'PENDING':    { label: 'Chờ kích hoạt',  color: 'warning' },
  'ACTIVE':     { label: 'Đang hoạt động', color: 'success' },
  'INACTIVE':   { label: 'Tạm ngừng',      color: 'default' },
  'SUSPENDED':  { label: 'Bị đình chỉ',    color: 'error'   },
};
```

---

## 5. Excel Export — Đặc Tả Chi Tiết

### 5.1 Màn Hình Nào Có Nút Export

| Màn Hình | URL | Nút Export | Columns Xuất Ra |
|---|---|---|---|
| **Danh sách thiết bị** | /inventory/devices | `📥 Xuất Excel` | Serial, Model, Vendor, Trạng thái, Kho, Merchant (nếu deployed), Ngày nhập, Hạn bảo hành |
| **Lịch sử vòng đời thiết bị** | /inventory/devices/{serial}/lifecycle | `📥 Xuất Excel` | Thời gian, Từ trạng thái, Sang trạng thái, Lý do, Người thực hiện |
| **Stock Transactions (Sổ cái kho)** | /inventory/stock-ledger | `📥 Xuất Excel` | Thời gian, Serial, Loại GD, Kho nguồn, Kho đích, Người thực hiện |
| **Danh sách Assignment** | /assignments | `📥 Xuất Excel` | Serial, Model, Merchant, TID, Ngày cấp phát, Ngày thu hồi, Người cấp phát |
| **Danh sách Merchant** | /merchants | `📥 Xuất Excel` | Mã, Tên, MCC, Business Unit, Trạng thái, Số TID, Ngày tạo |
| **Phiếu xuất kho** | /inventory/exports | `📥 Xuất Excel` | Số phiếu, Kho, Đối tượng, Mục đích, Số TBị, Trạng thái, Ngày tạo |
| **Approval History** | /approval/history | `📥 Xuất Excel` | Số phiếu, Loại, Người tạo, Người duyệt, Trạng thái, Ngày tạo, Ngày duyệt |
| **Audit Log** | /monitoring/audit | `📥 Xuất CSV/Excel` | Thời gian, User, Hành động, Resource, IP, Chi tiết |
| **Báo cáo** | /reports | `📥 PDF` + `📥 Excel` | Tùy loại báo cáo |

### 5.2 UX Pattern cho Export

```typescript
// Angular Export Flow:
// 1. User click "Xuất Excel" button
// 2. Button → loading state: "Đang tạo file..."
// 3. Call API: GET /api/v1/devices/export?{currentFilters}
// 4a. Nếu < 10,000 rows: Response binary → browser auto-download
// 4b. Nếu > 10,000 rows: Response jobId → polling /api/v1/jobs/{id}
//     → Show progress dialog: "Đang xuất 25,000 thiết bị... 45%"
//     → Khi done: tải về tự động
// 5. Snackbar: "✅ Đã xuất 1,245 thiết bị ra file Excel"

// Validation trước khi export:
if (totalElements > 50000) {
  showWarning('Quá nhiều dữ liệu (>50,000 bản ghi). Hãy thu hẹp bộ lọc trước khi xuất.');
  return;
}
if (totalElements === 0) {
  showWarning('Không có dữ liệu để xuất. Vui lòng thay đổi điều kiện lọc.');
  return;
}
```

### 5.3 Excel File Format Standard

```
File name: {entity}_{YYYY-MM-DD}_{HH-mm}.xlsx
Ví dụ: devices_2026-10-01_14-30.xlsx

Sheet "Dữ liệu":
  - Row 1: Header (bold, background #1E3A5F, text white)
  - Row 2+: Data (zebra striping: white / #F5F5F5)
  - Freeze panes: Row 1 (header luôn hiển thị khi scroll)
  - Auto-fit column width
  - Date format: DD/MM/YYYY HH:mm
  - Number format: #,##0 (phân cách nghìn)

Sheet "Thông tin xuất":
  Thời gian xuất: 01/10/2026 14:30
  Người xuất: Nguyễn Văn A
  Điều kiện lọc: Status=INSTOCK, Warehouse=KHO-HN-01
  Tổng số bản ghi: 423

Sensitive data trong Excel:
  - Serial Number: HIỂN THỊ ĐẦY ĐỦ (đây là file nội bộ)
  - TID: HIỂN THỊ ĐẦY ĐỦ
  - (Khác với log: log phải mask)
```

### 5.4 Backend Implementation Note

```java
// Dùng Apache POI (poi-ooxml) — thêm vào pom.xml:
// <dependency>
//   <groupId>org.apache.poi</groupId>
//   <artifactId>poi-ooxml</artifactId>
//   <version>5.3.0</version>
// </dependency>

// Controller pattern:
@GetMapping("/export")
@PreAuthorize("hasAuthority('DEVICE_EXPORT')")
public ResponseEntity<Resource> exportDevices(
    DeviceFilter filter,
    UserPrincipal user,
    HttpServletResponse response) {

    String filename = "devices_" + LocalDate.now() + ".xlsx";
    response.setHeader("Content-Disposition",
        "attachment; filename=\"" + filename + "\"");
    response.setContentType(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    // Nếu > 10,000 rows: trả về jobId (async)
    long count = deviceService.countWithFilter(filter, user);
    if (count > 10_000) {
        String jobId = exportJobService.scheduleExport("DEVICE", filter, user);
        return ResponseEntity.accepted()
            .body(new JobStartedResponse(jobId));
    }

    // Nếu ≤ 10,000: stream trực tiếp
    deviceExportService.writeExcel(filter, user, response.getOutputStream());
    return ResponseEntity.ok().build();
}
```

---

## 7. Flow G: Tạo Merchant + MID + TID (Wizard Multi-Step)

**Mô hình:** 1 Merchant → N MID → N TID → 1 Device

**Điều kiện tiên quyết:** Business Unit, MCC Code, Fee Policy đã tồn tại.

**Ai thực hiện:** `MERCHANT_MANAGER` (tạo Merchant + MID), `ASSIGNMENT_OPERATOR` (tạo TID và cấp phát device)

### 7.1 Luồng End-to-End

```
[Bước 1: Tạo Merchant]
  MERCHANT_MANAGER điền thông tin Merchant:
    - Tên merchant, tên pháp nhân, mã số thuế
    - Business Unit, MCC Code, Fee Policy
    - Thông tin liên hệ, địa chỉ
  → POST /api/v1/merchants
  → Status: PENDING (chờ kích hoạt)

[Bước 2: Tạo MID cho Merchant]
  1 Merchant → Nhiều MID (mỗi MID đại diện 1 chi nhánh/điểm kinh doanh)
  → POST /api/v1/merchants/{merchantId}/mids
  Body: { mid, label, way4Mid, t24AccountId, isPrimary }
  → MID được đồng bộ sang WAY4 (nếu enabled)
  → T24 account được verify (nếu enabled)

[Bước 3: Tạo TID cho MID]
  1 MID → Nhiều TID (mỗi TID đại diện 1 terminal POS vật lý)
  → POST /api/v1/mids/{midId}/tids
  Body: { tid, installationAddress, way4Tid }
  → TID được đồng bộ sang WAY4

[Bước 4: Cấp phát Device cho TID]
  → ASSIGNMENT_OPERATOR chọn TID (status=UNASSIGNED) + Device (status=INSTOCK)
  → POST /api/v1/assignments
    Header: X-Idempotency-Key: <UUID>
    Body: { serialNumber, tidId, reason }
  → Device status: INSTOCK → DEPLOYED
  → TID status: UNASSIGNED → ASSIGNED
  → Outbox Event → Kafka → WAY4 Device Sync

[Kích hoạt Merchant]
  → PATCH /api/v1/merchants/{id}/activate
  → Merchant status: PENDING → ACTIVE
  → WAY4 Merchant được kích hoạt (nếu enabled)
```

### 7.2 Ràng Buộc Nghiệp Vụ (Business Rules)

```
✅ 1 Merchant có thể có nhiều MID (theo chi nhánh, loại hình)
✅ 1 MID có thể có nhiều TID (theo số lượng terminal tại điểm đó)
✅ 1 TID chỉ gắn với 1 Device tại một thời điểm
✅ Khi thu hồi device: TID trở về UNASSIGNED
✅ Không thể tạo TID cho MID đã DECOMMISSIONED
✅ WAY4 mid phải unique trong hệ thống POS
✅ T24 account được verify realtime trước khi save MID
```

### 7.3 Wizard UI Flow (Angular Multi-Step)

Theo chuẩn `docs/07_UI_UX_Standard.md § 8` (Wizard Multi-Step):

```
[1] Thông Tin MID → [2] Thông Tin TID → [3] Tài Khoản → [4] Tài Liệu → [5] Xác Nhận
        ↓                   ↓                  ↓                ↓             ↓
   Chọn Merchant       Danh sách TID     Verify T24       Upload files    Review tất cả
   Chọn/tạo MID       Thêm TID mới      account          đính kèm        → Gửi yêu cầu
   (isPrimary?)        VALIDATE          realtime
                       per-row
```

**Validate động (section 7.2 trong UI/UX Standard):**
- Dòng TID thứ 2 trở đi: button "Thêm dòng" disabled cho đến khi dòng hiện tại valid
- Button "Tiếp theo" disabled nếu bất kỳ TID nào chưa điền đủ

---

## 8. Flow H: Logistics Tracking — Vận Chuyển Thiết Bị

Khi thiết bị được vận chuyển giữa các kho hoặc đến Merchant, hệ thống tạo Logistics Tracking để theo dõi.

### 8.1 Khi Nào Tạo Logistics Tracking?

```
1. Xuất kho → Kho khác (Điều chuyển)
   → Tạo logistics_tracking khi phiếu điều chuyển được APPROVED

2. Xuất kho → Merchant (Cấp phát vật lý)
   → Tạo logistics_tracking khi phiếu xuất kho được APPROVED

3. Thu hồi thiết bị → Kho
   → Tạo logistics_tracking khi phiếu thu hồi được APPROVED
```

### 8.2 Vòng Đời Logistics

```
PREPARING (đang đóng gói/chuẩn bị)
    │
    ▼
IN_TRANSIT (đang vận chuyển — có tracking number)
    │
    ├── DELIVERED (giao thành công → trigger cập nhật Device/Warehouse)
    │
    └── FAILED (giao thất bại → cần xử lý thủ công)
              │
              └── RETURNED (trả lại kho xuất phát)
```

### 8.3 Thông Tin Logistics Tracking

```
Bảng logistics_trackings:
  - tracking_number: Mã vận đơn (từ đơn vị vận chuyển)
  - carrier: Tên đơn vị vận chuyển (VTP, GHTK, Nội bộ...)
  - status: PREPARING → IN_TRANSIT → DELIVERED/FAILED/RETURNED
  - sender_warehouse_id: Kho xuất phát
  - receiver_warehouse_id / receiver_merchant_id: Đích đến
  - estimated_delivery: Ngày dự kiến giao
  - actual_delivery: Ngày giao thực tế (fill khi DELIVERED)
  - notes: Ghi chú (lý do failed nếu có)
  - version + metadata JSONB (chuẩn toàn hệ thống)
```

---

## 9. Tích Hợp Ngoài — WAY4 & T24

### 9.1 Khi Nào Gọi WAY4?

| Sự Kiện | Action WAY4 | Phương thức |
|---|---|---|
| TID được tạo | Register Terminal | Async (Kafka Outbox) |
| MID được tạo | Register Merchant Contract | Async |
| Device DEPLOYED (gắn TID) | Update Terminal Status → ACTIVE | Async |
| Device RETURNED (tháo TID) | Update Terminal Status → INACTIVE | Async |
| Merchant ACTIVE | Activate Merchant | Async |
| Merchant SUSPENDED | Suspend Merchant | Async |

### 9.2 Khi Nào Gọi T24?

| Sự Kiện | Action T24 | Phương thức |
|---|---|---|
| Tạo MID (nhập t24_account_id) | Verify Account Number | Sync (realtime verify) |
| Merchant onboard | Lookup Customer by t24_customer_id | Sync |
| Fee settlement (định kỳ) | Post Fee Entry to Account | Async (Batch) |

### 9.3 Error Handling Integration

```
WAY4/T24 call thất bại:
  → Log lỗi vào integration_errors table
  → Set retry_count, next_retry_at
  → Alert nếu retry_count > 3
  → Operator xử lý thủ công qua màn Monitoring

ErrorCode:
  POS-9001: WAY4 connection error
  POS-9002: WAY4 rejected request
  POS-9003: T24 connection error
  POS-9004: T24 customer not found
  POS-9005: T24 fee settlement failed
```

---

## 10. Business Rules Tổng Hợp — Quick Reference

| Rule | Áp dụng cho | Enforce tại |
|---|---|---|
| KHÔNG deactivate Device Model nếu còn device tham chiếu | Device Model | Service layer + ErrorCode POS-2008 |
| 1 TID chỉ gắn 1 Device tại một thời điểm | TID, Device | DB unique index + Optimistic Lock |
| Serial Number theo format của Model | Device | Service layer sinh serial từ `model.serial_prefix` |
| `version` BIGINT bắt buộc mọi bảng | Toàn hệ thống | DB schema + `@Version` JPA |
| `metadata JSONB` bắt buộc mọi bảng nghiệp vụ | Toàn hệ thống | DB schema |
| Maker không được tự Checker | Approval | ApprovalService.validate() |
| Idempotency key bắt buộc cho write quan trọng | Assignment, Approval | X-Idempotency-Key header |
| Data Scope: user chỉ thấy dữ liệu Business Unit mình | Mọi màn hình | Repository layer filter |
| WAY4 sync bất đồng bộ (không block user) | TID/MID/Device | Outbox Pattern → Kafka |
| T24 account verify đồng bộ (block khi tạo MID) | MID | RestClient sync call |

