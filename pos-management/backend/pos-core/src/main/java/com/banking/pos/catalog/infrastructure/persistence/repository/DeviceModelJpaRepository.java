package com.banking.pos.catalog.infrastructure.persistence.repository;

import com.banking.pos.catalog.infrastructure.persistence.entity.DeviceModelJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface DeviceModelJpaRepository extends JpaRepository<DeviceModelJpaEntity, UUID>,
        JpaSpecificationExecutor<DeviceModelJpaEntity> {
    Optional<DeviceModelJpaEntity> findByCode(String code);
    boolean existsByDeviceTypeIdAndIsActiveTrue(UUID deviceTypeId);
}
