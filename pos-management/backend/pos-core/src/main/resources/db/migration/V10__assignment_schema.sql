-- ================================================================
-- Flyway V10: Device Assignment, Idempotency & Concurrency Schema
-- ================================================================

CREATE TABLE IF NOT EXISTS assignments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_code VARCHAR(50) NOT NULL UNIQUE,
    device_id       UUID        NOT NULL REFERENCES devices(id),
    serial_number   VARCHAR(100) NOT NULL,
    merchant_id     UUID        NOT NULL REFERENCES merchants(id),
    terminal_id     UUID        REFERENCES terminals(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CONSTRAINT chk_assignment_status CHECK (status IN ('ACTIVE','RETURNED','TRANSFERRED','CANCELLED')),
    note            TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    returned_at     TIMESTAMP WITH TIME ZONE,
    created_by      UUID        REFERENCES users(id)
);

CREATE INDEX idx_assignments_code ON assignments(assignment_code);
CREATE INDEX idx_assignments_serial ON assignments(serial_number);
CREATE INDEX idx_assignments_merchant ON assignments(merchant_id);
CREATE INDEX idx_assignments_status ON assignments(status);

CREATE TABLE IF NOT EXISTS assignment_history (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id   UUID        NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    serial_number   VARCHAR(100) NOT NULL,
    action          VARCHAR(50) NOT NULL, -- CREATE, RETURN, TRANSFER
    from_merchant_id UUID       REFERENCES merchants(id),
    to_merchant_id   UUID       REFERENCES merchants(id),
    reason          TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID        REFERENCES users(id)
);

CREATE INDEX idx_assignment_hist_serial ON assignment_history(serial_number);
