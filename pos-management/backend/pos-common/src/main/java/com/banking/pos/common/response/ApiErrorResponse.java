package com.banking.pos.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

/**
 * Wrapper chuẩn cho mọi API response lỗi trong POS Management System.
 *
 * <p>Tại sao dùng format này thay vì Spring Default Error? Spring mặc định trả về
 * /error endpoint với format khác nhau tùy version. Format này đảm bảo nhất quán,
 * phù hợp với error code system POS-1001 → POS-7006 được định nghĩa trong API Contract.
 *
 * <p>Format lỗi tuân theo RFC 7807 Problem Details (simplified):
 * <pre>
 * {
 *   "success": false,
 *   "errorCode": "POS-1001",        // Mã lỗi nội bộ
 *   "message": "...",               // Thông báo cho người dùng (tiếng Việt)
 *   "details": ["field: message"],  // Validation errors, có thể null
 *   "path": "/api/v1/...",         // Request URI gây ra lỗi
 *   "timestamp": "..."
 * }
 * </pre>
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private final boolean success = false;
    private final String errorCode;
    private final String message;
    private final List<String> details;
    private final String path;
    private final Instant timestamp;

    /**
     * Tạo error response nhanh từ mã lỗi và message.
     *
     * @param errorCode Mã lỗi chuẩn POS (ví dụ: "POS-1001")
     * @param message   Thông báo lỗi cho người dùng
     * @param path      Request URI gây ra lỗi
     * @return ApiErrorResponse
     */
    public static ApiErrorResponse of(String errorCode, String message, String path) {
        return ApiErrorResponse.builder()
                .errorCode(errorCode)
                .message(message)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Tạo error response kèm danh sách validation errors (cho 422 Unprocessable Entity).
     *
     * @param errorCode Mã lỗi
     * @param message   Thông báo tổng quát
     * @param details   Danh sách lỗi validation cụ thể từng field
     * @param path      Request URI
     * @return ApiErrorResponse với validation details
     */
    public static ApiErrorResponse ofValidation(String errorCode, String message,
                                                 List<String> details, String path) {
        return ApiErrorResponse.builder()
                .errorCode(errorCode)
                .message(message)
                .details(details)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }
}
