-- ================================================================
-- Flyway V3: Add version + metadata JSONB, Catalog & Org Schema
-- ================================================================
-- Thay đổi:
-- 1. Thêm version (optimistic lock) + metadata JSONB vào bảng V2
-- 2. Tạo toàn bộ bảng Catalog: categories, device_types,
--    device_models, vendors, mcc_codes, fee_policies
-- 3. Tạo bảng Organization: business_units, warehouses
-- 4. Tạo bảng logistics_tracking (vận chuyển thiết bị)
-- 5. Thêm quy tắc: serial_number áp dụng cho device_model (không phải
--    từng device riêng lẻ — dùng để group devices theo model)
-- ================================================================

-- ─── 1. Thêm version + metadata vào bảng roles ─────────────────
ALTER TABLE roles
    ADD COLUMN IF NOT EXISTS version  BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ─── 2. Thêm version + metadata vào bảng permissions ──────────
ALTER TABLE permissions
    ADD COLUMN IF NOT EXISTS version  BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ─── 3. Thêm metadata vào bảng refresh_tokens ─────────────────
ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ─── 4. Thêm metadata vào auth_audit_logs ─────────────────────
ALTER TABLE auth_audit_logs
    ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ================================================================
-- CATALOG MODULE TABLES
-- ================================================================

-- ─── Bảng device_categories (Loại thiết bị cấp cao nhất) ───────
-- Ví dụ: POS Terminal, EDC Terminal, mPOS, SoftPOS
CREATE TABLE device_categories (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    version     BIGINT      NOT NULL DEFAULT 0,    -- Optimistic lock
    metadata    JSONB,                              -- Thuộc tính mở rộng
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  UUID REFERENCES users(id),
    updated_by  UUID REFERENCES users(id)
);

CREATE INDEX idx_device_categories_code     ON device_categories(code);
CREATE INDEX idx_device_categories_active   ON device_categories(is_active);
CREATE INDEX idx_device_categories_metadata ON device_categories USING GIN (metadata);

CREATE TRIGGER trg_device_categories_updated_at
    BEFORE UPDATE ON device_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Bảng device_types (Phân loại chi tiết hơn) ────────────────
-- Ví dụ: Contactless POS, Chip-and-PIN POS, QR POS
CREATE TABLE device_types (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID        NOT NULL REFERENCES device_categories(id),
    code        VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    version     BIGINT      NOT NULL DEFAULT 0,
    metadata    JSONB,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  UUID REFERENCES users(id),
    updated_by  UUID REFERENCES users(id)
);

CREATE INDEX idx_device_types_category ON device_types(category_id);
CREATE INDEX idx_device_types_code     ON device_types(code);
CREATE INDEX idx_device_types_active   ON device_types(is_active);
CREATE INDEX idx_device_types_metadata ON device_types USING GIN (metadata);

CREATE TRIGGER trg_device_types_updated_at
    BEFORE UPDATE ON device_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Bảng vendors (Nhà cung cấp thiết bị) ──────────────────────
CREATE TABLE vendors (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(200) NOT NULL,
    contact     VARCHAR(500),
    address     TEXT,
    tax_code    VARCHAR(20),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    version     BIGINT      NOT NULL DEFAULT 0,
    metadata    JSONB,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  UUID REFERENCES users(id),
    updated_by  UUID REFERENCES users(id)
);

CREATE INDEX idx_vendors_code     ON vendors(code);
CREATE INDEX idx_vendors_active   ON vendors(is_active);
CREATE INDEX idx_vendors_metadata ON vendors USING GIN (metadata);

CREATE TRIGGER trg_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Bảng device_models (Model thiết bị) ───────────────────────
-- QUAN TRỌNG: Serial number prefix áp dụng theo MODEL (không phải từng device)
-- Không được active/inactive nếu còn device đang tham chiếu model này
CREATE TABLE device_models (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id             UUID        NOT NULL REFERENCES device_types(id),
    vendor_id           UUID        NOT NULL REFERENCES vendors(id),
    model_code          VARCHAR(100) NOT NULL UNIQUE,
    model_name          VARCHAR(200) NOT NULL,
    -- Serial prefix áp dụng cho toàn bộ device thuộc model này
    serial_prefix       VARCHAR(20),
    -- Thông số kỹ thuật
    display_size        VARCHAR(20),   -- Ví dụ: "5.5 inch"
    connectivity        VARCHAR(200),  -- WiFi, 4G, Bluetooth
    battery_capacity    VARCHAR(20),   -- Ví dụ: "3000 mAh"
    os_type             VARCHAR(50),   -- Android, Linux, Proprietary
    os_version          VARCHAR(20),
    -- Tích hợp ngoài (WAY4, T24)
    way4_model_code     VARCHAR(100),  -- Mã model trong hệ thống WAY4
    t24_product_code    VARCHAR(100),  -- Mã sản phẩm trong Temenos T24
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    version             BIGINT      NOT NULL DEFAULT 0,
    metadata            JSONB,         -- Thông số mở rộng chưa cần chuẩn hóa
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id)
);

-- CONSTRAINT: Không cho phép deactivate model nếu có device đang tham chiếu
-- (Business rule được enforce bằng trigger + application logic)
COMMENT ON COLUMN device_models.is_active IS
    'Không được phép đổi thành FALSE nếu còn device nào đang tham chiếu model này (INSTOCK/DEPLOYED/REPAIRING)';
COMMENT ON COLUMN device_models.serial_prefix IS
    'Serial number prefix áp dụng cho TẤT CẢ device thuộc model này — không phải từng device riêng lẻ';
COMMENT ON COLUMN device_models.way4_model_code IS
    'Mã tham chiếu sang hệ thống WAY4 Card Management';
COMMENT ON COLUMN device_models.t24_product_code IS
    'Mã tham chiếu sang hệ thống Temenos T24 Core Banking';

CREATE INDEX idx_device_models_type     ON device_models(type_id);
CREATE INDEX idx_device_models_vendor   ON device_models(vendor_id);
CREATE INDEX idx_device_models_code     ON device_models(model_code);
CREATE INDEX idx_device_models_active   ON device_models(is_active);
CREATE INDEX idx_device_models_way4     ON device_models(way4_model_code);
CREATE INDEX idx_device_models_t24      ON device_models(t24_product_code);
CREATE INDEX idx_device_models_metadata ON device_models USING GIN (metadata);

CREATE TRIGGER trg_device_models_updated_at
    BEFORE UPDATE ON device_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Bảng mcc_codes (Merchant Category Code) ───────────────────
CREATE TABLE mcc_codes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(10) NOT NULL UNIQUE,   -- Mã 4 chữ số, ví dụ: "5411"
    description VARCHAR(500) NOT NULL,
    category    VARCHAR(100),                  -- Nhóm MCC cấp cao
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    version     BIGINT      NOT NULL DEFAULT 0,
    metadata    JSONB,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mcc_codes_code     ON mcc_codes(code);
CREATE INDEX idx_mcc_codes_active   ON mcc_codes(is_active);
CREATE INDEX idx_mcc_codes_category ON mcc_codes(category);

CREATE TRIGGER trg_mcc_codes_updated_at
    BEFORE UPDATE ON mcc_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Bảng fee_policies (Chính sách phí) ────────────────────────
CREATE TABLE fee_policies (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    -- Các loại phí áp dụng
    interchange_rate DECIMAL(5,4),     -- % phí interchange
    service_fee_rate DECIMAL(5,4),     -- % phí dịch vụ
    fixed_fee       DECIMAL(15,2),     -- Phí cố định (VND)
    min_fee         DECIMAL(15,2),     -- Phí tối thiểu
    max_fee         DECIMAL(15,2),     -- Phí tối đa
    currency        VARCHAR(3) NOT NULL DEFAULT 'VND',
    -- Hiệu lực
    effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to    DATE,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    version         BIGINT      NOT NULL DEFAULT 0,
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_fee_policies_code    ON fee_policies(code);
CREATE INDEX idx_fee_policies_active  ON fee_policies(is_active);
CREATE INDEX idx_fee_policies_eff     ON fee_policies(effective_from, effective_to);

CREATE TRIGGER trg_fee_policies_updated_at
    BEFORE UPDATE ON fee_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ORGANIZATION MODULE TABLES
-- ================================================================

-- ─── Bảng business_units (Đơn vị kinh doanh) ───────────────────
CREATE TABLE business_units (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(200) NOT NULL,
    type        VARCHAR(50) NOT NULL DEFAULT 'BRANCH'
                    CONSTRAINT chk_bu_type CHECK (type IN ('HO','REGION','BRANCH','DEPARTMENT')),
    parent_id   UUID REFERENCES business_units(id),  -- Self-reference cho hierarchy
    address     TEXT,
    phone       VARCHAR(20),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    version     BIGINT      NOT NULL DEFAULT 0,
    metadata    JSONB,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  UUID REFERENCES users(id),
    updated_by  UUID REFERENCES users(id)
);

-- Kích hoạt FK từ users.business_unit_id
ALTER TABLE users
    ADD CONSTRAINT fk_users_business_unit
    FOREIGN KEY (business_unit_id) REFERENCES business_units(id) DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX idx_business_units_code     ON business_units(code);
CREATE INDEX idx_business_units_parent   ON business_units(parent_id);
CREATE INDEX idx_business_units_active   ON business_units(is_active);
CREATE INDEX idx_business_units_metadata ON business_units USING GIN (metadata);

CREATE TRIGGER trg_business_units_updated_at
    BEFORE UPDATE ON business_units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Bảng warehouses (Kho thiết bị) ────────────────────────────
CREATE TABLE warehouses (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    business_unit_id UUID       NOT NULL REFERENCES business_units(id),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    address         TEXT,
    warehouse_type  VARCHAR(50) NOT NULL DEFAULT 'MAIN'
                        CONSTRAINT chk_wh_type CHECK (warehouse_type IN ('MAIN','BRANCH','REPAIR','DISPOSAL')),
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    version         BIGINT      NOT NULL DEFAULT 0,
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_warehouses_bu       ON warehouses(business_unit_id);
CREATE INDEX idx_warehouses_code     ON warehouses(code);
CREATE INDEX idx_warehouses_type     ON warehouses(warehouse_type);
CREATE INDEX idx_warehouses_metadata ON warehouses USING GIN (metadata);

CREATE TRIGGER trg_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- LOGISTICS TRACKING TABLE
-- ================================================================
-- Theo dõi vận chuyển thiết bị POS giữa các địa điểm
CREATE TABLE logistics_trackings (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Tham chiếu đến phiếu gốc (linh hoạt — có thể là import/export/transfer)
    reference_type      VARCHAR(50) NOT NULL,  -- IMPORT_ORDER / EXPORT_ORDER / TRANSFER_ORDER / REPAIR
    reference_id        UUID        NOT NULL,
    -- Thông tin vận chuyển
    carrier_name        VARCHAR(200),           -- Tên đơn vị vận chuyển
    tracking_number     VARCHAR(100),           -- Mã vận đơn
    tracking_url        VARCHAR(500),           -- URL theo dõi online
    -- Địa chỉ
    from_address        TEXT,
    to_address          TEXT,
    from_warehouse_id   UUID REFERENCES warehouses(id),
    to_warehouse_id     UUID REFERENCES warehouses(id),
    -- Trạng thái
    status              VARCHAR(50) NOT NULL DEFAULT 'CREATED'
                            CONSTRAINT chk_logistics_status CHECK (
                                status IN ('CREATED','PICKED_UP','IN_TRANSIT','DELIVERED','FAILED','RETURNED_TO_SENDER')
                            ),
    -- Thời gian
    estimated_delivery  TIMESTAMP WITH TIME ZONE,
    actual_delivery     TIMESTAMP WITH TIME ZONE,
    -- Danh sách thiết bị trong lô (JSON array of device serial numbers)
    device_serials      JSONB,
    -- Metadata
    notes               TEXT,
    version             BIGINT      NOT NULL DEFAULT 0,
    metadata            JSONB,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id)
);

CREATE INDEX idx_logistics_reference   ON logistics_trackings(reference_type, reference_id);
CREATE INDEX idx_logistics_tracking_no ON logistics_trackings(tracking_number);
CREATE INDEX idx_logistics_status      ON logistics_trackings(status);
CREATE INDEX idx_logistics_from_wh     ON logistics_trackings(from_warehouse_id);
CREATE INDEX idx_logistics_to_wh       ON logistics_trackings(to_warehouse_id);
CREATE INDEX idx_logistics_metadata    ON logistics_trackings USING GIN (metadata);

CREATE TRIGGER trg_logistics_updated_at
    BEFORE UPDATE ON logistics_trackings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- MCC SEED DATA (Common MCC codes for POS terminals)
-- ================================================================
INSERT INTO mcc_codes (code, description, category) VALUES
    ('5411', 'Grocery Stores, Supermarkets',                'Retail'),
    ('5912', 'Drug Stores and Pharmacies',                  'Retail'),
    ('5732', 'Electronics Sales',                           'Retail'),
    ('5812', 'Eating Places, Restaurants',                  'Food & Beverage'),
    ('5813', 'Drinking Places (Alcoholic Beverages)',        'Food & Beverage'),
    ('5814', 'Fast Food Restaurants',                       'Food & Beverage'),
    ('7011', 'Lodging — Hotels, Motels, Resorts',           'Travel & Entertainment'),
    ('4111', 'Transportation — Subways & City Rails',       'Transportation'),
    ('4121', 'Taxicabs and Limousines',                     'Transportation'),
    ('7922', 'Theatrical Producers/Ticket Agencies',        'Entertainment'),
    ('5999', 'Miscellaneous and Specialty Retail',          'Retail'),
    ('6011', 'Automated Cash Disbursements — Cust.',        'Financial'),
    ('6012', 'Merchandise and Services — Cust.',            'Financial')
ON CONFLICT (code) DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE 'V3 migration completed: version+metadata added, catalog/org/logistics tables created';
END $$;
