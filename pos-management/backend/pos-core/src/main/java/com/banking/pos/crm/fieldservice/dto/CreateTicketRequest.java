package com.banking.pos.crm.fieldservice.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CreateTicketRequest(
    UUID merchantId,
    UUID terminalId,
    UUID deviceId,

    @NotBlank(message = "Loại sự cố không được để trống")
    String issueType,

    String priority,
    String description
) {}
