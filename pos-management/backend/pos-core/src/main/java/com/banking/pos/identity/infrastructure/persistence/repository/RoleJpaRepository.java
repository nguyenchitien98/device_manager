package com.banking.pos.identity.infrastructure.persistence.repository;

import com.banking.pos.identity.infrastructure.persistence.entity.RoleJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository cho bảng `roles`.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
public interface RoleJpaRepository extends JpaRepository<RoleJpaEntity, UUID> {

    Optional<RoleJpaEntity> findByName(String name);

    boolean existsByName(String name);
}
