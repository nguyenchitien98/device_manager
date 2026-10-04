package com.banking.pos.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.Instant;

/**
 * Wrapper chuẩn cho mọi API response thành công trong POS Management System.
 *
 * <p>Format chuẩn:
 * <pre>
 * {
 *   "success": true,
 *   "code": "SUCCESS",     // Mã trạng thái cho Frontend dễ kiểm tra
 *   "data": { ... },       // Payload chính, nullable nếu không có dữ liệu
 *   "message": "...",      // Thông báo cho UI, nullable
 *   "timestamp": "..."     // ISO-8601 UTC
 * }
 * </pre>
 *
 * @param <T> Kiểu dữ liệu của payload trả về
 * @author POS Management Team
 * @since 1.0.0
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final String code;
    private final T data;
    private final String message;
    private final Instant timestamp;

    private ApiResponse(boolean success, String code, T data, String message) {
        this.success = success;
        this.code = code != null ? code : (success ? "SUCCESS" : "ERROR");
        this.data = data;
        this.message = message;
        this.timestamp = Instant.now();
    }

    /**
     * Tạo response thành công với payload dữ liệu.
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "SUCCESS", data, null);
    }

    /**
     * Tạo response thành công với payload và message mô tả.
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, "SUCCESS", data, message);
    }

    /**
     * Tạo response thành công không có payload (dùng cho các thao tác void như DELETE, PATCH trạng thái).
     */
    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<>(true, "SUCCESS", null, message);
    }

    /**
     * Tạo response thành công đơn giản không có message và data.
     */
    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(true, "SUCCESS", null, "OK");
    }
}
