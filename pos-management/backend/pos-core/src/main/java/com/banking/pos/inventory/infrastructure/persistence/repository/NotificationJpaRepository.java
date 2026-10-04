package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.NotificationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NotificationJpaRepository extends JpaRepository<NotificationJpaEntity, UUID> {
    List<NotificationJpaEntity> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);
    List<NotificationJpaEntity> findByRecipientIdAndIsReadFalse(UUID recipientId);
    long countByRecipientIdAndIsReadFalse(UUID recipientId);

    @Query("SELECT n FROM NotificationJpaEntity n WHERE n.recipientId = :userId ORDER BY n.createdAt DESC")
    List<NotificationJpaEntity> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT n FROM NotificationJpaEntity n WHERE n.recipientId = :userId AND n.isRead = false")
    List<NotificationJpaEntity> findByUserIdAndIsReadFalse(@Param("userId") UUID userId);

    @Query("SELECT COUNT(n) FROM NotificationJpaEntity n WHERE n.recipientId = :userId AND n.isRead = false")
    long countByUserIdAndIsReadFalse(@Param("userId") UUID userId);

    long countByIsReadFalse();
}

