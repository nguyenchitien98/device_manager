package com.banking.pos.identity.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * JPA Entity ánh xạ bảng `users` — người dùng trong hệ thống POS Management.
 *
 * <p>Tại sao class này là JpaEntity thay vì User trực tiếp? Kiến trúc Hexagonal
 * tách biệt Domain Model (POJO thuần túy) khỏi JPA Entity để domain logic
 * không phụ thuộc vào annotation của framework. Entity chỉ là adapter layer.
 *
 * <p>@Version đảm bảo Optimistic Locking — khi 2 request đồng thời cập nhật
 * cùng một user, chỉ một request thành công; request còn lại nhận OptimisticLockException.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "business_unit_id")
    private UUID businessUnitId;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "failed_login_attempts", nullable = false)
    @Builder.Default
    private int failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<RoleJpaEntity> roles = new HashSet<>();

    /**
     * Kiểm tra tài khoản có bị khóa hay không tại thời điểm hiện tại.
     *
     * @return true nếu tài khoản đang bị khóa
     */
    public boolean isCurrentlyLocked() {
        return "LOCKED".equals(status) ||
                (lockedUntil != null && Instant.now().isBefore(lockedUntil));
    }
}
