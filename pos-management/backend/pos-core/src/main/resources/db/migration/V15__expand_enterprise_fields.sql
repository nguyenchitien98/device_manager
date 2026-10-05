-- Migration V15: Enterprise Field Expansion for Merchants, Devices, Terminals, and Assignments

-- 1. Merchants Enterprise Fields
ALTER TABLE merchants
    ADD COLUMN IF NOT EXISTS tax_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS legal_rep_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS legal_rep_id_card VARCHAR(20),
    ADD COLUMN IF NOT EXISTS business_license_no VARCHAR(50),
    ADD COLUMN IF NOT EXISTS bank_account_no VARCHAR(30),
    ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS bank_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
    ADD COLUMN IF NOT EXISTS sales_owner_id UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS contract_no VARCHAR(50),
    ADD COLUMN IF NOT EXISTS contract_sign_date DATE;

-- 2. Devices Enterprise Fields
ALTER TABLE devices
    ADD COLUMN IF NOT EXISTS sim_card_no VARCHAR(30),
    ADD COLUMN IF NOT EXISTS sim_phone_no VARCHAR(20),
    ADD COLUMN IF NOT EXISTS telco VARCHAR(20),
    ADD COLUMN IF NOT EXISTS sam_card_serial VARCHAR(50),
    ADD COLUMN IF NOT EXISTS pci_pts_expiry_date DATE,
    ADD COLUMN IF NOT EXISTS key_injected_status VARCHAR(20) NOT NULL DEFAULT 'NOT_INJECTED',
    ADD COLUMN IF NOT EXISTS key_injected_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS mac_address VARCHAR(50);

-- 3. Terminals Enterprise Fields
ALTER TABLE terminal_ids
    ADD COLUMN IF NOT EXISTS terminal_type VARCHAR(30) NOT NULL DEFAULT 'COUNTER',
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    ADD COLUMN IF NOT EXISTS max_amount_per_tx DECIMAL(15,2) NOT NULL DEFAULT 50000000.00,
    ADD COLUMN IF NOT EXISTS allow_contactless BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS allow_qr BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS settlement_cycle VARCHAR(20) NOT NULL DEFAULT 'T+1',
    ADD COLUMN IF NOT EXISTS last_transaction_at TIMESTAMP WITH TIME ZONE;

-- 4. Assignments Enterprise Fields
ALTER TABLE assignments
    ADD COLUMN IF NOT EXISTS installation_address VARCHAR(500),
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,8),
    ADD COLUMN IF NOT EXISTS technician_user_id UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS handover_doc_no VARCHAR(50),
    ADD COLUMN IF NOT EXISTS handover_doc_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS monthly_rental_fee DECIMAL(15,2) NOT NULL DEFAULT 0.00;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_merchants_tax_code ON merchants(tax_code);
CREATE INDEX IF NOT EXISTS idx_merchants_risk_level ON merchants(risk_level);
CREATE INDEX IF NOT EXISTS idx_devices_key_status ON devices(key_injected_status);
CREATE INDEX IF NOT EXISTS idx_terminals_last_tx ON terminal_ids(last_transaction_at);
