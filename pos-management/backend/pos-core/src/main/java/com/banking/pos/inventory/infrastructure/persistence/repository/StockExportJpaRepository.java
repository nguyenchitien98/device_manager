package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.StockExportJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface StockExportJpaRepository extends JpaRepository<StockExportJpaEntity, UUID>,
        JpaSpecificationExecutor<StockExportJpaEntity> {
    Optional<StockExportJpaEntity> findByExportCode(String exportCode);
    long countByExportCodeStartingWith(String prefix);
}
