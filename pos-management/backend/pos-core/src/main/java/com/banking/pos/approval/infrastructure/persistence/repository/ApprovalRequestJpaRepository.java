package com.banking.pos.approval.infrastructure.persistence.repository;

import com.banking.pos.approval.infrastructure.persistence.entity.ApprovalRequestJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ApprovalRequestJpaRepository extends JpaRepository<ApprovalRequestJpaEntity, UUID>,
        JpaSpecificationExecutor<ApprovalRequestJpaEntity> {
    Optional<ApprovalRequestJpaEntity> findByRequestCode(String requestCode);
    long countByStatus(String status);
    long countByCreatorId(UUID creatorId);
}
