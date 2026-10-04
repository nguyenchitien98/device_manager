package com.banking.pos.catalog.infrastructure.web;

import com.banking.pos.catalog.infrastructure.persistence.entity.MccCodeJpaEntity;
import com.banking.pos.catalog.infrastructure.persistence.repository.MccCodeJpaRepository;
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
@RequestMapping("/api/v1/catalog/mcc")
@RequiredArgsConstructor
@Tag(name = "Catalog - MCC Codes", description = "Quản lý mã ngành MCC")
public class CatalogMccController {

    private final MccCodeJpaRepository mccRepository;

    @GetMapping
    @Operation(summary = "Danh sách Mã ngành MCC")
    public ResponseEntity<ApiResponse<PageResponse<MccCodeJpaEntity>>> getMccCodes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "code") String sort,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<MccCodeJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("category")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<MccCodeJpaEntity> result = mccRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping
    @Operation(summary = "Tạo Mã MCC mới")
    public ResponseEntity<ApiResponse<MccCodeJpaEntity>> createMcc(@RequestBody MccCodeJpaEntity request) {
        if (mccRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Mã MCC đã tồn tại"));
        }
        request.setIsActive(true);
        MccCodeJpaEntity saved = mccRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo MCC thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Mã MCC")
    public ResponseEntity<ApiResponse<MccCodeJpaEntity>> updateMcc(
            @PathVariable UUID id,
            @RequestBody MccCodeJpaEntity request) {

        return mccRepository.findById(id).map(mcc -> {
            mcc.setName(request.getName());
            mcc.setCategory(request.getCategory());
            mcc.setDescription(request.getDescription());
            if (request.getIsActive() != null) mcc.setIsActive(request.getIsActive());
            MccCodeJpaEntity saved = mccRepository.save(mcc);
            return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật MCC thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft Delete Mã MCC")
    public ResponseEntity<ApiResponse<Void>> deleteMcc(@PathVariable UUID id) {
        return mccRepository.findById(id).map(mcc -> {
            mcc.setIsActive(false);
            mccRepository.save(mcc);
            return ResponseEntity.ok(ApiResponse.<Void>success("Vô hiệu hóa MCC thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Danh sách MCC")
    public ResponseEntity<byte[]> exportMcc() {
        String csv = "Code,Name,Category,Status\n5411,Supermarkets,Grocery Stores,ACTIVE\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=mcc_codes.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }
}
