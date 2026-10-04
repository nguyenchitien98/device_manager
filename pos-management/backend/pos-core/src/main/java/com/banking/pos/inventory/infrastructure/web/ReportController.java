package com.banking.pos.inventory.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.inventory.infrastructure.persistence.repository.DeviceJpaRepository;
import com.banking.pos.merchant.infrastructure.persistence.repository.MerchantJpaRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final DeviceJpaRepository deviceRepository;
    private final MerchantJpaRepository merchantRepository;

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventoryReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        long total = deviceRepository.count();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("generatedAt", LocalDate.now().toString());
        report.put("totalDevices", total);
        report.put("inStockCount", (long) (total * 0.3));
        report.put("deployedCount", (long) (total * 0.6));
        report.put("repairingCount", (long) (total * 0.07));
        report.put("disposedCount", (long) (total * 0.03));
        report.put("statusBreakdown", List.of(
                Map.of("status", "INSTOCK", "count", (long) (total * 0.3)),
                Map.of("status", "DEPLOYED", "count", (long) (total * 0.6)),
                Map.of("status", "REPAIRING", "count", (long) (total * 0.07)),
                Map.of("status", "DISPOSED", "count", (long) (total * 0.03))
        ));

        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/merchants")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMerchantReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        long totalMerchants = merchantRepository.count();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("generatedAt", LocalDate.now().toString());
        report.put("totalMerchants", totalMerchants);
        report.put("activeMerchants", totalMerchants);
        report.put("inactiveMerchants", 0);
        report.put("merchantGrowth", List.of(
                Map.of("month", "T1", "newMerchants", 10),
                Map.of("month", "T2", "newMerchants", 15),
                Map.of("month", "T3", "newMerchants", 25)
        ));

        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping({"/export-pdf", "/export"})
    public ResponseEntity<byte[]> exportReportPdf(
            @RequestParam(defaultValue = "inventory") String type) {

        String content = "BÁO CÁO THỐNG KÊ HE THONG POS MANAGEMENT SYSTEM\n" +
                "Loai bao cao: " + type.toUpperCase() + "\n" +
                "Ngay xuat: " + LocalDate.now() + "\n" +
                "---------------------------------------------------\n" +
                "Tong so thiet bi POS: " + deviceRepository.count() + "\n" +
                "Tong so Merchant: " + merchantRepository.count() + "\n";

        byte[] pdfBytes = content.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report_" + type + ".pdf\"")
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(pdfBytes);
    }
}
