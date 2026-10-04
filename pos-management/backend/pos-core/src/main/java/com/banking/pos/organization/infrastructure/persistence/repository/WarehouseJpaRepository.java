package com.banking.pos.organization.infrastructure.persistence.repository;

import com.banking.pos.organization.infrastructure.persistence.entity.WarehouseJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface WarehouseJpaRepository extends JpaRepository<WarehouseJpaEntity, UUID>,
        JpaSpecificationExecutor<WarehouseJpaEntity> {
    Optional<WarehouseJpaEntity> findByCode(String code);
    boolean existsByBusinessUnitIdAndIsActiveTrue(UUID businessUnitId);
}
