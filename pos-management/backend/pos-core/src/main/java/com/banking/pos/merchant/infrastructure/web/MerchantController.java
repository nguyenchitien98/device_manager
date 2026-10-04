package com.banking.pos.merchant.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.merchant.infrastructure.persistence.entity.MerchantJpaEntity;
import com.banking.pos.merchant.infrastructure.persistence.repository.MerchantJpaRepository;
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
@RequestMapping("/api/v1/merchants")
@RequiredArgsConstructor
@Tag(name = "Merchant Management", description = "Quản lý Merchant và Điểm chấp nhận thanh toán")
public class MerchantController {

    private final MerchantJpaRepository merchantRepository;

    @GetMapping
    @Operation(summary = "Danh sách Merchant")
    public ResponseEntity<ApiResponse<PageResponse<MerchantJpaEntity>>> getMerchants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID mccId,
            @RequestParam(required = false) UUID businessUnitId,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<MerchantJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("merchantCode")), pattern),
                        cb.like(cb.lower(root.get("merchantName")), pattern)
                ));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (mccId != null) {
                predicates.add(cb.equal(root.get("mccId"), mccId));
            }
            if (businessUnitId != null) {
                predicates.add(cb.equal(root.get("businessUnitId"), businessUnitId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<MerchantJpaEntity> result = merchantRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết Merchant")
    public ResponseEntity<ApiResponse<MerchantJpaEntity>> getMerchantDetail(@PathVariable UUID id) {
        return merchantRepository.findById(id)
                .map(m -> ResponseEntity.ok(ApiResponse.success(m)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Tạo Merchant mới")
    public ResponseEntity<ApiResponse<MerchantJpaEntity>> createMerchant(@RequestBody MerchantJpaEntity request) {
        if (request.getMerchantCode() == null || request.getMerchantCode().isBlank()) {
            long count = merchantRepository.countByMerchantCodeStartingWith("M") + 100001;
            request.setMerchantCode("M" + String.format("%06d", count));
        } else if (merchantRepository.findByMerchantCode(request.getMerchantCode()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Mã Merchant đã tồn tại"));
        }

        request.setStatus("ACTIVE");
        MerchantJpaEntity saved = merchantRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo Merchant thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Merchant")
    public ResponseEntity<ApiResponse<MerchantJpaEntity>> updateMerchant(
            @PathVariable UUID id,
            @RequestBody MerchantJpaEntity request) {

        return merchantRepository.findById(id).map(merchant -> {
            merchant.setMerchantName(request.getMerchantName());
            merchant.setLegalName(request.getLegalName());
            merchant.setTaxCode(request.getTaxCode());
            merchant.setContactName(request.getContactName());
            merchant.setContactPhone(request.getContactPhone());
            merchant.setContactEmail(request.getContactEmail());
            merchant.setAddress(request.getAddress());
            if (request.getMccId() != null) merchant.setMccId(request.getMccId());
            if (request.getBusinessUnitId() != null) merchant.setBusinessUnitId(request.getBusinessUnitId());
            if (request.getStatus() != null) merchant.setStatus(request.getStatus());

            MerchantJpaEntity saved = merchantRepository.save(merchant);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật Merchant thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái Merchant")
    public ResponseEntity<ApiResponse<MerchantJpaEntity>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Trạng thái không được để trống"));
        }

        return merchantRepository.findById(id).map(merchant -> {
            merchant.setStatus(status);
            MerchantJpaEntity saved = merchantRepository.save(merchant);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật trạng thái Merchant thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{merchantId}/fee-policy")
    @Operation(summary = "Gán chính sách phí cho Merchant")
    public ResponseEntity<ApiResponse<MerchantJpaEntity>> assignFeePolicy(
            @PathVariable UUID merchantId,
            @RequestBody Map<String, String> body) {

        String feePolicyIdStr = body.get("feePolicyId");
        if (feePolicyIdStr == null || feePolicyIdStr.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "feePolicyId không được để trống"));
        }

        UUID feePolicyId = UUID.fromString(feePolicyIdStr);
        return merchantRepository.findById(merchantId).map(merchant -> {
            merchant.setFeePolicyId(feePolicyId);
            MerchantJpaEntity saved = merchantRepository.save(merchant);
            return ResponseEntity.ok(ApiResponse.success(saved, "Gán chính sách phí thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Merchant")
    public ResponseEntity<byte[]> exportMerchants() {
        String csv = "MerchantCode,MerchantName,TaxCode,Status\nM100001,Cua hang VinMart,0101234567,ACTIVE\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=merchants.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }
}
