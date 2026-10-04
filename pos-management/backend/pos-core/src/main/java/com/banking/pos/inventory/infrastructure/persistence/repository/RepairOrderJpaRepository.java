package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.RepairOrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepairOrderJpaRepository extends JpaRepository<RepairOrderJpaEntity, UUID>,
        JpaSpecificationExecutor<RepairOrderJpaEntity> {
    Optional<RepairOrderJpaEntity> findByRepairCode(String repairCode);

    @Query("SELECT r FROM RepairOrderJpaEntity r WHERE r.deviceId = (SELECT d.id FROM DeviceJpaEntity d WHERE d.serialNumber = :serialNumber) ORDER BY r.createdAt DESC")
    List<RepairOrderJpaEntity> findBySerialNumberOrderByCreatedAtDesc(@Param("serialNumber") String serialNumber);
}

