-- V20__create_rental_fee_tables.sql
-- Tariff & Rental Fee Engine Tables

CREATE TABLE IF NOT EXISTS rental_fee_policies (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    min_monthly_volume NUMERIC(18,2) NOT NULL DEFAULT 0,
    monthly_rental_fee NUMERIC(18,2) NOT NULL DEFAULT 0,
    penalty_fee NUMERIC(18,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monthly_fee_charges (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    period VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    merchant_id BIGINT NOT NULL,
    terminal_id BIGINT,
    actual_volume NUMERIC(18,2) DEFAULT 0,
    fee_amount NUMERIC(18,2) DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, CHARGED, FAILED, WAIVED
    t24_reference_no VARCHAR(100),
    charged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_monthly_fee_charges_period ON monthly_fee_charges(period);
CREATE INDEX IF NOT EXISTS idx_monthly_fee_charges_merchant ON monthly_fee_charges(merchant_id);
CREATE INDEX IF NOT EXISTS idx_monthly_fee_charges_status ON monthly_fee_charges(status);

-- Seed initial default policies
INSERT INTO rental_fee_policies (code, name, min_monthly_volume, monthly_rental_fee, penalty_fee, is_active)
VALUES 
('POL_STANDARD', 'Gói Tiêu chuẩn POS 4G', 50000000.00, 300000.00, 150000.00, true),
('POL_VIP', 'Gói Đang phát triển - Chuỗi Siêu thị', 200000000.00, 500000.00, 250000.00, true),
('POL_ZERO_FEE', 'Gói Đơn vị Sự nghiệp Công / Thu phí công', 0.00, 0.00, 0.00, true);

-- Seed initial monthly charge data
INSERT INTO monthly_fee_charges (period, merchant_id, terminal_id, actual_volume, fee_amount, status, t24_reference_no, charged_at)
VALUES 
('2026-09', 1, 101, 35000000.00, 300000.00, 'CHARGED', 'T24-FT2609010029', NOW() - INTERVAL '5 days'),
('2026-09', 2, 102, 120000000.00, 0.00, 'WAIVED', NULL, NULL),
('2026-10', 1, 101, 15000000.00, 300000.00, 'PENDING', NULL, NULL);
