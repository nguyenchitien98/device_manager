package com.banking.pos.common.exception;

/**
 * Enum tập trung toàn bộ mã lỗi nghiệp vụ của POS Management System.
 *
 * <p>Tại sao dùng Enum thay vì String constant? Enum cho phép IDE tự động complete,
 * tránh typo, và dễ dàng tìm kiếm toàn bộ nơi sử dụng một mã lỗi cụ thể.
 *
 * <p>Quy tắc đặt mã lỗi:
 * <ul>
 *   <li>POS-1xxx: Authentication & Authorization errors</li>
 *   <li>POS-2xxx: Device & Inventory errors</li>
 *   <li>POS-3xxx: Merchant & Terminal errors</li>
 *   <li>POS-4xxx: Assignment errors</li>
 *   <li>POS-5xxx: Approval Workflow errors</li>
 *   <li>POS-6xxx: General Business Rule errors</li>
 *   <li>POS-7xxx: Export & Report errors</li>
 *   <li>POS-8xxx: Catalog & Organization errors</li>
 *   <li>POS-9xxx: External Integration errors (WAY4, T24)</li>
 * </ul>
 *
 * @author POS Management Team
 * @since 1.0.0
 */
public enum ErrorCode {

    // ─── Authentication & Authorization (1xxx) ───────────────────────────
    /** Thông tin đăng nhập không đúng */
    INVALID_CREDENTIALS("POS-1001", "Tên đăng nhập hoặc mật khẩu không đúng"),
    /** Tài khoản bị khóa do nhập sai quá nhiều lần */
    ACCOUNT_LOCKED("POS-1002", "Tài khoản bị tạm khóa. Vui lòng thử lại sau 30 phút"),
    /** Token hết hạn hoặc không hợp lệ */
    TOKEN_INVALID("POS-1003", "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"),
    /** Refresh Token đã bị thu hồi hoặc không tồn tại */
    REFRESH_TOKEN_INVALID("POS-1004", "Refresh token không hợp lệ. Vui lòng đăng nhập lại"),
    /** Không có quyền thực hiện hành động này */
    ACCESS_DENIED("POS-1005", "Bạn không có quyền thực hiện thao tác này"),
    /** Vượt quá giới hạn số lần đăng nhập */
    RATE_LIMIT_EXCEEDED("POS-1006", "Vượt quá số lần thử. Vui lòng thử lại sau"),

    // ─── Device & Inventory (2xxx) ───────────────────────────────────────
    /** Không tìm thấy thiết bị */
    DEVICE_NOT_FOUND("POS-2001", "Không tìm thấy thiết bị với Serial Number đã cung cấp"),
    /** Serial Number đã tồn tại trong hệ thống */
    SERIAL_ALREADY_EXISTS("POS-2002", "Serial Number này đã tồn tại trong hệ thống"),
    /** Trạng thái chuyển đổi không hợp lệ theo State Machine */
    INVALID_DEVICE_STATUS_TRANSITION("POS-2003", "Không thể chuyển trạng thái thiết bị theo quy trình"),
    /** Thiết bị không ở trạng thái phù hợp để thực hiện thao tác */
    DEVICE_NOT_ASSIGNABLE("POS-2004", "Thiết bị không đủ điều kiện để thực hiện thao tác này"),
    /** Không tìm thấy Purchase Order */
    PURCHASE_ORDER_NOT_FOUND("POS-2005", "Không tìm thấy đơn đặt hàng"),
    /** Kho không đủ tồn kho */
    INSUFFICIENT_STOCK("POS-2006", "Số lượng tồn kho không đủ để thực hiện yêu cầu"),
    /** Không tìm thấy Device Model */
    DEVICE_MODEL_NOT_FOUND("POS-2007", "Không tìm thấy Model thiết bị"),
    /** Không thể vô hiệu hóa Device Model khi còn device đang sử dụng */
    DEVICE_MODEL_HAS_ACTIVE_DEVICES("POS-2008",
        "Không thể vô hiệu hóa Model — còn thiết bị đang trong trạng thái hoạt động (INSTOCK/DEPLOYED/REPAIRING)"),
    /** Không tìm thấy Vendor */
    VENDOR_NOT_FOUND("POS-2009", "Không tìm thấy Vendor với ID đã cung cấp"),

    // ─── Merchant & Terminal (3xxx) ──────────────────────────────────────
    /** Không tìm thấy Merchant */
    MERCHANT_NOT_FOUND("POS-3001", "Không tìm thấy Merchant với thông tin đã cung cấp"),
    /** Merchant không ở trạng thái hoạt động */
    MERCHANT_INACTIVE("POS-3002", "Merchant hiện không ở trạng thái hoạt động"),
    /** Terminal ID đã được sử dụng */
    TERMINAL_ID_ALREADY_EXISTS("POS-3003", "Terminal ID này đã tồn tại trong hệ thống"),
    /** Không tìm thấy Terminal */
    TERMINAL_NOT_FOUND("POS-3004", "Không tìm thấy Terminal với ID đã cung cấp"),
    /** Chính sách phí bị trùng lặp effective date */
    FEE_POLICY_DATE_CONFLICT("POS-3005", "Đã tồn tại chính sách phí có hiệu lực trong khoảng thời gian này"),

    // ─── Assignment (4xxx) ───────────────────────────────────────────────
    /** Không tìm thấy Assignment */
    ASSIGNMENT_NOT_FOUND("POS-4001", "Không tìm thấy thông tin cấp phát thiết bị"),
    /** Thiết bị đã được cấp phát cho đối tượng khác */
    DEVICE_ALREADY_ASSIGNED("POS-4002", "Thiết bị này đang được sử dụng bởi một Merchant khác"),
    /** Conflict do concurrent assignment */
    ASSIGNMENT_CONFLICT("POS-4003", "Xung đột dữ liệu — Thiết bị vừa được cấp phát bởi thao tác khác"),
    /** Request trùng lặp — idempotency key đã được xử lý */
    DUPLICATE_REQUEST("POS-4004", "Yêu cầu trùng lặp — thao tác này đã được xử lý trước đó"),

    // ─── Approval Workflow (5xxx) ────────────────────────────────────────
    /** Không tìm thấy Approval Request */
    APPROVAL_REQUEST_NOT_FOUND("POS-5001", "Không tìm thấy yêu cầu phê duyệt"),
    /** Trạng thái Approval không hợp lệ để thực hiện action */
    INVALID_APPROVAL_STATUS("POS-5002", "Không thể thực hiện thao tác ở trạng thái phê duyệt hiện tại"),
    /** Người tạo không được tự phê duyệt yêu cầu của mình */
    SELF_APPROVAL_NOT_ALLOWED("POS-5003", "Người tạo yêu cầu không được phép tự phê duyệt"),

    // ─── General Business Rule (6xxx) ────────────────────────────────────
    /** Resource không tìm thấy (generic) */
    RESOURCE_NOT_FOUND("POS-6001", "Không tìm thấy dữ liệu yêu cầu"),
    /** Dữ liệu đầu vào không hợp lệ */
    VALIDATION_FAILED("POS-6002", "Dữ liệu đầu vào không hợp lệ"),
    /** Vi phạm ràng buộc dữ liệu */
    DATA_INTEGRITY_VIOLATION("POS-6003", "Vi phạm ràng buộc dữ liệu — dữ liệu đã tồn tại hoặc đang được sử dụng"),
    /** Lỗi hệ thống nội bộ không mong đợi */
    INTERNAL_SERVER_ERROR("POS-6999", "Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ hỗ trợ"),

    // ─── Export & Report (7xxx) ──────────────────────────────────────────
    /** Không có dữ liệu để xuất */
    EXPORT_NO_DATA("POS-7001", "Không có dữ liệu phù hợp để xuất"),
    /** File xuất quá lớn */
    EXPORT_SIZE_EXCEEDED("POS-7002", "Số lượng bản ghi vượt quá giới hạn cho phép (tối đa 10.000 bản ghi)"),
    /** Export job đang xử lý */
    EXPORT_IN_PROGRESS("POS-7003", "File đang được tạo. Vui lòng đợi và thử tải lại sau"),
    /** Export bị từ chối do thiếu quyền */
    EXPORT_PERMISSION_DENIED("POS-7004", "Bạn không có quyền xuất dữ liệu này"),
    /** Định dạng export không được hỗ trợ */
    EXPORT_FORMAT_UNSUPPORTED("POS-7005", "Định dạng xuất không được hỗ trợ"),
    /** Export job thất bại */
    EXPORT_JOB_FAILED("POS-7006", "Quá trình xuất dữ liệu thất bại. Vui lòng thử lại"),

    // ─── Catalog & Organization (8xxx) ──────────────────────────────────
    /** Không tìm thấy Device Category */
    CATEGORY_NOT_FOUND("POS-8001", "Không tìm thấy danh mục thiết bị"),
    /** Không tìm thấy Device Type */
    DEVICE_TYPE_NOT_FOUND("POS-8002", "Không tìm thấy loại thiết bị"),
    /** Không tìm thấy Business Unit */
    BUSINESS_UNIT_NOT_FOUND("POS-8003", "Không tìm thấy đơn vị kinh doanh"),
    /** Không tìm thấy Warehouse */
    WAREHOUSE_NOT_FOUND("POS-8004", "Không tìm thấy kho"),
    /** Không tìm thấy MCC Code */
    MCC_NOT_FOUND("POS-8005", "Không tìm thấy MCC Code"),
    /** Không tìm thấy Fee Policy */
    FEE_POLICY_NOT_FOUND("POS-8006", "Không tìm thấy chính sách phí"),
    /** Không tìm thấy Logistics Tracking */
    LOGISTICS_NOT_FOUND("POS-8007", "Không tìm thấy thông tin theo dõi vận chuyển"),
    /** Mã đã tồn tại (generic cho code unique constraint) */
    CODE_ALREADY_EXISTS("POS-8008", "Mã này đã tồn tại trong hệ thống"),

    // ─── External Integration (9xxx) ────────────────────────────────────
    /** Lỗi kết nối với hệ thống WAY4 */
    WAY4_INTEGRATION_ERROR("POS-9001", "Lỗi kết nối với hệ thống WAY4. Vui lòng thử lại sau"),
    /** WAY4 từ chối yêu cầu */
    WAY4_REQUEST_REJECTED("POS-9002", "WAY4 từ chối yêu cầu — kiểm tra cấu hình TID/MID"),
    /** Lỗi kết nối với hệ thống T24 */
    T24_INTEGRATION_ERROR("POS-9003", "Lỗi kết nối với hệ thống T24 Core Banking. Vui lòng thử lại sau"),
    /** T24 không tìm thấy khách hàng */
    T24_CUSTOMER_NOT_FOUND("POS-9004", "Không tìm thấy khách hàng trong hệ thống T24"),
    /** Lỗi đồng bộ phí vào T24 */
    T24_FEE_SETTLEMENT_FAILED("POS-9005", "Ghi phí vào T24 thất bại — yêu cầu xử lý thủ công");

    /** Mã lỗi chuẩn theo format POS-xxxx */
    private final String code;
    /** Thông báo lỗi mặc định bằng tiếng Việt */
    private final String defaultMessage;

    ErrorCode(String code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }

    public String getCode() {
        return code;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
