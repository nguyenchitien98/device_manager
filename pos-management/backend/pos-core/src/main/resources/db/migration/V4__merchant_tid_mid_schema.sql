-- ================================================================
-- Flyway V4: Merchant, MID & TID Schema (Mô hình chuẩn banking)
-- ================================================================
-- Mô hình quan hệ ĐÚNG trong banking:
--
--   1 Merchant → Nhiều MID (Merchant ID)
--     Một doanh nghiệp có thể có nhiều Merchant ID (theo chi nhánh, loại hình)
--
--   1 MID → Nhiều TID (Terminal ID)
--     Một Merchant ID có thể gắn với nhiều terminal POS
--
--   1 TID → 1 Device (POS terminal vật lý)
--     Một Terminal ID chỉ gắn với 1 thiết bị POS tại một thời điểm
--
-- Sơ đồ:
--   Merchant ABC
--     ├── MID: M000001 (Hội sở HCM)
--     │     ├── TID: T100001 → Device PAX A920
--     │     └── TID: T100002 → Device Ingenico iCT220
--     └── MID: M000002 (Chi nhánh Hà Nội)
--           └── TID: T100003 → Device Verifone VX520
--
-- WAY4 & T24 đều dùng TID/MID để định tuyến giao dịch và đối soát.
-- ================================================================

-- ─── Bảng merchants ─────────────────────────────────────────────
CREATE TABLE merchants (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_code       VARCHAR(50) NOT NULL UNIQUE,   -- Mã merchant nội bộ
    merchant_name       VARCHAR(500) NOT NULL,
    legal_name          VARCHAR(500),                  -- Tên pháp nhân
    tax_code            VARCHAR(20),
    mcc_id              UUID REFERENCES mcc_codes(id),
    business_unit_id    UUID REFERENCES business_units(id),
    -- Thông tin liên hệ
    contact_name        VARCHAR(200),
    contact_phone       VARCHAR(20),
    contact_email       VARCHAR(255),
    address             TEXT,
    province            VARCHAR(100),
    district            VARCHAR(100),
    -- Tích hợp ngoài
    way4_merchant_id    VARCHAR(100),  -- ID merchant trong WAY4
    t24_customer_id     VARCHAR(100),  -- ID khách hàng trong T24 Core Banking
    -- Chính sách phí
    fee_policy_id       UUID REFERENCES fee_policies(id),
    -- Hiệu lực
    effective_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to        DATE,
    status              merchant_status NOT NULL DEFAULT 'PENDING',
    version             BIGINT          NOT NULL DEFAULT 0,
    metadata            JSONB,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id)
);

COMMENT ON TABLE merchants IS 'Doanh nghiệp/đơn vị chấp nhận thanh toán. 1 Merchant có thể có nhiều MID';

CREATE INDEX idx_merchants_code       ON merchants(merchant_code);
CREATE INDEX idx_merchants_status     ON merchants(status);
CREATE INDEX idx_merchants_bu         ON merchants(business_unit_id);
CREATE INDEX idx_merchants_mcc        ON merchants(mcc_id);
CREATE INDEX idx_merchants_way4       ON merchants(way4_merchant_id);
CREATE INDEX idx_merchants_t24        ON merchants(t24_customer_id);
CREATE INDEX idx_merchants_metadata   ON merchants USING GIN (metadata);

CREATE TRIGGER trg_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Bảng merchant_ids (MID) ─────────────────────────────────────
-- MID = Merchant Identification — định danh tài khoản merchant tại ngân hàng
-- 1 Merchant → Nhiều MID (ví dụ: theo chi nhánh, loại giao dịch)
-- MID xuất hiện trên slip thanh toán, dùng để đối soát với WAY4/T24
CREATE TABLE merchant_ids (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    mid             VARCHAR(20) NOT NULL UNIQUE,    -- Merchant ID (thường 15 ký tự)
    merchant_id     UUID        NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    label           VARCHAR(200),                   -- Nhãn mô tả (ví dụ: "Chi nhánh Hà Nội Q1")
    -- Tích hợp ngoài
    way4_mid        VARCHAR(50),   -- MID trong hệ thống WAY4 Card Management
    t24_account_id  VARCHAR(50),   -- Settlement account trong T24 Core Banking
    -- Hiệu lực
    effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to    DATE,
    is_primary      BOOLEAN     NOT NULL DEFAULT FALSE,  -- MID chính của Merchant
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CONSTRAINT chk_mid_status CHECK (
                            status IN ('ACTIVE','SUSPENDED','DECOMMISSIONED')
                        ),
    version         BIGINT      NOT NULL DEFAULT 0,
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

COMMENT ON TABLE merchant_ids IS
    '1 Merchant có thể có nhiều MID. is_primary=TRUE là MID chính dùng để routing mặc định trong WAY4';
COMMENT ON COLUMN merchant_ids.mid IS
    'Merchant ID — xuất hiện trên hóa đơn thanh toán và dùng để đối soát giao dịch';
COMMENT ON COLUMN merchant_ids.way4_mid IS
    'Mapping sang WAY4 Merchant Contract ID để routing giao dịch';
COMMENT ON COLUMN merchant_ids.t24_account_id IS
    'Tài khoản thanh toán/quyết toán trong Temenos T24 Core Banking';

CREATE INDEX idx_mids_mid         ON merchant_ids(mid);
CREATE INDEX idx_mids_merchant    ON merchant_ids(merchant_id);
CREATE INDEX idx_mids_status      ON merchant_ids(status);
CREATE INDEX idx_mids_way4        ON merchant_ids(way4_mid);
CREATE INDEX idx_mids_primary     ON merchant_ids(merchant_id, is_primary);
CREATE INDEX idx_mids_metadata    ON merchant_ids USING GIN (metadata);

CREATE TRIGGER trg_merchant_ids_updated_at
    BEFORE UPDATE ON merchant_ids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Bảng terminal_ids (TID) ─────────────────────────────────────
-- TID = Terminal Identification — định danh điểm chấp nhận thanh toán
-- 1 MID → Nhiều TID (một merchant account có thể có nhiều terminal)
-- 1 TID → 1 Device (mối quan hệ 1-1 với thiết bị POS vật lý)
-- TID được WAY4 dùng để routing giao dịch đến đúng MID
CREATE TABLE terminal_ids (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tid             VARCHAR(20) NOT NULL UNIQUE,    -- Terminal ID (thường 8 ký tự số)
    mid_id          UUID        NOT NULL REFERENCES merchant_ids(id),  -- TID thuộc MID nào
    -- TID gắn với device (FK sẽ enable sau khi tạo bảng devices ở V5)
    device_id       UUID,                           -- FK to devices (V5)
    -- Tích hợp
    way4_tid        VARCHAR(50),   -- TID trong hệ thống WAY4 Card Management
    t24_channel_id  VARCHAR(50),   -- Channel ID trong T24 (nếu có)
    -- Thông tin lắp đặt
    installation_address TEXT,
    -- Trạng thái
    status          VARCHAR(20) NOT NULL DEFAULT 'UNASSIGNED'
                        CONSTRAINT chk_tid_status CHECK (
                            status IN ('UNASSIGNED','ASSIGNED','SUSPENDED','DECOMMISSIONED')
                        ),
    -- Hiệu lực
    assigned_from   TIMESTAMP WITH TIME ZONE,
    assigned_to     TIMESTAMP WITH TIME ZONE,
    version         BIGINT      NOT NULL DEFAULT 0,
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

COMMENT ON TABLE terminal_ids IS
    '1 MID có thể có nhiều TID. 1 TID chỉ gắn với 1 Device vật lý (POS terminal)';
COMMENT ON COLUMN terminal_ids.tid IS
    'Terminal ID — 8 ký tự số, dùng để định danh terminal trong giao dịch';
COMMENT ON COLUMN terminal_ids.mid_id IS
    'TID thuộc MID nào — quan hệ N TID : 1 MID';
COMMENT ON COLUMN terminal_ids.device_id IS
    'Thiết bị POS vật lý đang chạy TID này — 1 TID : 1 Device tại một thời điểm';
COMMENT ON COLUMN terminal_ids.way4_tid IS
    'Terminal ID trong hệ thống WAY4 — dùng để routing giao dịch và settlement';

CREATE INDEX idx_tids_tid        ON terminal_ids(tid);
CREATE INDEX idx_tids_mid        ON terminal_ids(mid_id);
CREATE INDEX idx_tids_device     ON terminal_ids(device_id);
CREATE INDEX idx_tids_status     ON terminal_ids(status);
CREATE INDEX idx_tids_way4       ON terminal_ids(way4_tid);
CREATE INDEX idx_tids_metadata   ON terminal_ids USING GIN (metadata);

CREATE TRIGGER trg_terminal_ids_updated_at
    BEFORE UPDATE ON terminal_ids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    RAISE NOTICE 'V4 migration completed: merchants, merchant_ids (MID), terminal_ids (TID)';
    RAISE NOTICE 'Mô hình: 1 Merchant → N MID → N TID → 1 Device';
END $$;
