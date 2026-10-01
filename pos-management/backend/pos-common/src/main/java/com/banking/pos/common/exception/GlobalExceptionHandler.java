package com.banking.pos.common.exception;

import com.banking.pos.common.response.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * Bộ xử lý exception tập trung cho toàn bộ POS Management REST API.
 *
 * <p>Tại sao cần lớp này? Thay vì để exception lan ra tạo ra 500 error không rõ ràng,
 * lớp này catch tất cả exception đã biết và map sang {@link ApiErrorResponse} chuẩn
 * với HTTP status code phù hợp. Giúp Frontend luôn nhận được format lỗi nhất quán.
 *
 * <p>Thứ tự ưu tiên xử lý:
 * <ol>
 *   <li>{@link PosBusinessException} — Lỗi nghiệp vụ có mã POS-xxxx</li>
 *   <li>{@link MethodArgumentNotValidException} — Bean Validation failed (422)</li>
 *   <li>{@link AccessDeniedException} — Không có quyền (403)</li>
 *   <li>{@link AuthenticationException} — Chưa xác thực (401)</li>
 *   <li>{@link DataIntegrityViolationException} — Vi phạm DB constraint (409)</li>
 *   <li>{@link Exception} — Mọi lỗi không mong đợi khác (500)</li>
 * </ol>
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Xử lý lỗi nghiệp vụ POS — map ErrorCode sang HTTP status.
     */
    @ExceptionHandler(PosBusinessException.class)
    public ResponseEntity<ApiErrorResponse> handlePosBusinessException(
            PosBusinessException ex, HttpServletRequest request) {

        HttpStatus status = mapErrorCodeToStatus(ex.getErrorCode());
        log.warn("[{}] {} — path: {}", ex.getErrorCode().getCode(), ex.getMessage(), request.getRequestURI());

        return ResponseEntity.status(status)
                .body(ApiErrorResponse.of(
                        ex.getErrorCode().getCode(),
                        ex.getMessage(),
                        request.getRequestURI()
                ));
    }

    /**
     * Xử lý lỗi validation từ @Valid / @Validated — trả về danh sách field errors.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<String> fieldErrors = ex.getBindingResult()
                .getAllErrors()
                .stream()
                .map(error -> {
                    if (error instanceof FieldError fe) {
                        return fe.getField() + ": " + fe.getDefaultMessage();
                    }
                    return error.getDefaultMessage();
                })
                .sorted()
                .toList();

        log.warn("[POS-6002] Validation failed — {} errors — path: {}", fieldErrors.size(), request.getRequestURI());

        return ResponseEntity.unprocessableEntity()
                .body(ApiErrorResponse.ofValidation(
                        ErrorCode.VALIDATION_FAILED.getCode(),
                        ErrorCode.VALIDATION_FAILED.getDefaultMessage(),
                        fieldErrors,
                        request.getRequestURI()
                ));
    }

    /**
     * Xử lý lỗi validation từ @Validated ở method parameter (path/query params).
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {

        List<String> violations = ex.getConstraintViolations()
                .stream()
                .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
                .sorted()
                .toList();

        return ResponseEntity.unprocessableEntity()
                .body(ApiErrorResponse.ofValidation(
                        ErrorCode.VALIDATION_FAILED.getCode(),
                        ErrorCode.VALIDATION_FAILED.getDefaultMessage(),
                        violations,
                        request.getRequestURI()
                ));
    }

    /**
     * Xử lý lỗi không có quyền truy cập (403 Forbidden).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {

        log.warn("[POS-1005] Access denied — path: {}", request.getRequestURI());

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiErrorResponse.of(
                        ErrorCode.ACCESS_DENIED.getCode(),
                        ErrorCode.ACCESS_DENIED.getDefaultMessage(),
                        request.getRequestURI()
                ));
    }

    /**
     * Xử lý lỗi chưa xác thực (401 Unauthorized).
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {

        log.warn("[POS-1003] Authentication failed — path: {}", request.getRequestURI());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiErrorResponse.of(
                        ErrorCode.TOKEN_INVALID.getCode(),
                        ErrorCode.TOKEN_INVALID.getDefaultMessage(),
                        request.getRequestURI()
                ));
    }

    /**
     * Xử lý lỗi vi phạm ràng buộc Database (409 Conflict).
     * Ví dụ: INSERT serial_number đã tồn tại.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {

        log.error("[POS-6003] Data integrity violation — path: {} — cause: {}",
                request.getRequestURI(), ex.getMostSpecificCause().getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.of(
                        ErrorCode.DATA_INTEGRITY_VIOLATION.getCode(),
                        ErrorCode.DATA_INTEGRITY_VIOLATION.getDefaultMessage(),
                        request.getRequestURI()
                ));
    }

    /**
     * Xử lý mọi exception không mong đợi khác (500 Internal Server Error).
     * KHÔNG expose stack trace ra ngoài — chỉ log internal.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {

        log.error("[POS-6999] Unexpected error — path: {} — type: {}",
                request.getRequestURI(), ex.getClass().getSimpleName(), ex);

        return ResponseEntity.internalServerError()
                .body(ApiErrorResponse.of(
                        ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                        ErrorCode.INTERNAL_SERVER_ERROR.getDefaultMessage(),
                        request.getRequestURI()
                ));
    }

    /**
     * Map ErrorCode sang HTTP status phù hợp.
     * Tại sao không dùng @ResponseStatus? Vì cùng một ErrorCode có thể
     * cần HTTP status khác nhau tùy ngữ cảnh — đặt logic ở đây để dễ override.
     */
    private HttpStatus mapErrorCodeToStatus(ErrorCode errorCode) {
        return switch (errorCode) {
            case INVALID_CREDENTIALS, REFRESH_TOKEN_INVALID, TOKEN_INVALID -> HttpStatus.UNAUTHORIZED;
            case ACCOUNT_LOCKED, RATE_LIMIT_EXCEEDED -> HttpStatus.TOO_MANY_REQUESTS;
            case ACCESS_DENIED, EXPORT_PERMISSION_DENIED, SELF_APPROVAL_NOT_ALLOWED -> HttpStatus.FORBIDDEN;
            case DEVICE_NOT_FOUND, PURCHASE_ORDER_NOT_FOUND, MERCHANT_NOT_FOUND,
                 TERMINAL_NOT_FOUND, ASSIGNMENT_NOT_FOUND, APPROVAL_REQUEST_NOT_FOUND,
                 RESOURCE_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case SERIAL_ALREADY_EXISTS, TERMINAL_ID_ALREADY_EXISTS,
                 DATA_INTEGRITY_VIOLATION, DEVICE_ALREADY_ASSIGNED,
                 FEE_POLICY_DATE_CONFLICT, ASSIGNMENT_CONFLICT -> HttpStatus.CONFLICT;
            case DUPLICATE_REQUEST -> HttpStatus.OK; // idempotency — trả về 200 OK
            case VALIDATION_FAILED -> HttpStatus.UNPROCESSABLE_ENTITY;
            case EXPORT_NO_DATA -> HttpStatus.NO_CONTENT;
            case EXPORT_IN_PROGRESS -> HttpStatus.ACCEPTED;
            case EXPORT_SIZE_EXCEEDED, EXPORT_FORMAT_UNSUPPORTED -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.BAD_REQUEST;
        };
    }
}
