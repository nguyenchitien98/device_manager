package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.AssignmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssignmentJpaRepository extends JpaRepository<AssignmentJpaEntity, UUID>,
        JpaSpecificationExecutor<AssignmentJpaEntity> {
    Optional<AssignmentJpaEntity> findByAssignmentCode(String assignmentCode);
    List<AssignmentJpaEntity> findBySerialNumberOrderByCreatedAtDesc(String serialNumber);
    Optional<AssignmentJpaEntity> findBySerialNumberAndStatus(String serialNumber, String status);
}
