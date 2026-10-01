# POS Management System — Interview Q&A (Câu Hỏi Phỏng Vấn)

> Tài liệu này tổng hợp các câu hỏi phỏng vấn kỹ thuật thực tế liên quan đến hệ thống POS Management — Banking Enterprise. Mỗi câu hỏi đều có model answer mà bạn phải giải thích được.

---

## Module 1: Device Lifecycle & State Machine

### Q1: Tại sao không dùng `device.setStatus("DEPLOYED")` trực tiếp?

**Model Answer:**
Vì không kiểm soát được transition hợp lệ. Một thiết bị `DISPOSED` không được phép về `DEPLOYED`, một thiết bị `REPAIRING` không được phép `DEPLOYED` ngay — nhưng nếu set trực tiếp, code sẽ không có gì ngăn cản điều đó.

Giải pháp: **State Machine Pattern** trong `DeviceStatus` enum:
```java
public enum DeviceStatus {
    DEPLOYED {
        @Override public Set<DeviceStatus> allowedTransitions() {
            return Set.of(RETURNED); // Chỉ có thể thu hồi
        }
    },
    DISPOSED {
        @Override public Set<DeviceStatus> allowedTransitions() {
            return Set.of(); // Trạng thái kết thúc
        }
    };
    // ...
    public boolean canTransitionTo(DeviceStatus target) {
        return allowedTransitions().contains(target);
    }
}

// Trong Domain Entity:
public DeviceJpaEntity transitionTo(DeviceStatus target) {
    if (!this.status.canTransitionTo(target)) {
        throw new InvalidDeviceStateTransitionException(this.status, target);
    }
    this.status = target;
    return this;
}
```

---

### Q2: Tại sao `device_lifecycle_history` phải là append-only?

**Model Answer:**
Vì đây là dữ liệu lịch sử kiểm toán (audit trail). Nếu cho phép UPDATE/DELETE:
- Không thể truy vết: *"Thiết bị này từng ở kho nào? Ai cấp phát? Khi nào thu hồi?"*
- Có thể bị can thiệp để che giấu sai phạm (gian lận nghiệp vụ)
- Không đáp ứng quy định banking về lưu trữ lịch sử giao dịch

Nguyên tắc: **Immutable History** — mỗi thay đổi trạng thái tạo ra 1 record mới, không bao giờ sửa record cũ.

---

## Module 2: Concurrency & Assignment

### Q3: Hai nhân viên cùng assign một thiết bị SN-POS-000001 cho hai Merchant khác nhau. Database xử lý thế nào?

**Model Answer (3 lớp bảo vệ):**

**Lớp 1 — Optimistic Lock (`@Version`):**
```sql
-- Thread A và Thread B cùng SELECT device version=3
-- Thread A UPDATE trước:
UPDATE devices SET status='DEPLOYED', version=4 WHERE serial='SN-POS-000001' AND version=3; -- 1 row affected ✓
-- Thread B UPDATE sau:
UPDATE devices SET status='DEPLOYED', version=4 WHERE serial='SN-POS-000001' AND version=3; -- 0 rows affected
-- → JPA throw OptimisticLockingFailureException → @Retryable retry 3 lần
-- → Retry: read lại device với version=4, status=DEPLOYED → throw DeviceAlreadyAssignedException
```

**Lớp 2 — Partial Unique Index:**
```sql
CREATE UNIQUE INDEX idx_one_active_assignment
ON assignments(device_id) WHERE status = 'ACTIVE';
-- → Ngay cả khi Optimistic Lock miss, DB enforce chỉ 1 ACTIVE assignment/device
```

**Lớp 3 — Idempotency Key (chống double-click):**
```
SETNX idempotency:assign:{uuid} (TTL 10m) → Chỉ 1 trong 2 request cùng key được xử lý
```

---

### Q4: Nhân viên nhấn nút "Cấp phát" 2 lần nhanh. Hệ thống xử lý thế nào?

**Model Answer:**
Angular generate `X-Idempotency-Key: uuid-v4` một lần khi form submit. Cả 2 request gửi cùng key.

Backend:
```java
String cached = redis.get("idempotency:assign:" + key);
if (cached != null) return parseResponse(cached); // Request thứ 2 → trả về cached response

// Request thứ 1: SETNX key → xử lý → cache kết quả (TTL 10m)
```

→ Request thứ 2 nhận response giống hệt request thứ 1, nhưng **không tạo assignment mới**.

---

### Q5: Optimistic Lock vs Pessimistic Lock — khi nào dùng loại nào trong POS System?

**Model Answer:**

| | Optimistic Lock | Pessimistic Lock |
|---|---|---|
| Cơ chế | `@Version` — check version khi UPDATE | `SELECT ... FOR UPDATE` — lock row |
| Phù hợp khi | Conflict hiếm xảy ra | Conflict xảy ra thường xuyên |
| Overhead | Thấp (không giữ lock) | Cao (giữ lock suốt transaction) |
| Deadlock | Không có | Có thể deadlock |
| Rollback khi conflict | Retry hoặc báo lỗi | Wait cho lock release |
| Dùng trong POS | Assignment device (2 nhân viên hiếm khi assign cùng lúc) | Số dư trong banking core (conflict cao) |

Trong POS Management: ưu tiên **Optimistic Lock** cho Assignment và Approval (low concurrency conflict). Dùng **Pessimistic Lock** (`SELECT FOR UPDATE SKIP LOCKED`) trong OutboxPollingService để tránh multiple workers publish cùng event.

---

## Module 3: Approval Workflow

### Q6: Maker-Checker Pattern là gì? Tại sao Banking cần?

**Model Answer:**
Maker-Checker (còn gọi là 4-eyes principle): Người tạo yêu cầu (Maker) và người phê duyệt (Checker) phải là hai người khác nhau.

**Tại sao cần:**
- **Kiểm soát rủi ro nội bộ (Internal Fraud Prevention):** Ngăn một nhân viên tự tạo và tự duyệt phiếu xuất kho hàng trăm thiết bị
- **Phân tách quyền hạn (Segregation of Duties):** Người nhập liệu ≠ người duyệt
- **Regulatory compliance:** Nhiều quy định ngân hàng (Basel III, ISO 27001) yêu cầu 4-eyes cho giao dịch trọng yếu

**Implement:**
```java
if (approvalRequest.getCreatedBy().equals(currentUser.getId())) {
    throw new SelfApprovalNotAllowedException("Người tạo không thể tự phê duyệt yêu cầu của mình");
}
```

---

### Q7: Khi Manager click "Phê duyệt" ở tab Inbox — điều gì xảy ra nếu một Manager khác đã duyệt milliseconds trước?

**Model Answer:**
Đây chính xác là lý do cần **Optimistic Lock trên approval_requests**:

```java
// approval_requests có: version BIGINT DEFAULT 0
// Khi Manager A và Manager B cùng read phiếu với version=2

// Manager A approve trước:
UPDATE approval_requests SET status='APPROVED', version=3
WHERE id=? AND version=2 AND status='PENDING_APPROVAL'; -- 1 row affected ✓

// Manager B approve sau (cùng version=2):
UPDATE approval_requests SET status='APPROVED', version=3
WHERE id=? AND version=2 AND status='PENDING_APPROVAL'; -- 0 rows affected
// → OptimisticLockException → hiển thị: "Phiếu này đã được xử lý bởi người khác, vui lòng refresh"
```

→ Không bao giờ có 2 approval actions trên cùng 1 phiếu tại cùng thời điểm.

---

### Q8: Approval APPROVED xong → Execute business logic (xuất kho). Dùng synchronous call hay Kafka event?

**Model Answer — Trade-off Analysis:**

**Option 1: Synchronous (Approval → gọi thẳng Inventory Service):**
- ✅ Simple, dễ implement
- ✅ Instant feedback nếu execute fail
- ❌ Tight coupling giữa Approval và Inventory
- ❌ Nếu Inventory Service timeout → Approval đã commit nhưng chưa execute → Inconsistent state

**Option 2: Kafka Event (Approval publish `approval.approved` → Inventory consume):**
- ✅ Loose coupling
- ✅ Retry tự động nếu Inventory fail
- ✅ Approval service không bị block bởi Inventory processing
- ❌ Eventual consistency (không biết ngay khi nào execute xong)
- ❌ Phức tạp hơn (Outbox + Idempotent Consumer)

**Recommendation trong POS Management:**
- Phase 1 (Modular Monolith): Synchronous call (cùng DB transaction) → đơn giản hơn
- Phase 2+ (Microservices): Kafka event + Outbox Pattern + Idempotent Consumer

---

## Module 4: Kafka & Outbox Pattern

### Q9: Tại sao không publish Kafka trực tiếp trong `@Transactional`?

**Model Answer:**
```java
// ❌ NGUY HIỂM
@Transactional
public void assignDevice(...) {
    assignmentRepo.save(assignment);
    kafkaTemplate.send("device-assigned", event); // Kafka publish TRƯỚC khi DB commit
    // Nếu sau đó có lỗi → DB rollback NHƯNG Kafka event đã gửi!
    // Consumer đã xử lý → Data inconsistency!
}

// ✅ ĐÚNG — Outbox Pattern
@Transactional
public void assignDevice(...) {
    assignmentRepo.save(assignment);
    outboxRepo.save(OutboxEvent.of("DEVICE_ASSIGNED", ...)); // Ghi vào CÙNG DB
    // COMMIT: assignment + outbox_event cùng thành công/thất bại
}
// OutboxPollingService (async): đọc PENDING → Kafka → UPDATE SENT
```

**Bảo đảm:** DB commit ↔ Event publish là atomic. Nếu DB rollback → không có event. Nếu Kafka down → event vẫn PENDING trong DB, publish lại khi Kafka UP.

---

### Q10: Idempotent Consumer là gì? Tại sao cần trong POS System?

**Model Answer:**
Kafka có thể deliver **At-Least-Once** — consumer có thể nhận cùng event nhiều lần (do rebalance, retry, failure).

Idempotent Consumer đảm bảo xử lý cùng event 2 lần không gây side-effect (không ghi audit_log 2 lần, không notify 2 lần):

```java
@KafkaListener(topics = "device-assigned")
public void handleDeviceAssigned(DeviceAssignedEvent event) {
    // Check Redis: event này đã xử lý chưa?
    String key = "consumed_event:" + event.getEventId();
    Boolean isNew = redisTemplate.opsForValue().setIfAbsent(key, "1", 1, HOURS);
    if (Boolean.FALSE.equals(isNew)) {
        log.warn("Event {} đã được xử lý, skip", event.getEventId());
        return; // SKIP — idempotent
    }
    // Xử lý event lần đầu tiên
    auditLogService.record(...);
}
```

Partition key = `serialNumber` → events của cùng thiết bị về cùng partition → đảm bảo ordering trong partition.

---

## Module 5: Stock Ledger & Inventory

### Q11: Tại sao không chỉ lưu `quantity` trong bảng `warehouses`?

**Model Answer:**
Nếu chỉ có:
```sql
-- warehouses: id, name, quantity
UPDATE warehouses SET quantity = quantity - 10 WHERE id = 'KHO-HN';
```

Thì khi quản lý hỏi:
- *"Kho Hà Nội từ 500 → 400 thiết bị. Ai xuất? Xuất khi nào? Xuất đi đâu?"*
→ Không có câu trả lời!

**Stock Ledger (append-only):**
```sql
-- stock_transactions: device_id, type, from_warehouse, to_warehouse, occurred_at
INSERT INTO stock_transactions (device_id, type='EXPORT', from_warehouse='KHO-HN', performed_by, occurred_at);
```

→ Tổng tồn kho = `SUM(quantity) GROUP BY warehouse` — Đầy đủ lịch sử biến động.

Tương tự **Double-Entry Bookkeeping** trong banking: không thể xóa hoặc sửa ledger entries đã ghi.

---

## Module 6: Data Scope & RBAC

### Q12: Làm sao đảm bảo INVENTORY_MANAGER ở HN không thấy kho HCM?

**Model Answer:**
**Không chỉ dùng Angular Route Guard** — Guard chỉ kiểm soát giao diện, không bảo vệ API.

**Backend Data Scope:**
```java
// UserPrincipal từ JWT chứa: userId, roles, businessUnitId
public Page<DeviceResponse> getDevices(DeviceFilter filter, Pageable pageable, UserPrincipal user) {
    UUID businessUnitId = user.isSuperAdmin() ? null : user.getBusinessUnitId();
    return deviceRepository.findAllWithFilter(filter, businessUnitId, pageable);
}

// Repository:
@Query("SELECT d FROM DeviceJpaEntity d WHERE " +
       "(:businessUnitId IS NULL OR d.warehouse.businessUnit.id = :businessUnitId) " +
       "AND (:status IS NULL OR d.status = :status)")
Page<DeviceJpaEntity> findAllWithFilter(@Param("businessUnitId") UUID businessUnitId, ...);
```

→ INVENTORY_MANAGER ở HN có thể gọi API trực tiếp, nhưng DB query luôn filter theo `businessUnitId = HN`.

---

## Module 7: Angular Frontend

### Q13: Tại sao dùng Angular Signals thay vì mutable property?

**Model Answer:**
```typescript
// ❌ Mutable property — không reactive, Angular phải check toàn bộ component tree
export class DeviceDetailComponent {
  device: DeviceDetailResponse | null = null;
  isLoading = false;
}

// ✅ Angular Signals — reactive, fine-grained change detection
export class DeviceDetailComponent {
  readonly device = signal<DeviceDetailResponse | null>(null);
  readonly isLoading = signal<boolean>(false);

  // Computed signal — chỉ tính lại khi device() thay đổi
  readonly canAssign = computed(() => this.device()?.status === 'INSTOCK');

  // Không cần Zone.js, không cần ChangeDetectorRef.markForCheck()
  // Angular chỉ re-render đúng component khi signal thay đổi
}
```

Lợi ích: Performance tốt hơn, code predictable hơn, không cần `async pipe`, không cần `OnPush` strategy thủ công.

---

### Q14: Tại sao Angular Route Guard không đủ để kiểm soát phân quyền?

**Model Answer:**
Route Guard là **UI layer** — chỉ prevent navigation. Nhưng:
1. Kẻ tấn công có thể gọi API trực tiếp (bỏ qua Angular hoàn toàn)
2. Token hợp lệ + role thấp vẫn call được API nếu backend không check

**Đúng phải có 2 lớp:**
```typescript
// Angular: Route Guard (UX — ẩn menu, redirect nếu không có quyền)
canActivate: [authGuard, permissionGuard],
data: { permission: 'INVENTORY_VIEW' }

// Spring Boot: @PreAuthorize (thực sự enforce ở backend)
@PreAuthorize("hasAuthority('INVENTORY_VIEW')")
@GetMapping("/api/v1/inventory/stock")
public ApiResponse<Page<StockResponse>> getStock(...) { ... }
```

---

*Tài liệu này cần được cập nhật sau mỗi Sprint với các câu hỏi phỏng vấn liên quan đến kỹ thuật mới học được.*
