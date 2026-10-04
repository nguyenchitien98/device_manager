package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.StockTransactionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface StockTransactionJpaRepository extends JpaRepository<StockTransactionJpaEntity, UUID>,
        JpaSpecificationExecutor<StockTransactionJpaEntity> {
    List<StockTransactionJpaEntity> findBySerialNumberOrderByCreatedAtDesc(String serialNumber);
}
