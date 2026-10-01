# 🚀 POS Management System (Quản Lý & Vận Hành Máy POS Ngân Hàng)

> **Hệ thống Quản lý Vòng đời & Vận hành Thiết bị POS** (Point of Sale Terminal Lifecycle & Inventory Management System) thiết kế chuẩn doanh nghiệp, phục vụ quản lý thiết bị thanh toán cho Ngân hàng và Chuỗi bán lẻ.

---

## 📌 1. Tổng Quan Dự Án

**POS Management System** giải quyết bài toán quản lý tài sản phần cứng (Thiết bị POS, SIM 3G/4G, Phụ kiện) với các đặc thù:
- **Theo dõi định danh duy nhất**: Mỗi máy POS được theo dõi chặt chẽ qua **Serial Number (S/N)** và **Terminal ID (TID)**.
- **Quy trình Phê duyệt Đa cấp (Maker-Checker)**: Mọi thao tác quan trọng (Cấp phát, Điều chuyển, Thanh lý, Kiểm kê) bắt buộc qua luồng Phê duyệt.
- **Phân quyền Scope Ngân hàng/Chi nhánh**: Đảm bảo phân vùng dữ liệu an toàn tuyệt đối theo từng Cấp đơn vị (HQ, Branch, Merchant).
- **Xuất Báo cáo & Excel Async**: Hỗ trợ xuất dữ liệu lớn với tiến trình chạy ngầm không gây block UI.

---

## 🛠 2. Công Nghệ Sử Dụng (Tech Stack)

| Phân Hệ | Công Nghệ / Thư Viện | Mô Tả |
| :--- | :--- | :--- |
| **Backend** | **Java 21+ / Spring Boot 3.2** | Core API Services, Spring Security, JPA/Hibernate |
| **Database** | **PostgreSQL 16** | Cơ sở dữ liệu quan hệ, Flyway migration |
| **Frontend** | **Angular 22** | Single Page Application, RxJS, Reactive Forms, Control Flow |
| **Security** | **JWT / Spring Security** | Stateless Authentication, RBAC + Scope-based Authorization |
| **Excel Core** | **Apache POI 5.2** | Stream-based Excel Export (`SXSSFWorkbook`) |
| **DevOps** | **Docker & Docker Compose** | Containerization môi trường Dev & Production |

---

## 📚 3. Bản Đồ Tài Liệu Dự Án (Documentation Index)

Toàn bộ thiết kế chi tiết của dự án được lưu trữ trong thư mục [`docs/`](file:///c:/Users/Admin/Desktop/POS_Manager/docs):

| File Tài Liệu | Tên Tài Liệu | Nội Dung Chính |
| :--- | :--- | :--- |
| [`00_Project_Vision.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/00_Project_Vision.md) | Vision & Scope | Tầm nhìn dự án, mục tiêu kinh doanh, phạm vi tính năng |
| [`01_Architecture_Bible.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/01_Architecture_Bible.md) | Kiến Trúc Hệ Thống | Mô hình 3-Tier, Layered Architecture, Security & Caching |
| [`02_Coding_Guideline.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/02_Coding_Guideline.md) | Quy Chuẩn Lập Trình | Naming convention, Exception handling, Code formatting |
| [`03_Backlog.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/03_Backlog.md) | Backlog & User Stories | Danh sách 28 User Stories (POS-001 đến POS-028) |
| [`04_Sprint_Plan.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/04_Sprint_Plan.md) | Kế Hoạch Sprint | Phân chia 15 Sprint triển khai dự án |
| [`05_AI_Coding_Guide.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/05_AI_Coding_Guide.md) | Hướng Dẫn Prompt AI | Prompt mẫu và quy tắc làm việc với AI Coding Agent |
| [`06_Database_Schema.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/06_Database_Schema.md) | Thiết Kế Dữ Liệu | Schema SQL 25+ bảng, ERD, Indexing, Enum Types |
| [`07_UI_UX_Standard.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/07_UI_UX_Standard.md) | UI/UX & Layout Spec | Design system, màu sắc, layout, Angular Message Library |
| [`08_Interview_QA.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/08_Interview_QA.md) | Q&A Nghiệp Vụ | Bộ câu hỏi kỹ thuật & nghiệp vụ phục vụ phỏng vấn |
| [`09_API_Contract.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/09_API_Contract.md) | API Contract (RESTful) | 40+ REST API endpoints, DTO schema, Excel Export API |
| [`10_Environment_Setup.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/10_Environment_Setup.md) | Hướng Dẫn Cài Đặt | Cấu hình Java 21+, Node 20, Docker, Postgres, Flyway |
| [`11_Business_Flow.md`](file:///c:/Users/Admin/Desktop/POS_Manager/docs/11_Business_Flow.md) | Luồng Nghiệp Vụ | Master Data, 6 Flow End-to-End, UI Messages & Excel UX |
| [`architecture_diagrams.md`](file:///c:/Users/Admin/Desktop/POS_Manager/architecture_diagrams.md) | Sơ Đồ Mermaid | PlantUML / Mermaid diagrams trực quan hóa kiến trúc |
| [`prompt.md`](file:///c:/Users/Admin/Desktop/POS_Manager/prompt.md) | Remote Control Prompt | Prompt dán vào AI Agent khi bắt đầu phiên làm việc |

---

## ⚡ 4. Khởi Động Nhanh (Quick Start)

### 4.1. Yêu Cầu Môi Trường
- **JDK**: Java 21+ (OpenJDK / Temurin)
- **Node.js**: Node 20 LTS (npm 10+)
- **Database**: PostgreSQL 16+ (hoặc Docker Compose)
- **IDE Khuyên dùng**: IntelliJ IDEA / VS Code / Antigravity IDE

### 4.2. Khởi Chạy Cơ Sở Dữ Liệu (Docker)
```bash
docker-compose up -d postgres
```

### 4.3. Khởi Chạy Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```
> Database sẽ tự động khởi tạo và nạp dữ liệu mẫu qua **Flyway Migration**.

### 4.4. Khởi Chạy Frontend (Angular 22)
```bash
cd frontend
npm install
ng serve --open
```
Truy cập ứng dụng tại: `http://localhost:4200`

---

## 🔄 5. Luồng Nghiệp Vụ Bắt Buộc (Core Business Cycle)

```
[Nhà Cung Cấp] ──> [Nhập Kho (PO)] ──> [Kho Đơn Vị (Warehouse)]
                                                │
                                                ▼
[Thu Hồi / Thanh Lý] <── [Merchant (Cửa Hàng)] <── [Cấp Phát POS + Thắt TID]
```

---

## 🤖 6. Bắt Đầu Code Cùng AI Agent

Khi bắt đầu phiên làm việc mới với AI Agent:
1. Mở file [`prompt.md`](file:///c:/Users/Admin/Desktop/POS_Manager/prompt.md).
2. Copy toàn bộ nội dung và dán vào ô Chat với AI.
3. Gõ lệnh tắt mong muốn (Ví dụ: `/next`, `/sprint 1`, `/flow A`).

---

## 📝 7. Quy Chuẩn Commit (Git Commit Convention)

Dự án tuân theo chuẩn **Conventional Commits**:
- `feat:` Thêm tính năng mới (Ví dụ: `feat(inventory): add PO creation workflow`)
- `fix:` Sửa lỗi (Ví dụ: `fix(auth): resolve JWT expiration parsing`)
- `docs:` Cập nhật tài liệu (Ví dụ: `docs: update API contract for Excel Export`)
- `refactor:` Tối ưu hóa code không làm thay đổi tính năng
- `test:` Thêm hoặc sửa unit test

---

© 2026 **POS Management System Project**. Tất cả tài liệu đã được chuẩn hóa cho phát triển doanh nghiệp.
