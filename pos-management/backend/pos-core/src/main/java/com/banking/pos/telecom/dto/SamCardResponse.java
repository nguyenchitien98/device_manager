package com.banking.pos.telecom.dto;

import java.time.Instant;
import java.util.UUID;

public record SamCardResponse(
    UUID id,
    String samSerial,
    String samType,
    String status,
    UUID currentDeviceId,
    String notes,
    Instant createdAt,
    Instant updatedAt
) {}
