package com.banking.pos.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.Instant;

/**
 * Wrapper chuẩn cho mọi API response thành công trong POS Management System.
 *
 * <p>Tại sao cần lớp này? Thay vì mỗi Controller tự quyết định format trả về,
 * toàn bộ hệ thống dùng một format nhất quán giúp Frontend dễ parse
 * và giảm bug do inconsistent response structure.
 *
 * <p>Format chuẩn:
 * <pre>
 * {
 *   "success": true,
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
    private final T data;
    private final String message;
    private final Instant timestamp;

    private ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.timestamp = Instant.now();
    }

    /**
     * Tạo response thành công với payload dữ liệu.
     *
     * @param data Payload dữ liệu cần trả về
     * @param <T>  Kiểu dữ liệu
     * @return ApiResponse thành công
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    /**
     * Tạo response thành công với payload và message mô tả.
     *
     * @param data    Payload dữ liệu
     * @param message Thông báo cho người dùng
     * @param <T>     Kiểu dữ liệu
     * @return ApiResponse thành công có message
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    /**
     * Tạo response thành công không có payload (dùng cho các thao tác void như DELETE, PATCH trạng thái).
     *
     * @param message Thông báo xác nhận cho người dùng
     * @return ApiResponse thành công không có data
     */
    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<>(true, null, message);
    }

    /**
     * Tạo response thành công đơn giản không có message và data.
     * Dùng cho các endpoint void như health check.
     *
     * @return ApiResponse thành công rỗng
     */
    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(true, null, "OK");
    }
}
