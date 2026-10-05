package com.banking.pos.monitoring.inactivity.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.monitoring.inactivity.application.service.POSInactivityService;
import com.banking.pos.monitoring.inactivity.dto.InactivityAlertResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/monitoring/inactivity")
@RequiredArgsConstructor
public class POSInactivityController {

    private final POSInactivityService inactivityService;

    @GetMapping("/alerts")
    public ApiResponse<PageResponse<InactivityAlertResponse>> listAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(inactivityService.searchAlerts(status, page, size));
    }

    @PostMapping("/alerts/{id}/trigger-recall")
    public ApiResponse<InactivityAlertResponse> triggerRecall(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID userId) {
        return ApiResponse.success(inactivityService.triggerRecall(id, userId), "Kích hoạt phiếu thu hồi thiết bị POS thành công");
    }
}
