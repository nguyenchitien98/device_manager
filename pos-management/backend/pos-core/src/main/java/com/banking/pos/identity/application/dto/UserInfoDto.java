package com.banking.pos.identity.application.dto;

import java.util.List;
import java.util.UUID;

/**
 * DTO thông tin user nhúng trong LoginResponse.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
public record UserInfoDto(
        UUID id,
        String username,
        String email,
        String fullName,
        List<String> roles,
        List<String> permissions,
        UUID businessUnitId,
        String businessUnitName
) {}
