-- ================================================================
-- Flyway V1: Khởi tạo nền tảng cơ sở dữ liệu
-- ================================================================
-- Mục đích: Bật extension UUID và tạo các utility function dùng
-- chung cho toàn bộ migration về sau. Đây là migration đầu tiên,
-- chỉ setup hạ tầng — không tạo bảng nghiệp vụ.
--
-- Lý do dùng extension uuid-ossp thay vì gen_random_uuid() built-in:
-- uuid-ossp cung cấp uuid_generate_v4() tương thích với PostgreSQL
-- versions cũ hơn và cho phép dùng DEFAULT uuid_generate_v4()
-- trực tiếp trong DDL mà không cần function wrapper.
-- ================================================================

-- Bật extension để sinh UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bật extension pgcrypto để hỗ trợ BCrypt password hashing (dùng trong seed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------
-- Tạo ENUM types dùng chung toàn hệ thống
-- (Các ENUM nghiệp vụ sẽ được tạo trong migration của từng module)
-- ----------------------------------------------------------------

-- Trạng thái thiết bị POS — Device State Machine
CREATE TYPE device_status AS ENUM (
    'INSTOCK',           -- Đang trong kho, chưa cấp phát
    'OUT_OF_WAREHOUSE',  -- Đã xuất kho, chưa deploy
    'DEPLOYED',          -- Đang triển khai tại Merchant
    'RETURNED',          -- Đã thu hồi từ Merchant, chờ kiểm tra
    'REPAIRING',         -- Đang trong quá trình sửa chữa
    'DISPOSED'           -- Đã thanh lý, không còn sử dụng
);

-- Trạng thái Approval Request
CREATE TYPE approval_status AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'PENDING_LEVEL_2',
    'APPROVED',
    'REJECTED',
    'RETURNED_FOR_EDIT',
    'EXECUTING',
    'COMPLETED',
    'CANCELLED'
);

-- Trạng thái Merchant
CREATE TYPE merchant_status AS ENUM (
    'PENDING',
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);

-- Trạng thái Assignment
CREATE TYPE assignment_status AS ENUM (
    'ACTIVE',
    'RETURNED',
    'TRANSFERRED'
);

-- ----------------------------------------------------------------
-- Tạo trigger function tự động cập nhật updated_at
-- (Dùng lại trong toàn bộ bảng có cột updated_at)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ----------------------------------------------------------------
-- Verification: Kiểm tra extensions đã được tạo
-- ----------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RAISE EXCEPTION 'Extension uuid-ossp not installed properly';
    END IF;
    RAISE NOTICE 'V1 migration completed: uuid-ossp, pgcrypto, ENUM types, trigger function ready';
END $$;
