# POS Terminal & Merchant Management System — Tầm Nhìn Dự Án (Project Vision)

Tài liệu này xác định tầm nhìn, phạm vi nghiệp vụ, mục tiêu kỹ thuật và các ràng buộc cốt lõi của **POS Terminal & Merchant Management System** — hệ thống quản lý vòng đời thiết bị POS và Merchant dành cho Banking Enterprise, được xây dựng để mô phỏng môi trường thực tế tại ngân hàng.

Đây là kim chỉ nam để lập trình viên và AI Agents đưa ra quyết định thiết kế nhất quán trong suốt các Sprint.

---

## 1. Tuyên Bố Tầm Nhìn (Vision Statement)

> "Xây dựng một **POS Management Platform** đầy đủ nghiệp vụ banking — quản lý vòng đời thiết bị POS từ nhập kho đến thanh lý, quản lý Merchant/TID, phê duyệt đa cấp, phân quyền theo vai trò và đơn vị kinh doanh — đủ để áp dụng trực tiếp vào môi trường ngân hàng thực tế."

**POS Management** không phải là CRUD app thông thường. Đây là một hệ thống Banking Enterprise với:

- **Device Lifecycle Management:** Vòng đời thiết bị POS từ `INSTOCK` → `DEPLOYED` → `RETURNED` → `REPAIRING` → `DISPOSED`
- **Merchant & TID Management:** Quản lý Merchant lifecycle, Terminal ID, Multi-Merchant
- **Inventory Management:** Stock Ledger, nhập/xuất kho, Purchase Order, kiểm kê
- **Approval Workflow:** Phê duyệt đa cấp (Maker-Checker) cho các nghiệp vụ quan trọng
- **Assignment Lifecycle:** Cấp phát, thu hồi, điều chuyển thiết bị với lịch sử bất biến
- **Fee Policy Management:** Chính sách phí áp dụng cho Merchant theo Effective Dating
- **RBAC + Data Scope:** Phân quyền theo vai trò và đơn vị kinh doanh
- **Event-Driven Architecture:** Kafka Outbox Pattern cho mọi nghiệp vụ quan trọng
- **Observability:** Distributed Tracing, Audit Trail bất biến, Monitoring Dashboard

---

## 2. Hiểu Đúng Bài Toán Nghiệp Vụ

### 2.1 Quan Hệ Cốt Lõi: Merchant → MID → TID → Device

> **Mô Hình Chuẩn Banking:** 1 Merchant → Nhiều MID → Nhiều TID → 1 Device

```
Merchant ABC
  ├── MID: M000001 (Hội sở HCM)
  │     ├── TID: T100001 → Device: PAX A920 (SN-PAX-000001)
  │     └── TID: T100002 → Device: Ingenico iCT220 (SN-ING-000002)
  └── MID: M000002 (Chi nhánh Hà Nội)
        └── TID: T100003 → Device: Verifone VX520 (SN-VFN-000003)
```

| Khái Niệm | Ý Nghĩa | Quan hệ |
|---|---|---|
| Merchant | Doanh nghiệp chấp nhận thanh toán | 1 Merchant → N MID |
| MID | Merchant ID — định danh tài khoản merchant tại ngân hàng | 1 MID → N TID |
| TID | Terminal ID — định danh điểm chấp nhận thanh toán | 1 TID → 1 Device |
| Device | Thiết bị POS vật lý (máy quẹt thẻ) | 1 Device/TID tại 1 thời điểm |
| Serial Number | Số định danh **theo Model** — prefix xác định bởi Device Model | |
| Vendor | Nhà cung cấp thiết bị (PAX, Ingenico, Verifone...) | |
| MCC | Merchant Category Code — mã phân loại ngành nghề Merchant | |
| WAY4 | WAY4 Card Management Platform — hệ thống xử lý giao dịch thẻ | |
| T24 | Temenos T24 Core Banking — hệ thống core banking | |

### 2.2 Vòng Đời Thiết Bị POS (Device Lifecycle State Machine)

```
         Nhập kho
            ↓
         INSTOCK ←────────── Sửa thành công / Nghiệm thu
            │
            │ Phiếu xuất được duyệt
            ↓
     OUT_OF_WAREHOUSE
            │
            │ Hoàn tất triển khai
            ↓
          DEPLOYED ──→ Thu hồi → RETURNED
                                    │
                                    ├── Đạt yêu cầu → INSTOCK (tái sử dụng)
                                    │
                                    └── Có lỗi → REPAIRING
                                                    │
                                                    ├── Sửa thành công → INSTOCK
                                                    │
                                                    └── Không thể sửa → DISPOSED (kết thúc)
```

### 2.3 Trạng Thái Phiếu Phê Duyệt (Approval States)

```
DRAFT → PENDING_APPROVAL → PENDING_LEVEL_2 → APPROVED → EXECUTING → COMPLETED
                                            ↘ REJECTED
                                            ↘ RETURNED_FOR_EDIT → PENDING_APPROVAL
DRAFT → CANCELLED (hủy bởi người tạo)
```

---

## 3. Mục Tiêu Kỹ Thuật (Engineering Objectives)

| Bài Toán | Giải Pháp |
|---|---|
| Hai nhân viên cùng cấp phát một thiết bị | Optimistic Lock (`@Version`) + DB Unique Constraint |
| Nhấn "Assign" hai lần | Idempotency Key + Redis SETNX |
| Kafka publish fail sau DB commit | Transactional Outbox Pattern |
| Consumer Kafka chết giữa chừng | At-Least-Once + Idempotent Consumer |
| Phê duyệt trên dữ liệu đã thay đổi | Optimistic Lock trên phiếu phê duyệt + version check |
| Người tạo tự duyệt yêu cầu của mình | Business rule enforcement trong Approval Service |
| Tra cứu thiết bị theo serial | Indexed search + Redis cache |
| Audit trail toàn bộ thao tác | Immutable audit_logs (append-only) |
| Phân quyền theo đơn vị kinh doanh | Data Scope: RBAC + Business Unit filter |
| Đồng bộ trạng thái thiết bị đa module | Event-Driven via Kafka |
| Thiết bị đã DISPOSED không được tái triển khai | State Machine với allowed transitions |
| Đồng bộ giao dịch với WAY4 | REST Client integration với WAY4 Card Management |
| Đồng bộ tài khoản với T24 | REST Client integration với Temenos T24 Core Banking |
| Activate/Deactivate Device Model | KHÔNG cho phép nếu còn device đang tham chiếu (INSTOCK/DEPLOYED/REPAIRING) |
| Vận chuyển thiết bị liên kho | Logistics Tracking với trạng thái và tracking number |
| Serial number theo model | Serial prefix cấu hình ở level Device Model, không phải từng device |
| Thuộc tính mở rộng chưa chuẩn hóa | `metadata JSONB` trên mọi bảng nghiệp vụ |
| Race condition cập nhật dữ liệu | `version BIGINT` (Optimistic Lock) trên mọi bảng nghiệp vụ |
| Quan hệ TID-MID chuẩn banking | **1 Merchant → N MID → N TID → 1 Device** (không phải 1 TID → N MID) |


---

## 4. Phạm Vi Nghiệp Vụ (Business Scope)

### ✅ Nằm Trong Phạm Vi (In-Scope)

#### Module A — Quản Lý Danh Mục (Catalog)
- Device Category (Nhóm thiết bị: POS, mPOS, SoftPOS...)
- Device Type (Loại: Cố định, Di động, Không dây...)
- Device Model (PAX A920, Ingenico iCT220, Verifone VX520...)
- Vendor (Nhà cung cấp: PAX, Ingenico, Verifone, VinaLab...)
- MCC (Merchant Category Code — ISO 18245)
- Business Unit (Chi nhánh, đơn vị kinh doanh)
- Fee Policy (Chính sách phí với Effective Dating)
- Purchase Order (Đơn đặt hàng từ Vendor)

#### Module B — Quản Lý Kho (Inventory)
- Nhập kho từ Purchase Order (cần xác nhận)
- Xuất kho thiết bị (cần phê duyệt đa cấp)
- Stock Ledger — lịch sử biến động kho bất biến (IMPORT/EXPORT/TRANSFER/RETURN/ADJUSTMENT)
- Điều chuyển giữa các kho (cần phê duyệt)
- Tồn kho — tra cứu số lượng tồn theo kho, model, status
- Kiểm kê định kỳ

#### Module C — Quản Lý Merchant, MID & TID
- Merchant lifecycle (Tạo, cập nhật, Active/Inactive/Suspended)
- **Merchant ID (MID):** Mỗi Merchant có thể có nhiều MID (theo chi nhánh, loại hình)
- **Terminal ID (TID):** Mỗi MID có thể có nhiều TID (terminal POS vật lý)
- 1 TID gắn với đúng 1 Device tại một thời điểm
- Gắn MCC với Merchant
- Fee Policy gắn với Merchant (Effective Dating)
- WAY4 MID/TID mapping — đồng bộ với WAY4 Card Management
- T24 Customer/Account mapping — đồng bộ với Temenos T24

#### Module D — Quản Lý Thiết Bị (Device)
- Tra cứu thiết bị theo Serial, Model, Vendor, Status, Warehouse
- Device Lifecycle State Machine (6 trạng thái + allowed transitions)
- Device Lifecycle History (lịch sử vòng đời bất biến)
- Repair Management (đơn sửa chữa, kết quả nghiệm thu)
- Chi tiết thiết bị với 8 tab: Thông tin chung | Trạng thái | Merchant | Vòng đời | Assignment | Sửa chữa | Lịch sử kho | Audit Log

#### Module E — Quản Lý Assignment
- Cấp phát thiết bị cho Merchant/TID (concurrent-safe với Optimistic Lock)
- Thu hồi thiết bị (cần phê duyệt)
- Điều chuyển thiết bị giữa Merchant
- Assignment History (bất biến, append-only)
- Kiểm tra thiết bị đã được cấp phát trước khi assign

#### Module F — Approval Workflow (Phê Duyệt Đa Cấp)
- Phê duyệt 2 cấp cho: Xuất kho, Thu hồi, Điều chuyển, Thanh lý
- Phê duyệt 1 cấp cho: Nhập kho xác nhận, Sửa chữa nghiệm thu
- Inbox (Hộp việc cần duyệt) với badge counter
- Tất cả yêu cầu / Yêu cầu tôi tạo / Lịch sử phê duyệt
- Cấu hình quy trình phê duyệt theo loại nghiệp vụ

#### Module G — Giám Sát & Báo Cáo (Monitoring)
- Dashboard tổng quan: KPIs thiết bị, kho, assignment, merchant
- Giám sát hệ thống POS: trạng thái thiết bị real-time
- Kafka event monitor (Outbox events)
- Audit Log: nhật ký bất biến mọi thao tác
- Báo cáo kho, thiết bị, assignment theo ngày/tháng

#### Module H — Quản Trị Hệ Thống (Administration)
- User Management
- Role & Permission Management (RBAC)
- Business Unit & Warehouse Management
- System Configuration

### ❌ Nằm Ngoài Phạm Vi (Non-Scope)

- Giao dịch thanh toán tại POS thực tế
- Kết nối NAPAS/Visa/Mastercard thực
- Hardware driver điều khiển thiết bị POS
- Mobile App (tập trung Web Admin)
- ERP integration thực

---

## 5. Ràng Buộc Công Nghệ (Technology Stack)

### Backend (Java)
| Thành Phần | Công Nghệ | Lý Do |
|---|---|---|
| Runtime | Java 21 LTS | Virtual Threads, Records |
| Framework | Spring Boot 3.3+ | Banking-grade, mature |
| Architecture | Modular Monolith | Học domain trước khi tách Microservices |
| Security | Spring Security 6 + JWT + RBAC | Standard banking |
| ORM | Spring Data JPA + Hibernate 6 | Optimistic Lock, Auditing |
| Database | PostgreSQL 16 | ACID, performance |
| Cache | Redis 7 | Session, Idempotency, Cache |
| Messaging | Apache Kafka 3.6+ | Event-Driven, Outbox Pattern |
| Migration | Flyway | Schema versioning |
| Resilience | Resilience4j | Circuit Breaker, Retry |
| Build | Maven (multi-module) | Monorepo |
| Container | Docker + Docker Compose | Local dev |
| API Doc | OpenAPI 3 / Swagger | Documentation |
| Observability | OpenTelemetry + Prometheus + Grafana | Monitoring |
| Testing | JUnit 5 + Mockito + Testcontainers | Quality |
| Distributed Lock | Redisson | Concurrent assignment |

### Frontend (Angular)
| Thành Phần | Công Nghệ | Lý Do |
|---|---|---|
| Framework | Angular 22 (Standalone, Signals) | Banking admin stack |
| State | NgRx + Signals | Enterprise state management |
| UI | Angular Material + SCSS | Admin UI chuẩn |
| HTTP | HttpClient + Interceptors | JWT, error handling |
| Routing | Lazy Loading + Route Guards | Performance, RBAC |
| Charts | ApexCharts | Dashboard, monitoring |
| Forms | Angular Reactive Forms | Complex form validation |

---

## 6. Quy Định Code & Phỏng Vấn

> **Mọi kỹ thuật khi xây dựng đều phải trả lời câu hỏi "Tại sao?" thông qua Javadoc tiếng Việt.**

1. **Không viết code giả:** `// TODO`, `return null`, `throw new UnsupportedOperationException()` — bị cấm tuyệt đối.
2. **Mỗi tính năng trong Sprint phải chạy được** và tích hợp với Docker Compose.
3. **Sau mỗi Sprint** hệ thống phải compile, pass tests.
4. **Tư duy banking:** *"Nếu service này chết giữa chừng thì sao?"* → trả lời bằng code.
5. **Interview-ready:** Giải thích mọi design decision bằng sơ đồ sequence hoặc whiteboard.

---

## 7. Ma Trận Vai Trò × Quyền Hạn

| Role | Catalog | Inventory | Merchant | Device | Assignment | Fee | Approval | Admin |
|---|---|---|---|---|---|---|---|---|
| SUPER_ADMIN | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| INVENTORY_MANAGER | 🔍 View | ✅ Full | 🔍 View | 🔍 View | 🔍 View | 🔍 View | ✅ Approve L1+L2 | ❌ |
| INVENTORY_STAFF | 🔍 View | ✏️ Create/Submit | 🔍 View | 🔍 View | ❌ | ❌ | ✏️ Submit | ❌ |
| MERCHANT_MANAGER | 🔍 View | 🔍 View | ✅ Full | 🔍 View | 🔍 View | ✅ Full | ✅ Approve L1 | ❌ |
| DEVICE_OPERATOR | 🔍 View | 🔍 View | 🔍 View | ✅ Full | ✏️ Create | 🔍 View | ✏️ Submit | ❌ |
| ASSIGNMENT_OPERATOR | 🔍 View | 🔍 View | 🔍 View | 🔍 View | ✅ Full | 🔍 View | ✏️ Submit | ❌ |
| FEE_MANAGER | 🔍 View | 🔍 View | 🔍 View | 🔍 View | 🔍 View | ✅ Full | ✅ Approve | ❌ |
| AUDITOR | 🔍 View | 🔍 View | 🔍 View | 🔍 View | 🔍 View | 🔍 View | 🔍 View | ❌ |
| VIEWER | 🔍 View | 🔍 View | 🔍 View | 🔍 View | 🔍 View | 🔍 View | ❌ | ❌ |

> **Data Scope:** Mỗi user chỉ thấy dữ liệu thuộc Business Unit của mình, trừ SUPER_ADMIN thấy toàn hệ thống.
