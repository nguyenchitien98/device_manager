package com.banking.pos.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

/**
 * Wrapper chuẩn cho mọi API response lỗi trong POS Management System.
 *
 * <p>Format lỗi tuân theo RFC 7807 Problem Details (simplified):
 * <pre>
 * {
 *   "success": false,
 *   "code": "POS-1001",             // Đồng bộ với code field của Frontend
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
    private final String code;
    private final String errorCode;
    private final String message;
    private final List<String> details;
    private final String path;
    private final Instant timestamp;

    public static ApiErrorResponse of(String errorCode, String message, String path) {
        return ApiErrorResponse.builder()
                .code(errorCode)
                .errorCode(errorCode)
                .message(message)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }

    public static ApiErrorResponse ofValidation(String errorCode, String message,
                                                 List<String> details, String path) {
        return ApiErrorResponse.builder()
                .code(errorCode)
                .errorCode(errorCode)
                .message(message)
                .details(details)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }
}
