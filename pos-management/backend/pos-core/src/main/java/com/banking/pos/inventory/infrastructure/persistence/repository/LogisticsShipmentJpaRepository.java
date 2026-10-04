package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.LogisticsShipmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface LogisticsShipmentJpaRepository extends JpaRepository<LogisticsShipmentJpaEntity, UUID>,
        JpaSpecificationExecutor<LogisticsShipmentJpaEntity> {
    Optional<LogisticsShipmentJpaEntity> findByWaybillNumber(String waybillNumber);
}
