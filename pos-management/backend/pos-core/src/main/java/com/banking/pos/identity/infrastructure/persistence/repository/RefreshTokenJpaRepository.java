package com.banking.pos.identity.infrastructure.persistence.repository;

import com.banking.pos.identity.infrastructure.persistence.entity.RefreshTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository cho bảng `refresh_tokens`.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
public interface RefreshTokenJpaRepository extends JpaRepository<RefreshTokenJpaEntity, UUID> {

    Optional<RefreshTokenJpaEntity> findByTokenHash(String tokenHash);

    /** Thu hồi toàn bộ refresh token của user (dùng khi logout hoặc đổi mật khẩu). */
    @Modifying
    @Query("UPDATE RefreshTokenJpaEntity rt SET rt.isRevoked = true WHERE rt.userId = :userId")
    void revokeAllByUserId(@Param("userId") UUID userId);

    /** Xóa token hết hạn để dọn dẹp DB định kỳ. */
    @Modifying
    @Query("DELETE FROM RefreshTokenJpaEntity rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") Instant now);
}
