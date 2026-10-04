package com.banking.pos.system.infrastructure.persistence.repository;

import com.banking.pos.system.infrastructure.persistence.entity.SystemConfigJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SystemConfigJpaRepository extends JpaRepository<SystemConfigJpaEntity, UUID> {
    Optional<SystemConfigJpaEntity> findByConfigKey(String configKey);
}
