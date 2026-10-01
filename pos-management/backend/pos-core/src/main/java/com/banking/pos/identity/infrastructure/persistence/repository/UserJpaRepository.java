package com.banking.pos.identity.infrastructure.persistence.repository;

import com.banking.pos.identity.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA Repository cho bảng `users`.
 *
 * <p>Tại sao implement JpaSpecificationExecutor? Cho phép tạo dynamic query
 * với Specification pattern — cần thiết cho user search với nhiều filter
 * (status, businessUnit, role...) mà không cần viết JPQL cho từng trường hợp.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, UUID>,
        JpaSpecificationExecutor<UserJpaEntity> {

    Optional<UserJpaEntity> findByUsername(String username);

    Optional<UserJpaEntity> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    /** Tăng số lần đăng nhập sai. */
    @Modifying
    @Query("UPDATE UserJpaEntity u SET u.failedLoginAttempts = u.failedLoginAttempts + 1 WHERE u.id = :id")
    void incrementFailedAttempts(@Param("id") UUID id);

    /** Reset đếm sai và cập nhật last_login_at sau đăng nhập thành công. */
    @Modifying
    @Query("UPDATE UserJpaEntity u SET u.failedLoginAttempts = 0, u.lastLoginAt = :loginAt WHERE u.id = :id")
    void resetFailedAttemptsAndUpdateLoginAt(@Param("id") UUID id, @Param("loginAt") Instant loginAt);

    /** Khóa tài khoản đến thời điểm chỉ định. */
    @Modifying
    @Query("UPDATE UserJpaEntity u SET u.status = 'LOCKED', u.lockedUntil = :until WHERE u.id = :id")
    void lockUser(@Param("id") UUID id, @Param("until") Instant until);
}
