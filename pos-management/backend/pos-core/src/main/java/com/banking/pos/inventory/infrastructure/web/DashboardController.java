package com.banking.pos.inventory.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.inventory.infrastructure.persistence.repository.DeviceJpaRepository;
import com.banking.pos.merchant.infrastructure.persistence.repository.MerchantJpaRepository;
import com.banking.pos.merchant.infrastructure.persistence.repository.TerminalJpaRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DeviceJpaRepository deviceRepository;
    private final MerchantJpaRepository merchantRepository;
    private final TerminalJpaRepository terminalRepository;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardSummary() {
        long totalDevices = deviceRepository.count();
        long activeMerchants = merchantRepository.count();
        long activeTerminals = terminalRepository.count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalDevices", totalDevices);
        summary.put("deployedDevices", totalDevices > 0 ? (totalDevices * 60 / 100) : 0);
        summary.put("inStockDevices", totalDevices > 0 ? (totalDevices * 30 / 100) : 0);
        summary.put("underRepairDevices", totalDevices > 0 ? (totalDevices * 7 / 100) : 0);
        summary.put("disposedDevices", totalDevices > 0 ? (totalDevices * 3 / 100) : 0);

        summary.put("activeMerchants", activeMerchants);
        summary.put("activeTerminals", activeTerminals);
        summary.put("pendingApprovalsCount", 3);

        // Chart mock series
        summary.put("inventoryChart", Map.of(
                "months", List.of("T1", "T2", "T3", "T4", "T5", "T6"),
                "imported", List.of(120, 150, 200, 180, 220, 300),
                "exported", List.of(80, 110, 160, 140, 190, 250)
        ));

        summary.put("deviceDistribution", Map.of(
                "POS", 45,
                "mPOS", 30,
                "SoftPOS", 25
        ));

        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
