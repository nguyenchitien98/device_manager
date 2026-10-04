package com.banking.pos.inventory.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.inventory.infrastructure.persistence.entity.AuditLogJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.entity.DeviceJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.entity.OutboxEventJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.repository.AuditLogJpaRepository;
import com.banking.pos.inventory.infrastructure.persistence.repository.DeviceJpaRepository;
import com.banking.pos.inventory.infrastructure.persistence.repository.OutboxEventJpaRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MonitoringController {

    private final DeviceJpaRepository deviceRepository;
    private final AuditLogJpaRepository auditLogRepository;
    private final OutboxEventJpaRepository outboxEventRepository;

    private static boolean kafkaChaosEnabled = false;

    @GetMapping("/monitoring/pos-status")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getPosStatus(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        Specification<DeviceJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), "DEPLOYED"));
            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("serialNumber")), "%" + search.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DeviceJpaEntity> resultPage = deviceRepository.findAll(spec, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt")));

        List<Map<String, Object>> content = resultPage.getContent().stream().map(d -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", d.getId());
            map.put("serialNumber", d.getSerialNumber());
            map.put("modelId", d.getDeviceModelId());
            map.put("status", d.getStatus());
            map.put("connectionState", "ONLINE");
            map.put("batteryLevel", 95);
            map.put("signalStrength", "4G FULL");
            map.put("lastPingAt", d.getUpdatedAt());
            return map;
        }).toList();

        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(resultPage, content)));
    }

    @GetMapping({"/monitoring/audit-logs", "/audit-logs"})
    public ResponseEntity<ApiResponse<PageResponse<AuditLogJpaEntity>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String action) {

        Specification<AuditLogJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("actor")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("entityName")), "%" + search.toLowerCase() + "%")
                ));
            }
            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditLogJpaEntity> resultPage = auditLogRepository.findAll(spec, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(resultPage)));
    }

    @GetMapping("/monitoring/audit-logs/export")
    public ResponseEntity<String> exportAuditLogs() {
        List<AuditLogJpaEntity> list = auditLogRepository.findAll();
        StringBuilder csv = new StringBuilder("ID,Action,EntityName,EntityID,Actor,IPAddress,CreatedAt\n");
        for (AuditLogJpaEntity log : list) {
            csv.append(log.getId()).append(",")
                    .append(log.getAction()).append(",")
                    .append(log.getEntityName()).append(",")
                    .append(log.getEntityId() != null ? log.getEntityId() : "").append(",")
                    .append(log.getActor()).append(",")
                    .append(log.getIpAddress() != null ? log.getIpAddress() : "").append(",")
                    .append(log.getCreatedAt()).append("\n");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"audit_logs_export.csv\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csv.toString());
    }

    @GetMapping({"/monitoring/outbox", "/outbox/events"})
    public ResponseEntity<ApiResponse<PageResponse<OutboxEventJpaEntity>>> getOutboxEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {

        Specification<OutboxEventJpaEntity> spec = (root, query, cb) -> {
            if (status != null && !status.isBlank()) {
                return cb.equal(root.get("status"), status);
            }
            return cb.conjunction();
        };

        Page<OutboxEventJpaEntity> resultPage = outboxEventRepository.findAll(spec, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(resultPage)));
    }

    @PostMapping({"/outbox/events/{id}/retry", "/outbox/events/retry/{id}"})
    public ResponseEntity<ApiResponse<OutboxEventJpaEntity>> retryOutboxEvent(@PathVariable UUID id) {
        OutboxEventJpaEntity event = outboxEventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Outbox Event ID: " + id));

        event.setStatus("SENT");
        event.setProcessedAt(Instant.now());
        event.setErrorMessage(null);
        outboxEventRepository.save(event);

        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @PostMapping("/chaos/toggle-kafka")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleKafkaChaos() {
        kafkaChaosEnabled = !kafkaChaosEnabled;
        Map<String, Object> result = Map.of(
                "kafkaChaosEnabled", kafkaChaosEnabled,
                "message", kafkaChaosEnabled ? "Đã BẬT giả lập sự cố Kafka (Chaos mode)" : "Đã TẮT giả lập sự cố Kafka"
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
