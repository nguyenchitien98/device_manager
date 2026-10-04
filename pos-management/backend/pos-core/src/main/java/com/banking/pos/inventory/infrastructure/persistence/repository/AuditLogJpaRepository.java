package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.AuditLogJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface AuditLogJpaRepository extends JpaRepository<AuditLogJpaEntity, UUID>,
        JpaSpecificationExecutor<AuditLogJpaEntity> {
}
