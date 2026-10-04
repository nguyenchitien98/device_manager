-- ================================================================
-- Flyway V9: Device Lifecycle History & Repair Orders Schema
-- ================================================================

CREATE TABLE IF NOT EXISTS device_lifecycle_history (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id       UUID        NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    serial_number   VARCHAR(100) NOT NULL,
    from_status     VARCHAR(30),
    to_status       VARCHAR(30) NOT NULL,
    action          VARCHAR(50) NOT NULL,
    reason          TEXT,
    created_by      UUID        REFERENCES users(id),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_device_lifecycle_serial ON device_lifecycle_history(serial_number);
CREATE INDEX idx_device_lifecycle_device ON device_lifecycle_history(device_id);

CREATE TABLE IF NOT EXISTS repair_orders (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_code       VARCHAR(50) NOT NULL UNIQUE,
    device_id         UUID        NOT NULL REFERENCES devices(id),
    serial_number     VARCHAR(100) NOT NULL,
    vendor_id         UUID        REFERENCES vendors(id),
    issue_description TEXT        NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'UNDER_REPAIR'
                          CONSTRAINT chk_repair_status CHECK (status IN ('UNDER_REPAIR','REPAIRED','SCRAPPED','CANCELLED')),
    repair_cost       DECIMAL(15,2),
    note              TEXT,
    created_by        UUID        REFERENCES users(id),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_repair_orders_code ON repair_orders(repair_code);
CREATE INDEX idx_repair_orders_serial ON repair_orders(serial_number);
CREATE INDEX idx_repair_orders_status ON repair_orders(status);
