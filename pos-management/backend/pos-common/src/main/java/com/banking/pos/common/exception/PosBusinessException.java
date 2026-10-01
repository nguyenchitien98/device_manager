package com.banking.pos.common.exception;

import lombok.Getter;

/**
 * Base exception cho toàn bộ nghiệp vụ POS Management System.
 *
 * <p>Tại sao cần custom exception thay vì dùng RuntimeException thẳng?
 * Lớp này mang theo {@link ErrorCode} — cho phép {@code GlobalExceptionHandler}
 * tự động map sang HTTP status code và error response chuẩn mà không cần
 * try-catch phân tán khắp service layer.
 *
 * <p>Cách dùng:
 * <pre>
 *   throw new PosBusinessException(ErrorCode.DEVICE_NOT_FOUND);
 *   throw new PosBusinessException(ErrorCode.VALIDATION_FAILED, "Serial không hợp lệ");
 * </pre>
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@Getter
public class PosBusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    /**
     * Ném exception với mã lỗi, dùng message mặc định từ ErrorCode.
     *
     * @param errorCode Mã lỗi theo chuẩn POS
     */
    public PosBusinessException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
    }

    /**
     * Ném exception với mã lỗi và message tùy chỉnh.
     *
     * @param errorCode Mã lỗi theo chuẩn POS
     * @param message   Thông báo tùy chỉnh thay thế message mặc định
     */
    public PosBusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    /**
     * Ném exception với mã lỗi, message tùy chỉnh, và nguyên nhân gốc.
     *
     * @param errorCode Mã lỗi theo chuẩn POS
     * @param message   Thông báo tùy chỉnh
     * @param cause     Nguyên nhân exception gốc
     */
    public PosBusinessException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}
