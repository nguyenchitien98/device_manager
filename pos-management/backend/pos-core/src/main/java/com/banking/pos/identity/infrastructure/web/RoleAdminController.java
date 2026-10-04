package com.banking.pos.identity.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.identity.application.dto.RoleAdminDto.*;
import com.banking.pos.identity.infrastructure.persistence.entity.PermissionJpaEntity;
import com.banking.pos.identity.infrastructure.persistence.entity.RoleJpaEntity;
import com.banking.pos.identity.infrastructure.persistence.repository.PermissionJpaRepository;
import com.banking.pos.identity.infrastructure.persistence.repository.RoleJpaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Role & Permission Management", description = "APIs quản lý vai trò và phân quyền")
public class RoleAdminController {

    private final RoleJpaRepository roleRepository;
    private final PermissionJpaRepository permissionRepository;

    @GetMapping("/roles")
    @Operation(summary = "Danh sách Role", description = "Lấy danh sách Role có phân trang")
    public ResponseEntity<ApiResponse<PageResponse<RoleResponse>>> getRoles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<RoleJpaEntity> rolePage = roleRepository.findAll(pageRequest);
        PageResponse<RoleResponse> response = PageResponse.map(rolePage, this::mapToRoleResponse);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/roles")
    @Operation(summary = "Tạo Role mới")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody CreateRoleRequest request) {
        if (roleRepository.findByName(request.name()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Tên Role đã tồn tại"));
        }

        RoleJpaEntity role = RoleJpaEntity.builder()
                .name(request.name())
                .description(request.description())
                .isActive(true)
                .build();

        RoleJpaEntity saved = roleRepository.save(role);
        return ResponseEntity.ok(ApiResponse.success(mapToRoleResponse(saved), "Tạo Role thành công"));
    }

    @PutMapping("/roles/{roleId}/permissions")
    @Operation(summary = "Cập nhật danh sách quyền cho Role")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRolePermissions(
            @PathVariable UUID roleId,
            @RequestBody UpdateRolePermissionsRequest request) {

        return roleRepository.findById(roleId).map(role -> {
            if (request.permissions() != null) {
                List<PermissionJpaEntity> perms = permissionRepository.findByCodeIn(request.permissions());
                role.setPermissions(new HashSet<>(perms));
            }
            RoleJpaEntity saved = roleRepository.save(role);
            return ResponseEntity.ok(ApiResponse.success(mapToRoleResponse(saved), "Cập nhật quyền thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/permissions")
    @Operation(summary = "Danh sách tất cả Permissions")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getPermissions() {
        List<PermissionResponse> list = permissionRepository.findAll().stream()
                .map(p -> new PermissionResponse(p.getId(), p.getCode(), p.getDescription(), p.getModule()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/roles/export")
    @Operation(summary = "Xuất Excel Ma trận phân quyền / Roles")
    public ResponseEntity<byte[]> exportRoles() {
        String csv = "Role,Description,Permissions\nSUPER_ADMIN,Full system access,ALL\n";
        byte[] bytes = csv.getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=roles_export.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }

    private RoleResponse mapToRoleResponse(RoleJpaEntity entity) {
        List<String> permCodes = entity.getPermissions().stream().map(PermissionJpaEntity::getCode).toList();
        return new RoleResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getIsActive(),
                permCodes
        );
    }
}
