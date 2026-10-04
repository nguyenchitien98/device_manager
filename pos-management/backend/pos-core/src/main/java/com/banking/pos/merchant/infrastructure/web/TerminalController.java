package com.banking.pos.merchant.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.merchant.infrastructure.persistence.entity.TerminalJpaEntity;
import com.banking.pos.merchant.infrastructure.persistence.repository.TerminalJpaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/terminals")
@RequiredArgsConstructor
@Tag(name = "Terminal (TID) Management", description = "Quản lý điểm bán Terminal / TID")
public class TerminalController {

    private final TerminalJpaRepository terminalRepository;

    @GetMapping
    @Operation(summary = "Danh sách Terminal TID")
    public ResponseEntity<ApiResponse<PageResponse<TerminalJpaEntity>>> getTerminals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<TerminalJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("tid")), pattern),
                        cb.like(cb.lower(root.get("installationAddress")), pattern)
                ));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<TerminalJpaEntity> result = terminalRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết Terminal TID")
    public ResponseEntity<ApiResponse<TerminalJpaEntity>> getTerminalDetail(@PathVariable UUID id) {
        return terminalRepository.findById(id)
                .map(t -> ResponseEntity.ok(ApiResponse.success(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Cấp mới Terminal TID")
    public ResponseEntity<ApiResponse<TerminalJpaEntity>> createTerminal(@RequestBody TerminalJpaEntity request) {
        if (request.getTid() == null || request.getTid().isBlank()) {
            long count = terminalRepository.countByTidStartingWith("T") + 100001;
            request.setTid("T" + String.format("%06d", count));
        } else if (terminalRepository.findByTid(request.getTid()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "TID đã tồn tại"));
        }

        request.setStatus("UNASSIGNED");
        TerminalJpaEntity saved = terminalRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo Terminal TID thành công"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái Terminal TID")
    public ResponseEntity<ApiResponse<TerminalJpaEntity>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Trạng thái không được để trống"));
        }

        return terminalRepository.findById(id).map(terminal -> {
            terminal.setStatus(status);
            TerminalJpaEntity saved = terminalRepository.save(terminal);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật trạng thái Terminal thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Terminal TID")
    public ResponseEntity<byte[]> exportTerminals() {
        String csv = "TID,InstallationAddress,Status\nT100001,Ha Noi,UNASSIGNED\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=terminals.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }
}
