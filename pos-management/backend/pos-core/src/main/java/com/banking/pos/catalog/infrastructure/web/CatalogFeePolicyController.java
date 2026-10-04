package com.banking.pos.catalog.infrastructure.web;

import com.banking.pos.catalog.infrastructure.persistence.entity.FeePolicyJpaEntity;
import com.banking.pos.catalog.infrastructure.persistence.repository.FeePolicyJpaRepository;
import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/fee-policies")
@RequiredArgsConstructor
@Tag(name = "Catalog - Fee Policies", description = "Quản lý chính sách phí")
public class CatalogFeePolicyController {

    private final FeePolicyJpaRepository feePolicyRepository;

    @GetMapping
    @Operation(summary = "Danh sách Chính sách phí")
    public ResponseEntity<ApiResponse<PageResponse<FeePolicyJpaEntity>>> getFeePolicies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveDate,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<FeePolicyJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("name")), pattern)
                ));
            }
            if (effectiveDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("effectiveFrom"), effectiveDate));
                predicates.add(cb.or(
                        cb.isNull(root.get("effectiveTo")),
                        cb.greaterThanOrEqualTo(root.get("effectiveTo"), effectiveDate)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<FeePolicyJpaEntity> result = feePolicyRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping
    @Operation(summary = "Tạo Chính sách phí mới")
    public ResponseEntity<ApiResponse<FeePolicyJpaEntity>> createFeePolicy(@RequestBody FeePolicyJpaEntity request) {
        if (feePolicyRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Mã chính sách phí đã tồn tại"));
        }
        if (request.getEffectiveFrom() == null) {
            request.setEffectiveFrom(LocalDate.now());
        }
        request.setIsActive(true);
        FeePolicyJpaEntity saved = feePolicyRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo chính sách phí thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Chính sách phí")
    public ResponseEntity<ApiResponse<FeePolicyJpaEntity>> updateFeePolicy(
            @PathVariable UUID id,
            @RequestBody FeePolicyJpaEntity request) {

        return feePolicyRepository.findById(id).map(policy -> {
            policy.setName(request.getName());
            policy.setDescription(request.getDescription());
            policy.setInterchangeRate(request.getInterchangeRate());
            policy.setServiceFeeRate(request.getServiceFeeRate());
            policy.setFixedFee(request.getFixedFee());
            policy.setMinFee(request.getMinFee());
            policy.setMaxFee(request.getMaxFee());
            if (request.getEffectiveFrom() != null) policy.setEffectiveFrom(request.getEffectiveFrom());
            policy.setEffectiveTo(request.getEffectiveTo());
            if (request.getIsActive() != null) policy.setIsActive(request.getIsActive());
            FeePolicyJpaEntity saved = feePolicyRepository.save(policy);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật chính sách phí thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft Delete Chính sách phí")
    public ResponseEntity<ApiResponse<Void>> deleteFeePolicy(@PathVariable UUID id) {
        return feePolicyRepository.findById(id).map(policy -> {
            policy.setIsActive(false);
            feePolicyRepository.save(policy);
            return ResponseEntity.ok(ApiResponse.<Void>success("Vô hiệu hóa chính sách phí thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Chính sách phí")
    public ResponseEntity<byte[]> exportFeePolicies() {
        String csv = "Code,Name,InterchangeRate,ServiceFeeRate,EffectiveFrom,Status\nFEE_STD_2026,Chinh sach phi chuan,0.0150,0.0050,2026-01-01,ACTIVE\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=fee_policies.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }
}
