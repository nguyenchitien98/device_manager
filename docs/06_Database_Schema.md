# POS Management System — Database Schema

Tài liệu này mô tả toàn bộ schema database cho hệ thống POS Management, bao gồm DDL, quan hệ giữa các bảng, index, constraint và nguyên tắc thiết kế.

---

## 1. Nguyên Tắc Thiết Kế Database

| Nguyên Tắc | Quy Định |
|---|---|
| **Migration Tool** | Flyway — KHÔNG dùng `ddl-auto=create/update` |
| **UUID Primary Key** | Tất cả bảng dùng `UUID` làm PK (`DEFAULT gen_random_uuid()`) |
| **Timestamps** | Mọi bảng có `created_at`, `updated_at` |
| **Soft Delete** | Dùng `status` hoặc `is_active` — KHÔNG xóa cứng Master Data |
| **Immutable Tables** | `device_lifecycle_history`, `stock_transactions`, `assignment_history`, `audit_logs` — KHÔNG UPDATE/DELETE |
| **Optimistic Lock** | Mọi bảng concurrent-prone phải có `version BIGINT DEFAULT 0` |
| **Naming** | snake_case, số nhiều cho table name, snake_case cho column |

---

## 2. Flyway Migration Files

```
V1__init_base_schema.sql           # UUID extension, common functions
V2__create_identity_tables.sql     # users, roles, permissions, auth
V3__create_catalog_tables.sql      # device categories, types, models, vendors
V4__create_organization_tables.sql # business_units, warehouses
V5__create_inventory_tables.sql    # purchase_orders, devices, stock_transactions
V6__create_merchant_tables.sql     # merchants, terminals, mcc_codes
V7__create_device_history_table.sql # device_lifecycle_history
V8__create_assignment_tables.sql   # assignments, assignment_history
V9__create_approval_tables.sql     # approval_requests, approval_steps
V10__create_notification_tables.sql # notifications, outbox_events, audit_logs
V11__create_fee_policy_tables.sql  # fee_policies, merchant_fee_assignments
V12__seed_catalog_data.sql         # Dữ liệu mẫu cho catalog
V13__seed_organization_data.sql    # Business Unit, Warehouse mẫu
V14__seed_identity_data.sql        # Roles, permissions, admin user
V15__seed_mcc_data.sql             # Top 50 MCC codes
```

---

## 3. Domain: Identity & RBAC

### Bảng: `users`
```sql
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(100) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,                  -- BCrypt hash
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    business_unit_id UUID       REFERENCES business_units(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE, LOCKED
    failed_login_attempts INT   NOT NULL DEFAULT 0,
    locked_until    TIMESTAMP WITH TIME ZONE,
    last_login_at   TIMESTAMP WITH TIME ZONE,
    version         BIGINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_business_unit ON users(business_unit_id);
```

### Bảng: `roles`
```sql
CREATE TABLE roles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,   -- SUPER_ADMIN, INVENTORY_MANAGER, ...
    description VARCHAR(255),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng: `permissions`
```sql
CREATE TABLE permissions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(100) NOT NULL UNIQUE,  -- INVENTORY_VIEW, DEVICE_ASSIGN, APPROVAL_APPROVE_L1
    description VARCHAR(255),
    module      VARCHAR(50) NOT NULL           -- CATALOG, INVENTORY, DEVICE, ASSIGNMENT, APPROVAL
);
```

### Bảng: `user_roles`, `role_permissions`
```sql
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);
```

### Bảng: `refresh_tokens`
```sql
CREATE TABLE refresh_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id),
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Domain: Catalog (Master Data)

### Bảng: `device_categories`
```sql
CREATE TABLE device_categories (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) NOT NULL UNIQUE,   -- POS, MPOS, SOFTPOS
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng: `device_types`
```sql
CREATE TABLE device_types (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    device_category_id  UUID        NOT NULL REFERENCES device_categories(id),
    code                VARCHAR(50) NOT NULL UNIQUE,   -- FIXED, MOBILE, WIRELESS
    name                VARCHAR(255) NOT NULL,
    description         VARCHAR(500),
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng: `vendors`
```sql
CREATE TABLE vendors (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) NOT NULL UNIQUE,   -- PAX, INGENICO, VERIFONE
    name        VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng: `device_models`
```sql
CREATE TABLE device_models (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    device_type_id  UUID        NOT NULL REFERENCES device_types(id),
    vendor_id       UUID        NOT NULL REFERENCES vendors(id),
    code            VARCHAR(50) NOT NULL UNIQUE,   -- A920, ICT220, VX520
    name            VARCHAR(255) NOT NULL,
    specifications  JSONB,                          -- Thông số kỹ thuật linh hoạt
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng: `mcc_codes`
```sql
CREATE TABLE mcc_codes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(10) NOT NULL UNIQUE,   -- 5411, 5812, ...
    name        VARCHAR(255) NOT NULL,
    category    VARCHAR(100),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE
);
```

### Bảng: `fee_policies`
```sql
CREATE TABLE fee_policies (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    description     VARCHAR(500),
    fee_rate        DECIMAL(5,4) NOT NULL,          -- Tỷ lệ % (0.0150 = 1.5%)
    fixed_fee       DECIMAL(15,2) DEFAULT 0,        -- Phí cố định
    min_fee         DECIMAL(15,2) DEFAULT 0,        -- Phí tối thiểu
    max_fee         DECIMAL(15,2),                  -- Phí tối đa (null = không giới hạn)
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Domain: Organization

### Bảng: `business_units`
```sql
CREATE TABLE business_units (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) NOT NULL UNIQUE,   -- HN, HCM, DN
    name        VARCHAR(255) NOT NULL,
    region      VARCHAR(100),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng: `warehouses`
```sql
CREATE TABLE warehouses (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    business_unit_id UUID        NOT NULL REFERENCES business_units(id),
    code             VARCHAR(50) NOT NULL UNIQUE,
    name             VARCHAR(255) NOT NULL,
    address          VARCHAR(500),
    is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Domain: Inventory

### Bảng: `purchase_orders`
```sql
CREATE TABLE purchase_orders (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number       VARCHAR(50) NOT NULL UNIQUE,   -- PO-2026-0001
    vendor_id       UUID        NOT NULL REFERENCES vendors(id),
    warehouse_id    UUID        NOT NULL REFERENCES warehouses(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    -- DRAFT, SUBMITTED, APPROVED, RECEIVED, CLOSED
    total_quantity  INT         NOT NULL DEFAULT 0,
    notes           TEXT,
    submitted_at    TIMESTAMP WITH TIME ZONE,
    approved_at     TIMESTAMP WITH TIME ZONE,
    received_at     TIMESTAMP WITH TIME ZONE,
    created_by      UUID        NOT NULL REFERENCES users(id),
    version         BIGINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng: `purchase_order_items`
```sql
CREATE TABLE purchase_order_items (
    id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID    NOT NULL REFERENCES purchase_orders(id),
    device_model_id   UUID    NOT NULL REFERENCES device_models(id),
    quantity_ordered  INT     NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INT     NOT NULL DEFAULT 0,
    unit_price        DECIMAL(15,2),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng: `devices` ⭐ (Bảng trung tâm)
```sql
CREATE TABLE devices (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number    VARCHAR(100) NOT NULL UNIQUE,  -- SN-POS-000001
    device_model_id  UUID        NOT NULL REFERENCES device_models(id),
    vendor_id        UUID        NOT NULL REFERENCES vendors(id),
    current_warehouse_id UUID    REFERENCES warehouses(id),
    status           VARCHAR(30) NOT NULL DEFAULT 'INSTOCK',
    -- INSTOCK, OUT_OF_WAREHOUSE, DEPLOYED, RETURNED, REPAIRING, DISPOSED
    purchase_order_id UUID       REFERENCES purchase_orders(id),
    purchase_date    DATE,
    warranty_expiry  DATE,
    firmware_version VARCHAR(50),
    notes            TEXT,
    version          BIGINT      NOT NULL DEFAULT 0,    -- Optimistic Lock
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_devices_serial ON devices(serial_number);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_model_status ON devices(device_model_id, status);
CREATE INDEX idx_devices_warehouse_status ON devices(current_warehouse_id, status);
```

### Bảng: `stock_transactions` ⭐ (Append-Only — Stock Ledger)
```sql
CREATE TABLE stock_transactions (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id        UUID        NOT NULL REFERENCES devices(id),
    transaction_type VARCHAR(30) NOT NULL,
    -- IMPORT, EXPORT, TRANSFER_OUT, TRANSFER_IN, RETURN, ADJUSTMENT
    quantity         INT         NOT NULL DEFAULT 1,  -- +1 hoặc -1
    from_warehouse_id UUID       REFERENCES warehouses(id),
    to_warehouse_id  UUID       REFERENCES warehouses(id),
    reference_type   VARCHAR(50),   -- PURCHASE_ORDER, EXPORT_REQUEST, ASSIGNMENT
    reference_id     UUID,
    notes            TEXT,
    performed_by     UUID        NOT NULL REFERENCES users(id),
    occurred_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- KHÔNG CÓ updated_at — bảng này APPEND-ONLY
);

CREATE INDEX idx_stock_tx_device ON stock_transactions(device_id);
CREATE INDEX idx_stock_tx_warehouse ON stock_transactions(to_warehouse_id, occurred_at DESC);
CREATE INDEX idx_stock_tx_type ON stock_transactions(transaction_type, occurred_at DESC);
```

---

## 7. Domain: Merchant & Terminal

### Bảng: `merchants`
```sql
CREATE TABLE merchants (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_code    VARCHAR(20) NOT NULL UNIQUE,  -- M000001 (auto-gen)
    merchant_name    VARCHAR(255) NOT NULL,
    tax_code         VARCHAR(20),
    mcc_code_id      UUID        REFERENCES mcc_codes(id),
    business_unit_id UUID        NOT NULL REFERENCES business_units(id),
    address          VARCHAR(500),
    contact_name     VARCHAR(255),
    contact_phone    VARCHAR(20),
    contact_email    VARCHAR(255),
    status           VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    -- PENDING, ACTIVE, INACTIVE, SUSPENDED
    version          BIGINT      NOT NULL DEFAULT 0,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_merchants_business_unit ON merchants(business_unit_id);
CREATE INDEX idx_merchants_mcc ON merchants(mcc_code_id);
```

### Bảng: `terminals`
```sql
CREATE TABLE terminals (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tid             VARCHAR(20) NOT NULL UNIQUE,  -- T100001 (auto-gen)
    merchant_id     UUID        NOT NULL REFERENCES merchants(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING, ACTIVE, INACTIVE
    effective_from  DATE,
    effective_to    DATE,
    notes           TEXT,
    version         BIGINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_terminals_merchant ON terminals(merchant_id);
CREATE INDEX idx_terminals_status ON terminals(status);
```

### Bảng: `merchant_fee_assignments` (Effective Dating)
```sql
CREATE TABLE merchant_fee_assignments (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id    UUID    NOT NULL REFERENCES merchants(id),
    fee_policy_id  UUID    NOT NULL REFERENCES fee_policies(id),
    effective_from DATE    NOT NULL,
    effective_to   DATE,                   -- NULL = còn hiệu lực đến hiện tại
    notes          TEXT,
    created_by     UUID    NOT NULL REFERENCES users(id),
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Đảm bảo không có 2 policy active cùng lúc cho cùng merchant
CREATE UNIQUE INDEX idx_merchant_fee_active
ON merchant_fee_assignments(merchant_id)
WHERE effective_to IS NULL;
```

---

## 8. Domain: Device Lifecycle History (Append-Only)

### Bảng: `device_lifecycle_history` ⭐
```sql
CREATE TABLE device_lifecycle_history (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id        UUID        NOT NULL REFERENCES devices(id),
    from_status      VARCHAR(30),                    -- NULL khi nhập kho lần đầu
    to_status        VARCHAR(30) NOT NULL,
    reason           VARCHAR(500),
    reference_type   VARCHAR(50),  -- ASSIGNMENT, RETURN, REPAIR_ORDER, EXPORT_REQUEST
    reference_id     UUID,
    performed_by     UUID        NOT NULL REFERENCES users(id),
    occurred_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- KHÔNG CÓ updated_at — APPEND-ONLY
);

CREATE INDEX idx_device_lifecycle_device ON device_lifecycle_history(device_id, occurred_at DESC);
```

### Bảng: `repair_orders`
```sql
CREATE TABLE repair_orders (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_number   VARCHAR(50) NOT NULL UNIQUE,   -- REP-2026-0001
    device_id       UUID        NOT NULL REFERENCES devices(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    -- CREATED, IN_PROGRESS, COMPLETED, FAILED
    description     TEXT        NOT NULL,           -- Mô tả lỗi
    repair_vendor   VARCHAR(255),                   -- Đơn vị sửa chữa
    result          TEXT,                           -- Kết quả nghiệm thu
    started_at      TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    created_by      UUID        NOT NULL REFERENCES users(id),
    completed_by    UUID        REFERENCES users(id),
    version         BIGINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. Domain: Assignment

### Bảng: `assignments` ⭐
```sql
CREATE TABLE assignments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_code VARCHAR(50) NOT NULL UNIQUE,  -- ASG-000001
    device_id       UUID        NOT NULL REFERENCES devices(id),
    merchant_id     UUID        NOT NULL REFERENCES merchants(id),
    terminal_id     UUID        REFERENCES terminals(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    -- ACTIVE, RETURNED, TRANSFERRED
    assigned_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    returned_at     TIMESTAMP WITH TIME ZONE,
    assigned_by     UUID        NOT NULL REFERENCES users(id),
    returned_by     UUID        REFERENCES users(id),
    notes           TEXT,
    version         BIGINT      NOT NULL DEFAULT 0,   -- Optimistic Lock
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Chỉ cho phép 1 assignment ACTIVE tại một thời điểm cho một thiết bị
CREATE UNIQUE INDEX idx_one_active_assignment_per_device
ON assignments(device_id)
WHERE status = 'ACTIVE';

CREATE INDEX idx_assignments_merchant ON assignments(merchant_id, status);
CREATE INDEX idx_assignments_device ON assignments(device_id, status);
```

---

## 10. Domain: Approval Workflow

### Bảng: `approval_requests`
```sql
CREATE TABLE approval_requests (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number   VARCHAR(50) NOT NULL UNIQUE,  -- EX-2026-0001, RC-2026-0001
    request_type     VARCHAR(50) NOT NULL,
    -- STOCK_EXPORT, STOCK_TRANSFER, DEVICE_RETURN, DEVICE_DISPOSE, MERCHANT_CHANGE
    status           VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    -- DRAFT, PENDING_APPROVAL, PENDING_LEVEL_2, APPROVED, REJECTED, RETURNED_FOR_EDIT, EXECUTING, COMPLETED, CANCELLED
    max_approval_level INT       NOT NULL DEFAULT 2,
    current_level    INT         NOT NULL DEFAULT 0,
    reference_id     UUID,                          -- ID của nghiệp vụ liên quan
    reference_type   VARCHAR(50),
    summary          VARCHAR(500),                  -- Tóm tắt để hiển thị trong inbox
    details          JSONB,                          -- Toàn bộ thông tin phiếu
    rejection_reason TEXT,
    created_by       UUID        NOT NULL REFERENCES users(id),
    business_unit_id UUID        REFERENCES business_units(id),
    version          BIGINT      NOT NULL DEFAULT 0,   -- Optimistic Lock chống duyệt trùng
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_status ON approval_requests(status);
CREATE INDEX idx_approvals_type_status ON approval_requests(request_type, status);
CREATE INDEX idx_approvals_created_by ON approval_requests(created_by, status);
```

### Bảng: `approval_steps`
```sql
CREATE TABLE approval_steps (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id  UUID        NOT NULL REFERENCES approval_requests(id),
    level                INT         NOT NULL,     -- 1, 2
    action               VARCHAR(30) NOT NULL,
    -- SUBMITTED, APPROVED, REJECTED, RETURNED_FOR_EDIT, EXECUTED
    performed_by         UUID        NOT NULL REFERENCES users(id),
    comment              TEXT,
    occurred_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- APPEND-ONLY
);

CREATE INDEX idx_approval_steps_request ON approval_steps(approval_request_id, occurred_at DESC);
```

---

## 11. Domain: Notifications & System

### Bảng: `notifications`
```sql
CREATE TABLE notifications (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL REFERENCES users(id),
    title            VARCHAR(255) NOT NULL,
    message          TEXT        NOT NULL,
    type             VARCHAR(50) NOT NULL,   -- APPROVAL_REQUIRED, APPROVAL_RESULT, SYSTEM
    reference_type   VARCHAR(50),
    reference_id     UUID,
    is_read          BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
```

### Bảng: `outbox_events`
```sql
CREATE TABLE outbox_events (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type       VARCHAR(100) NOT NULL,   -- DEVICE_ASSIGNED, STOCK_ISSUED, ...
    aggregate_id     VARCHAR(255) NOT NULL,
    aggregate_type   VARCHAR(100) NOT NULL,
    payload          JSONB       NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING',   -- PENDING, SENT, FAILED
    retry_count      INT         NOT NULL DEFAULT 0,
    last_error       TEXT,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at          TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_outbox_status ON outbox_events(status, created_at ASC);
```

### Bảng: `audit_logs` (Append-Only — Immutable)
```sql
CREATE TABLE audit_logs (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        REFERENCES users(id),
    username         VARCHAR(100),               -- Denormalized để không mất khi user xóa
    action           VARCHAR(100) NOT NULL,      -- DEVICE_ASSIGNED, APPROVAL_APPROVED, ...
    resource_type    VARCHAR(100) NOT NULL,      -- DEVICE, ASSIGNMENT, APPROVAL, MERCHANT
    resource_id      VARCHAR(255),
    description      TEXT,
    ip_address       VARCHAR(50),
    request_id       VARCHAR(100),               -- Correlation ID
    old_value        JSONB,                      -- Trạng thái trước khi thay đổi
    new_value        JSONB,                      -- Trạng thái sau khi thay đổi
    occurred_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- APPEND-ONLY: KHÔNG CÓ updated_at, KHÔNG UPDATE, KHÔNG DELETE
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, occurred_at DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id, occurred_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, occurred_at DESC);
```

---

## 12. ERD Tóm Tắt (Entity Relationship)

```
device_categories (1) ──→ (N) device_types (1) ──→ (N) device_models
vendors (1) ──→ (N) device_models

business_units (1) ──→ (N) warehouses
business_units (1) ──→ (N) users
business_units (1) ──→ (N) merchants

purchase_orders (1) ──→ (N) purchase_order_items
purchase_orders (1) ──→ (N) devices
device_models (1) ──→ (N) devices
vendors (1) ──→ (N) devices
warehouses (1) ──→ (N) devices
devices (1) ──→ (N) stock_transactions
devices (1) ──→ (N) device_lifecycle_history
devices (1) ──→ (N) repair_orders
devices (1) ──→ (N) assignments

merchants (1) ──→ (N) terminals
merchants (1) ──→ (N) assignments
merchants (1) ──→ (N) merchant_fee_assignments
mcc_codes (1) ──→ (N) merchants
fee_policies (1) ──→ (N) merchant_fee_assignments

assignments (1) ──→ (N) assignment_history (implicit via lifecycle)
approval_requests (1) ──→ (N) approval_steps

users (1) ──→ (N) user_roles ──→ (N) roles ──→ (N) role_permissions ──→ (N) permissions
```

---

## 13. Indexes Quan Trọng

```sql
-- Tra cứu thiết bị nhanh theo nhiều tiêu chí
CREATE INDEX idx_devices_search ON devices(status, device_model_id, current_warehouse_id);

-- Tìm assignment active của thiết bị
CREATE UNIQUE INDEX idx_one_active_assignment_per_device
ON assignments(device_id) WHERE status = 'ACTIVE';

-- Query approval inbox của user
CREATE INDEX idx_approvals_inbox ON approval_requests(status, current_level, business_unit_id);

-- Stock ledger history của thiết bị
CREATE INDEX idx_stock_tx_device_time ON stock_transactions(device_id, occurred_at DESC);

-- Device lifecycle history
CREATE INDEX idx_lifecycle_device_time ON device_lifecycle_history(device_id, occurred_at DESC);

-- Fee policy có hiệu lực
CREATE UNIQUE INDEX idx_merchant_fee_active
ON merchant_fee_assignments(merchant_id) WHERE effective_to IS NULL;
```
