package com.banking.pos.crm.fieldservice.dto;

import java.time.Instant;
import java.util.UUID;

public record TicketResponse(
    UUID id,
    String ticketNumber,
    UUID merchantId,
    UUID terminalId,
    UUID deviceId,
    String issueType,
    String priority,
    String status,
    String description,
    UUID technicianId,
    String resolutionNotes,
    String handoverDocUrl,
    Instant createdAt,
    Instant updatedAt
) {}
