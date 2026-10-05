package com.banking.pos.telecom.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SimCardResponse(
    UUID id,
    String simSerial,
    String phoneNumber,
    String telco,
    String status,
    String packageName,
    BigDecimal monthlyFee,
    LocalDate expiryDate,
    UUID currentDeviceId,
    String notes,
    Instant createdAt,
    Instant updatedAt
) {}
