package com.banking.pos.inventory.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.inventory.infrastructure.persistence.entity.DeviceJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.entity.DeviceLifecycleJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.entity.RepairOrderJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.entity.StockTransactionJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.repository.DeviceJpaRepository;
import com.banking.pos.inventory.infrastructure.persistence.repository.DeviceLifecycleJpaRepository;
import com.banking.pos.inventory.infrastructure.persistence.repository.RepairOrderJpaRepository;
import com.banking.pos.inventory.infrastructure.persistence.repository.StockTransactionJpaRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DeviceDetailController {

    private final DeviceJpaRepository deviceRepository;
    private final DeviceLifecycleJpaRepository lifecycleRepository;
    private final RepairOrderJpaRepository repairOrderRepository;
    private final StockTransactionJpaRepository stockTransactionRepository;

    @GetMapping("/devices")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getDevices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID modelId,
            @RequestParam(required = false) UUID warehouseId) {

        Specification<DeviceJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("serialNumber")), "%" + search.toLowerCase() + "%"));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (modelId != null) {
                predicates.add(cb.equal(root.get("deviceModelId"), modelId));
            }
            if (warehouseId != null) {
                predicates.add(cb.equal(root.get("warehouseId"), warehouseId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DeviceJpaEntity> resultPage = deviceRepository.findAll(spec, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<Map<String, Object>> content = resultPage.getContent().stream().map(this::mapDeviceToMap).toList();

        PageResponse<Map<String, Object>> response = PageResponse.from(resultPage, content);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/devices/{serialNumber}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeviceBySerial(@PathVariable String serialNumber) {
        DeviceJpaEntity device = deviceRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thiết bị với Serial: " + serialNumber));

        return ResponseEntity.ok(ApiResponse.success(mapDeviceToMap(device)));
    }

    @GetMapping("/devices/{serialNumber}/lifecycle")
    public ResponseEntity<ApiResponse<List<DeviceLifecycleJpaEntity>>> getDeviceLifecycle(@PathVariable String serialNumber) {
        List<DeviceLifecycleJpaEntity> history = lifecycleRepository.findBySerialNumberOrderByCreatedAtDesc(serialNumber);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/devices/{serialNumber}/assignments")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDeviceAssignments(@PathVariable String serialNumber) {
        // Placeholder return list for assignments history
        return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
    }

    @GetMapping("/devices/{serialNumber}/repairs")
    public ResponseEntity<ApiResponse<List<RepairOrderJpaEntity>>> getDeviceRepairs(@PathVariable String serialNumber) {
        List<RepairOrderJpaEntity> repairs = repairOrderRepository.findBySerialNumberOrderByCreatedAtDesc(serialNumber);
        return ResponseEntity.ok(ApiResponse.success(repairs));
    }

    @GetMapping("/devices/{serialNumber}/stock-history")
    public ResponseEntity<ApiResponse<List<StockTransactionJpaEntity>>> getDeviceStockHistory(@PathVariable String serialNumber) {
        List<StockTransactionJpaEntity> txs = stockTransactionRepository.findBySerialNumberOrderByCreatedAtDesc(serialNumber);
        return ResponseEntity.ok(ApiResponse.success(txs));
    }

    @GetMapping("/devices/{serialNumber}/audit-logs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDeviceAuditLogs(@PathVariable String serialNumber) {
        return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
    }

    @PatchMapping("/devices/{serialNumber}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateDeviceStatus(
            @PathVariable String serialNumber,
            @RequestBody Map<String, String> body) {

        DeviceJpaEntity device = deviceRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thiết bị với Serial: " + serialNumber));

        String oldStatus = device.getStatus();
        String newStatus = body.get("status");
        String reason = body.get("reason");

        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException("Trạng thái mới không được để trống");
        }

        device.setStatus(newStatus);
        deviceRepository.save(device);

        lifecycleRepository.save(DeviceLifecycleJpaEntity.builder()
                .deviceId(device.getId())
                .serialNumber(device.getSerialNumber())
                .fromStatus(oldStatus)
                .toStatus(newStatus)
                .action("STATUS_CHANGE")
                .reason(reason != null ? reason : "Chuyển trạng thái thiết bị")
                .build());

        return ResponseEntity.ok(ApiResponse.success(mapDeviceToMap(device)));
    }

    @PostMapping("/devices/{serialNumber}/repairs")
    public ResponseEntity<ApiResponse<RepairOrderJpaEntity>> createRepairOrder(
            @PathVariable String serialNumber,
            @RequestBody Map<String, Object> req) {

        DeviceJpaEntity device = deviceRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thiết bị với Serial: " + serialNumber));

        String issueDescription = (String) req.get("issueDescription");
        if (issueDescription == null || issueDescription.isBlank()) {
            issueDescription = "Báo lỗi sửa chữa thiết bị";
        }

        UUID vendorId = null;
        if (req.get("vendorId") != null) {
            try {
                vendorId = UUID.fromString(req.get("vendorId").toString());
            } catch (Exception ignored) {}
        }

        BigDecimal repairCost = null;
        if (req.get("repairCost") != null) {
            try {
                repairCost = new BigDecimal(req.get("repairCost").toString());
            } catch (Exception ignored) {}
        }

        String repairCode = "RO-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (1000 + new Random().nextInt(9000));

        RepairOrderJpaEntity order = RepairOrderJpaEntity.builder()
                .repairCode(repairCode)
                .deviceId(device.getId())
                .serialNumber(device.getSerialNumber())
                .vendorId(vendorId)
                .issueDescription(issueDescription)
                .status("UNDER_REPAIR")
                .repairCost(repairCost)
                .note((String) req.get("note"))
                .build();

        repairOrderRepository.save(order);

        // Update device status to REPAIRING
        String oldStatus = device.getStatus();
        device.setStatus("REPAIRING");
        deviceRepository.save(device);

        lifecycleRepository.save(DeviceLifecycleJpaEntity.builder()
                .deviceId(device.getId())
                .serialNumber(device.getSerialNumber())
                .fromStatus(oldStatus)
                .toStatus("REPAIRING")
                .action("SEND_TO_REPAIR")
                .reason("Gửi bảo hành / sửa chữa: " + repairCode)
                .build());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(order));
    }

    @PostMapping("/devices/{serialNumber}/dispose")
    public ResponseEntity<ApiResponse<Map<String, Object>>> disposeDevice(
            @PathVariable String serialNumber,
            @RequestBody Map<String, String> req) {

        DeviceJpaEntity device = deviceRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thiết bị với Serial: " + serialNumber));

        String reason = req.get("reason");
        String oldStatus = device.getStatus();

        device.setStatus("DISPOSED");
        deviceRepository.save(device);

        lifecycleRepository.save(DeviceLifecycleJpaEntity.builder()
                .deviceId(device.getId())
                .serialNumber(device.getSerialNumber())
                .fromStatus(oldStatus)
                .toStatus("DISPOSED")
                .action("DISPOSE_DEVICE")
                .reason(reason != null ? reason : "Thanh lý / tiêu hủy thiết bị")
                .build());

        return ResponseEntity.ok(ApiResponse.success(mapDeviceToMap(device)));
    }

    @GetMapping({"/devices/export", "/devices/monitoring/export"})
    public ResponseEntity<String> exportDevices() {
        List<DeviceJpaEntity> list = deviceRepository.findAll();
        StringBuilder csv = new StringBuilder("ID,Serial,ModelID,WarehouseID,Status,CreatedAt\n");
        for (DeviceJpaEntity d : list) {
            csv.append(d.getId()).append(",")
                    .append(d.getSerialNumber()).append(",")
                    .append(d.getDeviceModelId()).append(",")
                    .append(d.getWarehouseId() != null ? d.getWarehouseId() : "").append(",")
                    .append(d.getStatus()).append(",")
                    .append(d.getCreatedAt()).append("\n");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"devices_export.csv\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csv.toString());
    }

    @GetMapping("/repairs")
    public ResponseEntity<ApiResponse<PageResponse<RepairOrderJpaEntity>>> getRepairs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        Specification<RepairOrderJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("repairCode")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("serialNumber")), "%" + search.toLowerCase() + "%")
                ));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<RepairOrderJpaEntity> resultPage = repairOrderRepository.findAll(spec, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        PageResponse<RepairOrderJpaEntity> response = PageResponse.from(resultPage);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/repairs/{id}/complete")
    public ResponseEntity<ApiResponse<RepairOrderJpaEntity>> completeRepair(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> req) {

        RepairOrderJpaEntity order = repairOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lệnh sửa chữa ID: " + id));

        order.setStatus("REPAIRED");
        order.setCompletedAt(Instant.now());
        if (req != null) {
            if (req.get("note") != null) order.setNote(req.get("note").toString());
            if (req.get("repairCost") != null) {
                try {
                    order.setRepairCost(new BigDecimal(req.get("repairCost").toString()));
                } catch (Exception ignored) {}
            }
        }
        repairOrderRepository.save(order);

        // Update device status back to INSTOCK
        deviceRepository.findBySerialNumber(order.getSerialNumber()).ifPresent(d -> {
            String oldStatus = d.getStatus();
            d.setStatus("INSTOCK");
            deviceRepository.save(d);

            lifecycleRepository.save(DeviceLifecycleJpaEntity.builder()
                    .deviceId(d.getId())
                    .serialNumber(d.getSerialNumber())
                    .fromStatus(oldStatus)
                    .toStatus("INSTOCK")
                    .action("REPAIR_COMPLETED")
                    .reason("Hoàn tất sửa chữa lệnh " + order.getRepairCode())
                    .build());
        });

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PatchMapping("/repairs/{id}/fail")
    public ResponseEntity<ApiResponse<RepairOrderJpaEntity>> failRepair(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> req) {

        RepairOrderJpaEntity order = repairOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lệnh sửa chữa ID: " + id));

        order.setStatus("SCRAPPED");
        order.setCompletedAt(Instant.now());
        if (req != null && req.get("note") != null) {
            order.setNote(req.get("note").toString());
        }
        repairOrderRepository.save(order);

        // Update device status to DISPOSED
        deviceRepository.findBySerialNumber(order.getSerialNumber()).ifPresent(d -> {
            String oldStatus = d.getStatus();
            d.setStatus("DISPOSED");
            deviceRepository.save(d);

            lifecycleRepository.save(DeviceLifecycleJpaEntity.builder()
                    .deviceId(d.getId())
                    .serialNumber(d.getSerialNumber())
                    .fromStatus(oldStatus)
                    .toStatus("DISPOSED")
                    .action("REPAIR_FAILED_SCRAPPED")
                    .reason("Không thể sửa chữa, hủy thiết bị theo lệnh " + order.getRepairCode())
                    .build());
        });

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/repairs/export")
    public ResponseEntity<String> exportRepairs() {
        List<RepairOrderJpaEntity> list = repairOrderRepository.findAll();
        StringBuilder csv = new StringBuilder("ID,RepairCode,Serial,Status,Issue,Cost,CreatedAt\n");
        for (RepairOrderJpaEntity r : list) {
            csv.append(r.getId()).append(",")
                    .append(r.getRepairCode()).append(",")
                    .append(r.getSerialNumber()).append(",")
                    .append(r.getStatus()).append(",")
                    .append(r.getIssueDescription() != null ? r.getIssueDescription().replace(",", ";") : "").append(",")
                    .append(r.getRepairCost() != null ? r.getRepairCost() : "").append(",")
                    .append(r.getCreatedAt()).append("\n");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"repairs_export.csv\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csv.toString());
    }

    private Map<String, Object> mapDeviceToMap(DeviceJpaEntity device) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", device.getId());
        map.put("serialNumber", device.getSerialNumber());
        map.put("deviceModelId", device.getDeviceModelId());
        map.put("modelName", "POS Model");
        map.put("warehouseId", device.getWarehouseId());
        map.put("warehouseName", device.getWarehouseId() != null ? "Kho Trung Tâm" : null);
        map.put("status", device.getStatus());
        map.put("version", device.getVersion());
        map.put("createdAt", device.getCreatedAt());
        map.put("updatedAt", device.getUpdatedAt());
        return map;
    }
}
