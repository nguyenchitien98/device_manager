package com.banking.pos.catalog.infrastructure.web;

import com.banking.pos.catalog.infrastructure.persistence.entity.DeviceTypeJpaEntity;
import com.banking.pos.catalog.infrastructure.persistence.repository.DeviceModelJpaRepository;
import com.banking.pos.catalog.infrastructure.persistence.repository.DeviceTypeJpaRepository;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/device-types")
@RequiredArgsConstructor
@Tag(name = "Catalog - Device Types", description = "Quản lý loại thiết bị")
public class CatalogTypeController {

    private final DeviceTypeJpaRepository typeRepository;
    private final DeviceModelJpaRepository modelRepository;

    @GetMapping
    @Operation(summary = "Danh sách Loại thiết bị")
    public ResponseEntity<ApiResponse<PageResponse<DeviceTypeJpaEntity>>> getTypes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<DeviceTypeJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("name")), pattern)
                ));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DeviceTypeJpaEntity> result = typeRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping
    @Operation(summary = "Tạo Loại thiết bị mới")
    public ResponseEntity<ApiResponse<DeviceTypeJpaEntity>> createType(@RequestBody DeviceTypeJpaEntity request) {
        if (typeRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Mã loại thiết bị đã tồn tại"));
        }
        request.setIsActive(true);
        DeviceTypeJpaEntity saved = typeRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo loại thiết bị thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Loại thiết bị")
    public ResponseEntity<ApiResponse<DeviceTypeJpaEntity>> updateType(
            @PathVariable UUID id,
            @RequestBody DeviceTypeJpaEntity request) {

        return typeRepository.findById(id).map(type -> {
            type.setName(request.getName());
            type.setDescription(request.getDescription());
            if (request.getCategoryId() != null) type.setCategoryId(request.getCategoryId());
            if (request.getIsActive() != null) type.setIsActive(request.getIsActive());
            DeviceTypeJpaEntity saved = typeRepository.save(type);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật loại thiết bị thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft Delete Loại thiết bị")
    public ResponseEntity<ApiResponse<Void>> deleteType(@PathVariable UUID id) {
        if (modelRepository.existsByDeviceTypeIdAndIsActiveTrue(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.success("POS-2008: Loại thiết bị còn Model đang hoạt động, không thể xóa"));
        }
        return typeRepository.findById(id).map(type -> {
            type.setIsActive(false);
            typeRepository.save(type);
            return ResponseEntity.ok(ApiResponse.<Void>success("Vô hiệu hóa loại thiết bị thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Loại thiết bị")
    public ResponseEntity<byte[]> exportTypes() {
        String csv = "Code,Name,CategoryId,Status\nPOS_CONTACTLESS,Contactless POS,,ACTIVE\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=device_types.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }
}
