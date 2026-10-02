# 📖 12. Từ Vựng & Thuật Ngữ Chuyên Ngành (Glossary & Terminology)

> **Tài liệu Bách Khoa Thuật Ngữ (Glossary Master)** dành cho Kỹ sư phần mềm, Business Analyst (BA), Cán bộ Vận hành và Tester trong dự án **POS Management System** (Hệ thống Quản lý Vòng đời & Vận hành Thiết bị POS Ngân hàng Enterprise).

---

## 📌 Mục Lục
1. [Thuật Ngữ POS & Phần Cứng (Hardware & Terminal)](#1-thuật-ngữ-pos--phần-cứng-hardware--terminal)
2. [Thuật Ngữ Merchant & Chấp Nhận Thẻ (Merchant & Acquiring Business)](#2-thuật-ngữ-merchant--chấp-nhận-thẻ-merchant--acquiring-business)
3. [Thuật Ngữ Thanh Toán, Chuyển Mạch & An Ninh Thẻ (Payment, Switching & Card Security)](#3-thuật-ngữ-thanh-toán-chuyển-mạch--an-ninh-thẻ-payment-switching--card-security)
4. [Hệ Thống Enterprise & Tích Hợp Ngoại (Banking Enterprise Systems & Integrations)](#4-hệ-thống-enterprise--tích-hợp-ngoại-banking-enterprise-systems--integrations)
5. [Kiến Trúc Phần Mềm & Pattern Backend (Backend Architecture & Patterns)](#5-kiến-trúc-phần-mềm--pattern-backend-backend-architecture--patterns)
6. [Công Nghệ Frontend & Quy Chuẩn UI/UX (Frontend Tech Stack & UI/UX Standards)](#6-công-nghệ-frontend--quy-chuẩn-uiux-frontend-tech-stack--uiux-standards)
7. [Trạng Thái Vòng Đời Thiết Bị & Vận Chuyển (Asset Lifecycle & Logistics Statuses)](#7-trạng-thái-vòng-đời-thiết-bị--vận-chuyển-asset-lifecycle--logistics-statuses)
8. [Quy Trình Duyệt Maker-Checker, Phân Quyền & An Ninh (Approval, Security & Access Control)](#8-quy-trình-duyệt-maker-checker-phân-quyền--an-ninh-approval-security--access-control)

---

## 1. Thuật Ngữ POS & Phần Cứng (Hardware & Terminal)

| Từ Vựng / Mã | Tên Tiếng Anh / Gốc | Định Nghĩa Tiếng Việt & Ngữ Cảnh Trong Dự Án |
| :--- | :--- | :--- |
| **POS** | Point of Sale Terminal | **Thiết bị/Máy chấp nhận thanh toán thẻ**: Máy quẹt thẻ đặt tại các cửa hàng, nhà hàng, siêu thị để khách hàng thanh toán qua thẻ ngân hàng hoặc QR Code. |
| **Terminal** | POS Terminal | **Đầu cuối thanh toán**: Tên gọi chung cho mỗi chiếc máy POS vật lý trong mạng lưới thanh toán. |
| **S/N** | Serial Number | **Số Serial nhà sản xuất**: Mã định danh vật lý duy nhất in trên thân máy POS. Không thể thay đổi và không được trùng lặp toàn hệ thống. |
| **Vendor** | Hardware Vendor / Supplier | **Nhà cung cấp / Hãng sản xuất phần cứng**: Đơn vị bán phần cứng máy POS cho ngân hàng (Ví dụ: PAX Technology, Verifone, Ingenico, Sunmi, Newland). |
| **Device Model** | Model | **Dòng sản phẩm / Dòng máy POS**: Mẫu máy cụ thể (VD: Pax A920, Verifone VX520). Lưu thông tin cấu hình, hãng sản xuất, hệ điều hành, tiền tố Serial (`serial_prefix`). |
| **Smart POS / Android POS** | Smart POS | **Máy POS thông minh chạy hệ điều hành Android**: Có màn hình cảm ứng lớn, tích hợp camera quét mã QR, máy in hóa đơn nhiệt và chạy các ứng dụng bán hàng. |
| **Traditional POS** | Traditional POS / Countertop | **Máy POS truyền thống**: Máy POS nút bấm cơ học, kết nối qua dây LAN/Dial-up hoặc SIM 2G/3G, chuyên dùng quẹt thẻ từ/thẻ chip. |
| **SAM Card** | Secure Access Module Card | **Thẻ chip bảo mật**: Thẻ SIM nhỏ chứa vi mạch bảo mật gắn bên trong máy POS để lưu trữ khóa mã hóa giao dịch tài chính. |
| **SIM 3G/4G** | Subscriber Identity Module | **SIM viễn thông (GPRS/3G/4G)**: Thẻ SIM di động gắn vào POS giúp kết nối internet truyền dữ liệu giao dịch về Ngân hàng khi không có Wifi/LAN. |
| **Accessory** | Accessories | **Phụ kiện đính kèm**: Các thiết bị phụ thuộc như Chân đế (Base/Cradle), dây sạc, adapter nguồn, bao da, nắp pin, dây cáp mạng. |
| **Serial Prefix** | Serial Prefix | **Tiền tố số Serial**: Ký tự đầu của số Serial dùng để phân loại dòng máy (VD: `PAX-920-`, `VF-520-`). |
| **Firmware** | Firmware / OS Version | **Phần mềm điều khiển hệ thống máy POS**: Chương trình cơ sở cài trên chip ROM của máy POS. |

---

## 2. Thuật Ngữ Merchant & Chấp Nhận Thẻ (Merchant & Acquiring Business)

| Từ Vựng / Mã | Tên Tiếng Anh / Gốc | Định Nghĩa Tiếng Việt & Ngữ Cảnh Trong Dự Án |
| :--- | :--- | :--- |
| **Merchant** | Merchant Account / Acceptor | **Đơn vị Chấp nhận Thẻ (ĐVCNT)**: Doanh nghiệp, chuỗi siêu thị, cửa hàng hoặc hộ kinh doanh ký hợp đồng chấp nhận thanh toán qua máy POS với Ngân hàng. |
| **MID** | Merchant Identification Number | **Mã định danh Merchant**: Dãy số (thường 15 chữ số) do Ngân hàng/WAY4 cấp để quản lý thông tin hợp đồng, tài khoản thụ hưởng và doanh số của Merchant. *1 Merchant có thể có nhiều MID*. |
| **TID** | Terminal Identification Number | **Mã định danh điểm thanh toán (Terminal)**: Dãy số (thường 8 chữ số) gắn với từng máy POS/điểm quẹt thẻ để nhận diện khi phát sinh giao dịch. *1 MID có thể có nhiều TID*. |
| **Acquirer** | Acquiring Bank | **Ngân hàng Thanh toán / Ngân hàng Chấp nhận Thẻ**: Ngân hàng cung cấp máy POS, mở tài khoản cho Merchant và đứng ra thanh toán tiền bán hàng cho Merchant. |
| **Issuer** | Issuing Bank | **Ngân hàng Phát hành Thẻ**: Ngân hàng cấp thẻ ATM/Visa/Mastercard cho chủ thẻ (người tiêu dùng). |
| **MCC** | Merchant Category Code | **Mã ngành nghề kinh doanh**: Mã 4 chữ số tiêu chuẩn ISO 18245 phân loại loại hình kinh doanh của Merchant (VD: 5812 - Nhà hàng, 5411 - Siêu thị, 7011 - Khách sạn). Dùng để áp mức phí quẹt thẻ. |
| **Fee Policy** | Fee Schedule / Tariff | **Chính sách phí thanh toán**: Quy định mức % phí quẹt thẻ Merchant phải trả cho ngân hàng trên từng giao dịch (chia theo thẻ nội địa NAPAS, thẻ quốc tế Visa/Master, QR Code). |
| **Legal Name** | Merchant Legal Name | **Tên pháp nhân**: Tên doanh nghiệp chính thức ghi trên Giấy chứng nhận đăng ký kinh doanh. |
| **Business Representative** | Merchant Representative | **Người đại diện pháp luật**: Cá nhân đứng tên hợp đồng mở điểm POS với ngân hàng (kèm CCCD/Passport). |
| **Tax Code** | Tax Identification Number | **Mã số thuế**: Mã số thuế của doanh nghiệp hoặc hộ kinh doanh đăng ký mở Merchant. |
| **Business Unit (BU)** | Branch / Hub / Regional Unit | **Đơn vị Kinh doanh / Chi nhánh / Phòng Giao dịch Ngân hàng**: Đơn vị cấp quản lý trực tiếp Merchant và dàn máy POS theo phạm vi địa lý (VD: Chi nhánh Hà Nội, Chi nhánh TP.HCM). |
| **Primary MID** | Primary Merchant ID | **MID Chính**: Mã MID đại diện chính của Merchant khi doanh nghiệp có nhiều chi nhánh/điểm bán. |
| **Sub-MID** | Secondary / Sub MID | **MID Phụ**: Mã MID nhánh dùng quản lý riêng cho từng điểm bán hoặc gian hàng của Merchant. |

---

## 3. Thuật Ngữ Thanh Toán, Chuyển Mạch & An Ninh Thẻ (Payment, Switching & Card Security)

| Từ Vựng / Mã | Tên Tiếng Anh / Gốc | Định Nghĩa Tiếng Việt & Ngữ Cảnh Trong Dự Án |
| :--- | :--- | :--- |
| **EMV** | Europay, Mastercard, Visa | **Chuẩn thẻ chip quốc tế EMV**: Tiêu chuẩn bảo mật thẻ chip chống làm giả thẻ (thay thế thẻ từ cũ). |
| **Contactless** | NFC / Tap to Pay | **Thanh toán không tiếp xúc (Chạm)**: Giao dịch quẹt thẻ bằng cách chạm thẻ hoặc điện thoại (Apple Pay/Google Pay) vào máy POS. |
| **Static QR / Dynamic QR** | Static / Dynamic QR Code | **Mã QR Tĩnh / Mã QR Động**: Mã QR hiển thị trên màn hình POS chứa số tiền giao dịch chính xác (Dynamic) hoặc mã QR in dán tại bàn (Static). |
| **Settlement** | Daily Settlement | **Quyết toán giao dịch cuối ngày**: Hành động máy POS tổng hợp toàn bộ giao dịch trong ngày và gửi về ngân hàng để chốt sổ, chuyển tiền vào tài khoản Merchant. |
| **Batch Closing** | Batch Close | **Chốt lô giao dịch**: Quá trình đóng lô giao dịch hiện tại trên máy POS để chuẩn bị cho lô giao dịch tiếp theo. |
| **Chargeback** | Dispute / Chargeback | **Tra soát / Khiếu nại giao dịch**: Quy trình xử lý tranh chấp khi chủ thẻ báo giao dịch bị gian lận hoặc không nhận được hàng hóa. |
| **PCI-DSS** | Payment Card Industry Data Security Standard | **Tiêu chuẩn an toàn dữ liệu ngành thẻ thanh toán**: Bộ tiêu chuẩn an ninh bắt buộc cho hệ thống lưu trữ, xử lý thông tin thẻ ngân hàng. |
| **DUKPT** | Derived Unique Key Per Transaction | **Thuật toán tạo khóa mã hóa duy nhất per giao dịch**: Cơ chế mã hóa PIN/dữ liệu thẻ trên POS giúp mỗi giao dịch dùng 1 khóa mã hóa khác nhau. |
| **HSM** | Hardware Security Module | **Thiết bị bảo mật phần cứng chuyên dụng**: Thiết bị phần cứng ngân hàng dùng để lưu trữ Master Key, sinh khóa và mã hóa/giải mã số PIN. |
| **ISO 8583** | ISO 8583 Financial Message Standard | **Tiêu chuẩn tin nhắn tài chính ISO 8583**: Định dạng tin nhắn chuẩn quốc tế dùng cho giao dịch quẹt thẻ giữa máy POS, Ngân hàng và Tổ chức thẻ (Visa/Mastercard/NAPAS). |

---

## 4. Hệ Thống Enterprise & Tích Hợp Ngoại (Banking Enterprise Systems & Integrations)

| Từ Vựng / Mã | Tên Tiếng Anh / Gốc | Định Nghĩa Tiếng Việt & Ngữ Cảnh Trong Dự Án |
| :--- | :--- | :--- |
| **BOF** | Back Office Frontend | **Giao diện Vận hành Nội bộ**: Ứng dụng Web (Angular 22) dành riêng cho Cán bộ Ngân hàng, Quản trị kho, Maker, Checker thao tác nghiệp vụ. |
| **WAY4** | OpenWay WAY4 System | **Hệ thống Core Card Management & POS Switching**: Phần mềm lõi ngân hàng enterprise của OpenWay quản lý hợp đồng MID, TID, cấp khóa và định tuyến giao dịch quẹt thẻ. |
| **T24 / Temenos** | Temenos Transact (T24) | **Hệ thống Core Banking**: Hệ thống tài khoản lõi ngân hàng quản lý tài khoản thanh toán, số dư, thông tin khách hàng (CIF) và hạch toán kế toán. |
| **Outbox Pattern** | Transactional Outbox Pattern | **Mẫu thiết kế Outbox**: Kỹ thuật lưu sự kiện vào bảng DB (`outbox_events`) cùng transaction dữ liệu chính trước khi đẩy sang Kafka/WAY4, tránh mất sự kiện khi sập mạng. |
| **Kafka** | Apache Kafka | **Hệ thống Message Queue / Event Streaming**: Nền tảng truyền nhận thông điệp sự kiện bất đồng bộ dung lượng lớn giữa POS Manager và WAY4/T24. |
| **DLQ** | Dead Letter Queue | **Hàng đợi thông điệp lỗi**: Nơi chứa các tin nhắn Kafka xử lý thất bại nhiều lần để cán bộ kỹ thuật kiểm tra và retry thủ công. |
| **Circuit Breaker** | Circuit Breaker Pattern (Resilience4j) | **Cơ chế ngắt mạch tự động**: Tự động ngắt gọi API sang hệ thống ngoài (WAY4/T24) khi hệ thống đó bị chập chờn hoặc timeout, tránh kéo sập POS Manager. |
| **Flyway** | Database Migration Tool | **Công cụ quản lý phiên bản Database**: Tự động chạy các script SQL (`V1__...sql`, `V2__...sql`) để đồng bộ cấu trúc DB khi deploy code mới. |
| **Spring RestClient** | Spring 6.1+ RestClient | **HTTP Client hiện đại của Spring**: Công cụ thay thế `RestTemplate` trong Spring Boot 3.4/4.1 dùng để gọi API RESTful sang WAY4 và T24. |

---

## 5. Kiến Trúc Phần Mềm & Pattern Backend (Backend Architecture & Patterns)

| Từ Vựng / Mã | Tên Tiếng Anh / Gốc | Định Nghĩa Tiếng Việt & Ngữ Cảnh Trong Dự Án |
| :--- | :--- | :--- |
| **Hexagonal Arch** | Hexagonal / Ports & Adapters Architecture | **Kiến trúc Lục giác**: Kiến trúc tách biệt tuyệt đối giữa Logic Nghiệp vụ cốt lõi (Domain/Service) với các công nghệ bên ngoài (DB, REST Controller, Kafka, WAY4). |
| **Domain-Driven Design (DDD)** | DDD | **Thiết kế hướng miền nghiệp vụ**: Phương pháp thiết kế phần mềm lấy các khái niệm và quy tắc nghiệp vụ thực tế làm trung tâm codebase. |
| **Aggregate Root** | DDD Aggregate Root | **Thực thể gốc**: Class chính quản lý một cụm dữ liệu liên quan (VD: `Merchant` là Aggregate Root quản lý các `MID` và `TID` bên trong). |
| **Idempotency Key** | `X-Idempotency-Key` | **Mã chống trùng lặp request**: Chuỗi UUID gửi trong HTTP Header. Nếu user lỡ bấm nút "Cấp phát POS" 2 lần, hệ thống nhận diện key trùng và chỉ xử lý 1 lần. |
| **Optimistic Lock** | Optimistic Locking (`version`) | **Khóa lạc quan**: Dùng cột `version` kiểu `BIGINT` trên mỗi bảng. Khi update, nếu `version` trong DB khác `version` client gửi lên, hệ thống báo lỗi xung đột dữ liệu (`StaleObjectStateException`). |
| **Metadata JSONB** | Dynamic Metadata (`JSONB`) | **Thuộc tính mở rộng dạng JSONB**: Cột dữ liệu linh hoạt trên PostgreSQL dùng lưu các thông tin phụ biến động mà không cần chạy migration sửa cột DB. |
| **SXSSFWorkbook** | Apache POI SXSSF Stream | **Kỹ thuật xuất Excel dạng Stream**: Kỹ thuật ghi dữ liệu Excel trực tiếp xuống đĩa theo luồng (Stream) giúp xuất file hàng trăm nghìn dòng mà không bị tràn bộ nhớ RAM (OutOfMemory). |
| **Async Export Job** | Asynchronous Job | **Tiến trình xuất Báo cáo chạy ngầm**: Khi dữ liệu xuất Excel > 10,000 dòng, hệ thống tạo một Job chạy ngầm và trả về `jobId` ngay lập tức để người dùng không bị đơ màn hình. |
| **DTO** | Data Transfer Object | **Đối tượng truyền tải dữ liệu**: Class Java chỉ chứa fields dữ liệu dùng truyền giữa Client và API (VD: `CreateMerchantRequest`, `DeviceResponse`). |

---

## 6. Công Nghệ Frontend & Quy Chuẩn UI/UX (Frontend Tech Stack & UI/UX Standards)

| Từ Vựng / Mã | Tên Tiếng Anh / Gốc | Định Nghĩa Tiếng Việt & Ngữ Cảnh Trong Dự Án |
| :--- | :--- | :--- |
| **SPA** | Single Page Application | **Ứng dụng Web một trang (Angular 22)**: Màn hình không bị tải lại toàn bộ trang khi chuyển tab hoặc chuyển trang, cho trải nghiệm mượt như app desktop. |
| **RxJS** | Reactive Extensions for JavaScript | **Thư viện lập trình phản ứng**: Dùng để xử lý các luồng dữ liệu bất đồng bộ, sự kiện bấm nút và gọi API RESTful trên Angular. |
| **Signal** | Angular Signal State | **Cơ chế quản lý trạng thái Angular mới**: Giúp giao diện tự động cập nhật cực nhanh khi dữ liệu thay đổi mà không cần re-render toàn bộ DOM. |
| **Control Flow** | Angular Control Flow (`@if`, `@for`) | **Cú pháp điều khiển mới trong Angular**: Thay thế cho `*ngIf`, `*ngFor` cũ, giúp code template sạch và hiệu năng cao hơn. |
| **Two-Column Layout** | Left List + Right Detail | **Bố cục 2 Khung**: Khung bên trái hiển thị danh sách & bộ lọc; Khung bên phải hiển thị thông tin chi tiết của bản ghi đang được chọn. |
| **Status Tabs** | Filter Tabs | **Thanh Tab trạng thái**: Thanh chuyển tab trên đầu danh sách (VD: Tất cả, Cho duyệt, Đã duyệt, Từ chối) kèm badge đếm số lượng. |
| **Wizard Multi-Step** | Multi-Step Wizard Flow | **Quy trình nhập liệu từng bước**: Form dài được chia nhỏ thành nhiều bước (Step 1 -> Step 2 -> Step 3) có thanh tiến trình (Stepper) ở trên. |
| **Per-Row Validation** | Dynamic Table Row Validation | **Xác thực dữ liệu theo từng dòng**: Quy tắc giao diện bắt buộc điền đủ & đúng dữ liệu ở dòng bảng hiện tại thì mới cho bấm nút "Thêm dòng tiếp theo". |
| **Glassmorphism** | Glassmorphism UI Style | **Phong cách thiết kế kính mờ**: Giao diện UI hiện đại sử dụng hiệu ứng trong suốt, mờ nền và viền sáng mỏng tạo cảm giác sang trọng. |
| **Skeleton Loading** | Skeleton Loading Indicator | **Khung xương chờ tải dữ liệu**: Hiệu ứng mờ nhấp nháy mô phỏng hình dáng bảng/form trong lúc chờ API trả dữ liệu, thay cho vòng quay spinner cổ điển. |

---

## 7. Trạng Thái Vòng Đời Thiết Bị & Vận Chuyển (Asset Lifecycle & Logistics Statuses)

| Mã Trạng Thái | Tên Tiếng Anh | Nghĩa Tiếng Việt & Ngữ Cảnh Sử Dụng |
| :--- | :--- | :--- |
| `INSTOCK` | In Stock | **Trong Kho**: Thiết bị mới nhập hoặc vừa thu hồi về, đang nằm trong kho ngân hàng, sẵn sàng cấp phát. |
| `ASSIGNED` | Assigned to TID | **Đã Cấp Phát**: Thiết bị đã được gán mã TID và đã lập phiếu xuất kho cho cán bộ đi lắp đặt. |
| `DEPLOYED` | Deployed / Active | **Đang Vận Hành**: Thiết bị đã được lắp đặt hoàn tất tại Merchant và đang hoạt động quẹt thẻ bình thường. |
| `REPAIRING` | Under Maintenance / Repair | **Đang Bảo Hành / Sửa Chữa**: Thiết bị bị lỗi/hỏng, đang được gửi về trung tâm bảo hành của Vendor hoặc phòng kỹ thuật. |
| `RECOVERED` | Recovered | **Đã Thu Hồi**: Thiết bị đã tháo khỏi Merchant, thu hồi về kho (chờ tái cấp phát hoặc kiểm định lại). |
| `LIQUIDATED` | Liquidated / Scrapped | **Đã Thanh Lý**: Thiết bị quá cũ, hỏng nặng hoặc hết hạn khấu hao, được làm thủ tục thanh lý loại khỏi tài sản. |
| `DECOMMISSIONED` | Decommissioned | **Hủy Vận Hành**: Mã TID hoặc MID bị hủy hoàn toàn, không còn lưu hành trên hệ thống. |
| `SUSPENDED` | Suspended | **Tạm Ngừng**: Merchant hoặc TID bị tạm khóa giao dịch (do nợ phí, vi phạm quy định hoặc rủi ro gian lận). |
| `PREPARING` | Logistics Preparing | **Đang Đóng Gói**: Hàng hóa/máy POS đang được chuẩn bị đóng gói tại kho xuất phát. |
| `IN_TRANSIT` | In Transit | **Đang Vận Chuyển**: Đơn hàng đã giao cho đơn vị vận chuyển (có mã tracking number). |
| `DELIVERED` | Delivered | **Giao Thành Công**: Đơn hàng đã đến kho đích hoặc đã bàn giao cho cán bộ lắp đặt. |
| `FAILED` | Delivery Failed | **Giao Thất Bại**: Không giao được hàng (sai địa chỉ, không liên lạc được, hàng hỏng hóc giữa đường). |
| `RETURNED` | Returned to Sender | **Đã Trả Về**: Đơn hàng giao thất bại và đã được vận chuyển quay ngược lại kho xuất phát. |

---

## 8. Quy Trình Duyệt Maker-Checker, Phân Quyền & An Ninh (Approval, Security & Access Control)

| Từ Vựng / Mã | Tên Tiếng Anh / Gốc | Định Nghĩa Tiếng Việt & Giải Thích Chi Tiết |
| :--- | :--- | :--- |
| **Maker** | Request Creator / Initiator | **Người Lập Yêu Cầu (Maker)**: Cán bộ kho hoặc cán bộ quản lý Merchant thực hiện tạo mới, điều chuyển, thanh lý hoặc cấp phát thiết bị. *Yêu cầu ở trạng thái PENDING*. |
| **Checker** | Approver / Supervisor | **Người Phê Duyệt (Checker)**: Quản lý chi nhánh hoặc Trưởng phòng có thẩm quyền duyệt (`APPROVED`) hoặc từ chối (`REJECTED`) yêu cầu do Maker gửi lên. |
| **Dual Control** | Dual Control / 4-Eyes Principle | **Nguyên tắc 4 Mắt**: Quy định an ninh bắt buộc Maker và Checker phải là 2 tài khoản người dùng hoàn toàn khác nhau. Maker không được tự duyệt yêu cầu của chính mình. |
| **BU Scope** | Business Unit Scope Authorization | **Phạm vi Phân vùng Dữ liệu**: Cơ chế phân quyền dữ liệu. User thuộc Chi nhánh A chỉ được xem và thao tác dữ liệu thuộc Chi nhánh A. Cán bộ Hội sở (HQ) được xem toàn bộ. |
| **RBAC** | Role-Based Access Control | **Phân quyền dựa trên vai trò**: Phân quyền hệ thống theo các Role chức danh (VD: `ADMIN`, `WAREHOUSE_KEEPER`, `MERCHANT_MANAGER`, `CHECKER`, `AUDITOR`). |
| **JWT** | JSON Web Token | **Mã xác thực JWT**: Chuỗi mã hóa stateless gửi trong HTTP Header (`Authorization: Bearer <token>`) chứa thông tin user, vai trò và phạm vi chi nhánh. |
| **Refresh Token** | Refresh Token | **Token cấp mới**: Token dùng để lấy lại Access Token mới khi Access Token hết hạn mà người dùng không cần phải gõ lại username/password. |
| **Audit Log / Trail** | Audit Trail / Activity Log | **Nhật ký Truy vết**: Bảng DB ghi lại lịch sử chi tiết: Ai (User ID)? Làm gì (Action)? Lúc nào (Timestamp)? Giá trị cũ (Old Value)? Giá trị mới (New Value)? |
| **Reason Code** | Rejection Reason | **Mã / Lý do Từ chối**: Ghi chú bắt buộc của Checker khi bấm Từ chối phiếu yêu cầu để Maker biết lý do sửa lại. |
| **SLA** | Service Level Agreement | **Cam kết Thời gian Xử lý**: Quy định thời gian tối đa Checker phải xử lý một yêu cầu (VD: Trong vòng 24h làm việc kể từ khi Maker gửi duyệt). |

---

© 2026 **POS Management System Project**. Bách khoa từ vựng chuyên ngành được chuẩn hóa đầy đủ cho toàn bộ dự án.
