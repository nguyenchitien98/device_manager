package com.banking.pos.telecom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateSimCardRequest(
    @NotBlank(message = "Số seri SIM không được để trống")
    String simSerial,

    @NotBlank(message = "Số điện thoại không được để trống")
    String phoneNumber,

    @NotBlank(message = "Nhà mạng không được để trống")
    String telco,

    String packageName,

    @NotNull(message = "Cước hàng tháng không được để trống")
    BigDecimal monthlyFee,

    LocalDate expiryDate,

    String notes
) {}
