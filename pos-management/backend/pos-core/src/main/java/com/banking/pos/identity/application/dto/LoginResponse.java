package com.banking.pos.identity.application.dto;

/**
 * DTO response sau khi đăng nhập/refresh token thành công.
 * Chứa access token, refresh token, và thông tin user.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
public record LoginResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserInfoDto user
) {
    /** Factory method tiện lợi. */
    public static LoginResponse of(String accessToken, String refreshToken,
                                    long expiresIn, UserInfoDto user) {
        return new LoginResponse(accessToken, refreshToken, "Bearer", expiresIn, user);
    }
}
