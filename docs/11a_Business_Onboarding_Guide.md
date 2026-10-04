# POS Management — Onboarding Nghiệp Vụ Cho Người Mới

> **Đọc file này TRƯỚC** [11_Business_Flow.md](./11_Business_Flow.md).
> File 11 trả lời câu hỏi **"hệ thống làm gì, theo thứ tự nào"** (dành cho dev).
> File này trả lời câu hỏi **"TẠI SAO lại làm vậy"**, để bạn tự suy luận được khi gặp một yêu cầu mới.

---

## 0. Cách đọc tài liệu này

| Bạn muốn | Đọc mục |
|---|---|
| Hiểu bức tranh lớn trong 15 phút | §1, §2 |
| Tra cứu một thuật ngữ | §3 (Glossary) |
| Hiểu lý do đằng sau từng flow | §4 |
| Hiểu các cơ chế kỹ thuật "kiểu banking" | §5 |
| Biết tài liệu gốc còn chỗ nào mâu thuẫn | §6 |
| Biết hệ thống thật thường có thêm gì | §7 |
| Tự luyện khả năng phán đoán | §8 |
| Chuẩn bị câu hỏi để hỏi BA / Senior ở công ty | §9 |

---

## 1. Bức tranh lớn: Một lần quẹt thẻ diễn ra như thế nào?

Hệ thống POS Management **không xử lý giao dịch**, nhưng mọi dữ liệu nó quản lý (MID, TID, máy, phí) tồn tại là **để giao dịch chạy được**. Vì vậy phải hiểu giao dịch trước.

### 1.1 Mô hình 4 bên (Four-Party Model)

```
 Chủ thẻ ──quẹt thẻ──► Máy POS (TID) tại Merchant (MID)
                           │
                           ▼
              Ngân hàng THANH TOÁN (Acquirer)  ◄── NGÂN HÀNG CỦA BẠN
              (hệ thống WAY4 nhận giao dịch)
                           │
                           ▼
              Tổ chức thẻ (Visa / Mastercard / NAPAS / JCB)
                           │
                           ▼
              Ngân hàng PHÁT HÀNH thẻ (Issuer) → kiểm tra số dư → Chấp nhận / Từ chối
```

| Bên | Vai trò | Ví dụ |
|---|---|---|
| **Cardholder** | Người có thẻ, đi mua hàng | Bạn |
| **Merchant** | Điểm bán, đặt máy POS | Siêu thị A |
| **Acquirer** | Ngân hàng **cung cấp máy POS** và **trả tiền** cho Merchant | Ngân hàng nơi bạn làm |
| **Card Scheme** | Mạng lưới chuyển giao dịch giữa các ngân hàng | Visa, NAPAS |
| **Issuer** | Ngân hàng phát hành thẻ cho chủ thẻ | Ngân hàng của người mua |

> 💡 **Điểm mấu chốt:** Dự án này là phía **Acquirer**. Khi nghe "POS", "MID", "TID", "MDR", "kết toán" → tất cả đều thuộc nghiệp vụ **Acquiring**.

### 1.2 Vì sao MID và TID quan trọng sống còn?

Mỗi giao dịch gửi về ngân hàng đều mang theo **MID + TID**.

- **TID** (Terminal ID) → để biết giao dịch đến từ **máy nào** (chống gian lận, tra soát).
- **MID** (Merchant ID) → để biết **tiền trả về tài khoản nào** của Merchant (qua T24) và **tính phí bao nhiêu** (MDR).

👉 Nếu TID **chưa được đăng ký trong WAY4** → máy quẹt sẽ bị **từ chối giao dịch**. Đó là lý do flow tạo TID luôn kèm "đồng bộ WAY4".

👉 Nếu gắn **nhầm máy vào nhầm TID** → tiền của Merchant A có thể chảy vào tài khoản Merchant B. Đây là **sự cố nghiêm trọng** ở ngân hàng. Đó là lý do có cả Idempotency + Optimistic Lock + Unique Index cho thao tác cấp phát.

### 1.3 Các hệ thống xung quanh POS Management

```
                 ┌──────────────┐
                 │  T24 (Core)  │  Khách hàng (CIF), Tài khoản, Hạch toán phí
                 └──────▲───────┘
                        │ verify tài khoản / post phí
┌──────────┐    ┌───────┴────────────┐    ┌───────────────┐
│ Vendor   │───►│  POS MANAGEMENT    │───►│ WAY4 (OpenWay)│  Đăng ký MID/TID,
│ (PAX...) │máy │  (dự án của bạn)   │sync│ Acquiring Host│  nhận giao dịch thật
└──────────┘    └───────┬────────────┘    └───────────────┘
                        │ (hệ thống thật thường có thêm)
                 ┌──────▼───────┐
                 │ TMS          │  Tải app, tham số, khoá mã hoá xuống máy POS
                 └──────────────┘
```

| Hệ thống | Là gì | Dự án này tương tác thế nào |
|---|---|---|
| **T24** (Temenos) | Core Banking: khách hàng, tài khoản, sổ cái | Verify tài khoản quyết toán khi tạo MID, thu phí |
| **WAY4** (OpenWay) | Hệ thống xử lý thẻ / acquiring | Đăng ký Merchant/MID/TID, bật/tắt terminal |
| **TMS** | Terminal Management System | *Chưa có trong demo* — xem §7 |

---

## 2. Vòng đời tổng thể trong 1 sơ đồ

```
 [MASTER DATA]          [MERCHANT ONBOARDING]          [KHO & THIẾT BỊ]
 Vendor, Model,         Merchant (PENDING)             Purchase Order
 MCC, Fee, Kho,   ──►   → KYC (offline)          ──►   → Nhập kho (INSTOCK)
 Business Unit          → ACTIVE                        │
                        → tạo MID → tạo TID             │
                                │                       │
                                └──────────┬────────────┘
                                           ▼
                              [CẤP PHÁT] gắn Device ↔ TID  (DEPLOYED)
                                           │
                    ┌──────────────────────┼─────────────────────┐
                    ▼                      ▼                     ▼
              Merchant dùng máy     Máy hỏng → Thu hồi     Merchant đóng cửa
              (giao dịch qua WAY4)  → Sửa chữa / Thanh lý  → Thu hồi toàn bộ
```

**Quy tắc vàng để nhớ:**
1. **Không có Master Data → không làm được gì.**
2. **Merchant phải ACTIVE** trước khi nhận máy.
3. **Mọi thao tác làm thay đổi tài sản / tiền → phải có người thứ 2 duyệt** (Maker-Checker).
4. **Mọi thay đổi phải để lại dấu vết** (history, audit log) — vì thanh tra/kiểm toán sẽ hỏi.

---

## 3. Glossary — Từ điển chuyên ngành

### 3.1 Thuật ngữ thanh toán thẻ

| Thuật ngữ | Nghĩa | Ví dụ trong dự án |
|---|---|---|
| **POS** | Point of Sale — máy chấp nhận thẻ | PAX A920, Verifone VX520 |
| **EDC** | Electronic Data Capture — tên gọi khác của máy POS | |
| **mPOS / SoftPOS** | POS dùng điện thoại / NFC trên điện thoại | Có thể là `device_category` |
| **Merchant** | Đơn vị chấp nhận thẻ (ĐVCNT) | Siêu thị A |
| **MID** | Merchant ID — mã định danh điểm kinh doanh tại Acquirer | M000001 |
| **TID** | Terminal ID — mã định danh logic của 1 máy | T100001 |
| **Serial Number (S/N)** | Số seri **do nhà sản xuất in** trên máy | SN-PAX-000001 |
| **MCC** | Merchant Category Code (ISO 18245) — mã ngành nghề | 5411 = Siêu thị |
| **MDR** | Merchant Discount Rate — % phí Merchant trả cho mỗi giao dịch | 1.1% / giao dịch |
| **Settlement / Quyết toán** | Ngân hàng chuyển tiền bán hàng (trừ phí) về tài khoản Merchant | T+1 |
| **Kết toán (Batch close)** | Cuối ngày máy POS gửi tổng giao dịch về host | |
| **KYC** | Know Your Customer — thẩm định danh tính, pháp lý Merchant | Bước offline trong Flow D |
| **Acquirer / Issuer** | Ngân hàng thanh toán / phát hành | Xem §1.1 |
| **Chargeback / Tra soát** | Chủ thẻ khiếu nại, đòi lại tiền | Cần biết TID nào đã xử lý giao dịch |
| **PCI DSS** | Tiêu chuẩn bảo mật dữ liệu thẻ | Lý do phải mask dữ liệu trong log |
| **PCI PTS** | Chứng nhận bảo mật phần cứng máy POS | Thuộc tính của Device Model |
| **TMK / Key Injection** | Nạp khoá mã hoá vào máy trong phòng bảo mật | Xem §7 |

### 3.2 Thuật ngữ quản trị kho & tài sản

| Thuật ngữ | Nghĩa |
|---|---|
| **PO (Purchase Order)** | Đơn đặt mua hàng gửi Vendor |
| **GRN / Nhập kho (Receiving)** | Xác nhận hàng thực tế đã về, ghi nhận từng serial |
| **Phiếu xuất kho** | Chứng từ cho phép máy rời kho |
| **Điều chuyển (Transfer)** | Chuyển máy giữa 2 kho |
| **Kiểm kê (Stock count)** | Đối chiếu số liệu hệ thống với thực tế |
| **Thanh lý (Disposal)** | Loại bỏ tài sản vĩnh viễn (cần duyệt nhiều cấp, liên quan kế toán) |
| **Stock Ledger / Sổ cái kho** | Bảng ghi mọi biến động (`stock_transactions`) — chỉ thêm, không sửa |

### 3.3 Thuật ngữ quản trị nội bộ ngân hàng

| Thuật ngữ | Nghĩa |
|---|---|
| **Maker-Checker (4-eyes)** | Người tạo ≠ người duyệt |
| **Business Unit / Chi nhánh** | Đơn vị kinh doanh, quyết định phạm vi dữ liệu (Data Scope) |
| **Segregation of Duties (SoD)** | Tách biệt nhiệm vụ: người giữ kho không tự duyệt xuất kho |
| **Audit Trail** | Dấu vết: ai, làm gì, lúc nào, từ IP nào, giá trị cũ → mới |
| **Hội sở / Chi nhánh / PGD** | Cấp tổ chức ngân hàng |

---

## 4. Giải thích "TẠI SAO" cho từng Flow

> Với mỗi flow trong file 11, hãy luôn tự hỏi 3 câu: **Rủi ro là gì? Ai chịu trách nhiệm? Kiểm toán cần dấu vết gì?**

### Flow A — Nhập kho (PO → Receiving)

| Câu hỏi | Trả lời |
|---|---|
| Tại sao cần PO được duyệt trước khi nhập? | PO là **cam kết chi tiền** của ngân hàng. Không có duyệt = nhân viên có thể tự đặt mua. |
| Tại sao phải nhập **từng serial**? | Máy POS là **tài sản cố định**, phải truy được từng chiếc (mất, bảo hành, tra soát). |
| Tại sao PO có trạng thái "nhận một phần"? | Vendor thường giao nhiều đợt. Thực tế cần `PARTIALLY_RECEIVED`. |
| Rủi ro lớn nhất? | Nhập trùng serial, nhập sai model, nhập nhiều hơn số lượng PO. |

### Flow B — Xuất kho & Cấp phát

| Câu hỏi | Trả lời |
|---|---|
| Tại sao tách "xuất kho" và "cấp phát" thành 2 bước? | **Xuất kho** là chuyện **tài sản rời kho** (trách nhiệm thủ kho). **Cấp phát** là chuyện **gắn máy vào TID** (trách nhiệm nghiệp vụ). Hai trách nhiệm khác nhau → hai người khác nhau (SoD). |
| Tại sao cần duyệt xuất kho? | Máy trị giá vài triệu đến vài chục triệu, ra khỏi kho là rủi ro mất. |
| Tại sao cấp phát cần 3 lớp bảo vệ? | Xem §1.2 — gắn nhầm / gắn trùng = tiền chảy sai tài khoản. |

### Flow C — Thu hồi

| Câu hỏi | Trả lời |
|---|---|
| Khi nào thu hồi? | Máy hỏng, Merchant đóng cửa, Merchant vi phạm (gian lận), đổi máy, hết hợp đồng. |
| Tại sao máy thu hồi không về thẳng INSTOCK? | Phải **kiểm tra tình trạng** trước. Máy hỏng mà về INSTOCK → lần sau cấp phát cho Merchant khác sẽ lỗi. |
| Việc gì phải làm ở WAY4? | Vô hiệu hoá TID / gỡ liên kết để máy cũ không thể giao dịch tiếp. |

### Flow D / G — Merchant, MID, TID

| Câu hỏi | Trả lời |
|---|---|
| Tại sao 1 Merchant có nhiều MID? | Mỗi chi nhánh có thể **nhận tiền vào tài khoản khác nhau** hoặc **mức phí khác nhau**. |
| Tại sao 1 MID có nhiều TID? | Một cửa hàng có nhiều quầy thu ngân. |
| Tại sao TID là "logic" còn Device là "vật lý"? | Máy hỏng → **đổi máy mới nhưng giữ nguyên TID**, Merchant không cần thay đổi gì, lịch sử giao dịch liền mạch. |
| Tại sao Merchant ở trạng thái PENDING ban đầu? | Chưa KYC xong = chưa được phép nhận tiền. Chống rửa tiền (AML). |

### Flow E — Maker-Checker

| Câu hỏi | Trả lời |
|---|---|
| Tại sao không cho tự duyệt? | Quy định kiểm soát nội bộ: **một người không được vừa tạo vừa duyệt** giao dịch ảnh hưởng tài sản. |
| Tại sao có "Trả lại sửa" khác với "Từ chối"? | Từ chối = kết thúc, phải tạo phiếu mới. Trả lại = sửa lỗi nhỏ, giữ nguyên số phiếu và lịch sử. |
| Tại sao số cấp duyệt cấu hình được? | Mỗi loại phiếu có mức rủi ro khác nhau. Thanh lý (mất tài sản) thường cần nhiều cấp hơn điều chuyển. |

### Flow F — Sửa chữa & Thanh lý

| Câu hỏi | Trả lời |
|---|---|
| Tại sao DISPOSED không thể khôi phục? | Thanh lý liên quan **sổ sách kế toán tài sản**. Đảo ngược = phải làm chứng từ kế toán mới, không phải bấm nút. |
| Tại sao phải gõ lại serial để xác nhận? | Chống thao tác nhầm trên thao tác không thể đảo ngược. |

### Flow H — Logistics

Máy ở trạng thái "đang trên đường" là lúc **dễ mất nhất** và **không ai đang giữ**. Logistics tracking trả lời câu hỏi: *"Máy này lúc này đang ở đâu, ai chịu trách nhiệm?"*

---

## 5. Cơ chế kỹ thuật "kiểu banking" — Giải thích bằng ví dụ đời thường

| Cơ chế | Vấn đề nó giải quyết | Ví dụ đời thường |
|---|---|---|
| **Idempotency Key** | User bấm "Cấp phát" 2 lần do mạng chậm → tạo 2 bản ghi | Mã đơn hàng: gửi lại cùng mã thì hệ thống biết là cùng 1 đơn |
| **Optimistic Lock (`version`)** | 2 người cùng sửa 1 bản ghi, người sau ghi đè người trước | Google Docs báo "tài liệu đã bị người khác sửa" |
| **Partial Unique Index** | Lớp chặn cuối cùng ở DB: 1 device chỉ có 1 assignment ACTIVE | Một ghế rạp chỉ bán được 1 vé |
| **Outbox Pattern** | Lưu DB thành công nhưng gửi Kafka thất bại → WAY4 không biết | Ghi việc cần làm vào sổ trước, rồi mới đi làm; quên thì đọc sổ làm lại |
| **Data Scope theo Business Unit** | Chi nhánh HN xem được dữ liệu HCM → lộ thông tin | Nhân viên chi nhánh chỉ có chìa khoá két của chi nhánh mình |
| **Audit Log** | Sự cố xảy ra, không biết ai làm | Camera an ninh |
| **History tables** (`*_history`) | Cần biết trạng thái tại một thời điểm trong quá khứ | Lịch sử bệnh án |
| **Soft delete / không xoá** | Xoá dữ liệu = mất bằng chứng | Ngân hàng không xé chứng từ, chỉ đóng dấu "huỷ" |
| **Sync vs Async integration** | T24 verify phải chờ (sai tài khoản thì không cho tạo); WAY4 sync có thể chạy nền | Kiểm tra CMND phải làm ngay; gửi thư báo thì gửi sau |

---

## 6. Đánh giá file 11 — Những điểm mâu thuẫn cần làm rõ

> Đây là phần **giá trị nhất cho việc rèn khả năng phán đoán**. Ở dự án thật, phát hiện mâu thuẫn trong tài liệu là kỹ năng được đánh giá rất cao. Hãy thử tự giải thích trước khi đọc đề xuất.

| # | Mâu thuẫn | Vị trí trong file 11 | Đề xuất xử lý |
|---|---|---|---|
| 1 | **Mã lỗi trùng nhau**: `POS-9001..9005` vừa là lỗi Auth (§4.4), vừa là lỗi WAY4/T24 (§9.3). Code login frontend lại dùng `POS-1001/1002` cho Auth, trong khi §4.4 gán `POS-1xxx` cho Device. | §4.4, §9.3 | Chia dải mã theo module, ví dụ `POS-1xxx` Auth, `POS-2xxx` Device, `POS-8xxx` Integration. Một mã chỉ có một nghĩa. |
| 2 | **Trạng thái TID có 2 kiểu**: Flow B/D dùng `PENDING → ACTIVE`, Flow G dùng `UNASSIGNED → ASSIGNED`. | §3.2, §3.4, §7.1 | Tách 2 trục: trạng thái **vòng đời** (`PENDING/ACTIVE/INACTIVE/DECOMMISSIONED`) và trạng thái **gắn máy** (có/không có device — suy ra từ bảng assignment). |
| 3 | **Flow G bỏ qua xuất kho**: Device đi thẳng `INSTOCK → DEPLOYED`, trong khi Flow B bắt buộc qua phiếu xuất kho + duyệt (`OUT_OF_WAREHOUSE`). Flow B bước 6 cũng chấp nhận `INSTOCK`. | §3.2, §7.1 | Chốt 1 quy tắc. Khuyến nghị: chỉ `OUT_OF_WAREHOUSE` mới được cấp phát — nếu không, phiếu xuất kho mất ý nghĩa kiểm soát. |
| 4 | **Thứ tự kích hoạt Merchant**: Flow G kích hoạt Merchant ở **cuối cùng** (sau khi gắn máy), Flow B yêu cầu Merchant **ACTIVE trước** khi cấp phát. | §3.2, §7.1 | Merchant phải ACTIVE (đã KYC) trước khi tạo MID/TID và nhận máy. |
| 5 | **TID gắn ở đâu**: Flow D tạo TID trực tiếp trong Merchant (Tab Terminals), mô hình chuẩn là TID thuộc MID. | §3.4 vs §1.3 | Flow D là phiên bản cũ, nên cập nhật theo mô hình Merchant → MID → TID. |
| 6 | **Thu hồi có duyệt không?** Flow C không có duyệt, nhưng §8.1 nói "phiếu thu hồi được APPROVED" và filter Approval có `DEVICE_RETURN`. | §3.3, §8.1, §2.4 | Làm rõ với BA. Thường: thu hồi do hỏng → không cần duyệt; thu hồi do vi phạm / chấm dứt hợp đồng → cần duyệt. |
| 7 | **Serial Number do ai sinh?** §10 nói "Service layer sinh serial từ `model.serial_prefix`", validation lại ép định dạng `SN-POS-XXXXXX`, ví dụ lại là `SN-PAX-000001`. | §4.6, §10, §1.3 | **Thực tế serial do nhà sản xuất in trên máy**, hệ thống chỉ **nhận và kiểm tra trùng**, không tự sinh. Định dạng khác nhau theo Vendor → validate theo regex cấu hình ở Device Model. |
| 8 | **Tài khoản admin seed**: tài liệu ghi `admin@pos.vn`, thực tế đăng nhập bằng `admin`. | §2.3 | Cập nhật tài liệu cho khớp seed. |
| 9 | **Đánh số mục nhảy từ §5 sang §7** (không có §6). | — | Sửa lại đánh số. |
| 10 | **"Kiểm kê định kỳ" có trong phạm vi (§1.1) nhưng không có flow nào.** | §1.1 | Bổ sung flow (xem §7.1 dưới đây). |

### 6.1 Đề xuất một State Machine thống nhất cho Device

```
                ┌──────────────── (kiểm tra OK) ◄──────────────┐
                ▼                                               │
  [nhập kho] INSTOCK ──(phiếu xuất được duyệt)──► OUT_OF_WAREHOUSE / IN_TRANSIT
                │                                       │
                │ (điều chuyển kho)                     │ (gắn TID)
                ▼                                       ▼
             IN_TRANSIT ──(đến kho mới)──► INSTOCK   DEPLOYED
                                                        │
                                       (thu hồi)        ▼
                                                     RETURNED ──(lỗi)──► REPAIRING
                                                        │                   │
                                                        │         (không sửa được + duyệt)
                                                        ▼                   ▼
                                                     LOST (mất)  ──────► DISPOSED  (kết thúc)
```

> Hai trạng thái **chưa có trong demo** nhưng hệ thống thật hay cần: `IN_TRANSIT` (đang vận chuyển) và `LOST` (mất / bị trộm).

---

## 7. Hệ thống thật thường có thêm gì? (Để bạn không bị bất ngờ)

### 7.1 Các flow còn thiếu trong demo

| Flow | Mô tả ngắn | Điểm nghiệp vụ cần lưu ý |
|---|---|---|
| **Kiểm kê (Stock Count)** | Định kỳ đối chiếu serial thực tế với hệ thống | Tạo đợt kiểm kê → khoá biến động kho → quét serial → báo cáo chênh lệch (thừa/thiếu) → duyệt điều chỉnh |
| **Đổi máy (Device Swap)** | Máy hỏng tại Merchant, thay máy mới **giữ nguyên TID** | Thực chất = Thu hồi + Cấp phát trong **1 giao dịch nguyên tử**, không để TID "trống" giữa chừng |
| **Đóng Merchant (Offboarding)** | Merchant ngừng hợp tác | Thu hồi toàn bộ máy → đóng TID → đóng MID → huỷ trên WAY4 → tất toán phí còn nợ |
| **Mất / Trộm máy** | Máy bị mất tại Merchant hoặc khi vận chuyển | Khoá TID ngay lập tức trên WAY4 (chống giao dịch gian lận), lập biên bản, có thể phạt Merchant theo hợp đồng |
| **Bảo hành** | Theo dõi hạn bảo hành theo serial | Quyết định gửi Vendor sửa miễn phí hay tự chịu chi phí |
| **Uỷ quyền duyệt (Delegation)** | Người duyệt nghỉ phép | Uỷ quyền tạm thời, có thời hạn, có ghi log |
| **Quá hạn duyệt (Escalation)** | Phiếu treo quá N ngày | Tự động nhắc / chuyển cấp trên |
| **Merchant tạm ngưng (Suspend)** | Nghi ngờ gian lận | Tạm khoá giao dịch trên WAY4 nhưng không thu hồi máy |

### 7.2 Các phần hệ thống thật thường có

- **TMS & Key Management**: Trước khi giao máy, máy phải được **nạp khoá mã hoá (TMK)** trong phòng bảo mật và **tải ứng dụng + tham số** (MID, TID, IP host). Máy chưa nạp khoá thì không giao dịch được. → Thường có thêm trạng thái như `KEY_INJECTED`, `READY_TO_DEPLOY`.
- **SIM / Kết nối**: Máy POS 4G có SIM riêng, cần quản lý số SIM, nhà mạng, cước.
- **Hợp đồng & Phí thuê máy**: Merchant thuê máy, đặt cọc, phí duy trì; nếu doanh số thấp có thể bị thu phí.
- **Phụ kiện**: Sạc, đế, cuộn giấy in — đôi khi cũng quản lý kho.
- **Khấu hao tài sản**: Phòng kế toán cần giá trị còn lại của máy.
- **Bảng có nhiều field hơn rất nhiều**: Merchant thật có người đại diện pháp luật, giấy phép kinh doanh, tài liệu KYC, mức rủi ro, giờ hoạt động, toạ độ GPS, nhân viên quản lý quan hệ (RM)...

---

## 8. Tình huống luyện phán đoán

> Đọc tình huống, **tự trả lời trước**, rồi mới mở đáp án. Đây là cách nhanh nhất để "có cảm giác nghiệp vụ".

<details>
<summary><b>TH1.</b> Merchant gọi tổng đài: "Máy POS của tôi không quẹt được thẻ nữa". Hệ thống của bạn cần hỗ trợ gì?</summary>

- Tra theo Merchant / TID → xem device đang gắn, model, hạn bảo hành, lịch sử sửa chữa.
- Kiểm tra trạng thái TID và Merchant trên WAY4 (có bị khoá / suspend không?).
- Nếu hỏng phần cứng → **Đổi máy** (giữ TID), máy cũ → RETURNED → REPAIRING.
- Gợi ý: màn hình tra cứu cần cho phép tìm theo **TID**, không chỉ theo serial.
</details>

<details>
<summary><b>TH2.</b> Hai nhân viên cùng lúc cấp phát cùng 1 máy cho 2 Merchant khác nhau. Điều gì xảy ra?</summary>

- Người thứ nhất thành công, `version` của device tăng.
- Người thứ hai bị **Optimistic Lock** chặn (version cũ) → lỗi "Dữ liệu đã thay đổi".
- Nếu lọt qua (ví dụ 2 transaction song song) → **Partial Unique Index** ở DB chặn assignment ACTIVE thứ 2.
</details>

<details>
<summary><b>TH3.</b> Cấp phát thành công trong POS Management nhưng WAY4 đang bảo trì. Có nên báo lỗi cho người dùng không?</summary>

- **Không chặn người dùng** (WAY4 sync là async qua Outbox).
- Event nằm trong outbox, retry khi WAY4 lên lại. Quá số lần retry → vào `integration_errors`, cảnh báo trên Monitoring.
- Nhưng nên hiển thị cho người dùng trạng thái "Đang đồng bộ WAY4" để họ biết máy **chưa giao dịch được ngay**.
</details>

<details>
<summary><b>TH4.</b> Nhân viên kho nhập serial bị trùng với một máy đã DISPOSED cách đây 2 năm. Xử lý thế nào?</summary>

- Serial phải **unique vĩnh viễn**, kể cả máy đã thanh lý → từ chối (POS-5001).
- Có thể là nhập nhầm, hoặc Vendor giao máy tân trang (refurbished) → cần BA quyết định quy trình đặc biệt, không tự ý cho ghi đè.
</details>

<details>
<summary><b>TH5.</b> Quản lý kho đi công tác 2 tuần, phiếu xuất kho treo hết. Đề xuất giải pháp?</summary>

- Uỷ quyền duyệt (Delegation) có thời hạn, hoặc cấu hình nhiều người cùng role có thể duyệt.
- Escalation: phiếu quá 48h tự chuyển cấp trên.
- Lưu ý: người được uỷ quyền **vẫn không được duyệt phiếu do chính mình tạo**.
</details>

<details>
<summary><b>TH6.</b> BA yêu cầu: "Cho phép xoá Merchant tạo nhầm". Bạn phản hồi thế nào?</summary>

- Hỏi lại: Merchant đã có MID/TID/đồng bộ WAY4 chưa? Đã có giao dịch chưa?
- Đề xuất: chỉ cho **huỷ** (status `CANCELLED`) khi còn PENDING và chưa có MID; không xoá vật lý (giữ audit trail).
</details>

<details>
<summary><b>TH7.</b> Merchant chuyển địa chỉ cửa hàng sang quận khác. Có phải tạo TID mới không?</summary>

- Thường **không cần** tạo TID mới, chỉ cập nhật địa chỉ lắp đặt (có lịch sử thay đổi).
- Nhưng nếu đổi sang **chi nhánh ngân hàng quản lý khác** (Business Unit khác) → ảnh hưởng Data Scope, cần quy trình chuyển giao, có thể cần duyệt.
</details>

---

## 9. Bộ câu hỏi nên hỏi BA / Senior khi vào dự án thật

**Về phạm vi**
1. Hệ thống mình là phía Acquirer phải không? Có tích hợp TMS không?
2. Hệ thống nào là "nguồn sự thật" (source of truth) cho MID/TID — mình hay WAY4?

**Về trạng thái**
3. Có sơ đồ state machine chính thức cho Device, Merchant, TID, Phiếu không?
4. Trạng thái nào là "kết thúc", không thể đảo ngược?

**Về phê duyệt**
5. Loại phiếu nào cần duyệt, mấy cấp, theo hạn mức nào (số lượng máy / giá trị)?
6. Có uỷ quyền và escalation không?

**Về dữ liệu**
7. Serial có định dạng theo Vendor không? Có trường hợp máy refurbished không?
8. Dữ liệu nào nhạy cảm, cần mask khi log / xuất file?

**Về tích hợp**
9. Gọi WAY4/T24 lỗi thì xử lý thế nào? Ai là người xử lý thủ công?
10. Có môi trường UAT của WAY4/T24 để test không?

**Về vận hành**
11. Báo cáo nào được gửi cho ban lãnh đạo / Ngân hàng Nhà nước?
12. Lưu trữ audit log bao lâu?

---

## 10. Lộ trình tự học đề xuất (2 tuần)

| Ngày | Việc | Kết quả mong đợi |
|---|---|---|
| 1–2 | Đọc §1–§3 file này, vẽ lại sơ đồ 4 bên ra giấy | Giải thích được cho người khác vì sao cần MID/TID |
| 3–4 | Đọc file 11 §1–§3, đối chiếu với §4 file này | Kể lại được Flow A → B → C bằng lời của mình |
| 5 | Mở DB, xem bảng `devices`, `assignments`, `stock_transactions` | Biết mỗi flow ghi vào bảng nào |
| 6–7 | Chạy app, tự đóng vai Maker và Checker (2 tài khoản) | Trải nghiệm thật luồng phê duyệt |
| 8 | Làm §6 — tự tìm thêm mâu thuẫn mới | Rèn mắt "soi" tài liệu |
| 9–10 | Làm §8 — tự viết thêm 3 tình huống | Có phản xạ nghiệp vụ |
| 11–14 | Chọn 1 flow còn thiếu ở §7.1, viết đặc tả (state, bảng, API, quyền) | Có sản phẩm cụ thể để trao đổi với Senior |

---

## 11. Tự đánh giá: Bạn đã sẵn sàng chưa?

Bạn đã nắm nghiệp vụ ở mức đủ tự tin khi trả lời được hết các câu sau **mà không cần mở tài liệu**:

- [ ] Ngân hàng của tôi là Acquirer hay Issuer trong dự án này? Tại sao?
- [ ] MID và TID khác nhau thế nào? Vì sao đổi máy không cần đổi TID?
- [ ] Vì sao xuất kho và cấp phát là 2 bước do 2 người khác nhau làm?
- [ ] Maker-Checker ngăn chặn rủi ro gì?
- [ ] Idempotency và Optimistic Lock khác nhau thế nào?
- [ ] Vì sao WAY4 sync async nhưng T24 verify sync?
- [ ] Nêu 3 điểm mâu thuẫn trong file 11 và cách xử lý.
- [ ] Nêu 3 flow mà hệ thống thật có nhưng demo chưa có.
