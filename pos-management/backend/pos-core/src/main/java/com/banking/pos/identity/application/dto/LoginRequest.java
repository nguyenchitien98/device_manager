package com.banking.pos.identity.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO cho request đăng nhập.
 * Dùng record (Java 21) thay vì class — immutable và concise.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
public record LoginRequest(

        @NotBlank(message = "Tên đăng nhập không được để trống")
        @Size(max = 100, message = "Tên đăng nhập không quá 100 ký tự")
        String username,

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, max = 255, message = "Mật khẩu từ 6 đến 255 ký tự")
        String password
) {}
