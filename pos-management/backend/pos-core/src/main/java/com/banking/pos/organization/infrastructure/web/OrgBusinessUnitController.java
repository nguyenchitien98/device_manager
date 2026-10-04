package com.banking.pos.organization.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.organization.infrastructure.persistence.entity.BusinessUnitJpaEntity;
import com.banking.pos.organization.infrastructure.persistence.repository.BusinessUnitJpaRepository;
import com.banking.pos.organization.infrastructure.persistence.repository.WarehouseJpaRepository;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organization/business-units")
@RequiredArgsConstructor
@Tag(name = "Organization - Business Units", description = "Quản lý Đơn vị kinh doanh")
public class OrgBusinessUnitController {

    private final BusinessUnitJpaRepository businessUnitRepository;
    private final WarehouseJpaRepository warehouseRepository;

    @GetMapping
    @Operation(summary = "Danh sách Đơn vị kinh doanh")
    public ResponseEntity<ApiResponse<PageResponse<BusinessUnitJpaEntity>>> getBusinessUnits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<BusinessUnitJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("name")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<BusinessUnitJpaEntity> result = businessUnitRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping
    @Operation(summary = "Tạo Đơn vị kinh doanh mới")
    public ResponseEntity<ApiResponse<BusinessUnitJpaEntity>> createBusinessUnit(@RequestBody BusinessUnitJpaEntity request) {
        if (businessUnitRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Mã đơn vị kinh doanh đã tồn tại"));
        }
        request.setIsActive(true);
        BusinessUnitJpaEntity saved = businessUnitRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo đơn vị kinh doanh thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Đơn vị kinh doanh")
    public ResponseEntity<ApiResponse<BusinessUnitJpaEntity>> updateBusinessUnit(
            @PathVariable UUID id,
            @RequestBody BusinessUnitJpaEntity request) {

        return businessUnitRepository.findById(id).map(bu -> {
            bu.setName(request.getName());
            bu.setType(request.getType());
            bu.setAddress(request.getAddress());
            bu.setPhone(request.getPhone());
            if (request.getIsActive() != null) bu.setIsActive(request.getIsActive());
            BusinessUnitJpaEntity saved = businessUnitRepository.save(bu);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật đơn vị kinh doanh thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft Delete Đơn vị kinh doanh")
    public ResponseEntity<ApiResponse<Void>> deleteBusinessUnit(@PathVariable UUID id) {
        if (warehouseRepository.existsByBusinessUnitIdAndIsActiveTrue(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.success("POS-2008: Đơn vị kinh doanh còn Kho đang hoạt động, không thể xóa"));
        }
        return businessUnitRepository.findById(id).map(bu -> {
            bu.setIsActive(false);
            businessUnitRepository.save(bu);
            return ResponseEntity.ok(ApiResponse.<Void>success("Vô hiệu hóa đơn vị kinh doanh thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Đơn vị kinh doanh")
    public ResponseEntity<byte[]> exportBusinessUnits() {
        String csv = "Code,Name,Type,Phone,Status\nBU_HN,Chi nhanh Ha Noi,BRANCH,02439998888,ACTIVE\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=business_units.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }
}
