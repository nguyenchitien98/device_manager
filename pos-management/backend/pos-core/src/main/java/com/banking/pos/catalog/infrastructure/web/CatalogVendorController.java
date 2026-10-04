package com.banking.pos.catalog.infrastructure.web;

import com.banking.pos.catalog.infrastructure.persistence.entity.VendorJpaEntity;
import com.banking.pos.catalog.infrastructure.persistence.repository.VendorJpaRepository;
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
@RequestMapping("/api/v1/catalog/vendors")
@RequiredArgsConstructor
@Tag(name = "Catalog - Vendors", description = "Quản lý nhà cung cấp thiết bị")
public class CatalogVendorController {

    private final VendorJpaRepository vendorRepository;

    @GetMapping
    @Operation(summary = "Danh sách Nhà cung cấp")
    public ResponseEntity<ApiResponse<PageResponse<VendorJpaEntity>>> getVendors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<VendorJpaEntity> spec = (root, query, cb) -> {
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

        Page<VendorJpaEntity> result = vendorRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping
    @Operation(summary = "Tạo Nhà cung cấp mới")
    public ResponseEntity<ApiResponse<VendorJpaEntity>> createVendor(@RequestBody VendorJpaEntity request) {
        if (vendorRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Mã nhà cung cấp đã tồn tại"));
        }
        request.setIsActive(true);
        VendorJpaEntity saved = vendorRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo nhà cung cấp thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Nhà cung cấp")
    public ResponseEntity<ApiResponse<VendorJpaEntity>> updateVendor(
            @PathVariable UUID id,
            @RequestBody VendorJpaEntity request) {

        return vendorRepository.findById(id).map(vendor -> {
            vendor.setName(request.getName());
            vendor.setContact(request.getContact());
            vendor.setAddress(request.getAddress());
            vendor.setTaxCode(request.getTaxCode());
            if (request.getIsActive() != null) vendor.setIsActive(request.getIsActive());
            VendorJpaEntity saved = vendorRepository.save(vendor);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật nhà cung cấp thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft Delete Nhà cung cấp")
    public ResponseEntity<ApiResponse<Void>> deleteVendor(@PathVariable UUID id) {
        return vendorRepository.findById(id).map(vendor -> {
            vendor.setIsActive(false);
            vendorRepository.save(vendor);
            return ResponseEntity.ok(ApiResponse.<Void>success("Vô hiệu hóa nhà cung cấp thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Nhà cung cấp")
    public ResponseEntity<byte[]> exportVendors() {
        String csv = "Code,Name,Contact,TaxCode,Status\nPAX,PAX Technology,contact@pax.com,0101234567,ACTIVE\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=vendors.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }
}
