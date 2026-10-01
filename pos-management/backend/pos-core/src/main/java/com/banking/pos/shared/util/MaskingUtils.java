package com.banking.pos.shared.util;

/**
 * Utility class để che giấu thông tin nhạy cảm trong logs và audit trail.
 *
 * <p>Tại sao cần class này? Serial Number và TID là định danh duy nhất của thiết bị
 * — nếu log raw, khi log file bị lộ sẽ tiết lộ toàn bộ inventory. Masking đảm bảo
 * logs đủ để debug nhưng không đủ để exploit.
 *
 * <p>Quy tắc masking:
 * <ul>
 *   <li>Serial Number: Giữ 4 ký tự đầu + "****" + 4 ký tự cuối</li>
 *   <li>TID: Giữ 2 ký tự đầu + "****" + 2 ký tự cuối</li>
 *   <li>Chuỗi ngắn hơn 4 ký tự: mask toàn bộ bằng "****"</li>
 * </ul>
 *
 * <p>Ví dụ:
 * <pre>
 *   MaskingUtils.maskSerial("SN-POS-000001") → "SN-P****0001"
 *   MaskingUtils.maskTid("T100001") → "T1****01"
 * </pre>
 *
 * @author POS Management Team
 * @since 1.0.0
 */
public final class MaskingUtils {

    private MaskingUtils() {
        // Utility class — không cho phép khởi tạo
    }

    /**
     * Mask Serial Number thiết bị để an toàn khi log.
     * Giữ 4 ký tự đầu và 4 ký tự cuối, che giữa bằng "****".
     *
     * @param serialNumber Serial Number cần mask
     * @return Chuỗi đã được mask, hoặc "****" nếu null/ngắn
     */
    public static String maskSerial(String serialNumber) {
        return mask(serialNumber, 4, 4);
    }

    /**
     * Mask Terminal ID (TID) để an toàn khi log.
     * Giữ 2 ký tự đầu và 2 ký tự cuối, che giữa bằng "****".
     *
     * @param tid Terminal ID cần mask
     * @return TID đã được mask
     */
    public static String maskTid(String tid) {
        return mask(tid, 2, 2);
    }

    /**
     * Mask email address — giữ ký tự đầu và domain.
     * Ví dụ: "admin@pos.vn" → "a****@pos.vn"
     *
     * @param email Email cần mask
     * @return Email đã được mask
     */
    public static String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "****";
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "****" + (atIndex >= 0 ? email.substring(atIndex) : "");
        }
        return email.charAt(0) + "****" + email.substring(atIndex);
    }

    /**
     * Generic mask — giữ {@code prefixLen} ký tự đầu và {@code suffixLen} ký tự cuối.
     *
     * @param value     Chuỗi cần mask
     * @param prefixLen Số ký tự đầu giữ nguyên
     * @param suffixLen Số ký tự cuối giữ nguyên
     * @return Chuỗi đã mask
     */
    public static String mask(String value, int prefixLen, int suffixLen) {
        if (value == null || value.isBlank()) {
            return "****";
        }
        int totalVisible = prefixLen + suffixLen;
        if (value.length() <= totalVisible) {
            return "****";
        }
        return value.substring(0, prefixLen) + "****" + value.substring(value.length() - suffixLen);
    }
}
