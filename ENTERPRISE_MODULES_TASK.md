# POS Management System — Enterprise Extensions Task Tracker (ENTERPRISE_MODULES_TASK.md)

> **Tài liệu nhiệm vụ mở rộng cấp Doanh nghiệp Banking (Enterprise Level)**
> Format: `[x]` done, `[/]` in progress, `[ ]` todo.
> **Quy tắc AI Antigravity Agent:** Đọc file này kết hợp với [AI_MODULE_IMPLEMENTATION_GUIDE.md](./AI_MODULE_IMPLEMENTATION_GUIDE.md) TRƯỚC KHI CODE bất kỳ module nâng cấp nào.

---

## 📊 TRẠNG THÁI TỔNG QUAN TÍNH NĂNG DOANH NGHIỆP (ENTERPRISE EXTENSIONS)

```text
Sprint E1 (Schema Expansion):           15/15 tasks [100%]  ← ĐÃ HOÀN THÀNH
Sprint E2 (Module SIM/SAM Card):        18/18 tasks [100%]  ← ĐÃ HOÀN THÀNH
Sprint E3 (Module Inactivity Alert):   16/16 tasks [100%]  ← ĐÃ HOÀN THÀNH
Sprint E4 (Module HSM Key Injection):  16/16 tasks [100%]  ← ĐÃ HOÀN THÀNH
Sprint E5 (Module Field Service CRM):  20/20 tasks [100%]  ← ĐÃ HOÀN THÀNH
Sprint E6 (Module Tariff & Rental Fee):18/18 tasks [100%]  ← ĐÃ HOÀN THÀNH
OVERALL: 103/103 tasks (100%) — ENTERPRISE ROADMAP COMPLETED 🚀
```

---

## 🚀 QUY TRÌNH THỰC THI CHO AI AGENT (EXECUTION PIPELINE)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PROMPT GIAO CHO AI AGENT (Copy nguyên văn để chạy từng task):                          │
│                                                                                        │
│ "Đọc kỹ AGENTS.md, AI_MODULE_IMPLEMENTATION_GUIDE.md, và ENTERPRISE_MODULES_TASK.md.  │
│  Hãy thực hiện task [MÃ_TASK] trong Sprint [TÊN_SPRINT].                               │
│  Tuân thủ chuẩn Clean Architecture, Angular 22 Signals, OnPush, 100% Shared UI        │
│  Components (pos-button, pos-input, pos-table, pos-select, pos-modal...).             │
│  Sau khi code xong, chạy 'mvn clean verify' và 'npm run build', kiểm tra 0 lỗi rồi      │
│  tick [x] vào ENTERPRISE_MODULES_TASK.md."                                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ SPRINT E1 — Triển khai Mở Rộng Schema Database (Enterprise Field Expansion)

### 1. Backend Migration & Database (Flyway V15)

- `[x]` Tạo Flyway `V15__expand_enterprise_fields.sql`:
  - Bổ sung vào `merchants`: `tax_code`, `legal_rep_name`, `legal_rep_id_card`, `business_license_no`, `bank_account_no`, `bank_account_name`, `bank_code`, `risk_level`, `sales_owner_id`, `contract_no`, `contract_sign_date`.
  - Bổ sung vào `devices`: `sim_card_no`, `sim_phone_no`, `telco`, `sam_card_serial`, `pci_pts_expiry_date`, `key_injected_status`, `key_injected_at`, `mac_address`.
  - Bổ sung vào `terminal_ids`: `terminal_type`, `currency`, `max_amount_per_tx`, `allow_contactless`, `allow_qr`, `settlement_cycle`, `last_transaction_at`.
  - Bổ sung vào `assignments`: `installation_address`, `latitude`, `longitude`, `technician_user_id`, `handover_doc_no`, `handover_doc_url`, `monthly_rental_fee`.
- `[x]` Cập nhật JPA Entity: `MerchantJpaEntity`, `DeviceJpaEntity`, `TerminalJpaEntity`, `AssignmentJpaEntity`.
- `[x]` Cập nhật DTO Request/Response trong package `com.banking.pos.*.dto`.
- `[x]` Cập nhật Mappers (MapStruct / Manual DTO converter).
- `[x]` Cập nhật các API Controller `MerchantController`, `CatalogDeviceController`, `TerminalController`, `AssignmentController` để trả về các field mới.

### 2. Frontend Integration

- `[x]` Cập nhật TypeScript Interfaces: `Merchant`, `Device`, `Terminal`, `Assignment` trong `src/app/core/models/`.
- `[x]` Cập nhật UI màn hình `Merchant Detail` (Tab Pháp lý & Tài khoản ngân hàng settlement).
- `[x]` Cập nhật UI màn hình `Merchant Form Modal` (Thêm input Mã số thuế, Ngân hàng, Tài khoản T24, Mức rủi ro AML).
- `[x]` Cập nhật UI màn hình `Device Detail` (Tab Thông số SIM 4G, Thẻ SAM & Chứng chỉ PCI PTS).
- `[x]` Cập nhật UI màn hình `Terminal Detail` (Tab Cấu hình Hạn mức & Phương thức Chạm/QR).
- `[x]` Cập nhật UI màn hình `Assignment Modal` (Thêm Tọa độ GPS, Địa chỉ lắp đặt, Kỹ thuật viên phụ trách, Phí thuê máy).
- `[x]` Chạy test `mvn clean verify` và `npm run build` 0 lỗi.

---

## 📱 SPRINT E2 — Module 1: Quản Lý SIM 4G & Thẻ SAM (Telecom Inventory)

> **Mục tiêu:** Quản lý toàn bộ kho SIM 4G (Viettel, Vina, Mobi) và thẻ SAM mã hóa lắp trên thiết bị POS di động, quản lý cước phí và vòng đời SIM.

### 1. Database & Backend

- `[x]` Tạo Flyway `V16__create_telecom_tables.sql`:
  - Bảng `sim_cards` (id, sim_serial, phone_number, telco, status [INSTOCK/ASSIGNED/SUSPENDED/EXPIRED/DISPOSED], package_name, monthly_fee, expiry_date, current_device_id FK, created_at, updated_at).
  - Bảng `sam_cards` (id, sam_serial, sam_type, status [INSTOCK/ASSIGNED/DISPOSED], current_device_id FK, created_at, updated_at).
  - Bảng `sim_ledger` (id, sim_card_id, action_type [IMPORT/ASSIGN/UNASSIGN/SUSPEND/RENEW], device_id, performed_by FK, notes, occurred_at).
- `[x]` JPA Entities: `SimCardJpaEntity`, `SamCardJpaEntity`.
- `[x]` Repositories: `SimCardJpaRepository`, `SamCardJpaRepository`.
- `[x]` Service Layer: `TelecomService` (Nhập kho SIM theo lô, Gắn SIM vào máy POS, Gỡ SIM, Cảnh báo SIM sắp hết hạn, Khóa SIM).
- `[x]` Controller Layer: `TelecomController` (`/api/v1/telecom/sims`, `/api/v1/telecom/sams`).

### 2. Frontend

- `[x]` Model: `telecom.model.ts`.
- `[x]` Service: `TelecomService` (Angular Signal-driven API service).
- `[x]` UI Screen: `sim-list.component` (Bảng quản lý danh sách SIM 4G, bộ lọc Nhà mạng/Trạng thái/Hạn dùng, dùng `<pos-table>`, `<pos-badge>`, `<pos-pagination>`).
- `[x]` UI Modal: `sim-create-modal` (Modal nhập kho SIM mới).
- `[x]` Sidebar Menu Integration: Thêm mục "Quản Lý SIM & SAM" dưới Menu Kho Hàng (Inventory).
- `[x]` Chạy test verification 0 lỗi.

---

## 🔔 SPRINT E3 — Module 2: Giám Sát POS "Chết" & Cảnh Báo Doanh Số (POS Inactivity & Revenue Alert)

> **Mục tiêu:** Tự động phát hiện các máy POS không phát sinh giao dịch quẹt thẻ trong 30/60/90 ngày để nhắc nhở Merchant hoặc tạo Phiếu Thu Hồi Máy tự động nhằm tối ưu tài sản.

### 1. Database & Backend

- `[x]` Tạo Flyway `V17__create_inactivity_alert_tables.sql`:
  - Bảng `inactivity_configs` (id, threshold_days [30/60/90], auto_recall_days, warning_message, is_active).
  - Bảng `inactivity_alerts` (id, terminal_id FK, merchant_id FK, device_id FK, days_inactive, last_tx_at, status [NEW/NOTIFIED/RECALLED/DISMISSED], resolved_at, resolved_by FK, notes, created_at).
- `[x]` JPA Entities: `InactivityAlertJpaEntity`.
- `[x]` Repositories: `InactivityAlertJpaRepository`.
- `[x]` Service Layer: `POSInactivityService` (Quét POS inactive, tạo bản ghi Cảnh báo, Kích hoạt quy trình Thu hồi tự động qua `ApprovalRequest`).
- `[x]` Controller Layer: `POSInactivityController` (`GET /api/v1/monitoring/inactivity/alerts`, `POST /api/v1/monitoring/inactivity/alerts/{id}/trigger-recall`).

### 2. Frontend

- `[x]` Model: `inactivity.model.ts`.
- `[x]` Service: `InactivityService`.
- `[x]` UI Screen: `inactivity-alert-list.component` (Danh sách Cảnh báo POS inactive, Nút "Tạo phiếu thu hồi máy").
- `[x]` Router Registration & Sidebar Menu Integration.
- `[x]` Chạy test verification 0 lỗi.

---

## 🔐 SPRINT E4 — Module 3: Phòng Nạp Khóa Bảo Mật HSM (Key Injection & PCI DSS Workflow)

> **Mục tiêu:** Quản lý quy trình đưa máy POS trắng vào Phòng Bảo Mật HSM để nạp khóa Terminal Master Key (TMK) trước khi bàn giao cho Merchant, đáp ứng tiêu chuẩn PCI DSS.

### 1. Database & Backend

- `[x]` Tạo Flyway `V18__create_key_injection_tables.sql`:
  - Bảng `key_injection_orders` (id, order_number, device_id FK, hsm_profile_id, status [PENDING/INJECTING/SUCCESS/FAILED], injected_by FK, approved_by FK, hsm_response_code, created_at, updated_at).
  - Bảng `hsm_security_logs` (id, order_id FK, device_serial, key_type [TMK/TPK/TAK], checksum, performed_at, ip_address).
- `[x]` JPA Entities: `KeyInjectionOrderJpaEntity`.
- `[x]` Repositories: `KeyInjectionOrderJpaRepository`.
- `[x]` Service Layer: `KeyInjectionService` (Tạo lệnh nạp khóa, Verify Checksum, Cập nhật `key_injected_status` trên `devices`).
- `[x]` Controller Layer: `KeyInjectionController` (`/api/v1/security/key-injections`, `POST /{id}/execute`).

### 2. Frontend

- `[x]` Model: `key-injection.model.ts`.
- `[x]` Service: `KeyInjectionService`.
- `[x]` UI Screen: `key-injection-list.component` (Bảng quản lý Lệnh nạp khóa bảo mật, Nút "Nạp Khóa HSM").
- `[x]` Router Registration & Sidebar Menu Integration.
- `[x]` Chạy test verification 0 lỗi.

---

## 🛠️ SPRINT E5 — Module 4: Quản Lý Sự Cố & Kỹ Thuật Viên Địa Bàn (Field Service CRM & Ticket System)

> **Mục tiêu:** Quản lý các yêu cầu hỗ trợ từ Merchant (Hỏng máy, hết giấy, hỏng sạc, lỗi SIM), phân công Kỹ thuật viên đi bàn giao/sửa chữa tại chỗ kèm Biên bản điện tử.

### 1. Database & Backend

- `[x]` Tạo Flyway `V19__create_field_service_tables.sql`:
  - Bảng `maintenance_tickets` (id, ticket_number, merchant_id FK, terminal_id FK, device_id FK, issue_type [HARDWARE/SOFTWARE/PAPER/SIM/REPLACEMENT], priority [LOW/MEDIUM/HIGH/URGENT], status [OPEN/ASSIGNED/IN_PROGRESS/RESOLVED/CLOSED], description, technician_id FK, resolution_notes, handover_doc_url, created_at, updated_at).
  - Bảng `ticket_activities` (id, ticket_id FK, actor_id FK, action, comment, created_at).
- `[x]` JPA Entities & Repositories.
- `[x]` Service Layer: `FieldServiceTicketService` (Tạo Ticket, Phân công kỹ thuật viên, Cập nhật tiến độ sửa chữa, Đổi máy tại chỗ, Upload biên bản nghiệm thu).
- `[x]` Controller Layer: `TicketController` (`/api/v1/tickets`, `POST /{id}/assign`, `PUT /{id}/resolve`).

### 2. Frontend

- `[x]` Model & Service: `ticket.model.ts`, `TicketService`.
- `[x]` UI Screen: `ticket-list.component` (Bảng quản lý Yêu cầu hỗ trợ, bộ lọc Độ ưu tiên & Trạng thái).
- `[x]` UI Screen & Component: `ticket-list.component.ts|html|scss` registered at `/crm/tickets`.
- `[x]` Sidebar Menu Integration.
- `[x]` Chạy test verification 0 lỗi.

---

## 💰 SPRINT E6 — Module 5: Tính Phí Thuê Máy & Phạt Doanh Số Tự Động (Tariff & Rental Fee Engine)

> **Mục tiêu:** Cấu hình chính sách miễn/giảm phí thuê máy POS dựa trên doanh số quẹt thẻ hàng tháng, tự động lập danh sách trích nợ tài khoản Merchant qua Core T24.

### 1. Database & Backend

- `[x]` Tạo Flyway `V20__create_rental_fee_tables.sql`:
  - Bảng `rental_fee_policies` (id, code, name, min_monthly_volume, monthly_rental_fee, penalty_fee, is_active).
  - Bảng `monthly_fee_charges` (id, period [YYYY-MM], merchant_id FK, terminal_id FK, actual_volume, fee_amount, status [PENDING/CHARGED/FAILED/WAIVED], t24_reference_no, charged_at).
- `[x]` JPA Entities & Repositories.
- `[x]` Service Layer: `RentalFeeEngineService` (Tính toán doanh số quẹt thẻ tháng, Đối chiếu policy, Tạo lệnh trích nợ T24 qua Outbox Pattern).
- `[x]` Controller Layer: `RentalFeeController` (`/api/v1/finance/rental-fees/policies`, `/api/v1/finance/rental-fees/charges`, `POST /calculate-period`).

### 2. Frontend

- `[x]` Model & Service: `rental-fee.model.ts`, `RentalFeeService`.
- `[x]` UI Screen: `rental-fee-policy-list.component` (Cấu hình chính sách miễn phí thuê máy theo doanh số, Bảng trích nợ T24).
- `[x]` Router Registration & Sidebar Menu Integration.
- `[x]` Chạy test verification 0 lỗi.

---

## ✅ GATE NGHIỆM THU CUỐI CÙNG (FINAL CHECKLIST)

- `[x]` Tất cả 6 Flyway scripts (`V15` đến `V20`) chạy thành công trên Database.
- `[x]` Lệnh `mvn clean verify` trên backend trả về BUILD SUCCESS, 0 lỗi TypeScript / JPA / Compilation.
- `[x]` Lệnh `npm run build` trên frontend đạt kết quả SUCCESS, 0 lỗi CSS / SCSS / Angular Template.
- `[x]` Chạy `ng serve`, xác nhận tất cả các màn hình module mới hiển thị đẹp mắt, dual theme Dark/Light mode mịn màng, 100% dùng Shared UI Components.
