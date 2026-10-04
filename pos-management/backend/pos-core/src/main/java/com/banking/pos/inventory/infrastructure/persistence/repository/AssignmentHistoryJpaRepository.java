package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.AssignmentHistoryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AssignmentHistoryJpaRepository extends JpaRepository<AssignmentHistoryJpaEntity, UUID>,
        JpaSpecificationExecutor<AssignmentHistoryJpaEntity> {
    List<AssignmentHistoryJpaEntity> findByDeviceIdOrderByCreatedAtDesc(UUID deviceId);

    @Query("SELECT ah FROM AssignmentHistoryJpaEntity ah WHERE ah.deviceId = (SELECT d.id FROM DeviceJpaEntity d WHERE d.serialNumber = :serialNumber) ORDER BY ah.createdAt DESC")
    List<AssignmentHistoryJpaEntity> findBySerialNumberOrderByCreatedAtDesc(@Param("serialNumber") String serialNumber);
}

