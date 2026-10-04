package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.NotificationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationJpaRepository extends JpaRepository<NotificationJpaEntity, UUID> {
    List<NotificationJpaEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<NotificationJpaEntity> findByUserIdAndIsReadFalse(UUID userId);
    long countByUserIdAndIsReadFalse(UUID userId);
    long countByIsReadFalse();
}
