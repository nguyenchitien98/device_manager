package com.banking.pos.catalog.infrastructure.persistence.repository;

import com.banking.pos.catalog.infrastructure.persistence.entity.DeviceCategoryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface DeviceCategoryJpaRepository extends JpaRepository<DeviceCategoryJpaEntity, UUID>,
        JpaSpecificationExecutor<DeviceCategoryJpaEntity> {
    Optional<DeviceCategoryJpaEntity> findByCode(String code);
}
