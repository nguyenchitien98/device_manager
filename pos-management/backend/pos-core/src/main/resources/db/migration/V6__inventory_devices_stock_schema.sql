-- ================================================================
-- Flyway V6: Inventory, PO, Devices, Stock Ledger & Outbox Schema
-- ================================================================

-- ─── Bảng purchase_orders ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number       VARCHAR(50) NOT NULL UNIQUE,
    vendor_id       UUID        NOT NULL REFERENCES vendors(id),
    warehouse_id    UUID        NOT NULL REFERENCES warehouses(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                        CONSTRAINT chk_po_status CHECK (status IN ('DRAFT','SUBMITTED','APPROVED','RECEIVED','CLOSED','REJECTED')),
    note            TEXT,
    total_quantity  INT         NOT NULL DEFAULT 0,
    version         BIGINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_status ON purchase_orders(status);

-- ─── Bảng purchase_order_items ────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id           UUID        NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    device_model_id UUID        NOT NULL REFERENCES device_models(id),
    quantity        INT         NOT NULL DEFAULT 1,
    received_qty    INT         NOT NULL DEFAULT 0,
    price           DECIMAL(15,2),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_po_items_po ON purchase_order_items(po_id);

-- ─── Bảng devices (Thiết bị POS vật lý) ───────────────────────────
CREATE TABLE IF NOT EXISTS devices (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number   VARCHAR(100) NOT NULL UNIQUE,
    device_model_id UUID        NOT NULL REFERENCES device_models(id),
    warehouse_id    UUID        REFERENCES warehouses(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'INSTOCK'
                        CONSTRAINT chk_device_status CHECK (status IN ('INSTOCK','OUT_OF_WAREHOUSE','DEPLOYED','REPAIRING','RETURNED','DISPOSED')),
    version         BIGINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_serial ON devices(serial_number);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_warehouse ON devices(warehouse_id);

-- ─── Bảng stock_transactions (Ledger nhật ký xuất/nhập/điều chuyển) ───
CREATE TABLE IF NOT EXISTS stock_transactions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(30) NOT NULL, -- IMPORT, EXPORT, TRANSFER, RETURN
    device_id       UUID        REFERENCES devices(id),
    serial_number   VARCHAR(100) NOT NULL,
    from_warehouse_id UUID      REFERENCES warehouses(id),
    to_warehouse_id   UUID      REFERENCES warehouses(id),
    po_id           UUID        REFERENCES purchase_orders(id),
    note            TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_stock_tx_serial ON stock_transactions(serial_number);
CREATE INDEX idx_stock_tx_type ON stock_transactions(transaction_type);

-- ─── Bảng outbox_events (Transactional Outbox Pattern) ───────────
CREATE TABLE IF NOT EXISTS outbox_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type  VARCHAR(50) NOT NULL,
    aggregate_id    VARCHAR(100) NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    payload         TEXT        NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CONSTRAINT chk_outbox_status CHECK (status IN ('PENDING','SENT','FAILED')),
    retry_count     INT         NOT NULL DEFAULT 0,
    error_message   TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at    TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_outbox_status ON outbox_events(status);
