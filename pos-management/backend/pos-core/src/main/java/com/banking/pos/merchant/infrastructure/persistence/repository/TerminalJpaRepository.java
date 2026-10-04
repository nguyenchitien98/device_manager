package com.banking.pos.merchant.infrastructure.persistence.repository;

import com.banking.pos.merchant.infrastructure.persistence.entity.TerminalJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface TerminalJpaRepository extends JpaRepository<TerminalJpaEntity, UUID>,
        JpaSpecificationExecutor<TerminalJpaEntity> {
    Optional<TerminalJpaEntity> findByTid(String tid);
    long countByTidStartingWith(String prefix);
}
