CREATE TABLE IF NOT EXISTS system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);

INSERT INTO system_configs (config_key, config_value, description) VALUES
('SYSTEM_NAME', 'POS Management System', 'Tên hệ thống'),
('ALLOW_DEMO_LOGIN', 'false', 'Cho phép đăng nhập demo'),
('DEFAULT_PAGE_SIZE', '20', 'Kích thước trang mặc định'),
('SESSION_TIMEOUT_MINUTES', '60', 'Thời gian hết hạn phiên làm việc')
ON CONFLICT (config_key) DO NOTHING;
