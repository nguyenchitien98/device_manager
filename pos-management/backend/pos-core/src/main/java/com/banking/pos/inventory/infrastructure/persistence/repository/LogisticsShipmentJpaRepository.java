package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.LogisticsShipmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface LogisticsShipmentJpaRepository extends JpaRepository<LogisticsShipmentJpaEntity, UUID>,
        JpaSpecificationExecutor<LogisticsShipmentJpaEntity> {
    Optional<LogisticsShipmentJpaEntity> findByTrackingNumber(String trackingNumber);

    @Query("SELECT l FROM LogisticsShipmentJpaEntity l WHERE l.trackingNumber = :waybillNumber")
    Optional<LogisticsShipmentJpaEntity> findByWaybillNumber(@Param("waybillNumber") String waybillNumber);
}

