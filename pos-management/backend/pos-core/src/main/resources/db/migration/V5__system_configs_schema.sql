-- ================================================================
-- Flyway V5: System Configs Schema
-- ================================================================

CREATE TABLE IF NOT EXISTS system_configs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key  VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    description VARCHAR(255),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by  VARCHAR(100)
);

INSERT INTO system_configs (config_key, config_value, description) VALUES
('SITE_TITLE', 'POS Management System', 'Tên hệ thống'),
('SESSION_TIMEOUT', '15', 'Thời gian hết hạn phiên làm việc (phút)'),
('MAX_LOGIN_ATTEMPTS', '5', 'Số lần thử đăng nhập tối đa trước khi khóa'),
('ALLOW_REGISTRATION', 'false', 'Cho phép tự đăng ký tài khoản')
ON CONFLICT (config_key) DO NOTHING;
