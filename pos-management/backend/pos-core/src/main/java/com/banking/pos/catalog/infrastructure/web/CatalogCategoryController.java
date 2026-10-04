package com.banking.pos.catalog.infrastructure.web;

import com.banking.pos.catalog.infrastructure.persistence.entity.DeviceCategoryJpaEntity;
import com.banking.pos.catalog.infrastructure.persistence.repository.DeviceCategoryJpaRepository;
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
@RequestMapping("/api/v1/catalog/device-categories")
@RequiredArgsConstructor
@Tag(name = "Catalog - Device Categories", description = "Quản lý danh mục thiết bị")
public class CatalogCategoryController {

    private final DeviceCategoryJpaRepository categoryRepository;
    private final DeviceTypeJpaRepository typeRepository;

    @GetMapping
    @Operation(summary = "Danh sách Danh mục thiết bị")
    public ResponseEntity<ApiResponse<PageResponse<DeviceCategoryJpaEntity>>> getCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<DeviceCategoryJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("name")), pattern)
                ));
            }
            if (code != null && !code.isBlank()) {
                predicates.add(cb.equal(root.get("code"), code.trim()));
            }
            if (name != null && !name.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.trim().toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("isActive"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DeviceCategoryJpaEntity> result = categoryRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping
    @Operation(summary = "Tạo Danh mục thiết bị mới")
    public ResponseEntity<ApiResponse<DeviceCategoryJpaEntity>> createCategory(@RequestBody DeviceCategoryJpaEntity request) {
        if (categoryRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Mã danh mục đã tồn tại"));
        }
        request.setIsActive(true);
        DeviceCategoryJpaEntity saved = categoryRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo danh mục thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Danh mục thiết bị")
    public ResponseEntity<ApiResponse<DeviceCategoryJpaEntity>> updateCategory(
            @PathVariable UUID id,
            @RequestBody DeviceCategoryJpaEntity request) {

        return categoryRepository.findById(id).map(cat -> {
            cat.setName(request.getName());
            cat.setDescription(request.getDescription());
            if (request.getIsActive() != null) cat.setIsActive(request.getIsActive());
            DeviceCategoryJpaEntity saved = categoryRepository.save(cat);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật danh mục thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft Delete (vô hiệu hóa) Danh mục thiết bị")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        if (typeRepository.existsByCategoryIdAndIsActiveTrue(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.success("POS-2008: Danh mục còn Loại thiết bị đang hoạt động, không thể xóa"));
        }
        return categoryRepository.findById(id).map(cat -> {
            cat.setIsActive(false);
            categoryRepository.save(cat);
            return ResponseEntity.ok(ApiResponse.<Void>success("Vô hiệu hóa danh mục thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Danh mục thiết bị")
    public ResponseEntity<byte[]> exportCategories() {
        String csv = "Code,Name,Description,Status\nPOS,POS Terminal,Thiet bi POS,ACTIVE\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=device_categories.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }
}
