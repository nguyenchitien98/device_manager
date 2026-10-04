-- ================================================================
-- Flyway V12: Comprehensive Sample Seed Data
-- ================================================================

-- 1. Business Units & Warehouses
INSERT INTO business_units (id, code, name, type, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'BU_HN', 'Đơn vị Kinh doanh Hà Nội', 'BRANCH', true),
    ('22222222-2222-2222-2222-222222222222', 'BU_HCM', 'Đơn vị Kinh doanh Hồ Chí Minh', 'BRANCH', true),
    ('33333333-3333-3333-3333-333333333333', 'BU_DN', 'Đơn vị Kinh doanh Đà Nẵng', 'BRANCH', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO warehouses (id, code, name, address, business_unit_id, is_active)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'WH_HN_CENTRAL', 'Kho Trung Tâm Hà Nội', '17 Phạm Hùng, Cầu Giấy, Hà Nội', '11111111-1111-1111-1111-111111111111', true),
    ('a2222222-2222-2222-2222-222222222222', 'WH_HCM_TANBINH', 'Kho Tân Bình HCM', '120 Cộng Hòa, Tân Bình, TP.HCM', '22222222-2222-2222-2222-222222222222', true),
    ('a3333333-3333-3333-3333-333333333333', 'WH_DN_HAICHAU', 'Kho Hải Châu Đà Nẵng', '45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', '33333333-3333-3333-3333-333333333333', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Catalog: Categories, Types, Vendors, Models, MCC, Fee Policies
INSERT INTO device_categories (id, code, name, description, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'POS', 'POS Terminal', 'Thiết bị chấp nhận thẻ cố định & di động', true),
    ('c2222222-2222-2222-2222-222222222222', 'MPOS', 'mPOS Terminal', 'Thiết bị thanh toán di động nhỏ gọn', true),
    ('c3333333-3333-3333-3333-333333333333', 'SOFTPOS', 'SoftPOS Application', 'Giải pháp chấp nhận thẻ trên điện thoại', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO vendors (id, code, name, contact, is_active)
VALUES
    ('41111111-1111-1111-1111-111111111111', 'PAX', 'PAX Technology Ltd.', 'contact@pax.com', true),
    ('42222222-2222-2222-2222-222222222222', 'INGENICO', 'Ingenico Group', 'sales@ingenico.com', true),
    ('43333333-3333-3333-3333-333333333333', 'VERIFONE', 'Verifone Systems', 'support@verifone.com', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO device_types (id, code, name, category_id, is_active)
VALUES
    ('51111111-1111-1111-1111-111111111111', 'SMART_POS', 'Android Smart POS', 'c1111111-1111-1111-1111-111111111111', true),
    ('52222222-2222-2222-2222-222222222222', 'DESK_POS', 'Desktop POS Traditional', 'c1111111-1111-1111-1111-111111111111', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO device_models (id, type_id, vendor_id, model_code, model_name, serial_prefix, is_active)
VALUES
    ('61111111-1111-1111-1111-111111111111', '51111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111111', 'PAX_A920', 'PAX A920 Smart POS', 'SN-PAX-', true),
    ('62222222-2222-2222-2222-222222222222', '52222222-2222-2222-2222-222222222222', '42222222-2222-2222-2222-222222222222', 'ING_MOVE5000', 'Ingenico Move 5000', 'SN-ING-', true)
ON CONFLICT (model_code) DO NOTHING;

INSERT INTO mcc_codes (id, code, description, category, is_active)
VALUES
    ('b1111111-1111-1111-1111-111111111111', '5411', 'Siêu thị & Cửa hàng tiện lợi', 'Bán lẻ', true),
    ('b2222222-2222-2222-2222-222222222222', '5812', 'Nhà hàng & Dịch vụ ăn uống', 'F&B', true),
    ('b3333333-3333-3333-3333-333333333333', '5912', 'Hiệu thuốc & Dược phẩm', 'Y tế', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO fee_policies (id, code, name, interchange_rate, fixed_fee, effective_from, is_active)
VALUES
    ('f1111111-1111-1111-1111-111111111111', 'FEE_STD', 'Chính sách phí chuẩn (1.2%)', 0.0120, 1000.00, '2026-01-01', true),
    ('f2222222-2222-2222-2222-222222222222', 'FEE_VIP', 'Chính sách phí VIP (0.8%)', 0.0080, 500.00, '2026-01-01', true)
ON CONFLICT (code) DO NOTHING;

-- 3. Merchants, MID & TID
INSERT INTO merchants (id, merchant_code, merchant_name, contact_email, contact_phone, address, mcc_id, business_unit_id, status)
VALUES
    ('d1111111-1111-1111-1111-111111111111', 'M000001', 'Siêu thị WinMart Hà Nội', 'contact@winmart.vn', '02431112222', 'Tháp BIDV, 194 Trần Quang Khải, Hà Nội', (SELECT id FROM mcc_codes WHERE code = '5411' LIMIT 1), '11111111-1111-1111-1111-111111111111', 'ACTIVE'),
    ('d2222222-2222-2222-2222-222222222222', 'M000002', 'Nhà hàng Golden Gate HCM', 'info@ggg.com.vn', '02832223333', 'Vincom Đồng Khởi, Quận 1, TP.HCM', (SELECT id FROM mcc_codes WHERE code = '5812' LIMIT 1), '22222222-2222-2222-2222-222222222222', 'ACTIVE')
ON CONFLICT (merchant_code) DO NOTHING;

INSERT INTO merchant_ids (id, mid, merchant_id, label, is_primary, status)
VALUES
    ('d1111111-2222-1111-1111-111111111111', 'MID990001', 'd1111111-1111-1111-1111-111111111111', 'MID WinMart Hà Nội', true, 'ACTIVE'),
    ('d2222222-2222-2222-2222-222222222222', 'MID990002', 'd2222222-2222-2222-2222-222222222222', 'MID Golden Gate HCM', true, 'ACTIVE')
ON CONFLICT (mid) DO NOTHING;

INSERT INTO terminal_ids (id, tid, mid_id, device_id, status)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'T000001', 'd1111111-2222-1111-1111-111111111111', '93333333-3333-3333-3333-333333333333', 'ASSIGNED'),
    ('e2222222-2222-2222-2222-222222222222', 'T000002', 'd2222222-2222-2222-2222-222222222222', NULL, 'UNASSIGNED')
ON CONFLICT (tid) DO NOTHING;

-- 4. Devices
INSERT INTO devices (id, serial_number, model_id, warehouse_id, status)
VALUES
    ('91111111-1111-1111-1111-111111111111', 'SN-PAX-90001', '61111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'INSTOCK'),
    ('92222222-2222-2222-2222-222222222222', 'SN-PAX-90002', '61111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'INSTOCK'),
    ('93333333-3333-3333-3333-333333333333', 'SN-PAX-90003', '61111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'DEPLOYED'),
    ('94444444-4444-4444-4444-444444444444', 'SN-ING-80001', '62222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'REPAIRING'),
    ('95555555-5555-5555-5555-555555555555', 'SN-ING-80002', '62222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'DISPOSED')
ON CONFLICT (serial_number) DO NOTHING;

-- 5. Notifications
INSERT INTO notifications (id, recipient_id, title, content, type, is_read)
VALUES
    ('81111111-1111-1111-1111-111111111111', (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'Hệ thống khởi chạy thành công', 'Hệ thống POS Management System phiên bản 1.0 đã sẵn sàng vận hành.', 'SUCCESS', false),
    ('82222222-2222-2222-2222-222222222222', (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'Cảnh báo hạn ngạch tồn kho', 'Kho Hà Nội đã chạm ngưỡng tối thiểu 30 thiết bị PAX A920.', 'WARNING', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Audit Logs
INSERT INTO audit_logs (id, action, entity_type, entity_id, username, ip_address)
VALUES
    ('71111111-1111-1111-1111-111111111111', 'LOGIN_SUCCESS', 'User', 'admin', 'admin', '127.0.0.1'),
    ('72222222-2222-2222-2222-222222222222', 'CREATE_MERCHANT', 'Merchant', 'M000001', 'admin', '127.0.0.1')
ON CONFLICT (id) DO NOTHING;
