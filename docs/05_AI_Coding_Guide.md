# POS Management System — Hướng Dẫn Cho AI Agent (AI Coding Guide)

> ⚠️ **ANTIGRAVITY AI AGENT:** Đọc `CODING_AGENT_GUIDE.md` TRƯỚC tài liệu này. Đó là "kim chỉ nam" với quy trình bắt buộc, checklist và coding standards chi tiết nhất.

Tài liệu này hướng dẫn cách làm việc hiệu quả với AI Agent (Gemini, Claude, Cursor, Copilot) trong dự án POS Management. Đọc kỹ trước khi bắt đầu code bất kỳ Sprint nào.

---

## 1. Quy Trình Làm Việc Với AI Agent

### Bước 1: Khởi động đúng context
Sao chép prompt sau vào chat đầu tiên với AI Agent:

```markdown
Bạn là AI coding assistant chuyên về Banking Enterprise, hỗ trợ tôi xây dựng dự án
**POS Terminal & Merchant Management System** với Java 21 + Spring Boot 3 + Angular 22.

Trước khi viết bất kỳ dòng code nào, bạn BẮT BUỘC phải đọc theo thứ tự:
1. `POS_Manager/docs/00_Project_Vision.md` — Tầm nhìn, scope, technology stack
2. `POS_Manager/docs/01_Architecture_Bible.md` — Kiến trúc, patterns, sequence diagrams
3. `POS_Manager/docs/02_Coding_Guideline.md` — Coding standards, Javadoc, naming
4. `POS_Manager/docs/04_Sprint_Plan.md` — Sprint hiện tại và scope được phép làm

Sau khi đọc xong, hãy:
- Xác nhận đã đọc và nắm kiến trúc POS Management
- Hỏi: "Chúng ta sẽ làm Sprint nào hoặc Task nào hôm nay?"
```

### Bước 2: Xác định Sprint đang làm
Kiểm tra `task.md` để biết Sprint hiện tại và task nào còn `[ ]` chưa làm.

### Bước 3: Code theo pattern
- Backend: Clean Architecture (Domain → Application → Infrastructure → Presentation)
- Frontend: Standalone Components, Signal-based state, file tách `.ts` / `.html` / `.scss`
- Database: Flyway migration, không dùng `ddl-auto=create`
- Kafka: Luôn dùng Outbox Pattern, không publish trực tiếp trong @Transactional

### Bước 4: Verify trước khi bàn giao
- `mvn compile` — 0 errors
- `ng build` — 0 errors
- `docker-compose up` — tất cả services UP
- Test theo checklist Sprint

---

## 2. Câu Hỏi AI Agent Phải Trả Lời Được

### Domain Knowledge:
- **Merchant, TID, Device, Serial Number** — mỗi khái niệm ý nghĩa gì, quan hệ ra sao?
- **Assignment** — tại sao không chỉ `device.merchantId = merchantId`?
- **Stock Ledger** — tại sao không chỉ lưu `quantity` mà phải append-only transactions?
- **Device Lifecycle** — 6 trạng thái và allowed transitions là gì?
- **Approval Workflow** — Maker-Checker là gì? Tại sao Banking cần?
- **Effective Dating (Fee Policy)** — có nhiều Fee Policy cho 1 Merchant, làm sao query policy đang có hiệu lực?

### Technical Deep Dives:
- **Optimistic Lock vs Pessimistic Lock** — khi nào dùng trong POS System?
- **Idempotency** — nhân viên nhấn nút Assign 2 lần thì sao?
- **Transactional Outbox** — tại sao không publish Kafka trong @Transactional?
- **Concurrent Assignment** — hai nhân viên cùng assign một serial thì DB xử lý ra sao?
- **Data Scope** — làm sao đảm bảo user chỉ thấy data Business Unit của mình?
- **State Machine** — tại sao thiết bị DISPOSED không được chuyển về INSTOCK?
- **Idempotent Consumer** — Kafka consumer nhận cùng event 2 lần thì xử lý thế nào?
- **Partial Unique Index** — giải thích `UNIQUE ON assignments(device_id) WHERE status='ACTIVE'`

---

## 3. Pattern Reference Quick Guide

### Cấp Phát Thiết Bị (Assignment) — Template

```java
@Override
@Transactional
public AssignmentResponse createAssignment(
    CreateAssignmentCommand command,
    String idempotencyKey,
    UserPrincipal currentUser
) {
    // Bước 1: Idempotency check
    String cachedResult = redisTemplate.opsForValue()
        .get("idempotency:assign:" + idempotencyKey);
    if (cachedResult != null) {
        return parseResponse(cachedResult);
    }

    // Bước 2: Load Device với Optimistic Lock
    DeviceJpaEntity device = deviceRepository
        .findBySerialNumberWithLock(command.serialNumber())
        .orElseThrow(() -> new DeviceNotFoundException(command.serialNumber()));

    // Bước 3: Validate business rules
    if (!device.getStatus().canTransitionTo(DeviceStatus.DEPLOYED)) {
        throw new DeviceNotAssignableException(device.getSerialNumber(), device.getStatus());
    }
    validateBusinessUnitScope(currentUser, command.merchantCode());

    // Bước 4: Execute (trong @Transactional này)
    AssignmentJpaEntity assignment = assignmentRepository.save(
        AssignmentJpaEntity.create(device, command, currentUser.getUserId()));
    device.transitionTo(DeviceStatus.DEPLOYED);
    deviceRepository.save(device);  // Optimistic Lock check tại đây
    lifecycleHistoryRepository.save(DeviceLifecycleHistory.of(
        device, DeviceStatus.INSTOCK, DeviceStatus.DEPLOYED, "Cấp phát", currentUser.getUserId()));
    outboxRepository.save(OutboxEvent.of("DEVICE_ASSIGNED", assignment.getId(), payload));

    // Bước 5: Cache idempotency result
    AssignmentResponse response = mapper.toResponse(assignment);
    redisTemplate.opsForValue().set(
        "idempotency:assign:" + idempotencyKey,
        objectMapper.writeValueAsString(response), 10, MINUTES);
    return response;
}
```

### Angular Component — Template

```typescript
// device-detail.page.ts
@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  templateUrl: './device-detail.page.html',
  styleUrls: ['./device-detail.page.scss'],
  imports: [CommonModule, MatTabsModule, MatButtonModule, MatChipsModule, ...]
})
export class DeviceDetailPageComponent implements OnInit {
  private readonly deviceService = inject(DeviceService);
  private readonly route = inject(ActivatedRoute);

  // Signals cho state management
  readonly device = signal<DeviceDetailResponse | null>(null);
  readonly activeTab = signal<number>(0);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed signals
  readonly canAssign = computed(() =>
    this.device()?.status === 'INSTOCK' &&
    this.authService.hasPermission('ASSIGNMENT_CREATE')
  );
  readonly canReturn = computed(() =>
    this.device()?.status === 'DEPLOYED' &&
    this.authService.hasPermission('ASSIGNMENT_RETURN')
  );

  ngOnInit(): void {
    const serial = this.route.snapshot.paramMap.get('serial')!;
    this.loadDevice(serial);
  }

  private loadDevice(serial: string): void {
    this.isLoading.set(true);
    this.deviceService.getDeviceDetail(serial).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (device) => this.device.set(device),
      error: (err) => this.error.set(err.message)
    });
  }
}
```

---

## 4. Domain Events Reference

### Kafka Topics

| Topic | Producer | Consumer | Khi Nào |
|---|---|---|---|
| `device-assigned` | Assignment Module | Audit, Monitoring | Sau khi assign thành công |
| `device-returned` | Assignment Module | Audit, Monitoring | Sau khi thu hồi thành công |
| `device-lifecycle-changed` | Device Module | Audit, Monitoring | Mọi khi device status thay đổi |
| `stock-issued` | Inventory Module | Audit, Monitoring | Sau khi nhập kho |
| `stock-exported` | Inventory Module | Audit, Monitoring | Sau khi xuất kho |
| `stock-transferred` | Inventory Module | Audit, Monitoring | Sau khi điều chuyển kho |
| `approval-submitted` | Approval Module | Notification | Sau khi submit phiếu |
| `approval-approved` | Approval Module | Notification, BusinessModule | Sau khi duyệt |
| `approval-rejected` | Approval Module | Notification | Sau khi từ chối |
| `merchant-created` | Merchant Module | Audit | Tạo Merchant mới |
| `terminal-status-changed` | Merchant Module | Audit | Thay đổi trạng thái TID |

### Event Schema Template

```json
{
  "eventId": "EVT-000001",
  "eventType": "DEVICE_ASSIGNED",
  "aggregateId": "SN-POS-000001",
  "aggregateType": "DEVICE",
  "occurredAt": "2026-10-01T14:00:00Z",
  "version": 1,
  "payload": {
    "serialNumber": "SN-POS-000001",
    "merchantCode": "M000001",
    "terminalId": "T100001",
    "assignedBy": "user-uuid",
    "assignmentId": "ASG-000001"
  },
  "metadata": {
    "correlationId": "CORR-xxx",
    "source": "assignment-service"
  }
}
```

---

## 5. Danh Sách Giao Diện Cần Build

Tổng cộng **38 màn hình** cho toàn bộ dự án:

| # | Nhóm | Màn Hình | Sprint |
|---|---|---|---|
| 1 | Auth | Login Page | 01 |
| 2 | Layout | Main Layout + Sidebar | 01 |
| 3 | Admin | User Management | 01 |
| 4 | Admin | Role & Permission | 01 |
| 5 | Catalog | Device Category | 02 |
| 6 | Catalog | Device Type | 02 |
| 7 | Catalog | Device Model | 02 |
| 8 | Catalog | Vendor | 02 |
| 9 | Catalog | MCC | 02 |
| 10 | Catalog | Fee Policy | 02 |
| 11 | Organization | Business Unit | 02 |
| 12 | Organization | Warehouse | 02 |
| 13 | Inventory | Purchase Order — List | 03 |
| 14 | Inventory | Purchase Order — Create/Detail | 03 |
| 15 | Inventory | Nhập Kho | 03 |
| 16 | Inventory | Tồn Kho (Stock Overview) | 03 |
| 17 | Inventory | Xuất Kho | 04 |
| 18 | Inventory | Điều Chuyển Kho | 04 |
| 19 | Merchant | Danh Sách Merchant | 05 |
| 20 | Merchant | Chi Tiết Merchant (4 tabs) | 05 |
| 21 | Merchant | Quản Lý TID | 05 |
| 22 | Device | Tra Cứu Thiết Bị | 06 |
| 23 | Device | Chi Tiết Thiết Bị (8 tabs) | 06 |
| 24 | Repair | Quản Lý Đơn Sửa Chữa | 07 |
| 25 | Assignment | Cấp Phát Thiết Bị | 08 |
| 26 | Assignment | Danh Sách Assignment | 08 |
| 27 | Assignment | Lịch Sử Assignment | 09 |
| 28 | Approval | Hộp Việc Cần Duyệt (Inbox) | 10 |
| 29 | Approval | Chi Tiết Phiếu Phê Duyệt | 10 |
| 30 | Approval | Yêu Cầu Tôi Đã Tạo | 10 |
| 31 | Approval | Tất Cả Yêu Cầu | 10 |
| 32 | Approval | Lịch Sử Phê Duyệt | 10 |
| 33 | Monitoring | Outbox Events Monitor | 12 |
| 34 | Dashboard | Main Dashboard (KPIs + Charts) | 13 |
| 35 | Monitoring | Giám Sát POS | 13 |
| 36 | Monitoring | Audit Log | 14 |
| 37 | Report | Báo Cáo | 14 |
| 38 | Notification | Notification Center | 11 |

---

## 6. Lỗi Thường Gặp & Cách Xử Lý

### Backend:
```
LazyInitializationException → Thêm @Transactional hoặc dùng JOIN FETCH trong query
OptimisticLockException → Thêm @Retryable(retryFor = ObjectOptimisticLockingFailureException.class, maxAttempts = 3)
DataIntegrityViolationException → Unique constraint violated, check business logic
FlywayException → Không được edit file migration cũ, tạo file V(n+1) mới
```

### Frontend:
```
ExpressionChangedAfterItHasBeenCheckedError → Dùng Signal thay vì mutable property
NG0200 (Circular dependency) → Kiểm tra import giữa các module
CORS Error → Kiểm tra CorsConfig trong Spring Boot backend
401 Unauthorized → Kiểm tra JWT Interceptor attach Bearer token chưa
```

---

## 7. Checklist Security Review (Trước Mỗi Sprint Review)

```
Backend Security:
☐ Không log serial number / TID raw (phải mask)
☐ Không return JPA Entity từ REST Controller
☐ Không publish Kafka trong @Transactional (dùng Outbox)
☐ Có @PreAuthorize trên mọi sensitive endpoint
☐ Data Scope filter trên mọi list query
☐ Device State Machine validate trước mọi status change
☐ Optimistic Lock trên mọi concurrent-prone entity
☐ Idempotency Key trên Assignment, Approval submit

Frontend Security:
☐ JWT Interceptor attach token mọi request
☐ Permission Guard trên tất cả routes cần quyền
☐ Không lưu sensitive data trong localStorage (chỉ token)
☐ Không hardcode API URL (dùng environment.ts)
☐ Error handling graceful (không expose stack trace cho user)
```
