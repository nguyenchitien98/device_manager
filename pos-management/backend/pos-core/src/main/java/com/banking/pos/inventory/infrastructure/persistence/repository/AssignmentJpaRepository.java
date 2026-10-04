package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.AssignmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssignmentJpaRepository extends JpaRepository<AssignmentJpaEntity, UUID>,
        JpaSpecificationExecutor<AssignmentJpaEntity> {
    Optional<AssignmentJpaEntity> findByAssignmentCode(String assignmentCode);
    List<AssignmentJpaEntity> findByDeviceIdOrderByCreatedAtDesc(UUID deviceId);

    @Query("SELECT a FROM AssignmentJpaEntity a WHERE a.deviceId = (SELECT d.id FROM DeviceJpaEntity d WHERE d.serialNumber = :serialNumber) ORDER BY a.createdAt DESC")
    List<AssignmentJpaEntity> findBySerialNumberOrderByCreatedAtDesc(@Param("serialNumber") String serialNumber);

    @Query("SELECT a FROM AssignmentJpaEntity a WHERE a.deviceId = (SELECT d.id FROM DeviceJpaEntity d WHERE d.serialNumber = :serialNumber) AND a.status = :status")
    Optional<AssignmentJpaEntity> findBySerialNumberAndStatus(@Param("serialNumber") String serialNumber, @Param("status") String status);
}

