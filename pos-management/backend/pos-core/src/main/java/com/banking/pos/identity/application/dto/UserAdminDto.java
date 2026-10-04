package com.banking.pos.identity.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class UserAdminDto {

    public record CreateUserRequest(
            @NotBlank(message = "Username không được để trống")
            String username,

            @NotBlank(message = "Email không được để trống")
            @Email(message = "Email không đúng định dạng")
            String email,

            @NotBlank(message = "Họ tên không được để trống")
            String fullName,

            String phone,
            String password,
            UUID businessUnitId,
            List<UUID> roleIds
    ) {}

    public record UpdateUserRequest(
            @Email(message = "Email không đúng định dạng")
            String email,
            String fullName,
            String phone,
            UUID businessUnitId,
            List<UUID> roleIds,
            String status
    ) {}

    public record UserResponse(
            UUID id,
            String username,
            String email,
            String fullName,
            String phone,
            UUID businessUnitId,
            String businessUnitName,
            String status,
            Instant lastLoginAt,
            Instant createdAt,
            List<String> roles
    ) {}

    public record ChangePasswordRequest(
            @NotBlank(message = "Mật khẩu cũ không được để trống")
            String oldPassword,
            @NotBlank(message = "Mật khẩu mới không được để trống")
            String newPassword
    ) {}

    public record UpdateProfileRequest(
            String fullName,
            String email,
            String phone
    ) {}
}
