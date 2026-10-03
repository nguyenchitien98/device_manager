# CODING AGENT GUIDE — Quy Trình Làm Việc Cho Antigravity AI

> Đây là tài liệu QUAN TRỌNG NHẤT. Đọc kỹ toàn bộ trước khi bắt đầu bất kỳ Sprint nào.

---

## ⚡ QUY TRÌNH BẮT BUỘC MỖI SESSION

### Bước 1: Khởi Động Context

Trước khi code, BẮT BUỘC đọc theo thứ tự:

1. `task.md` → xác định Sprint hiện tại và tasks `[ ]` cần làm
2. `docs/07_UI_UX_Standard.md` → design system, sidebar structure, screen specs
3. `docs/04_Sprint_Plan.md` → chi tiết Sprint đang làm
4. `docs/06_Database_Schema.md` → schema tables liên quan
5. `docs/11_Business_Flow.md` → business flows, state machines

Sau khi đọc xong, confirm: "Đã đọc docs, Sprint {N} cần làm: [list tasks]"

### Bước 2: Xác Định Scope

CHỈ làm tasks trong Sprint hiện tại. KHÔNG tự ý làm Sprint sau.

### Bước 3: Code Theo Pattern

**Backend:** Domain → Application → Infrastructure → Presentation
**Frontend:** Standalone Components, Signal-based state, 3 file tách biệt .ts/.html/.scss

### Bước 4: Verify Trước Khi Bàn Giao

- `mvn compile` → 0 errors
- `ng build` → 0 errors
- Test cases từ Sprint checklist

---

## 🎨 THIẾT KẾ UI — QUY TẮC BẮT BUỘC

### Shared UI Components (BẮT BUỘC TÁI SỬ DỤNG 100%)

TUYỆT ĐỐI KHÔNG tự viết lại các thẻ HTML thô hoặc CSS tùy biến khi đã có Shared Component trong `@shared` (`src/app/shared/index.ts`):
- Nút bấm: `<pos-button>`
- Ô nhập liệu / Search: `<pos-input>`
- Dropdown select: `<pos-select>`
- Huy hiệu trạng thái: `<pos-badge>`
- Modal / Pop-up: `<pos-modal>`
- Bảng dữ liệu: `<pos-table>`
- Phân trang: `<pos-pagination>`
- Context menu: `<pos-dropdown>`
- Xác nhận: `<pos-confirm-dialog>`
- Loading placeholder: `<pos-skeleton>`
- Trang trống: `<app-empty-state>`

### Màu Sắc

DÙNG CSS variables `var(--bg-card)`, `var(--text-primary)` v.v. — KHÔNG hardcode màu
Dual theme: `.theme-light` và `.theme-dark` trên `<body>`
Tham chiếu palette từ `docs/07_UI_UX_Standard.md Section 1`

### Sidebar

Cấu trúc CHÍNH XÁC theo `docs/07_UI_UX_Standard.md Section 0.2`:
- Warehouse nằm trong QUẢN LÝ DANH MỤC
- Nhập/Xuất/Tồn/Điều chuyển nằm trong QUẢN LÝ XUẤT/NHẬP KHO
- Hộp việc cần duyệt có badge đỏ

### Layout Màn Danh Sách

BẮT BUỘC 2 Khung (từ `docs/07_UI_UX_Standard.md Section 4`):

**KHUNG TRÊN (Search Zone):**
- Grid filter inputs (3-4 cột)
- 3 nút: [Tìm kiếm] PRIMARY | [Clear] ghost | [Xuất Excel] outline
- Status Tabs (chỉ khi màn có workflow)
- Clear = reset ALL filter + auto tìm kiếm lại

**KHUNG DƯỚI (List Zone):**
- Toolbar: [+ Thêm mới] [Chọn cột]              [Làm mới]
- Table: checkbox | STT | data | Actions(Xem/Sửa/···)
- Empty state + Loading skeleton
- Pagination: "Hiển thị X-Y của Z" + size selector + page buttons

### Dashboard

Từ ảnh chuẩn - 4 rows:
1. 5 KPI Cards lớn (gradient: blue/green/indigo/amber/red)
2. 3 KPI Cards nhỏ (Merchant Active / TID / Chờ duyệt)
3. Bar Chart + Donut Chart (ApexCharts)
4. Horizontal Bar (Top 5 Kho) + Activity Feed

---

## 💻 CODING STANDARDS

### Angular Component

```typescript
// ĐÚNG — Standalone, Signal-based, 3 files tách
@Component({
  selector: 'app-merchant-list-page',
  standalone: true,
  templateUrl: './merchant-list.page.html',
  styleUrls: ['./merchant-list.page.scss'],
  imports: [CommonModule, ReactiveFormsModule, PosTableComponent, ...]
})
export class MerchantListPageComponent implements OnInit {
  // Signals
  merchants  = signal<MerchantResponse[]>([]);
  isLoading  = signal<boolean>(false);
  totalItems = signal<number>(0);
  activeTab  = signal<string>('ALL');

  // Computed
  isEmpty = computed(() => this.merchants().length === 0 && !this.isLoading());

  // Inject (dùng inject() KHÔNG constructor injection)
  private readonly merchantService = inject(MerchantApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
}
```

### Backend Service

```java
// ĐÚNG — Clean Architecture, Javadoc tiếng Việt
@Service
@RequiredArgsConstructor
@Slf4j
public class MerchantApplicationService {

    private final MerchantRepository merchantRepository;
    private final DataScopeService dataScopeService;

    /**
     * Truy vấn danh sách Merchant theo điều kiện tìm kiếm.
     * Áp dụng Data Scope: chỉ trả về Merchant thuộc Business Unit của user hiện tại.
     *
     * @param filter điều kiện filter
     * @param pageable phân trang
     * @return danh sách merchant phân trang
     */
    @Transactional(readOnly = true)
    public Page<MerchantResponse> searchMerchants(MerchantFilterRequest filter, Pageable pageable) {
        BusinessUnitId scopedBU = dataScopeService.getCurrentUserBusinessUnitId();
        // ...
    }
}
```

---

## 🚫 NHỮNG GÌ TUYỆT ĐỐI KHÔNG LÀM

### Frontend

❌ KHÔNG hardcode màu hex trong component SCSS (dùng CSS variables hoặc SCSS vars)
❌ KHÔNG dùng `any` type trong TypeScript
❌ KHÔNG dùng `document.getElementById()` hay DOM manipulation thủ công
❌ KHÔNG tạo button hoạt động nhưng không có API call thực
❌ KHÔNG dùng inline styles trong HTML template
❌ KHÔNG để button Submit enabled khi form invalid
❌ KHÔNG bỏ qua empty state và loading state

### Backend

❌ KHÔNG trả về JPA Entity trực tiếp từ Controller
❌ KHÔNG publish Kafka event trong @Transactional (dùng Outbox Pattern)
❌ KHÔNG log raw serial number hay TID (dùng MaskingUtils)
❌ KHÔNG viết `// TODO` hay `throw new UnsupportedOperationException()`
❌ KHÔNG edit file Flyway migration cũ (tạo file V(n+1) mới)
❌ KHÔNG dùng `ddl-auto=create` hay `ddl-auto=update`
❌ KHÔNG return null từ service methods (dùng Optional hoặc throw exception)

---

## ✅ CHECKLIST TRƯỚC KHI BÀN GIAO MỖI TASK

### Frontend

```
☐ ng build → 0 errors, 0 warnings
☐ Tất cả button THỰC SỰ hoạt động (có API call)
☐ Loading state hiển thị khi đang fetch
☐ Empty state khi không có data
☐ Error handling khi API fail (Toast error)
☐ Form validation đầy đủ (required, format, real-time)
☐ Button Submit disabled khi form invalid
☐ Responsive layout (minimum 1280px)
☐ Dark Mode hoạt động đúng
☐ Breadcrumb đúng theo route
☐ Sidebar active item highlight đúng route
☐ Pagination hoạt động (prev/next/page số)
☐ Status badges đúng màu (xem Section 3.1)
```

### Backend

```
☐ mvn compile → 0 errors
☐ Flyway migration chạy clean
☐ @PreAuthorize trên mọi endpoint cần bảo vệ
☐ Data Scope filter trên mọi list query
☐ Javadoc tiếng Việt trên mọi public method
☐ Không return Entity, chỉ return DTO/Response
☐ GlobalExceptionHandler xử lý mọi exception
☐ ApiResponse<T> wrapper cho mọi response
```

---

## 🔑 API CONTRACT CHUẨN

### Response Format

```json
// SUCCESS
{
  "success": true,
  "data": { ... },
  "message": null,
  "timestamp": "2026-10-03T10:00:00Z"
}

// ERROR
{
  "success": false,
  "data": null,
  "message": "Tên đăng nhập hoặc mật khẩu không đúng",
  "errorCode": "POS-1001",
  "timestamp": "2026-10-03T10:00:00Z"
}
```

### Pagination Request

```
GET /api/v1/merchants?page=0&size=20&sort=createdAt,desc&keyword=abc&status=ACTIVE
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "content": [...],
    "totalElements": 120,
    "totalPages": 6,
    "page": 0,
    "size": 20
  }
}
```

---

## 📁 PROJECT STRUCTURE

```
pos-management/
├── backend/
│   ├── pos-common/          # Shared: ApiResponse, exceptions, utils
│   └── pos-core/
│       └── src/main/
│           ├── java/com/banking/pos/
│           │   ├── shared/         # Value objects, utils, audit
│           │   ├── config/         # Spring config (security, kafka, redis)
│           │   ├── identity/       # Auth module
│           │   ├── catalog/        # Catalog module
│           │   ├── organization/   # BU + Warehouse
│           │   ├── inventory/      # Stock module
│           │   ├── merchant/       # Merchant + TID
│           │   ├── device/         # Device lifecycle
│           │   ├── assignment/     # Assignment
│           │   ├── approval/       # Approval workflow
│           │   └── monitoring/     # Dashboard, audit
│           └── resources/
│               ├── db/migration/   # Flyway V1, V2, ...
│               ├── i18n/           # Messages
│               └── application.yml
└── frontend/
    └── src/app/
        ├── core/
        │   ├── services/           # auth.service, token.service, theme.service
        │   ├── interceptors/       # jwt, error, idempotency
        │   └── guards/             # auth.guard, permission.guard
        ├── shared/
        │   ├── components/
        │   │   ├── data-table/
        │   │   ├── status-badge/
        │   │   ├── confirm-dialog/
        │   │   └── approval-timeline/
        │   └── pipes/
        │       └── device-status.pipe.ts
        ├── layout/
        │   ├── main-layout/
        │   ├── header/
        │   └── sidebar/
        └── features/
            ├── auth/login/
            ├── admin/
            ├── catalog/
            ├── inventory/
            ├── merchant/
            ├── device/
            ├── assignment/
            ├── approval/
            ├── monitoring/
            └── dashboard/
```

---

## 🎯 KPI: MỌI NÚT PHẢI HOẠT ĐỘNG

Đây là yêu cầu quan trọng nhất của project:

- Button [Tìm kiếm] → gọi API với filter → hiển thị kết quả vào table
- Button [Clear] → reset form → auto tìm kiếm lại với filter trống
- Button [Xuất Excel] → gọi API export → download file
- Button [+ Thêm mới] → mở Dialog/Form → submit → gọi API POST → refresh table
- Button [Xem] → navigate đến trang detail với đúng ID/Serial
- Button [Sửa] → mở Dialog với data hiện tại → submit → gọi API PUT → refresh
- Button [Khóa/Mở khóa] → ConfirmDialog → gọi API PATCH → update status badge
- Button [Phê duyệt] → gọi API approve → cập nhật status → Toast success
- Button [Từ chối] → validate lý do không trống → gọi API reject → cập nhật
- Tab → hiển thị content đúng tab → nếu cần API call → fetch data → render

**KHÔNG được tạo button UI "để cho có" mà không có logic xử lý thực.**

---

*Tài liệu này là "kim chỉ nam" cho AI Agent. Đọc lại khi bắt đầu mỗi session coding.*
