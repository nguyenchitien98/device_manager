package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.DeviceJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceJpaRepository extends JpaRepository<DeviceJpaEntity, UUID>,
        JpaSpecificationExecutor<DeviceJpaEntity> {
    Optional<DeviceJpaEntity> findBySerialNumber(String serialNumber);
    boolean existsBySerialNumber(String serialNumber);
    List<DeviceJpaEntity> findByWarehouseIdAndStatus(UUID warehouseId, String status);
    List<DeviceJpaEntity> findByWarehouseIdAndDeviceModelIdAndStatus(UUID warehouseId, UUID deviceModelId, String status);
}
