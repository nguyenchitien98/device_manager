package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.StockTransferJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface StockTransferJpaRepository extends JpaRepository<StockTransferJpaEntity, UUID>,
        JpaSpecificationExecutor<StockTransferJpaEntity> {
    Optional<StockTransferJpaEntity> findByTransferCode(String transferCode);
    long countByTransferCodeStartingWith(String prefix);
}
