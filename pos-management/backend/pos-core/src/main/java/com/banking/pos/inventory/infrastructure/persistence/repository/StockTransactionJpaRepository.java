package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.StockTransactionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface StockTransactionJpaRepository extends JpaRepository<StockTransactionJpaEntity, UUID>,
        JpaSpecificationExecutor<StockTransactionJpaEntity> {
    List<StockTransactionJpaEntity> findByDeviceIdOrderByCreatedAtDesc(UUID deviceId);

    @Query("SELECT st FROM StockTransactionJpaEntity st WHERE st.deviceId = (SELECT d.id FROM DeviceJpaEntity d WHERE d.serialNumber = :serialNumber) ORDER BY st.createdAt DESC")
    List<StockTransactionJpaEntity> findBySerialNumberOrderByCreatedAtDesc(@Param("serialNumber") String serialNumber);
}

