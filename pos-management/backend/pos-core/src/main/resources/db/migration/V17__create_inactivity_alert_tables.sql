-- Migration V17: POS Inactivity Alert & Revenue Monitoring Schema

-- 1. Inactivity Configs Table
CREATE TABLE inactivity_configs (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    threshold_days    INT         NOT NULL DEFAULT 30,
    auto_recall_days  INT         NOT NULL DEFAULT 60,
    warning_message   TEXT        DEFAULT 'Thiết bị POS không phát sinh giao dịch quẹt thẻ',
    is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inactivity Alerts Table
CREATE TABLE inactivity_alerts (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id    UUID        NOT NULL REFERENCES terminal_ids(id),
    merchant_id    UUID        REFERENCES merchants(id),
    device_id      UUID        REFERENCES devices(id),
    days_inactive  INT         NOT NULL DEFAULT 30,
    last_tx_at     TIMESTAMP WITH TIME ZONE,
    status         VARCHAR(30) NOT NULL DEFAULT 'NEW', -- NEW, NOTIFIED, RECALLED, DISMISSED
    resolved_at    TIMESTAMP WITH TIME ZONE,
    resolved_by    UUID        REFERENCES users(id),
    notes          TEXT,
    version        BIGINT      NOT NULL DEFAULT 0,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_inactivity_alerts_status ON inactivity_alerts(status);
CREATE INDEX idx_inactivity_alerts_terminal ON inactivity_alerts(terminal_id);
CREATE INDEX idx_inactivity_alerts_merchant ON inactivity_alerts(merchant_id);

-- Seed Default Config
INSERT INTO inactivity_configs (threshold_days, auto_recall_days, warning_message, is_active)
VALUES (30, 60, 'Cảnh báo POS không phát sinh doanh số quẹt thẻ trong 30 ngày', TRUE);
