package com.banking.pos.security.keyinjection.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateKeyInjectionOrderRequest(
    @NotNull(message = "ID thiết bị không được để trống")
    UUID deviceId,

    String hsmProfileId,

    String notes
) {}
