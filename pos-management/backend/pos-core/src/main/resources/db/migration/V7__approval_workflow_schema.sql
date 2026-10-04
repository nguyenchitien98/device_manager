-- ================================================================
-- Flyway V7: Approval Workflow Engine Schema
-- ================================================================

CREATE TABLE IF NOT EXISTS approval_requests (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    request_code    VARCHAR(50) NOT NULL UNIQUE,
    request_type    VARCHAR(50) NOT NULL, -- STOCK_EXPORT, STOCK_TRANSFER, DEVICE_DISPOSE, MAINTENANCE
    creator_id      UUID        NOT NULL REFERENCES users(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                        CONSTRAINT chk_approval_status CHECK (status IN ('PENDING','APPROVED','REJECTED','RETURNED_FOR_EDIT','CANCELLED')),
    payload         TEXT,       -- JSON payload của đề xuất
    note            TEXT,
    current_step    INT         NOT NULL DEFAULT 1,
    total_steps     INT         NOT NULL DEFAULT 1,
    version         BIGINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approval_code ON approval_requests(request_code);
CREATE INDEX idx_approval_status ON approval_requests(status);
CREATE INDEX idx_approval_creator ON approval_requests(creator_id);

CREATE TABLE IF NOT EXISTS approval_steps (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id     UUID        NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    step_number     INT         NOT NULL,
    approver_id     UUID        REFERENCES users(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    comment         TEXT,
    action_at       TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_approval_steps_approval ON approval_steps(approval_id);
