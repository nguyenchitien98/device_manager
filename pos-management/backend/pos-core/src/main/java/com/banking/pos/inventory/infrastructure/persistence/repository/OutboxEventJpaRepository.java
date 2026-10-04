package com.banking.pos.inventory.infrastructure.persistence.repository;

import com.banking.pos.inventory.infrastructure.persistence.entity.OutboxEventJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface OutboxEventJpaRepository extends JpaRepository<OutboxEventJpaEntity, UUID>,
        JpaSpecificationExecutor<OutboxEventJpaEntity> {
    List<OutboxEventJpaEntity> findTop50ByStatusOrderByCreatedAtAsc(String status);
}
