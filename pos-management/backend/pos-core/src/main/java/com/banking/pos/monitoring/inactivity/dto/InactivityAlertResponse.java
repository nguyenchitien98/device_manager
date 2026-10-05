package com.banking.pos.monitoring.inactivity.dto;

import java.time.Instant;
import java.util.UUID;

public record InactivityAlertResponse(
    UUID id,
    UUID terminalId,
    UUID merchantId,
    UUID deviceId,
    Integer daysInactive,
    Instant lastTxAt,
    String status,
    Instant resolvedAt,
    UUID resolvedBy,
    String notes,
    Instant createdAt
) {}
