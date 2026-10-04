package com.banking.pos.identity.application.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.UUID;

public class RoleAdminDto {

    public record CreateRoleRequest(
            @NotBlank(message = "Tên role không được để trống")
            String name,
            String description
    ) {}

    public record UpdateRolePermissionsRequest(
            List<String> permissions
    ) {}

    public record RoleResponse(
            UUID id,
            String name,
            String description,
            boolean isActive,
            List<String> permissions
    ) {}

    public record PermissionResponse(
            UUID id,
            String code,
            String description,
            String module
    ) {}
}
