package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.RepairOrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepairOrderJpaRepository extends JpaRepository<RepairOrderJpaEntity, UUID>,
        JpaSpecificationExecutor<RepairOrderJpaEntity> {
    Optional<RepairOrderJpaEntity> findByRepairCode(String repairCode);
    List<RepairOrderJpaEntity> findBySerialNumberOrderByCreatedAtDesc(String serialNumber);
}
