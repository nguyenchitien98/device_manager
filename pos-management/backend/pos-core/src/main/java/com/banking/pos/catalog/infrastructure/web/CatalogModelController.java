package com.banking.pos.catalog.infrastructure.web;

import com.banking.pos.catalog.infrastructure.persistence.entity.DeviceModelJpaEntity;
import com.banking.pos.catalog.infrastructure.persistence.repository.DeviceModelJpaRepository;
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
@RequestMapping("/api/v1/catalog/device-models")
@RequiredArgsConstructor
@Tag(name = "Catalog - Device Models", description = "Quản lý Model POS")
public class CatalogModelController {

    private final DeviceModelJpaRepository modelRepository;

    @GetMapping
    @Operation(summary = "Danh sách Model POS")
    public ResponseEntity<ApiResponse<PageResponse<DeviceModelJpaEntity>>> getModels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) UUID deviceTypeId,
            @RequestParam(required = false) UUID vendorId,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<DeviceModelJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("name")), pattern)
                ));
            }
            if (deviceTypeId != null) {
                predicates.add(cb.equal(root.get("deviceTypeId"), deviceTypeId));
            }
            if (vendorId != null) {
                predicates.add(cb.equal(root.get("vendorId"), vendorId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DeviceModelJpaEntity> result = modelRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping
    @Operation(summary = "Tạo Model POS mới")
    public ResponseEntity<ApiResponse<DeviceModelJpaEntity>> createModel(@RequestBody DeviceModelJpaEntity request) {
        if (modelRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Mã Model đã tồn tại"));
        }
        request.setIsActive(true);
        DeviceModelJpaEntity saved = modelRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo Model thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Model POS")
    public ResponseEntity<ApiResponse<DeviceModelJpaEntity>> updateModel(
            @PathVariable UUID id,
            @RequestBody DeviceModelJpaEntity request) {

        return modelRepository.findById(id).map(model -> {
            model.setName(request.getName());
            model.setDescription(request.getDescription());
            if (request.getDeviceTypeId() != null) model.setDeviceTypeId(request.getDeviceTypeId());
            if (request.getVendorId() != null) model.setVendorId(request.getVendorId());
            if (request.getIsActive() != null) model.setIsActive(request.getIsActive());
            DeviceModelJpaEntity saved = modelRepository.save(model);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật Model thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft Delete Model POS")
    public ResponseEntity<ApiResponse<Void>> deleteModel(@PathVariable UUID id) {
        return modelRepository.findById(id).map(model -> {
            model.setIsActive(false);
            modelRepository.save(model);
            return ResponseEntity.ok(ApiResponse.<Void>success("Vô hiệu hóa Model thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Model POS")
    public ResponseEntity<byte[]> exportModels() {
        String csv = "Code,Name,DeviceTypeId,VendorId,Status\nPAX_A920,PAX A920 Smart POS,,,ACTIVE\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=device_models.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }
}
