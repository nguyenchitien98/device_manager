package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.PurchaseOrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface PurchaseOrderJpaRepository extends JpaRepository<PurchaseOrderJpaEntity, UUID>,
        JpaSpecificationExecutor<PurchaseOrderJpaEntity> {
    Optional<PurchaseOrderJpaEntity> findByPoNumber(String poNumber);
    long countByPoNumberStartingWith(String prefix);
}
