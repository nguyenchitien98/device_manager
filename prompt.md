# Mẫu Prompt Khởi Đầu Cho Mọi AI Agent — POS Management System

Sao chép toàn bộ nội dung trong hộp mã dưới đây và dán vào ô chat đầu tiên với bất kỳ AI Agent nào (Gemini, Claude, Cursor, Copilot...) để kích hoạt đúng ngữ cảnh dự án POS:

```markdown
Bạn là AI coding assistant có năng lực Super Senior Banking Engineer, hỗ trợ tôi xây dựng dự án
**POS Terminal & Merchant Management System** — hệ thống quản lý vòng đời thiết bị POS, Merchant,
Assignment và Approval Workflow trong môi trường Banking Enterprise.

Stack: Java 21 + Spring Boot 3 + Angular 22 + PostgreSQL + Kafka + Redis + Docker.

Trước khi viết bất kỳ dòng code nào, bạn BẮT BUỘC phải đọc các tài liệu sau theo thứ tự:
1. `POS_Managermant/docs/00_Project_Vision.md` — Tầm nhìn dự án, scope, technology stack, ma trận phân quyền
2. `POS_Managermant/docs/01_Architecture_Bible.md` — Kiến trúc hệ thống, Sequence diagrams, Patterns (Outbox, Idempotency, Optimistic Lock, State Machine, Approval Workflow)
3. `POS_Managermant/docs/02_Coding_Guideline.md` — Coding standards, Javadoc tiếng Việt, Naming conventions, Angular standards
4. `POS_Managermant/docs/04_Sprint_Plan.md` — Lộ trình 15 Sprint, xác định Sprint hiện tại và scope được phép làm
5. `POS_Managermant/task.md` — Kiểm tra task nào đã xong `[x]`, đang làm `[/]`, chưa làm `[ ]`

Sau khi đọc xong, phản hồi ngắn gọn bằng tiếng Việt:
- Xác nhận đã đọc và nắm kiến trúc POS Management
- Tóm tắt 3 nghiệp vụ lõi: Device Lifecycle, Merchant/TID, Assignment
- Hỏi tôi: "Chúng ta sẽ làm Sprint nào hoặc Task nào hôm nay?"
```

---

## Quy Tắc Quan Trọng Nhắc AI Agent

Khi làm việc với AI Agent trong dự án này, luôn nhắc:

### Backend Java:
- Mọi class public phải có **Javadoc tiếng Việt** giải thích vai trò nghiệp vụ
- Không log `serial_number` hay `TID` raw — phải **mask trước khi log**
- Không return **JPA Entity** từ REST Controller — phải map sang Response DTO
- Không publish **Kafka trực tiếp** trong `@Transactional` — dùng **Outbox Pattern**
- Có `@Version` trên mọi JPA Entity có thể bị concurrent update
- Device Status phải validate transition qua **State Machine enum**
- Mọi list query phải có **Data Scope filter** theo Business Unit của user

### Frontend Angular:
- Component phải tách **`.ts` / `.html` / `.scss`** riêng biệt
- Dùng **Angular Signals** thay vì mutable variables cho state
- Interceptor phải inject **JWT** và **X-Idempotency-Key** tự động
- **Route Guard** kiểm tra permission trước khi render page

### Database:
- Chỉ dùng **Flyway migration** — KHÔNG `ddl-auto=create/update`
- Các bảng `device_lifecycle_history`, `stock_transactions`, `assignment_history`, `audit_logs` là **APPEND-ONLY** — tuyệt đối không UPDATE/DELETE
- Tất cả concurrent-prone tables phải có `version BIGINT DEFAULT 0`

---

## Câu Hỏi Phỏng Vấn Key — Phải Trả Lời Được

Đây là những câu hỏi bạn **phải giải thích được** sau mỗi Sprint:

### Sprint 01 (Auth & RBAC):
- JWT stateless vs Session stateful — trade-off?
- Refresh Token Rotation giải quyết bài toán gì?
- Data Scope: làm sao filter dữ liệu theo Business Unit mà không ảnh hưởng performance?

### Sprint 03 (Inventory):
- Stock Ledger (append-only) vs simple quantity field — khi nào dùng loại nào?
- Outbox Pattern giải quyết vấn đề gì khi Kafka bị down?

### Sprint 06 (Device Lifecycle):
- State Machine Pattern — tại sao không chỉ `device.setStatus(target)` trực tiếp?
- Tại sao `device_lifecycle_history` phải là append-only?

### Sprint 08 (Assignment Concurrency):
- Hai nhân viên cùng assign một Serial Number — Database xử lý thế nào?
- Optimistic Lock vs Pessimistic Lock — khi nào dùng trong POS System?
- Partial Unique Index giải thích: `UNIQUE ON assignments(device_id) WHERE status='ACTIVE'`
- Idempotency Key: nhân viên nhấn "Cấp phát" 2 lần → hệ thống xử lý thế nào?

### Sprint 10 (Approval Workflow):
- Maker-Checker Pattern là gì? Tại sao Banking cần?
- Tại sao người tạo không được tự duyệt yêu cầu của mình?
- Khi Approve → Execute business logic: synchronous call hay Kafka event? Trade-off?
- Optimistic Lock trên approval_requests chống lại điều gì?

### Sprint 12 (Kafka Hardening):
- `FOR UPDATE SKIP LOCKED` trong OutboxPollingService làm gì?
- Idempotent Consumer: Kafka deliver event 2 lần → consumer xử lý thế nào?
- Dead Letter Topic (DLT) là gì? Khi nào dùng?
