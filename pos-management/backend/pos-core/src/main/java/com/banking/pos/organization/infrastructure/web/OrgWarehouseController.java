package com.banking.pos.organization.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.organization.infrastructure.persistence.entity.WarehouseJpaEntity;
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
@RequestMapping("/api/v1/organization/warehouses")
@RequiredArgsConstructor
@Tag(name = "Organization - Warehouses", description = "Quản lý Kho thiết bị")
public class OrgWarehouseController {

    private final WarehouseJpaRepository warehouseRepository;

    @GetMapping
    @Operation(summary = "Danh sách Kho thiết bị")
    public ResponseEntity<ApiResponse<PageResponse<WarehouseJpaEntity>>> getWarehouses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) UUID businessUnitId,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<WarehouseJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("name")), pattern)
                ));
            }
            if (businessUnitId != null) {
                predicates.add(cb.equal(root.get("businessUnitId"), businessUnitId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<WarehouseJpaEntity> result = warehouseRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping
    @Operation(summary = "Tạo Kho thiết bị mới")
    public ResponseEntity<ApiResponse<WarehouseJpaEntity>> createWarehouse(@RequestBody WarehouseJpaEntity request) {
        if (warehouseRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Mã kho thiết bị đã tồn tại"));
        }
        request.setIsActive(true);
        WarehouseJpaEntity saved = warehouseRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo kho thiết bị thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Kho thiết bị")
    public ResponseEntity<ApiResponse<WarehouseJpaEntity>> updateWarehouse(
            @PathVariable UUID id,
            @RequestBody WarehouseJpaEntity request) {

        return warehouseRepository.findById(id).map(wh -> {
            wh.setName(request.getName());
            wh.setAddress(request.getAddress());
            if (request.getBusinessUnitId() != null) wh.setBusinessUnitId(request.getBusinessUnitId());
            if (request.getIsActive() != null) wh.setIsActive(request.getIsActive());
            WarehouseJpaEntity saved = warehouseRepository.save(wh);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật kho thiết bị thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft Delete Kho thiết bị")
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(@PathVariable UUID id) {
        return warehouseRepository.findById(id).map(wh -> {
            wh.setIsActive(false);
            warehouseRepository.save(wh);
            return ResponseEntity.ok(ApiResponse.<Void>success("Vô hiệu hóa kho thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Kho thiết bị")
    public ResponseEntity<byte[]> exportWarehouses() {
        String csv = "Code,Name,BusinessUnitId,Status\nKHO_TT_HN,Kho Trung tam Ha Noi,,ACTIVE\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=warehouses.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }
}
