# 🖼️ POS Management System — Architecture Diagrams

> Bộ sơ đồ kiến trúc hệ thống POS Terminal & Merchant Management — Modular Monolith, Device Lifecycle FSM, Assignment Flow, Approval Workflow

---

## 1. System Topology (Tổng Quan Hệ Thống)

```mermaid
graph TD
    subgraph "Client Layer"
        AdminWeb["Angular 22 Admin Web Portal\nMulti-role · Desktop-first · Standalone Components"]
    end

    subgraph "API Gateway"
        Gateway["Spring Boot API Gateway\nJWT Filter · CORS · Rate Limit (5 req/s) · Routing"]
    end

    subgraph "Core Modules (Modular Monolith)"
        Identity["Identity Module\nUser · Role · Permission · JWT · RBAC · Data Scope"]
        Catalog["Catalog Module\nDevice Category · Type · Model · Vendor · MCC · Fee Policy"]
        Organization["Organization Module\nBusiness Unit · Warehouse"]
        Inventory["Inventory Module\nPurchase Order · Stock Import/Export · Stock Ledger"]
        Merchant["Merchant Module\nMerchant · TID · Fee Assignment · Effective Dating"]
        Device["Device Module\nLifecycle FSM · Repair · History · Redis Cache"]
        Assignment["Assignment Module\nAssign · Return · Transfer · Optimistic Lock · Idempotency"]
        Approval["Approval Module\nMaker-Checker · Multi-level · Inbox · Kafka Trigger"]
        Monitoring["Monitoring Module\nDashboard · POS Monitor · Audit Log · Reports"]
    end

    subgraph "Infrastructure Layer"
        PostgreSQL[("PostgreSQL 16\nPrimary Database\nFlyway Migration")]
        Redis[("Redis 7\nCache · Session · Idempotency\nDistributed Lock")]
        Kafka{{"Apache Kafka\nEvent Bus\nOutbox Pattern"}}
    end

    subgraph "Observability"
        Prometheus["Prometheus\nCustom Metrics"]
        Grafana["Grafana\nDashboard"]
        Jaeger["Jaeger\nDistributed Tracing"]
    end

    AdminWeb --> Gateway
    Gateway --> Identity & Catalog & Organization
    Gateway --> Inventory & Merchant & Device
    Gateway --> Assignment & Approval & Monitoring

    Inventory & Assignment & Device --> |"Outbox Events"| Kafka
    Kafka --> Approval & Monitoring & Identity

    Identity & Catalog & Organization --> PostgreSQL
    Inventory & Merchant & Device --> PostgreSQL
    Assignment & Approval & Monitoring --> PostgreSQL

    Identity & Assignment --> Redis
    Device --> |"Status Cache 60s"| Redis
    Approval --> |"Inbox Count Cache"| Redis

    Prometheus --> Gateway
    Grafana --> Prometheus
    Jaeger --> Gateway & Device & Assignment

    style Identity fill:#1a237e,color:#fff
    style Inventory fill:#1b5e20,color:#fff
    style Device fill:#4a148c,color:#fff
    style Assignment fill:#b71c1c,color:#fff
    style Approval fill:#e65100,color:#fff
```

---

## 2. Device Lifecycle State Machine (FSM)

```mermaid
stateDiagram-v2
    [*] --> INSTOCK: Nhập kho (từ Purchase Order)

    INSTOCK --> OUT_OF_WAREHOUSE: Phiếu xuất kho được APPROVED
    INSTOCK --> DISPOSED: Phê duyệt thanh lý (APPROVED)

    OUT_OF_WAREHOUSE --> DEPLOYED: Assignment tạo thành công\n(Cấp phát cho Merchant/TID)
    OUT_OF_WAREHOUSE --> INSTOCK: Hủy triển khai, nhập lại kho

    DEPLOYED --> RETURNED: Thu hồi thiết bị\n(Approval APPROVED)

    RETURNED --> INSTOCK: Kiểm định đạt\n(Tái sử dụng)
    RETURNED --> REPAIRING: Phát hiện lỗi\n(Tạo Repair Order)

    REPAIRING --> INSTOCK: Sửa chữa thành công\n(Nghiệm thu đạt)
    REPAIRING --> DISPOSED: Không thể sửa\n(Đề nghị thanh lý APPROVED)

    DISPOSED --> [*]: Trạng thái kết thúc vĩnh viễn

    note right of INSTOCK
        @Version: optimistic lock
        device_lifecycle_history: ghi mọi thay đổi
        Redis cache TTL 60s
    end note

    note right of DEPLOYED
        assignment: status=ACTIVE
        Partial unique index:
        UNIQUE(device_id) WHERE status='ACTIVE'
    end note

    note right of DISPOSED
        Không thể transition về bất kỳ trạng thái nào.
        canTransitionTo() → empty Set
    end note
```

---

## 3. Clean Architecture — Hexagonal Architecture (Per Module)

```mermaid
graph TB
    subgraph Infrastructure["🟢 Infrastructure Layer (Adapters)"]
        subgraph DrivingAdapters["Driving Adapters (Input Side)"]
            REST["🌐 REST Controller\n@RestController\nAssignmentController"]
            KAFKA_IN["📥 Kafka Consumer\nApprovalEventConsumer"]
        end
        subgraph DrivenAdapters["Driven Adapters (Output Side)"]
            JPA["🗄️ JPA Repository\nAssignmentJpaRepository\nimplements AssignmentRepository"]
            KAFKA_OUT["📤 Kafka Publisher\nOutboxKafkaPublisher\nimplements EventPublisherPort"]
            REDIS["⚡ Redis Adapter\nDeviceCacheAdapter\nimplements DeviceCachePort"]
        end
    end

    subgraph Ports["🟣 Ports (Interfaces)"]
        IN_PORT["📋 Input Ports\nCreateAssignmentUseCase\nReturnDeviceUseCase"]
        OUT_PORT["📋 Output Ports\nAssignmentRepository\nDeviceRepository\nEventPublisherPort\nDeviceCachePort"]
    end

    subgraph Application["🔵 Application Layer (Orchestration)"]
        APP_SVC["⚙️ Application Service\nAssignmentApplicationService\n@Transactional\nIdempotency Check\nOrchestrates domain objects"]
        COMMANDS["📦 Commands\nCreateAssignmentCommand\nReturnDeviceCommand"]
    end

    subgraph Domain["🟡 Domain Layer (Pure Java — No Spring/JPA)"]
        ENTITY["🏦 Entities\nDeviceAssignment\nDeviceStatus (FSM)\nRepairOrder"]
        DOMAIN_SVC["🧠 Domain Services\nAssignmentDomainService\nDeviceLifecycleDomainService"]
        VALUE_OBJ["💎 Value Objects\nSerialNumber\nMerchantCode\nTerminalId\nAssignmentId"]
        EVENTS["📢 Domain Events\nDeviceAssignedEvent\nDeviceReturnedEvent"]
    end

    REST --> IN_PORT
    KAFKA_IN --> IN_PORT
    IN_PORT --> APP_SVC
    APP_SVC --> COMMANDS
    APP_SVC --> DOMAIN_SVC
    DOMAIN_SVC --> ENTITY
    DOMAIN_SVC --> VALUE_OBJ
    APP_SVC --> EVENTS
    APP_SVC --> OUT_PORT
    OUT_PORT --> JPA
    OUT_PORT --> KAFKA_OUT
    OUT_PORT --> REDIS

    style Domain fill:#1a1400,stroke:#ffd600,color:#fff
    style Application fill:#0a1628,stroke:#1565c0,color:#fff
    style Ports fill:#150a28,stroke:#6a1b9a,color:#fff
    style Infrastructure fill:#0a1f0a,stroke:#2e7d32,color:#fff
```

---

## 4. Assignment Flow — Concurrent-Safe (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Op as 👤 Nhân viên
    participant Angular as Angular App
    participant GW as API Gateway
    participant Assignment as Assignment Service
    participant Device as Device Module
    participant Redis as Redis
    participant DB as PostgreSQL
    participant Outbox as Outbox Table
    participant Kafka as Kafka
    participant Audit as Audit Module

    Op->>Angular: Chọn Serial, Merchant, TID → Submit
    Angular->>Angular: Generate Idempotency-Key (UUID v4)
    Angular->>GW: POST /api/v1/assignments\nX-Idempotency-Key: uuid-xxx
    GW->>GW: JWT verify + Rate limit check
    GW->>Assignment: Forward request

    Assignment->>Redis: SETNX idempotency:assign:uuid-xxx (TTL 10m)
    alt Key đã tồn tại — Duplicate Request
        Redis-->>Assignment: false (exists)
        Assignment-->>Angular: 409 Conflict - "Đang xử lý"
    end

    Assignment->>DB: SELECT * FROM devices WHERE serial=? FOR UPDATE SKIP LOCKED
    DB-->>Assignment: Device {status: INSTOCK, version: 3}

    alt Device không phải INSTOCK
        Assignment-->>Angular: 422 - "Thiết bị không thể cấp phát (DEPLOYED)"
    end
    alt Có ACTIVE assignment khác
        Assignment-->>Angular: 422 - "Thiết bị đã cấp cho Merchant khác"
    end

    Note over Assignment, DB: Bắt đầu @Transactional

    Assignment->>DB: INSERT INTO assignments (status=ACTIVE)
    Assignment->>DB: UPDATE devices SET status='DEPLOYED', version=4\nWHERE serial=? AND version=3
    Note right of DB: Optimistic Lock kiểm tra version ✓
    Assignment->>DB: INSERT INTO device_lifecycle_history\n(from=INSTOCK, to=DEPLOYED)
    Assignment->>Outbox: INSERT INTO outbox_events\n(type='DEVICE_ASSIGNED', status=PENDING)

    Note over Assignment, DB: COMMIT Transaction

    Assignment->>Redis: SET idempotency:assign:uuid-xxx "SUCCESS" TTL=10m
    Assignment-->>Angular: 200 OK {assignmentId, status: ASSIGNED}

    Note over Outbox, Kafka: Async — OutboxPollingService @Scheduled(fixedDelay=2000)
    Outbox->>DB: SELECT FROM outbox_events WHERE status=PENDING FOR UPDATE SKIP LOCKED
    Outbox->>Kafka: Publish 'device-assigned' event
    Outbox->>DB: UPDATE outbox_events SET status=SENT

    Kafka->>Audit: Consume → Ghi audit_log bất biến
```

---

## 5. Approval Workflow Flow

```mermaid
sequenceDiagram
    autonumber
    actor Staff as 👤 Nhân viên (Maker)
    actor M1 as 👔 Quản lý cấp 1
    actor M2 as 👔 Quản lý cấp 2
    participant Approval as Approval Service
    participant BizModule as Inventory/Assignment
    participant Kafka as Kafka
    participant Notif as Notification Service

    Staff->>Approval: Tạo phiếu xuất kho → DRAFT
    Staff->>Approval: Submit phiếu → PENDING_APPROVAL
    Approval->>Kafka: Publish 'approval.submitted' (Outbox)
    Kafka->>Notif: Consume → Notify M1: "Có phiếu chờ duyệt"

    M1->>Approval: GET /api/v1/approvals/inbox (thấy phiếu)

    alt M1 Phê duyệt cấp 1
        M1->>Approval: POST /approve {comment}
        Approval->>Approval: Kiểm tra M1 ≠ Người tạo phiếu
        Approval->>DB: UPDATE status=PENDING_LEVEL_2\nInsert approval_step (level=1, action=APPROVED)
        Approval->>Kafka: Publish 'approval.level1.approved'
        Kafka->>Notif: Notify M2: "Phiếu chờ duyệt cấp 2"
    else M1 Từ chối
        M1->>Approval: POST /reject {reason}
        Approval->>DB: UPDATE status=REJECTED
        Kafka->>Notif: Notify Staff: "Phiếu bị từ chối: {reason}"
    else M1 Yêu cầu bổ sung
        M1->>Approval: POST /return-for-edit {note}
        Approval->>DB: UPDATE status=RETURNED_FOR_EDIT
        Kafka->>Notif: Notify Staff: "Cần bổ sung thông tin"
    end

    M2->>Approval: POST /approve (final)
    Approval->>DB: UPDATE status=APPROVED\nInsert approval_step (level=2, action=APPROVED)
    Approval->>BizModule: Trigger ExecuteBusinessLogic (sync/event)
    BizModule->>BizModule: Thực hiện xuất kho + Update Device status
    BizModule->>Approval: Callback → COMPLETED
    Kafka->>Notif: Notify Staff: "Phiếu đã được duyệt và thực hiện"
```

---

## 6. Data Scope Pattern — Business Unit Isolation

```mermaid
graph LR
    subgraph "User A — INVENTORY_MANAGER"
        UA["Business Unit: HÀ NỘI"]
    end

    subgraph "User B — INVENTORY_MANAGER"
        UB["Business Unit: HỒ CHÍ MINH"]
    end

    subgraph "Database"
        D1["Devices (Kho Hà Nội)\nSN-POS-000001 ... 500"]
        D2["Devices (Kho HCM)\nSN-POS-000501 ... 1000"]
        M1["Merchants (HN)\nM000001 ... M000100"]
        M2["Merchants (HCM)\nM000101 ... M000200"]
    end

    UA -->|"Chỉ thấy"| D1
    UA -->|"Chỉ thấy"| M1
    UB -->|"Chỉ thấy"| D2
    UB -->|"Chỉ thấy"| M2

    style UA fill:#1565c0,color:#fff
    style UB fill:#2e7d32,color:#fff
```

```java
// Trong mọi list query:
// DataScopeService inject businessUnitId
public Page<DeviceResponse> getDevices(DeviceFilter filter, Pageable pageable, UserPrincipal user) {
    // SUPER_ADMIN: businessUnitId = null → thấy tất cả
    // Các role khác: businessUnitId = user.getBusinessUnitId() → chỉ thấy dữ liệu của BU mình
    UUID businessUnitId = user.isSuperAdmin() ? null : user.getBusinessUnitId();
    return deviceRepository.findAllWithFilter(filter, businessUnitId, pageable)
        .map(mapper::toResponse);
}
```

---

## 7. Outbox Pattern — Transactional Reliability

```mermaid
flowchart TD
    A["Nhân viên: Assign device"] --> B["@Transactional BEGIN"]
    B --> C["INSERT assignments (ACTIVE)"]
    C --> D["UPDATE devices SET status=DEPLOYED, version++\nWHERE version=currentVersion"]
    D --> E{"Optimistic Lock OK?"}
    E -->|"No — OptimisticLockException"| F["Retry (max 3 lần)"]
    F --> B
    E -->|"Yes"| G["INSERT device_lifecycle_history"]
    G --> H["INSERT outbox_events (status=PENDING)"]
    H --> I["@Transactional COMMIT"]
    I --> J["Return 200 OK to client"]

    K["OutboxPollingService\n@Scheduled fixedDelay=2000ms"] --> L["SELECT FROM outbox_events\nWHERE status=PENDING\nFOR UPDATE SKIP LOCKED"]
    L --> M["Publish to Kafka topic: device-assigned"]
    M --> N{"Publish OK?"}
    N -->|"Yes"| O["UPDATE status=SENT"]
    N -->|"No (retry 5x)"| P["UPDATE status=FAILED\nDead Letter Topic"]

    style I fill:#2e7d32,color:#fff
    style P fill:#b71c1c,color:#fff
    style O fill:#1565c0,color:#fff
```

---

## 8. Redis Key Strategy

| Use Case | Key Pattern | TTL | Type |
|---|---|---|---|
| JWT Refresh Token | `refresh:{tokenId}` | 7 ngày | String |
| Idempotency Assign | `idempotency:assign:{uuid}` | 10 phút | String |
| Idempotency Approval | `idempotency:approval:{uuid}` | 10 phút | String |
| Rate Limit Login | `rate_limit:login:{ip}` | 1 phút | Counter |
| Device Status Cache | `device:status:{serialNumber}` | 60 giây | String |
| Approval Inbox Count | `approval:inbox:{userId}` | 30 giây | String |
| Merchant Info Cache | `merchant:info:{merchantCode}` | 5 phút | String |
| Consumed Event | `consumed_event:{kafkaEventId}` | 1 giờ | String |
| Account Lock | `account:locked:{username}` | 30 phút | String |
| Distributed Lock | `device:assign:lock:{serial}` | 5 giây | Redisson RLock |

---

## 9. Database Schema ERD (Core Relationships)

```mermaid
erDiagram
    DEVICES {
        uuid id PK
        string serial_number UK
        uuid device_model_id FK
        uuid vendor_id FK
        uuid current_warehouse_id FK
        string status
        bigint version
    }

    ASSIGNMENTS {
        uuid id PK
        string assignment_code UK
        uuid device_id FK
        uuid merchant_id FK
        uuid terminal_id FK
        string status
        bigint version
    }

    MERCHANTS {
        uuid id PK
        string merchant_code UK
        uuid business_unit_id FK
        uuid mcc_code_id FK
        string status
        bigint version
    }

    TERMINALS {
        uuid id PK
        string tid UK
        uuid merchant_id FK
        string status
    }

    APPROVAL_REQUESTS {
        uuid id PK
        string request_number UK
        string request_type
        string status
        int current_level
        uuid created_by FK
        bigint version
    }

    DEVICE_LIFECYCLE_HISTORY {
        uuid id PK
        uuid device_id FK
        string from_status
        string to_status
        uuid performed_by FK
        timestamp occurred_at
    }

    STOCK_TRANSACTIONS {
        uuid id PK
        uuid device_id FK
        string transaction_type
        uuid from_warehouse_id FK
        uuid to_warehouse_id FK
        timestamp occurred_at
    }

    OUTBOX_EVENTS {
        uuid id PK
        string event_type
        string aggregate_id
        string status
        int retry_count
    }

    DEVICES ||--o{ ASSIGNMENTS : "assigned via"
    DEVICES ||--o{ DEVICE_LIFECYCLE_HISTORY : "has history"
    DEVICES ||--o{ STOCK_TRANSACTIONS : "stock ledger"
    MERCHANTS ||--o{ TERMINALS : "has terminals"
    MERCHANTS ||--o{ ASSIGNMENTS : "receives devices"
    TERMINALS ||--o{ ASSIGNMENTS : "linked to"
    APPROVAL_REQUESTS ||--o{ APPROVAL_STEPS : "has steps"
```

---

*Tất cả diagram được tạo dựa trên thiết kế nghiệp vụ thực tế của POS Terminal & Merchant Management System*
