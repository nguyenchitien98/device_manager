# POS Management System — Hướng Dẫn Viết Code (Coding Guideline)

Tài liệu này quy định tiêu chuẩn lập trình, quy ước đặt tên, cấu trúc package, và phong cách viết Javadoc bắt buộc trong toàn bộ dự án POS Management.

---

## 1. Tiêu Chuẩn Backend (Java 21 LTS / Spring Boot 3.4.x → Target: Spring Boot 4.1)

### 1.1 Cấu Trúc Package Tổng Thể

```
com.banking.pos
├── shared/                          # Shared utilities (dùng toàn app)
│   ├── domain/
│   │   └── valueobject/
│   │       ├── SerialNumber.java    # Không để String rải rắc
│   │       ├── MerchantCode.java
│   │       ├── TerminalId.java
│   │       └── BusinessUnitId.java
│   ├── exception/
│   │   ├── PosManagementException.java  # Base exception
│   │   ├── DomainException.java
│   │   └── ErrorCode.java               # Mã lỗi chuẩn RFC 7807
│   ├── response/
│   │   ├── ApiResponse.java             # Wrapper tất cả response
│   │   └── ApiErrorResponse.java
│   ├── audit/
│   │   └── AuditableEntity.java         # Base class với createdAt, updatedAt, createdBy
│   └── util/
│       ├── SecurityUtils.java
│       └── MaskingUtils.java            # Mask Serial, TID trong logs
│
├── config/                              # Cấu hình Spring (toàn cục)
│   ├── security/                        # SecurityConfig, JwtFilter, JwtTokenService
│   ├── kafka/                           # Kafka producer/consumer config
│   ├── redis/                           # RedisConfig, RedissonConfig
│   ├── web/                             # CORS, RestClient beans
│   └── OpenApiConfig.java               # SpringDoc/Swagger config
│
├── identity/                            # Module xác thực & phân quyền
├── catalog/                             # Module danh mục (Category, Type, Model, Vendor, MCC)
├── organization/                        # Module đơn vị kinh doanh & kho
├── inventory/                           # Module quản lý kho & logistics
├── merchant/                            # Module Merchant, TID & MID (1 TID → N MID)
├── device/                              # Module thiết bị & lifecycle
├── assignment/                          # Module cấp phát thiết bị
├── approval/                            # Module phê duyệt đa cấp
├── monitoring/                          # Module giám sát & báo cáo
│
└── integration/                         # External system integrations
    ├── way4/                            # WAY4 Card Management
    │   ├── Way4IntegrationService.java
    │   ├── dto/
    │   └── config/                      # WAY4 RestClient config
    └── t24/                             # Temenos T24 Core Banking
        ├── T24IntegrationService.java
        ├── dto/
        └── config/
```

### 1.1.1 Cấu Trúc Nội Module (Mỗi module PHẢI theo cấu trúc này)

```
{module}/
├── domain/                          # Pure Java — KHÔNG Spring/JPA dependency
│   ├── model/                       # Domain Model / Aggregate Root
│   ├── valueobject/                 # Value Objects (immutable)
│   ├── service/                     # Domain Services (business rules thuần)
│   ├── repository/                  # Repository Interfaces (Ports)
│   ├── event/                       # Domain Events
│   └── exception/                   # Domain-specific Exceptions
│
├── application/                     # Use Cases / Orchestration Layer
│   ├── service/                     # Application Services
│   ├── dto/                         # Input/Output DTOs
│   │   ├── request/
│   │   └── response/
│   └── port/                        # Output Port interfaces
│
└── infrastructure/                  # Adapters (implements domain ports)
    ├── persistence/
    │   ├── entity/                  # JPA Entities (*JpaEntity.java)
    │   ├── repository/              # Spring Data JPA Repositories
    │   ├── adapter/                 # Repository Adapters
    │   └── mapper/                  # MapStruct Mappers (*Mapper.java)
    ├── messaging/                   # Kafka Publishers & Consumers
    ├── batch/                       # Spring Batch jobs (nếu cần xử lý bulk)
    ├── export/                      # Excel/PDF export (Apache POI)
    ├── integration/                 # Module-level external API calls
    └── web/                         # REST Controllers (Presentation)
        ├── {Module}Controller.java
        └── dto/                     # Controller-level request/response
```


### 1.2 Quy Tắc Đặt Tên (Naming Conventions)

| Loại | Quy Tắc | Ví Dụ |
|---|---|---|
| Class/Interface | PascalCase | `AssignmentApplicationService`, `DeviceRepository` |
| Method | camelCase | `assignDevice()`, `validateDeviceStatus()` |
| Variable | camelCase | `serialNumber`, `idempotencyKey` |
| Constant | UPPER_SNAKE_CASE | `MAX_APPROVAL_LEVEL`, `DEVICE_LOCK_TTL_SECONDS` |
| Package | lowercase.dot.separated | `com.banking.pos.device.domain.model` |
| DB Table | snake_case, số nhiều | `devices`, `assignments`, `stock_transactions` |
| DB Column | snake_case | `serial_number`, `merchant_code`, `assigned_at` |
| Kafka Topic | kebab-case | `device-assigned`, `stock-issued`, `approval-completed` |
| Redis Key | colon-separated | `device:status:SN001`, `idempotency:assign:uuid` |
| DTO Suffix | Hậu tố rõ ràng | `CreateAssignmentRequest`, `DeviceResponse` |
| Exception | Suffix Exception | `DeviceAlreadyAssignedException`, `DeviceNotAssignableException` |
| JPA Entity | Suffix JpaEntity | `DeviceJpaEntity`, `AssignmentJpaEntity` |
| Mapper | Suffix Mapper | `DeviceMapper`, `AssignmentMapper` |
| Adapter | Suffix Adapter | `DeviceRepositoryAdapter` |

### 1.3 Domain Value Objects — Bắt Buộc

**SAI (anti-pattern):**
```java
// Đừng để String và UUID rải rắc trong business logic
public void assignDevice(String serialNumber, UUID merchantId, String tid) {
    if (serialNumber == null || serialNumber.isBlank()) throw new Exception("Invalid serial");
}
```

**ĐÚNG (POS Management standard):**
```java
// Dùng Value Object để encapsulate validation và semantic
public void assignDevice(SerialNumber serial, MerchantCode merchantCode, TerminalId terminalId) {
    // SerialNumber tự validate format trong constructor
    // MerchantCode tự validate prefix M + 6 digits
}

// SerialNumber Value Object
public record SerialNumber(String value) {
    public SerialNumber {
        Objects.requireNonNull(value, "Serial number không được null");
        if (!value.matches("SN-POS-\\d{6}")) {
            throw new DomainException(ErrorCode.INVALID_SERIAL_FORMAT,
                "Serial number phải có định dạng SN-POS-XXXXXX");
        }
    }
}
```

---

## 2. Tiêu Chuẩn Javadoc Tiếng Việt — Bắt Buộc

### 2.1 Javadoc Cho Class

```java
/**
 * Application Service điều phối luồng nghiệp vụ cấp phát thiết bị POS cho Merchant.
 *
 * <p>Lớp này là điểm vào duy nhất cho mọi use case liên quan đến assignment.
 * Tuân thủ Clean Architecture: chỉ phụ thuộc vào Domain và Port interfaces,
 * không import JPA Entity hay Kafka trực tiếp.</p>
 *
 * <p>Các nghiệp vụ chính:</p>
 * <ul>
 *   <li>Cấp phát thiết bị (assign) với Idempotency + Optimistic Lock</li>
 *   <li>Thu hồi thiết bị (return) với phê duyệt workflow</li>
 *   <li>Điều chuyển thiết bị giữa các Merchant</li>
 * </ul>
 *
 * @author POS Management Team
 * @since Sprint 05
 */
@Service
@Transactional
public class AssignmentApplicationService implements CreateAssignmentUseCase, ReturnDeviceUseCase {
```

### 2.2 Javadoc Cho Method

```java
/**
 * Cấp phát thiết bị POS cho Merchant/TID.
 *
 * <p>Luồng xử lý:</p>
 * <ol>
 *   <li>Kiểm tra Idempotency Key trong Redis (chống nhấn nút 2 lần)</li>
 *   <li>Validate Device status phải là INSTOCK</li>
 *   <li>Kiểm tra không có assignment ACTIVE nào khác cho thiết bị này</li>
 *   <li>Kiểm tra Merchant và TID tồn tại và ACTIVE</li>
 *   <li>Kiểm tra Business Unit scope (người dùng có quyền thao tác với merchant này không)</li>
 *   <li>Trong @Transactional: Tạo Assignment, cập nhật Device status → DEPLOYED, ghi lifecycle history, ghi Outbox Event</li>
 * </ol>
 *
 * <p>Concurrency: Dùng @Version (Optimistic Lock) trên Device + Unique Constraint
 * trên assignments(device_id) WHERE status='ACTIVE' để chống race condition.</p>
 *
 * @param command Lệnh cấp phát thiết bị chứa SerialNumber, MerchantCode, TerminalId
 * @param idempotencyKey Header X-Idempotency-Key từ client (UUID v4)
 * @param currentUser User đang thực hiện thao tác (từ Security Context)
 * @return AssignmentResponse chứa assignmentId và trạng thái
 * @throws DeviceNotFoundException khi serial không tồn tại trong hệ thống
 * @throws DeviceNotAssignableException khi Device không ở trạng thái INSTOCK
 * @throws DeviceAlreadyAssignedException khi Device đã được cấp phát cho Merchant khác
 * @throws MerchantNotFoundException khi Merchant không tồn tại hoặc INACTIVE
 * @throws AccessDeniedException khi user không có quyền thao tác với Business Unit này
 */
public AssignmentResponse createAssignment(
    CreateAssignmentCommand command,
    String idempotencyKey,
    UserPrincipal currentUser
) {
```

### 2.3 Comment Inline Cho Logic Phức Tạp

```java
// Tại sao phải kiểm tra version trước khi update:
// Device có thể bị cập nhật bởi thread khác trong khoảng thời gian từ khi SELECT đến UPDATE.
// @Version column giúp phát hiện conflict và throw OptimisticLockException → Retry 3 lần.
deviceJpaRepository.save(deviceEntity);  // JPA tự động kiểm tra version

// Tại sao ghi Outbox thay vì publish Kafka trực tiếp:
// Nếu publish Kafka trong @Transactional, DB có thể rollback nhưng event đã gửi → data inconsistency.
// Outbox đảm bảo event chỉ được publish KHI VÀ CHỈ KHI DB transaction commit thành công.
outboxRepository.save(OutboxEvent.of("DEVICE_ASSIGNED", assignment.getId(), payload));
```

---

## 3. Các Pattern Bắt Buộc Trong POS Management

### 3.1 @Transactional — Bắt Buộc Với Mọi Write Operation

```java
// ✅ ĐÚNG — @Transactional bao toàn bộ unit of work
@Override
@Transactional
public AssignmentResponse createAssignment(CreateAssignmentCommand command, ...) {
    DeviceJpaEntity device = deviceRepository.findBySerialNumberWithLock(command.serialNumber());
    // Validate...
    AssignmentJpaEntity assignment = assignmentRepository.save(newAssignment);
    deviceRepository.save(device.transitionTo(DeviceStatus.DEPLOYED));
    outboxRepository.save(OutboxEvent.of("DEVICE_ASSIGNED", ...));
    return mapper.toResponse(assignment);
}

// ❌ SAI — Nhiều @Transactional nhỏ lẻ không đảm bảo atomicity
public void step1() { @Transactional deviceRepo.save(...); }
public void step2() { @Transactional assignmentRepo.save(...); }  // Nếu step2 fail, step1 không rollback!
```

### 3.2 Idempotency Key — Bắt Buộc Với Assignment, Approval

```java
// Trong Controller:
@PostMapping
public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
    @RequestHeader("X-Idempotency-Key") String idempotencyKey,
    @Valid @RequestBody CreateAssignmentRequest request,
    @AuthenticationPrincipal UserPrincipal user
) {
    // Kiểm tra duplicate trong Redis trước khi xử lý
    String cachedResponse = redisTemplate.opsForValue().get("idempotency:assign:" + idempotencyKey);
    if (cachedResponse != null) {
        return ResponseEntity.ok(objectMapper.readValue(cachedResponse, ...));
    }
    // Xử lý...
    redisTemplate.opsForValue().set("idempotency:assign:" + idempotencyKey, responseJson, 10, MINUTES);
}
```

### 3.3 Return JPA Entity — Nghiêm Cấm

```java
// ❌ NGHIÊM CẤM — Return JPA Entity trực tiếp
@GetMapping("/devices/{serial}")
public DeviceJpaEntity getDevice(@PathVariable String serial) { ... }

// ✅ ĐÚNG — Map sang Response DTO
@GetMapping("/devices/{serial}")
public ApiResponse<DeviceDetailResponse> getDevice(@PathVariable String serial) { ... }
```

### 3.4 Sensitive Data Logging — Nghiêm Cấm Log Raw

```java
// ❌ NGHIÊM CẤM
log.info("Assigning device: serial={}, merchant={}", serialNumber, merchantCode);
log.debug("TID: {}", terminalId);

// ✅ ĐÚNG — Mask trước khi log (chỉ show 4 ký tự cuối)
log.info("Assigning device: serial={}****, merchant={}",
    MaskingUtils.maskSerial(serialNumber),
    MaskingUtils.maskMerchant(merchantCode));
```

### 3.5 Device State Machine — Bắt Buộc Validate Transition

```java
// ❌ SAI — Set status trực tiếp
device.setStatus(DeviceStatus.DEPLOYED);

// ✅ ĐÚNG — Validate transition trước
public DeviceJpaEntity transitionTo(DeviceStatus targetStatus) {
    if (!this.status.canTransitionTo(targetStatus)) {
        throw new InvalidDeviceStateTransitionException(
            String.format("Không thể chuyển thiết bị từ %s sang %s", this.status, targetStatus));
    }
    this.status = targetStatus;
    return this;
}

// Trong DeviceStatus enum:
public enum DeviceStatus {
    INSTOCK {
        @Override public Set<DeviceStatus> allowedTransitions() {
            return Set.of(OUT_OF_WAREHOUSE, DISPOSED);
        }
    },
    OUT_OF_WAREHOUSE {
        @Override public Set<DeviceStatus> allowedTransitions() {
            return Set.of(DEPLOYED, INSTOCK);
        }
    },
    DEPLOYED {
        @Override public Set<DeviceStatus> allowedTransitions() {
            return Set.of(RETURNED);
        }
    },
    RETURNED {
        @Override public Set<DeviceStatus> allowedTransitions() {
            return Set.of(INSTOCK, REPAIRING);
        }
    },
    REPAIRING {
        @Override public Set<DeviceStatus> allowedTransitions() {
            return Set.of(INSTOCK, DISPOSED);
        }
    },
    DISPOSED {
        @Override public Set<DeviceStatus> allowedTransitions() {
            return Set.of();  // Trạng thái kết thúc, không thể chuyển tiếp
        }
    };

    public abstract Set<DeviceStatus> allowedTransitions();

    public boolean canTransitionTo(DeviceStatus target) {
        return allowedTransitions().contains(target);
    }
}
```

### 3.6 Data Scope — Bắt Buộc Với Mọi Query Trả Về Danh Sách

```java
// ❌ SAI — Không filter theo Business Unit
public List<DeviceResponse> getAllDevices() {
    return deviceRepository.findAll().stream().map(mapper::toResponse).toList();
}

// ✅ ĐÚNG — Filter theo Business Unit của user hiện tại
public Page<DeviceResponse> getDevices(DeviceFilter filter, Pageable pageable, UserPrincipal user) {
    // SUPER_ADMIN thấy toàn bộ; các role khác chỉ thấy dữ liệu của Business Unit mình
    UUID businessUnitId = user.isSuperAdmin() ? null : user.getBusinessUnitId();
    return deviceRepository.findAllWithFilter(filter, businessUnitId, pageable)
        .map(mapper::toResponse);
}
```

---

## 4. Tiêu Chuẩn Frontend (Angular 22)

### 4.1 Cấu Trúc Thư Mục

```
src/app/
│
├── core/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   └── user.model.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── permission.guard.ts
│   ├── interceptors/
│   │   ├── jwt.interceptor.ts
│   │   ├── idempotency.interceptor.ts  # Tự động generate X-Idempotency-Key
│   │   └── error.interceptor.ts
│   └── layout/
│       ├── main-layout/
│       │   ├── main-layout.component.ts
│       │   ├── main-layout.component.html
│       │   └── main-layout.component.scss
│       └── sidebar/
│
├── shared/
│   ├── components/
│   │   ├── data-table/          # Reusable table với pagination, filter
│   │   ├── status-badge/        # Badge hiển thị trạng thái
│   │   ├── confirm-dialog/      # Dialog xác nhận
│   │   └── approval-timeline/   # Timeline phê duyệt
│   ├── pipes/
│   │   ├── device-status.pipe.ts
│   │   └── approval-status.pipe.ts
│   └── models/                  # TypeScript interfaces
│
├── features/
│   ├── dashboard/
│   ├── catalog/
│   │   ├── device-category/
│   │   ├── device-type/
│   │   ├── device-model/
│   │   ├── vendor/
│   │   ├── mcc/
│   │   └── fee-policy/
│   ├── organization/
│   │   ├── business-unit/
│   │   └── warehouse/
│   ├── inventory/
│   │   ├── purchase-order/
│   │   ├── stock-import/
│   │   ├── stock-export/
│   │   ├── stock-transfer/
│   │   └── stock-overview/
│   ├── merchant/
│   │   ├── merchant-list/
│   │   ├── merchant-detail/
│   │   └── terminal/
│   ├── device/
│   │   ├── device-search/
│   │   └── device-detail/       # 8 tabs
│   ├── assignment/
│   │   ├── assignment-list/
│   │   ├── assignment-create/
│   │   └── assignment-history/
│   ├── approval/
│   │   ├── inbox/               # Hộp việc cần duyệt
│   │   ├── my-requests/
│   │   ├── all-requests/
│   │   └── history/
│   ├── monitoring/
│   │   ├── dashboard/
│   │   ├── pos-monitor/
│   │   └── audit-log/
│   └── admin/
│       ├── user-management/
│       ├── role-management/
│       └── system-config/
│
├── app.config.ts
└── app.routes.ts                 # Lazy loading routes
```

### 4.2 Quy Ước Angular Component

```typescript
// Tên file: device-detail.page.ts
// Tên component: DeviceDetailPageComponent
// Tên selector: app-device-detail-page

@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  templateUrl: './device-detail.page.html',
  styleUrls: ['./device-detail.page.scss'],
  imports: [CommonModule, MatTabsModule, ...]
})
export class DeviceDetailPageComponent {
  // Signal-based state (Angular 22)
  readonly device = signal<DeviceDetailResponse | null>(null);
  readonly activeTab = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  // Computed signals
  readonly canAssign = computed(() =>
    this.device()?.status === 'INSTOCK' &&
    this.authService.hasPermission('DEVICE_ASSIGN')
  );
}
```

### 4.3 Phân Quyền Route

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'inventory',
    canActivate: [authGuard, permissionGuard],
    data: { permission: 'INVENTORY_VIEW' },
    loadChildren: () => import('./features/inventory/inventory.routes')
      .then(m => m.INVENTORY_ROUTES)
  },
  {
    path: 'assignment',
    canActivate: [authGuard, permissionGuard],
    data: { permission: 'ASSIGNMENT_VIEW' },
    loadChildren: () => import('./features/assignment/assignment.routes')
      .then(m => m.ASSIGNMENT_ROUTES)
  }
];

// Angular Guard chỉ kiểm soát giao diện.
// Backend PHẢI kiểm tra quyền trên từng API (@PreAuthorize)
```

---

## 5. Quy Tắc Database

### 5.1 Flyway Bắt Buộc

```properties
# application.yml
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
# spring.jpa.hibernate.ddl-auto=validate  # KHÔNG ĐƯỢC dùng create/update
```

### 5.2 Naming Convention Migration Files

```
V1__init_base_schema.sql              -- Sprint 00: UUID extension, gen_random_uuid()
V2__create_identity_tables.sql        -- Sprint 01: users, roles, permissions, user_roles, role_permissions, refresh_tokens
V3__create_catalog_tables.sql         -- Sprint 02: device_categories, device_types, device_models, vendors, mcc_codes, fee_policies
V4__create_organization_tables.sql    -- Sprint 02: business_units, warehouses
V5__create_inventory_tables.sql       -- Sprint 03-04: purchase_orders, purchase_order_items, devices, stock_transactions, stock_export_requests, stock_export_items, stock_transfer_requests, stock_transfer_items
V6__create_merchant_tables.sql        -- Sprint 05: merchants, terminals, merchant_status_history, terminal_status_history
V7__create_device_history_tables.sql  -- Sprint 06-07: device_lifecycle_history, repair_orders
V8__create_assignment_tables.sql      -- Sprint 08-09: assignments, assignment_history
V9__create_approval_tables.sql        -- Sprint 10: approval_requests, approval_steps, approval_configs
V10__create_notification_tables.sql   -- Sprint 11-12-14: notifications, outbox_events, audit_logs
V11__create_fee_policy_tables.sql     -- Sprint 02/05: merchant_fee_assignments
V12__seed_catalog_data.sql            -- Seed: Device categories, types, models, vendors
V13__seed_organization_data.sql       -- Seed: Business Unit, Warehouse mẫu
V14__seed_identity_data.sql           -- Seed: Roles, permissions, admin user
V15__seed_mcc_data.sql                -- Seed: Top 50 MCC codes ISO 18245
```

### 5.3 Quy Tắc Bất Biến (Immutability)

```sql
-- Các bảng KHÔNG được UPDATE/DELETE (Immutable / Append-Only):
-- device_lifecycle_history     → Lịch sử vòng đời thiết bị
-- stock_transactions           → Lịch sử biến động kho
-- assignment_history           → Lịch sử cấp phát
-- merchant_status_history      → Lịch sử trạng thái Merchant
-- terminal_status_history      → Lịch sử trạng thái Terminal
-- approval_steps               → Lịch sử hành động phê duyệt (append-only)
-- audit_logs                   → Nhật ký hệ thống bất biến
-- outbox_events                → Chỉ update status PENDING → SENT/FAILED

-- Các bảng dùng Soft Delete (chỉ cập nhật status):
-- assignments                  → status: ACTIVE → RETURNED/TRANSFERRED
-- approvals                    → status flow theo workflow
-- merchants                    → status: ACTIVE → INACTIVE/SUSPENDED
```

### 5.4 Optimistic Lock Bắt Buộc

```sql
-- Mọi bảng có thể bị concurrent update phải có version column:
ALTER TABLE devices ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE assignments ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE approvals ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE merchants ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
```

---

## 6. Checklist Trước Khi Commit Code

```
Backend:
☐ Mọi class public có Javadoc tiếng Việt giải thích vai trò nghiệp vụ
☐ Mọi method public/protected có Javadoc với @param, @return, @throws
☐ Không log sensitive data (serial, TID raw)
☐ Không return JPA Entity từ Controller
☐ Không publish Kafka trực tiếp trong @Transactional (dùng Outbox)
☐ Có @Version trên mọi JPA Entity được concurrent update
☐ Có metadata JSONB column trên mọi bảng nghiệp vụ mới
☐ Có Idempotency check trên mọi write endpoint quan trọng
☐ Data Scope filter trong mọi query danh sách
☐ State Machine validate transition trước khi update Device status
☐ Unit Test cho business logic
☐ Kiểm tra device references trước khi deactivate Device Model
☐ Dùng RestClient (KHÔNG dùng RestTemplate) cho mọi HTTP client mới

Frontend:
☐ Component tách thành .ts / .html / .scss riêng biệt
☐ Dùng Signal thay vì mutable variable cho state
☐ Interceptor tự động inject JWT và X-Idempotency-Key
☐ Route Guard kiểm tra permission trước khi render
☐ Không hardcode API URL (dùng environment.ts)
☐ Loading state và error handling cho mọi HTTP call
```

---

## 7. HTTP Client Convention — Spring RestClient (KHÔNG dùng RestTemplate)

Spring Framework 6.1+ (Spring Boot 3.2+) giới thiệu `RestClient` — thay thế `RestTemplate`.

```java
// ❌ SAI — Đừng dùng RestTemplate trong code mới
RestTemplate restTemplate = new RestTemplate();
ResponseEntity<String> resp = restTemplate.getForEntity(url, String.class);

// ✅ ĐÚNG — Dùng RestClient
@Configuration
public class RestClientConfig {
    @Bean
    public RestClient way4RestClient(RestClient.Builder builder,
                                     @Value("${pos.way4.base-url}") String baseUrl) {
        return builder
            .baseUrl(baseUrl)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }
}

@Service
@RequiredArgsConstructor
public class Way4IntegrationService {
    private final RestClient way4RestClient;

    public Way4RegisterResponse registerTerminal(Way4RegisterRequest req) {
        return way4RestClient.post()
            .uri("/api/terminals")
            .body(req)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                throw new PosBusinessException(ErrorCode.WAY4_INTEGRATION_ERROR);
            })
            .body(Way4RegisterResponse.class);
    }
}
```

---

## 8. Business Rules Enforcement — Device Model

### 8.1 Không được deactivate Device Model khi còn device đang sử dụng

```java
// Trong DeviceModelService.deactivate():
@Transactional
public void deactivate(UUID modelId) {
    DeviceModelJpaEntity model = repository.findById(modelId)
        .orElseThrow(() -> new PosBusinessException(ErrorCode.DEVICE_MODEL_NOT_FOUND));

    // Business rule: kiểm tra còn device active không
    long activeDeviceCount = deviceRepository.countActiveByModelId(modelId);
    if (activeDeviceCount > 0) {
        throw new PosBusinessException(
            ErrorCode.DEVICE_MODEL_HAS_ACTIVE_DEVICES,
            "Không thể vô hiệu hóa model — còn " + activeDeviceCount + " thiết bị đang hoạt động"
        );
    }

    model.setActive(false);
    model.setUpdatedBy(SecurityUtils.getCurrentUserId());
    repository.save(model);
}
```

### 8.2 Serial Number theo Model

```java
// Serial format: {serial_prefix}-{sequence_number:06d}
// Ví dụ: PAX-A920-000001, PAX-A920-000002

// DeviceModel.serial_prefix = "PAX-A920"
// Khi nhập kho → sinh serial: PAX-A920-000001
String serial = model.getSerialPrefix() + "-" + String.format("%06d", nextSequence);
```
