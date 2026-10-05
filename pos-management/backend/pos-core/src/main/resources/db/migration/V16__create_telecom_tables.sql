-- Migration V16: Telecom Inventory (SIM 4G & SAM Cards) Schema

-- 1. SIM Cards Table
CREATE TABLE sim_cards (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sim_serial        VARCHAR(50) NOT NULL UNIQUE,
    phone_number      VARCHAR(20) NOT NULL UNIQUE,
    telco             VARCHAR(30) NOT NULL DEFAULT 'VIETTEL',  -- VIETTEL, VINAPHONE, MOBIFONE
    status            VARCHAR(30) NOT NULL DEFAULT 'INSTOCK', -- INSTOCK, ASSIGNED, SUSPENDED, EXPIRED, DISPOSED
    package_name      VARCHAR(100) DEFAULT 'DATA_POS_4G',
    monthly_fee       DECIMAL(15,2) NOT NULL DEFAULT 50000.00,
    expiry_date       DATE,
    current_device_id UUID        REFERENCES devices(id),
    notes             TEXT,
    version           BIGINT      NOT NULL DEFAULT 0,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. SAM Cards Table
CREATE TABLE sam_cards (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sam_serial        VARCHAR(50) NOT NULL UNIQUE,
    sam_type          VARCHAR(50) NOT NULL DEFAULT 'HSM_SECURITY_SAM',
    status            VARCHAR(30) NOT NULL DEFAULT 'INSTOCK', -- INSTOCK, ASSIGNED, DISPOSED
    current_device_id UUID        REFERENCES devices(id),
    notes             TEXT,
    version           BIGINT      NOT NULL DEFAULT 0,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. SIM Ledger (Append-Only Audit History)
CREATE TABLE sim_ledger (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sim_card_id  UUID        NOT NULL REFERENCES sim_cards(id),
    action_type  VARCHAR(50) NOT NULL, -- IMPORT, ASSIGN, UNASSIGN, SUSPEND, RENEW, DISPOSE
    device_id    UUID        REFERENCES devices(id),
    performed_by UUID        REFERENCES users(id),
    notes        TEXT,
    occurred_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sim_cards_serial ON sim_cards(sim_serial);
CREATE INDEX idx_sim_cards_status ON sim_cards(status);
CREATE INDEX idx_sim_cards_telco ON sim_cards(telco);
CREATE INDEX idx_sam_cards_serial ON sam_cards(sam_serial);
CREATE INDEX idx_sam_cards_status ON sam_cards(status);
CREATE INDEX idx_sim_ledger_sim ON sim_ledger(sim_card_id);
