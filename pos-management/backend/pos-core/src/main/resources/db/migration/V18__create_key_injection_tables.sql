-- Migration V18: HSM Key Injection & PCI DSS Security Workflow Schema

-- 1. Key Injection Orders Table
CREATE TABLE key_injection_orders (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number      VARCHAR(50) NOT NULL UNIQUE,
    device_id         UUID        NOT NULL REFERENCES devices(id),
    hsm_profile_id    VARCHAR(100) NOT NULL DEFAULT 'HSM_PCI_PTS_PROD',
    status            VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, INJECTING, SUCCESS, FAILED
    injected_by       UUID        REFERENCES users(id),
    approved_by       UUID        REFERENCES users(id),
    hsm_response_code VARCHAR(50) DEFAULT '00_SUCCESS',
    notes             TEXT,
    version           BIGINT      NOT NULL DEFAULT 0,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. HSM Security Audit Logs Table
CREATE TABLE hsm_security_logs (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id       UUID        NOT NULL REFERENCES key_injection_orders(id),
    device_serial  VARCHAR(100) NOT NULL,
    key_type       VARCHAR(30) NOT NULL DEFAULT 'TMK', -- TMK, TPK, TAK
    checksum       VARCHAR(100) NOT NULL,
    ip_address     VARCHAR(50),
    performed_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_key_inj_orders_status ON key_injection_orders(status);
CREATE INDEX idx_key_inj_orders_device ON key_injection_orders(device_id);
CREATE INDEX idx_hsm_logs_order ON hsm_security_logs(order_id);
