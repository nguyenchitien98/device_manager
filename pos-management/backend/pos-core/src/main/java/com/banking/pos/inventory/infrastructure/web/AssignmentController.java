package com.banking.pos.inventory.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.inventory.infrastructure.persistence.entity.AssignmentHistoryJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.entity.AssignmentJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.entity.DeviceJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.entity.DeviceLifecycleJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.repository.AssignmentHistoryJpaRepository;
import com.banking.pos.inventory.infrastructure.persistence.repository.AssignmentJpaRepository;
import com.banking.pos.inventory.infrastructure.persistence.repository.DeviceJpaRepository;
import com.banking.pos.inventory.infrastructure.persistence.repository.DeviceLifecycleJpaRepository;
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

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentJpaRepository assignmentRepository;
    private final AssignmentHistoryJpaRepository historyRepository;
    private final DeviceJpaRepository deviceRepository;
    private final DeviceLifecycleJpaRepository lifecycleRepository;

    // InMemory cache for Idempotency Key validation (TTL / simple Map)
    private final Map<String, AssignmentJpaEntity> idempotencyCache = new ConcurrentHashMap<>();

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AssignmentJpaEntity>>> getAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID merchantId,
            @RequestParam(required = false) UUID terminalId) {

        Specification<AssignmentJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("assignmentCode")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("serialNumber")), "%" + search.toLowerCase() + "%")
                ));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (merchantId != null) {
                predicates.add(cb.equal(root.get("merchantId"), merchantId));
            }
            if (terminalId != null) {
                predicates.add(cb.equal(root.get("terminalId"), terminalId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AssignmentJpaEntity> resultPage = assignmentRepository.findAll(spec, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(resultPage)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentJpaEntity>> getAssignmentById(@PathVariable UUID id) {
        AssignmentJpaEntity assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin bàn giao ID: " + id));
        return ResponseEntity.ok(ApiResponse.success(assignment));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentJpaEntity>> createAssignment(
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody Map<String, Object> req) {

        // Idempotency Check
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            if (idempotencyCache.containsKey(idempotencyKey)) {
                return ResponseEntity.ok(ApiResponse.success(idempotencyCache.get(idempotencyKey)));
            }
        }

        String serialNumber = (String) req.get("serialNumber");
        if (serialNumber == null || serialNumber.isBlank()) {
            throw new IllegalArgumentException("Mã Serial thiết bị không được để trống");
        }

        UUID merchantId = UUID.fromString(req.get("merchantId").toString());
        UUID terminalId = req.get("terminalId") != null ? UUID.fromString(req.get("terminalId").toString()) : null;

        DeviceJpaEntity device = deviceRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thiết bị với Serial: " + serialNumber));

        if (!"INSTOCK".equalsIgnoreCase(device.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.success(null, "Thiết bị không ở trạng thái sẵn sàng (INSTOCK) để cấp phát. Trạng thái hiện tại: " + device.getStatus()));
        }

        String code = "AS-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (1000 + new Random().nextInt(9000));

        AssignmentJpaEntity assignment = AssignmentJpaEntity.builder()
                .assignmentCode(code)
                .deviceId(device.getId())
                .serialNumber(device.getSerialNumber())
                .merchantId(merchantId)
                .terminalId(terminalId != null ? terminalId.toString() : null)
                .status("ACTIVE")
                .note((String) req.get("note"))
                .build();

        assignmentRepository.save(assignment);

        // Optimistic Locking & Status Update on Device
        String oldStatus = device.getStatus();
        device.setStatus("DEPLOYED");
        deviceRepository.save(device);

        // History logs
        historyRepository.save(AssignmentHistoryJpaEntity.builder()
                .assignmentId(assignment.getId())
                .serialNumber(device.getSerialNumber())
                .action("CREATE")
                .toMerchantId(merchantId)
                .reason("Cấp phát thiết bị cho Merchant")
                .build());

        lifecycleRepository.save(DeviceLifecycleJpaEntity.builder()
                .deviceId(device.getId())
                .serialNumber(device.getSerialNumber())
                .fromStatus(oldStatus)
                .toStatus("DEPLOYED")
                .action("ASSIGN_MERCHANT")
                .reason("Bàn giao thiết bị " + code)
                .build());

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            idempotencyCache.put(idempotencyKey, assignment);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(assignment));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<AssignmentJpaEntity>> returnAssignment(
            @PathVariable UUID id,
            @RequestBody Map<String, String> req) {

        AssignmentJpaEntity assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lệnh bàn giao ID: " + id));

        String reason = req.get("reason");

        assignment.setStatus("RETURNED");
        assignment.setReturnedAt(Instant.now());
        assignmentRepository.save(assignment);

        deviceRepository.findBySerialNumber(assignment.getSerialNumber()).ifPresent(device -> {
            String oldStatus = device.getStatus();
            device.setStatus("INSTOCK");
            deviceRepository.save(device);

            lifecycleRepository.save(DeviceLifecycleJpaEntity.builder()
                    .deviceId(device.getId())
                    .serialNumber(device.getSerialNumber())
                    .fromStatus(oldStatus)
                    .toStatus("INSTOCK")
                    .action("RETURN_DEVICE")
                    .reason(reason != null ? reason : "Thu hồi thiết bị về kho")
                    .build());
        });

        historyRepository.save(AssignmentHistoryJpaEntity.builder()
                .assignmentId(assignment.getId())
                .serialNumber(assignment.getSerialNumber())
                .action("RETURN")
                .fromMerchantId(assignment.getMerchantId())
                .reason(reason)
                .build());

        return ResponseEntity.ok(ApiResponse.success(assignment));
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<ApiResponse<AssignmentJpaEntity>> transferAssignment(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> req) {

        AssignmentJpaEntity oldAssignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lệnh bàn giao ID: " + id));

        UUID newMerchantId = UUID.fromString(req.get("newMerchantId").toString());
        UUID newTerminalId = req.get("newTerminalId") != null ? UUID.fromString(req.get("newTerminalId").toString()) : null;
        String reason = (String) req.get("reason");

        oldAssignment.setStatus("TRANSFERRED");
        assignmentRepository.save(oldAssignment);

        String newCode = "AS-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (1000 + new Random().nextInt(9000));

        AssignmentJpaEntity newAssignment = AssignmentJpaEntity.builder()
                .assignmentCode(newCode)
                .deviceId(oldAssignment.getDeviceId())
                .serialNumber(oldAssignment.getSerialNumber())
                .merchantId(newMerchantId)
                .terminalId(newTerminalId != null ? newTerminalId.toString() : null)
                .status("ACTIVE")
                .note("Điều chuyển từ Merchant ID: " + oldAssignment.getMerchantId())
                .build();

        assignmentRepository.save(newAssignment);

        historyRepository.save(AssignmentHistoryJpaEntity.builder()
                .assignmentId(newAssignment.getId())
                .serialNumber(oldAssignment.getSerialNumber())
                .action("TRANSFER")
                .fromMerchantId(oldAssignment.getMerchantId())
                .toMerchantId(newMerchantId)
                .reason(reason != null ? reason : "Điều chuyển thiết bị giữa các merchant")
                .build());

        return ResponseEntity.ok(ApiResponse.success(newAssignment));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PageResponse<AssignmentHistoryJpaEntity>>> getAssignmentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {

        Specification<AssignmentHistoryJpaEntity> spec = (root, query, cb) -> {
            if (search != null && !search.isBlank()) {
                return cb.like(cb.lower(root.get("serialNumber")), "%" + search.toLowerCase() + "%");
            }
            return cb.conjunction();
        };

        Page<AssignmentHistoryJpaEntity> resultPage = historyRepository.findAll(spec, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(resultPage)));
    }

    @GetMapping({"/export", "/history/export"})
    public ResponseEntity<String> exportAssignments() {
        List<AssignmentJpaEntity> list = assignmentRepository.findAll();
        StringBuilder csv = new StringBuilder("ID,AssignmentCode,Serial,MerchantID,Status,CreatedAt\n");
        for (AssignmentJpaEntity a : list) {
            csv.append(a.getId()).append(",")
                    .append(a.getAssignmentCode()).append(",")
                    .append(a.getSerialNumber()).append(",")
                    .append(a.getMerchantId()).append(",")
                    .append(a.getStatus()).append(",")
                    .append(a.getCreatedAt()).append("\n");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"assignments_export.csv\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csv.toString());
    }
}
