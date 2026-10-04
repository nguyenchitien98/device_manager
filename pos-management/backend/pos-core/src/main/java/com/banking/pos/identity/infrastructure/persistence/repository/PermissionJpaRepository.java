package com.banking.pos.identity.infrastructure.persistence.repository;

import com.banking.pos.identity.infrastructure.persistence.entity.PermissionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PermissionJpaRepository extends JpaRepository<PermissionJpaEntity, UUID> {
    Optional<PermissionJpaEntity> findByCode(String code);
    List<PermissionJpaEntity> findByCodeIn(List<String> codes);
}
