package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.DeviceLifecycleJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DeviceLifecycleJpaRepository extends JpaRepository<DeviceLifecycleJpaEntity, UUID> {
    List<DeviceLifecycleJpaEntity> findBySerialNumberOrderByCreatedAtDesc(String serialNumber);
    List<DeviceLifecycleJpaEntity> findByDeviceIdOrderByCreatedAtDesc(UUID deviceId);
}
