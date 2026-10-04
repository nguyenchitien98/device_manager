package com.banking.pos.catalog.infrastructure.persistence.repository;

import com.banking.pos.catalog.infrastructure.persistence.entity.DeviceTypeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface DeviceTypeJpaRepository extends JpaRepository<DeviceTypeJpaEntity, UUID>,
        JpaSpecificationExecutor<DeviceTypeJpaEntity> {
    Optional<DeviceTypeJpaEntity> findByCode(String code);
    boolean existsByCategoryIdAndIsActiveTrue(UUID categoryId);
}
