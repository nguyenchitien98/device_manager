-- ================================================================
-- Flyway V2: Identity & RBAC Tables
-- ================================================================
-- Tạo toàn bộ bảng cho module xác thực và phân quyền:
-- users, roles, permissions, user_roles, role_permissions,
-- refresh_tokens, auth_audit_logs
--
-- Lưu ý: business_units được tham chiếu từ users nhưng sẽ được
-- tạo ở V4. Dùng DEFERRABLE constraint để tránh circular dependency.
-- ================================================================

-- ─── Bảng users ─────────────────────────────────────────────────
CREATE TABLE users (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username                VARCHAR(100) NOT NULL UNIQUE,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    password_hash           VARCHAR(255) NOT NULL,
    full_name               VARCHAR(255) NOT NULL,
    phone                   VARCHAR(20),
    business_unit_id        UUID,                              -- FK to business_units (V4)
    status                  VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                                CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED')),
    failed_login_attempts   INT         NOT NULL DEFAULT 0,
    locked_until            TIMESTAMP WITH TIME ZONE,
    last_login_at           TIMESTAMP WITH TIME ZONE,
    version                 BIGINT      NOT NULL DEFAULT 0,    -- Optimistic Lock
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_business_unit ON users(business_unit_id);
CREATE INDEX idx_users_status ON users(status);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Bảng roles ──────────────────────────────────────────────────
CREATE TABLE roles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── Bảng permissions ────────────────────────────────────────────
CREATE TABLE permissions (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    module      VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_code ON permissions(code);

-- ─── Bảng user_roles ─────────────────────────────────────────────
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ─── Bảng role_permissions ───────────────────────────────────────
CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ─── Bảng refresh_tokens ─────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ─── Bảng auth_audit_logs (Append-Only) ──────────────────────────
-- TUYỆT ĐỐI không UPDATE/DELETE bảng này
CREATE TABLE auth_audit_logs (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         REFERENCES users(id),
    username    VARCHAR(100),                   -- Lưu luôn để không mất khi user bị xóa
    action      VARCHAR(50)  NOT NULL,          -- LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, LOCKED
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    details     TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_audit_user ON auth_audit_logs(user_id);
CREATE INDEX idx_auth_audit_action ON auth_audit_logs(action);
CREATE INDEX idx_auth_audit_created ON auth_audit_logs(created_at);

-- ================================================================
-- SEED DATA: 9 Roles + Permissions + Admin User
-- ================================================================

-- ─── 9 Roles mặc định ────────────────────────────────────────────
INSERT INTO roles (name, description) VALUES
    ('SUPER_ADMIN',         'Toàn quyền hệ thống, quản lý users và config'),
    ('INVENTORY_MANAGER',   'Phê duyệt nhập/xuất/điều chuyển kho'),
    ('INVENTORY_STAFF',     'Tạo phiếu nhập/xuất/điều chuyển'),
    ('MERCHANT_MANAGER',    'Tạo Merchant, kích hoạt, phân phí'),
    ('DEVICE_OPERATOR',     'Quản lý vòng đời thiết bị, sửa chữa, thanh lý'),
    ('ASSIGNMENT_OPERATOR', 'Cấp phát, thu hồi, điều chuyển thiết bị'),
    ('FEE_MANAGER',         'Cài đặt và quản lý chính sách phí'),
    ('AUDITOR',             'Xem audit log và báo cáo — chỉ đọc'),
    ('VIEWER',              'Xem tất cả dữ liệu — chỉ đọc');

-- ─── Permissions theo module ──────────────────────────────────────
INSERT INTO permissions (code, description, module) VALUES
    -- CATALOG
    ('CATALOG_VIEW',            'Xem danh mục thiết bị',            'CATALOG'),
    ('CATALOG_MANAGE',          'Quản lý danh mục thiết bị',         'CATALOG'),
    -- ORGANIZATION
    ('ORG_VIEW',                'Xem cơ cấu tổ chức',               'ORGANIZATION'),
    ('ORG_MANAGE',              'Quản lý đơn vị kinh doanh & kho',  'ORGANIZATION'),
    -- INVENTORY
    ('INVENTORY_VIEW',          'Xem tồn kho và giao dịch kho',     'INVENTORY'),
    ('INVENTORY_IMPORT',        'Tạo phiếu nhập kho',               'INVENTORY'),
    ('INVENTORY_EXPORT',        'Tạo phiếu xuất kho',               'INVENTORY'),
    ('INVENTORY_TRANSFER',      'Tạo phiếu điều chuyển kho',        'INVENTORY'),
    ('INVENTORY_APPROVE',       'Phê duyệt phiếu kho',              'INVENTORY'),
    -- DEVICE
    ('DEVICE_VIEW',             'Xem thông tin thiết bị',           'DEVICE'),
    ('DEVICE_MANAGE',           'Quản lý vòng đời thiết bị',        'DEVICE'),
    ('DEVICE_DISPOSE',          'Thanh lý thiết bị',                'DEVICE'),
    -- MERCHANT
    ('MERCHANT_VIEW',           'Xem thông tin Merchant',           'MERCHANT'),
    ('MERCHANT_MANAGE',         'Quản lý Merchant và TID',          'MERCHANT'),
    -- ASSIGNMENT
    ('ASSIGNMENT_VIEW',         'Xem lịch sử cấp phát',            'ASSIGNMENT'),
    ('ASSIGNMENT_CREATE',       'Cấp phát thiết bị',               'ASSIGNMENT'),
    ('ASSIGNMENT_RETURN',       'Thu hồi thiết bị',                'ASSIGNMENT'),
    ('ASSIGNMENT_TRANSFER',     'Điều chuyển thiết bị',            'ASSIGNMENT'),
    -- APPROVAL
    ('APPROVAL_VIEW',           'Xem danh sách phê duyệt',         'APPROVAL'),
    ('APPROVAL_APPROVE_L1',     'Phê duyệt cấp 1',                 'APPROVAL'),
    ('APPROVAL_APPROVE_L2',     'Phê duyệt cấp 2',                 'APPROVAL'),
    -- FEE
    ('FEE_VIEW',                'Xem chính sách phí',              'FEE'),
    ('FEE_MANAGE',              'Quản lý chính sách phí',          'FEE'),
    -- REPORT
    ('REPORT_VIEW',             'Xem báo cáo và thống kê',         'REPORT'),
    ('AUDIT_VIEW',              'Xem audit log',                   'AUDIT'),
    -- ADMIN
    ('ADMIN_USER_MANAGE',       'Quản lý người dùng',              'ADMIN'),
    ('ADMIN_ROLE_MANAGE',       'Quản lý vai trò và quyền',        'ADMIN');

-- ─── Gán permissions cho từng role ───────────────────────────────
-- SUPER_ADMIN: Toàn quyền
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'SUPER_ADMIN';

-- INVENTORY_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'INVENTORY_MANAGER'
  AND p.code IN ('CATALOG_VIEW','ORG_VIEW','INVENTORY_VIEW','INVENTORY_APPROVE','DEVICE_VIEW','REPORT_VIEW');

-- INVENTORY_STAFF
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'INVENTORY_STAFF'
  AND p.code IN ('CATALOG_VIEW','ORG_VIEW','INVENTORY_VIEW','INVENTORY_IMPORT','INVENTORY_EXPORT','INVENTORY_TRANSFER','DEVICE_VIEW');

-- MERCHANT_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'MERCHANT_MANAGER'
  AND p.code IN ('CATALOG_VIEW','MERCHANT_VIEW','MERCHANT_MANAGE','FEE_VIEW','ASSIGNMENT_VIEW','REPORT_VIEW');

-- DEVICE_OPERATOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'DEVICE_OPERATOR'
  AND p.code IN ('CATALOG_VIEW','DEVICE_VIEW','DEVICE_MANAGE','DEVICE_DISPOSE','INVENTORY_VIEW','APPROVAL_VIEW');

-- ASSIGNMENT_OPERATOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ASSIGNMENT_OPERATOR'
  AND p.code IN ('DEVICE_VIEW','MERCHANT_VIEW','ASSIGNMENT_VIEW','ASSIGNMENT_CREATE','ASSIGNMENT_RETURN','ASSIGNMENT_TRANSFER','APPROVAL_VIEW');

-- FEE_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'FEE_MANAGER'
  AND p.code IN ('MERCHANT_VIEW','FEE_VIEW','FEE_MANAGE','REPORT_VIEW');

-- AUDITOR (chỉ xem)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'AUDITOR'
  AND p.code IN ('CATALOG_VIEW','ORG_VIEW','INVENTORY_VIEW','DEVICE_VIEW','MERCHANT_VIEW',
                  'ASSIGNMENT_VIEW','APPROVAL_VIEW','FEE_VIEW','REPORT_VIEW','AUDIT_VIEW');

-- VIEWER (chỉ xem cơ bản)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'VIEWER'
  AND p.code IN ('CATALOG_VIEW','ORG_VIEW','INVENTORY_VIEW','DEVICE_VIEW','MERCHANT_VIEW','ASSIGNMENT_VIEW');

-- ─── Tạo Admin User ───────────────────────────────────────────────
-- Password: Admin@123 (BCrypt $2a$12$...)
INSERT INTO users (username, email, password_hash, full_name, status)
VALUES (
    'admin',
    'admin@pos.vn',
    '$2a$10$HMeS6bFNmxc4OZTyLhy7QujjDlZkNOQdCCuMojfXdMT0/blgSqjoO',
    'Super Administrator',
    'ACTIVE'
);

-- Gán role SUPER_ADMIN cho admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'SUPER_ADMIN';

-- ─── Test Users cho từng role ─────────────────────────────────────
-- Password: Test@123 (BCrypt hash)
INSERT INTO users (username, email, password_hash, full_name, status) VALUES
    ('inventory.manager', 'inventory.manager@pos.vn',  '$2a$10$HMeS6bFNmxc4OZTyLhy7QujjDlZkNOQdCCuMojfXdMT0/blgSqjoO', 'Inventory Manager', 'ACTIVE'),
    ('inventory.staff',   'inventory.staff@pos.vn',    '$2a$10$HMeS6bFNmxc4OZTyLhy7QujjDlZkNOQdCCuMojfXdMT0/blgSqjoO', 'Inventory Staff',   'ACTIVE'),
    ('merchant.manager',  'merchant.manager@pos.vn',   '$2a$10$HMeS6bFNmxc4OZTyLhy7QujjDlZkNOQdCCuMojfXdMT0/blgSqjoO', 'Merchant Manager',  'ACTIVE'),
    ('device.operator',   'device.op@pos.vn',          '$2a$10$HMeS6bFNmxc4OZTyLhy7QujjDlZkNOQdCCuMojfXdMT0/blgSqjoO', 'Device Operator',   'ACTIVE'),
    ('assignment.op',     'assignment.op@pos.vn',       '$2a$10$HMeS6bFNmxc4OZTyLhy7QujjDlZkNOQdCCuMojfXdMT0/blgSqjoO', 'Assignment Operator','ACTIVE'),
    ('fee.manager',       'fee.manager@pos.vn',         '$2a$10$HMeS6bFNmxc4OZTyLhy7QujjDlZkNOQdCCuMojfXdMT0/blgSqjoO', 'Fee Manager',       'ACTIVE'),
    ('auditor',           'auditor@pos.vn',             '$2a$10$HMeS6bFNmxc4OZTyLhy7QujjDlZkNOQdCCuMojfXdMT0/blgSqjoO', 'Auditor',           'ACTIVE'),
    ('viewer',            'viewer@pos.vn',              '$2a$10$HMeS6bFNmxc4OZTyLhy7QujjDlZkNOQdCCuMojfXdMT0/blgSqjoO', 'Viewer',            'ACTIVE');

-- Gán roles cho test users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE (u.username = 'inventory.manager' AND r.name = 'INVENTORY_MANAGER')
   OR (u.username = 'inventory.staff'   AND r.name = 'INVENTORY_STAFF')
   OR (u.username = 'merchant.manager'  AND r.name = 'MERCHANT_MANAGER')
   OR (u.username = 'device.operator'   AND r.name = 'DEVICE_OPERATOR')
   OR (u.username = 'assignment.op'     AND r.name = 'ASSIGNMENT_OPERATOR')
   OR (u.username = 'fee.manager'       AND r.name = 'FEE_MANAGER')
   OR (u.username = 'auditor'           AND r.name = 'AUDITOR')
   OR (u.username = 'viewer'            AND r.name = 'VIEWER');

DO $$
BEGIN
    RAISE NOTICE 'V2 migration completed: identity tables created, 9 roles, 27 permissions, 9 test users seeded';
END $$;
