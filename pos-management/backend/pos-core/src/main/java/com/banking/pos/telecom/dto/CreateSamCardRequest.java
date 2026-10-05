package com.banking.pos.telecom.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateSamCardRequest(
    @NotBlank(message = "Số seri SAM không được để trống")
    String samSerial,

    String samType,

    String notes
) {}
