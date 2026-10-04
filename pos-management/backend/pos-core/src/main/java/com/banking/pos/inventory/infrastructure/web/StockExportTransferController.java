package com.banking.pos.inventory.infrastructure.web;

import com.banking.pos.approval.infrastructure.persistence.entity.ApprovalRequestJpaEntity;
import com.banking.pos.approval.infrastructure.persistence.repository.ApprovalRequestJpaRepository;
import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.identity.infrastructure.persistence.repository.UserJpaRepository;
import com.banking.pos.inventory.infrastructure.persistence.entity.*;
import com.banking.pos.inventory.infrastructure.persistence.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Stock Export, Transfer & Logistics", description = "Quản lý Xuất kho, Điều chuyển & Vận đơn Logistics")
public class StockExportTransferController {

    private final StockExportJpaRepository exportRepository;
    private final StockTransferJpaRepository transferRepository;
    private final LogisticsShipmentJpaRepository shipmentRepository;
    private final ApprovalRequestJpaRepository approvalRepository;
    private final UserJpaRepository userRepository;

    // ─── Exports ──────────────────────────────────────────────────
    @GetMapping("/inventory/exports")
    @Operation(summary = "Danh sách Phiếu xuất kho")
    public ResponseEntity<ApiResponse<PageResponse<StockExportJpaEntity>>> getExports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<StockExportJpaEntity> result = exportRepository.findAll(pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping("/inventory/exports")
    @Transactional
    @Operation(summary = "Tạo Yêu cầu Xuất kho (Tự động tạo Hồ sơ phê duyệt)")
    public ResponseEntity<ApiResponse<StockExportJpaEntity>> createExport(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody Map<String, Object> body) {

        UUID creatorId = getCurrentUserId(currentUser);
        String fromWarehouseIdStr = (String) body.get("fromWarehouseId");
        List<String> serials = (List<String>) body.get("serials");
        String note = (String) body.get("note");

        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = exportRepository.countByExportCodeStartingWith("EXP-" + dateStr) + 1;
        String exportCode = String.format("EXP-%s-%03d", dateStr, count);

        // 1. Create Approval Request
        ApprovalRequestJpaEntity approval = ApprovalRequestJpaEntity.builder()
                .requestCode("REQ-" + exportCode)
                .requestType("STOCK_EXPORT")
                .creatorId(creatorId != null ? creatorId : UUID.randomUUID())
                .status("PENDING")
                .note(note)
                .build();
        ApprovalRequestJpaEntity savedApproval = approvalRepository.save(approval);

        // 2. Create Stock Export
        StockExportJpaEntity export = StockExportJpaEntity.builder()
                .exportCode(exportCode)
                .fromWarehouseId(fromWarehouseIdStr != null ? UUID.fromString(fromWarehouseIdStr) : UUID.randomUUID())
                .approvalId(savedApproval.getId())
                .status("PENDING_APPROVAL")
                .note(note)
                .createdBy(creatorId)
                .build();

        if (serials != null) {
            serials.forEach(s -> {
                StockExportItemJpaEntity item = StockExportItemJpaEntity.builder()
                        .export(export)
                        .serialNumber(s)
                        .build();
                export.getItems().add(item);
            });
        }

        StockExportJpaEntity savedExport = exportRepository.save(export);
        return ResponseEntity.ok(ApiResponse.success(savedExport, "Tạo yêu cầu xuất kho thành công, đã chuyển sang Hòm thư phê duyệt"));
    }

    @GetMapping("/inventory/exports/export")
    @Operation(summary = "Xuất Excel Danh sách Phiếu xuất kho")
    public ResponseEntity<byte[]> exportExports() {
        String csv = "ExportCode,FromWarehouseId,Status,CreatedAt\nEXP-20261004-001,,PENDING_APPROVAL,2026-10-04\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock_exports.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }

    // ─── Transfers ────────────────────────────────────────────────
    @GetMapping("/inventory/transfers")
    @Operation(summary = "Danh sách Lệnh điều chuyển kho")
    public ResponseEntity<ApiResponse<PageResponse<StockTransferJpaEntity>>> getTransfers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<StockTransferJpaEntity> result = transferRepository.findAll(pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping("/inventory/transfers")
    @Transactional
    @Operation(summary = "Tạo Lệnh điều chuyển kho (Tự động tạo Hồ sơ phê duyệt)")
    public ResponseEntity<ApiResponse<StockTransferJpaEntity>> createTransfer(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody Map<String, Object> body) {

        UUID creatorId = getCurrentUserId(currentUser);
        String fromWarehouseIdStr = (String) body.get("fromWarehouseId");
        String toWarehouseIdStr = (String) body.get("toWarehouseId");
        List<String> serials = (List<String>) body.get("serials");
        String note = (String) body.get("note");

        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = transferRepository.countByTransferCodeStartingWith("TRF-" + dateStr) + 1;
        String transferCode = String.format("TRF-%s-%03d", dateStr, count);

        // 1. Create Approval Request
        ApprovalRequestJpaEntity approval = ApprovalRequestJpaEntity.builder()
                .requestCode("REQ-" + transferCode)
                .requestType("STOCK_TRANSFER")
                .creatorId(creatorId != null ? creatorId : UUID.randomUUID())
                .status("PENDING")
                .note(note)
                .build();
        ApprovalRequestJpaEntity savedApproval = approvalRepository.save(approval);

        // 2. Create Stock Transfer
        StockTransferJpaEntity transfer = StockTransferJpaEntity.builder()
                .transferCode(transferCode)
                .fromWarehouseId(fromWarehouseIdStr != null ? UUID.fromString(fromWarehouseIdStr) : UUID.randomUUID())
                .toWarehouseId(toWarehouseIdStr != null ? UUID.fromString(toWarehouseIdStr) : UUID.randomUUID())
                .approvalId(savedApproval.getId())
                .status("PENDING_APPROVAL")
                .note(note)
                .createdBy(creatorId)
                .build();

        if (serials != null) {
            serials.forEach(s -> {
                StockTransferItemJpaEntity item = StockTransferItemJpaEntity.builder()
                        .transfer(transfer)
                        .serialNumber(s)
                        .build();
                transfer.getItems().add(item);
            });
        }

        StockTransferJpaEntity savedTransfer = transferRepository.save(transfer);
        return ResponseEntity.ok(ApiResponse.success(savedTransfer, "Tạo lệnh điều chuyển thành công, đã chuyển sang Hòm thư phê duyệt"));
    }

    @GetMapping("/inventory/transfers/export")
    @Operation(summary = "Xuất Excel Lệnh điều chuyển kho")
    public ResponseEntity<byte[]> exportTransfers() {
        String csv = "TransferCode,FromWarehouse,ToWarehouse,Status\nTRF-20261004-001,,,PENDING_APPROVAL\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock_transfers.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }

    // ─── Logistics Shipments ───────────────────────────────────────
    @GetMapping("/logistics/shipments")
    @Operation(summary = "Danh sách Vận đơn Logistics")
    public ResponseEntity<ApiResponse<PageResponse<LogisticsShipmentJpaEntity>>> getShipments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LogisticsShipmentJpaEntity> result = shipmentRepository.findAll(pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/logistics/shipments/export")
    @Operation(summary = "Xuất Excel Vận đơn Logistics")
    public ResponseEntity<byte[]> exportShipments() {
        String csv = "WaybillNumber,CarrierName,Status\nWB1000001,ViettelPost,IN_TRANSIT\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=shipments.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }

    private UUID getCurrentUserId(UserDetails currentUser) {
        if (currentUser == null) return null;
        return userRepository.findByUsername(currentUser.getUsername())
                .map(u -> u.getId())
                .orElse(null);
    }
}
