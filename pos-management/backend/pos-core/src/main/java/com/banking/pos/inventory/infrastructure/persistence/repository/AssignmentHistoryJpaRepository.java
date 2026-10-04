package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.AssignmentHistoryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface AssignmentHistoryJpaRepository extends JpaRepository<AssignmentHistoryJpaEntity, UUID>,
        JpaSpecificationExecutor<AssignmentHistoryJpaEntity> {
    List<AssignmentHistoryJpaEntity> findBySerialNumberOrderByCreatedAtDesc(String serialNumber);
}
