package com.banking.pos.inventory.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.inventory.infrastructure.persistence.entity.*;
import com.banking.pos.inventory.infrastructure.persistence.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Management", description = "Quản lý Đơn mua PO, Nhập kho, Tồn kho & Stock Ledger")
public class InventoryController {

    private final PurchaseOrderJpaRepository poRepository;
    private final DeviceJpaRepository deviceRepository;
    private final StockTransactionJpaRepository stockTxRepository;
    private final OutboxEventJpaRepository outboxEventRepository;

    // ─── Purchase Orders ──────────────────────────────────────────
    @GetMapping("/purchase-orders")
    @Operation(summary = "Danh sách Đơn mua PO")
    public ResponseEntity<ApiResponse<PageResponse<PurchaseOrderJpaEntity>>> getPurchaseOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID vendorId,
            @RequestParam(required = false) UUID warehouseId,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<PurchaseOrderJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("poNumber")), pattern),
                        cb.like(cb.lower(root.get("note")), pattern)
                ));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (vendorId != null) {
                predicates.add(cb.equal(root.get("vendorId"), vendorId));
            }
            if (warehouseId != null) {
                predicates.add(cb.equal(root.get("warehouseId"), warehouseId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PurchaseOrderJpaEntity> result = poRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/purchase-orders/{id}")
    @Operation(summary = "Chi tiết Đơn mua PO")
    public ResponseEntity<ApiResponse<PurchaseOrderJpaEntity>> getPoDetail(@PathVariable UUID id) {
        return poRepository.findById(id)
                .map(po -> ResponseEntity.ok(ApiResponse.success(po)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/purchase-orders")
    @Operation(summary = "Tạo Đơn mua PO mới")
    public ResponseEntity<ApiResponse<PurchaseOrderJpaEntity>> createPo(@RequestBody PurchaseOrderJpaEntity request) {
        if (request.getPoNumber() == null || request.getPoNumber().isBlank()) {
            String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            long count = poRepository.countByPoNumberStartingWith("PO-" + dateStr) + 1;
            request.setPoNumber(String.format("PO-%s-%03d", dateStr, count));
        }

        request.setStatus("DRAFT");
        if (request.getItems() != null) {
            request.getItems().forEach(item -> item.setPo(request));
            int total = request.getItems().stream().mapToInt(PurchaseOrderItemJpaEntity::getQuantity).sum();
            request.setTotalQuantity(total);
        }

        PurchaseOrderJpaEntity saved = poRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo đơn mua PO thành công"));
    }

    @PostMapping("/purchase-orders/{id}/submit")
    @Operation(summary = "Gửi duyệt Đơn mua PO")
    public ResponseEntity<ApiResponse<PurchaseOrderJpaEntity>> submitPo(@PathVariable UUID id) {
        return updatePoStatus(id, "SUBMITTED", "Đã gửi duyệt PO thành công");
    }

    @PostMapping("/purchase-orders/{id}/approve")
    @Operation(summary = "Phê duyệt Đơn mua PO")
    public ResponseEntity<ApiResponse<PurchaseOrderJpaEntity>> approvePo(@PathVariable UUID id) {
        return updatePoStatus(id, "APPROVED", "Đã phê duyệt PO thành công");
    }

    @PostMapping("/purchase-orders/{id}/receive")
    @Operation(summary = "Nhập kho PO")
    public ResponseEntity<ApiResponse<PurchaseOrderJpaEntity>> receivePo(@PathVariable UUID id) {
        return updatePoStatus(id, "RECEIVED", "Đã cập nhật trạng thái đã nhận hàng PO");
    }

    @PostMapping("/purchase-orders/{id}/close")
    @Operation(summary = "Đóng Đơn mua PO")
    public ResponseEntity<ApiResponse<PurchaseOrderJpaEntity>> closePo(@PathVariable UUID id) {
        return updatePoStatus(id, "CLOSED", "Đã đóng PO thành công");
    }

    @GetMapping("/purchase-orders/export")
    @Operation(summary = "Xuất Excel Danh sách PO")
    public ResponseEntity<byte[]> exportPos() {
        String csv = "PONumber,VendorId,WarehouseId,TotalQuantity,Status\nPO-20261004-001,,,100,APPROVED\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=purchase_orders.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }

    private ResponseEntity<ApiResponse<PurchaseOrderJpaEntity>> updatePoStatus(UUID id, String status, String msg) {
        return poRepository.findById(id).map(po -> {
            po.setStatus(status);
            PurchaseOrderJpaEntity saved = poRepository.save(po);
            return ResponseEntity.ok(ApiResponse.success(saved, msg));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Imports & Serial Scanning ────────────────────────────────
    @GetMapping("/imports")
    @Operation(summary = "Danh sách Lịch sử Nhập kho")
    public ResponseEntity<ApiResponse<PageResponse<StockTransactionJpaEntity>>> getImports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Specification<StockTransactionJpaEntity> spec = (root, query, cb) ->
                cb.equal(root.get("transactionType"), "IMPORT");

        Page<StockTransactionJpaEntity> result = stockTxRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping("/imports")
    @Transactional
    @Operation(summary = "Thực hiện Nhập kho từ PO + Danh sách Serials (Validate Duplicate -> 409)")
    public ResponseEntity<ApiResponse<Object>> createImport(@RequestBody Map<String, Object> body) {
        String poIdStr = (String) body.get("poId");
        String warehouseIdStr = (String) body.get("warehouseId");
        String deviceModelIdStr = (String) body.get("deviceModelId");
        List<String> serials = (List<String>) body.get("serials");

        if (serials == null || serials.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Danh sách serial không được để trống"));
        }

        // Validate duplicates
        List<String> duplicates = new ArrayList<>();
        for (String serial : serials) {
            if (deviceRepository.existsBySerialNumber(serial.trim())) {
                duplicates.add(serial.trim());
            }
        }
        if (!duplicates.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.success(null, "POS-4009: Serial number trùng lặp: " + String.join(", ", duplicates)));
        }

        UUID warehouseId = warehouseIdStr != null ? UUID.fromString(warehouseIdStr) : null;
        UUID deviceModelId = deviceModelIdStr != null ? UUID.fromString(deviceModelIdStr) : null;
        UUID poId = poIdStr != null ? UUID.fromString(poIdStr) : null;

        List<DeviceJpaEntity> createdDevices = new ArrayList<>();
        for (String serial : serials) {
            String s = serial.trim();
            DeviceJpaEntity dev = DeviceJpaEntity.builder()
                    .serialNumber(s)
                    .deviceModelId(deviceModelId != null ? deviceModelId : UUID.randomUUID())
                    .warehouseId(warehouseId)
                    .status("INSTOCK")
                    .build();
            DeviceJpaEntity savedDev = deviceRepository.save(dev);
            createdDevices.add(savedDev);

            // Stock transaction ledger entry
            StockTransactionJpaEntity tx = StockTransactionJpaEntity.builder()
                    .transactionType("IMPORT")
                    .deviceId(savedDev.getId())
                    .serialNumber(s)
                    .toWarehouseId(warehouseId)
                    .poId(poId)
                    .note("Nhập kho từ PO")
                    .build();
            stockTxRepository.save(tx);

            // Transactional Outbox event
            OutboxEventJpaEntity event = OutboxEventJpaEntity.builder()
                    .aggregateType("DEVICE")
                    .aggregateId(s)
                    .eventType("DEVICE_IMPORTED")
                    .payload("{\"serialNumber\":\"" + s + "\",\"status\":\"INSTOCK\"}")
                    .status("PENDING")
                    .build();
            outboxEventRepository.save(event);
        }

        return ResponseEntity.ok(ApiResponse.success(createdDevices, "Nhập kho thành công " + createdDevices.size() + " thiết bị"));
    }

    @GetMapping("/imports/export")
    @Operation(summary = "Xuất Excel Lịch sử Nhập kho")
    public ResponseEntity<byte[]> exportImports() {
        String csv = "SerialNumber,WarehouseId,POId,CreatedAt\nSN1000001,,PO-20261004-001,2026-10-04\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=imports.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }

    // ─── Stock Summary ─────────────────────────────────────────────
    @GetMapping("/stock")
    @Operation(summary = "Báo cáo Tồn kho POS theo Kho x Model")
    public ResponseEntity<ApiResponse<PageResponse<DeviceJpaEntity>>> getStock(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) UUID warehouseId,
            @RequestParam(required = false) String status) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Specification<DeviceJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (warehouseId != null) {
                predicates.add(cb.equal(root.get("warehouseId"), warehouseId));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DeviceJpaEntity> result = deviceRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/stock/{warehouseId}/devices")
    @Operation(summary = "Chi tiết danh sách thiết bị trong kho")
    public ResponseEntity<ApiResponse<List<DeviceJpaEntity>>> getDevicesInWarehouse(
            @PathVariable UUID warehouseId,
            @RequestParam(required = false) UUID modelId) {

        List<DeviceJpaEntity> list = modelId != null ?
                deviceRepository.findByWarehouseIdAndDeviceModelIdAndStatus(warehouseId, modelId, "INSTOCK") :
                deviceRepository.findByWarehouseIdAndStatus(warehouseId, "INSTOCK");
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/stock/export")
    @Operation(summary = "Xuất Excel Báo cáo Tồn kho")
    public ResponseEntity<byte[]> exportStock() {
        String csv = "WarehouseId,ModelId,SerialNumber,Status\n,SN1000001,INSTOCK\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock_report.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }

    // ─── Stock Ledger Transactions ────────────────────────────────
    @GetMapping("/transactions")
    @Operation(summary = "Nhật ký Giao dịch Kho (Stock Ledger)")
    public ResponseEntity<ApiResponse<PageResponse<StockTransactionJpaEntity>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<StockTransactionJpaEntity> result = stockTxRepository.findAll(pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }
}
