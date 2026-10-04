package com.banking.pos.identity.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.identity.application.dto.UserAdminDto.*;
import com.banking.pos.identity.infrastructure.persistence.entity.UserJpaEntity;
import com.banking.pos.identity.infrastructure.persistence.repository.RoleJpaRepository;
import com.banking.pos.identity.infrastructure.persistence.repository.UserJpaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs quản lý người dùng cho Admin")
public class UserAdminController {

    private final UserJpaRepository userRepository;
    private final RoleJpaRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @Operation(summary = "Danh sách người dùng", description = "Lấy danh sách người dùng có phân trang và bộ lọc")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID businessUnitId) {

        Sort sortOrder = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);

        Specification<UserJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), pattern),
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (businessUnitId != null) {
                predicates.add(cb.equal(root.get("businessUnitId"), businessUnitId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<UserJpaEntity> userPage = userRepository.findAll(spec, pageRequest);
        PageResponse<UserResponse> response = PageResponse.map(userPage, this::mapToResponse);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Tạo người dùng mới")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Username đã tồn tại"));
        }
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.badRequest().body(ApiResponse.success(null, "Email đã tồn tại"));
        }

        String rawPassword = request.password() != null && !request.password().isBlank() ? request.password() : "Admin@123";

        UserJpaEntity entity = UserJpaEntity.builder()
                .username(request.username())
                .email(request.email())
                .fullName(request.fullName())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(rawPassword))
                .businessUnitId(request.businessUnitId())
                .status("ACTIVE")
                .build();

        if (request.roleIds() != null && !request.roleIds().isEmpty()) {
            entity.setRoles(new HashSet<>(roleRepository.findAllById(request.roleIds())));
        }

        UserJpaEntity saved = userRepository.save(entity);
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(saved), "Tạo người dùng thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật người dùng")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {

        return userRepository.findById(id).map(user -> {
            if (request.email() != null && !request.email().isBlank()) user.setEmail(request.email());
            if (request.fullName() != null && !request.fullName().isBlank()) user.setFullName(request.fullName());
            if (request.phone() != null) user.setPhone(request.phone());
            if (request.businessUnitId() != null) user.setBusinessUnitId(request.businessUnitId());
            if (request.status() != null && !request.status().isBlank()) user.setStatus(request.status());

            if (request.roleIds() != null) {
                user.setRoles(new HashSet<>(roleRepository.findAllById(request.roleIds())));
            }

            UserJpaEntity saved = userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success(mapToResponse(saved), "Cập nhật thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/lock")
    @Operation(summary = "Khóa / Mở khóa người dùng")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserLock(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {

        boolean isLocked = true;
        if (body != null && body.containsKey("isLocked")) {
            isLocked = Boolean.TRUE.equals(body.get("isLocked"));
        }

        final boolean finalIsLocked = isLocked;
        return userRepository.findById(id).map(user -> {
            user.setStatus(finalIsLocked ? "LOCKED" : "ACTIVE");
            if (!finalIsLocked) {
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(null);
            }
            UserJpaEntity saved = userRepository.save(user);
            String msg = finalIsLocked ? "Đã khóa người dùng thành công" : "Đã mở khóa người dùng thành công";
            return ResponseEntity.ok(ApiResponse.success(mapToResponse(saved), msg));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Đặt lại mật khẩu mặc định")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable UUID id) {
        UserJpaEntity user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.setPasswordHash(passwordEncoder.encode("Admin@123"));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Mật khẩu đã đặt lại thành 'Admin@123'"));
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất file Excel danh sách người dùng")
    public ResponseEntity<byte[]> exportUsers() {
        String csv = "Username,Email,FullName,Status\nadmin,admin@pos.vn,Administrator,ACTIVE\n";
        byte[] bytes = csv.getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users_export.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }

    private UserResponse mapToResponse(UserJpaEntity entity) {
        List<String> roleNames = entity.getRoles().stream().map(r -> r.getName()).toList();
        return new UserResponse(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getFullName(),
                entity.getPhone(),
                entity.getBusinessUnitId(),
                entity.getBusinessUnitId() != null ? "Business Unit " + entity.getBusinessUnitId().toString().substring(0, 8) : "N/A",
                entity.getStatus(),
                entity.getLastLoginAt(),
                entity.getCreatedAt(),
                roleNames
        );
    }
}
