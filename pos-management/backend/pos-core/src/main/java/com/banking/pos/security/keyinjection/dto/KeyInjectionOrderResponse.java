package com.banking.pos.security.keyinjection.dto;

import java.time.Instant;
import java.util.UUID;

public record KeyInjectionOrderResponse(
    UUID id,
    String orderNumber,
    UUID deviceId,
    String hsmProfileId,
    String status,
    UUID injectedBy,
    UUID approvedBy,
    String hsmResponseCode,
    String notes,
    Instant createdAt,
    Instant updatedAt
) {}
