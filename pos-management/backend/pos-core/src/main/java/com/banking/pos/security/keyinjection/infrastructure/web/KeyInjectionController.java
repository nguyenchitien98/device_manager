package com.banking.pos.security.keyinjection.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.security.keyinjection.application.service.KeyInjectionService;
import com.banking.pos.security.keyinjection.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/security/key-injections")
@RequiredArgsConstructor
public class KeyInjectionController {

    private final KeyInjectionService service;

    @GetMapping
    public ApiResponse<PageResponse<KeyInjectionOrderResponse>> listOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(service.searchOrders(status, page, size));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<KeyInjectionOrderResponse> createOrder(@Valid @RequestBody CreateKeyInjectionOrderRequest request) {
        return ApiResponse.success(service.createOrder(request), "Tạo lệnh nạp khóa HSM thành công");
    }

    @PostMapping("/{id}/execute")
    public ApiResponse<KeyInjectionOrderResponse> execute(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID userId) {
        return ApiResponse.success(service.executeInjection(id, userId), "Thực thi nạp khóa bảo mật TMK thành công");
    }
}
