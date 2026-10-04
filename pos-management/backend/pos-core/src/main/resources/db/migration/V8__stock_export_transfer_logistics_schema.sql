-- ================================================================
-- Flyway V8: Stock Export, Transfer & Logistics Schema
-- ================================================================

CREATE TABLE IF NOT EXISTS stock_exports (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    export_code         VARCHAR(50) NOT NULL UNIQUE,
    from_warehouse_id   UUID        NOT NULL REFERENCES warehouses(id),
    approval_id         UUID        REFERENCES approval_requests(id),
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    note                TEXT,
    version             BIGINT      NOT NULL DEFAULT 0,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS stock_export_items (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    export_id           UUID        NOT NULL REFERENCES stock_exports(id) ON DELETE CASCADE,
    serial_number       VARCHAR(100) NOT NULL,
    device_id           UUID        REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS stock_transfers (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_code       VARCHAR(50) NOT NULL UNIQUE,
    from_warehouse_id   UUID        NOT NULL REFERENCES warehouses(id),
    to_warehouse_id     UUID        NOT NULL REFERENCES warehouses(id),
    approval_id         UUID        REFERENCES approval_requests(id),
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    note                TEXT,
    version             BIGINT      NOT NULL DEFAULT 0,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS stock_transfer_items (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id         UUID        NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
    serial_number       VARCHAR(100) NOT NULL,
    device_id           UUID        REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS logistics_shipments (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    waybill_number      VARCHAR(100) NOT NULL UNIQUE,
    carrier_name        VARCHAR(200) NOT NULL,
    from_address        TEXT,
    to_address          TEXT,
    status              VARCHAR(30) NOT NULL DEFAULT 'IN_TRANSIT',
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
