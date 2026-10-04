package com.banking.pos.catalog.infrastructure.persistence.repository;

import com.banking.pos.catalog.infrastructure.persistence.entity.MccCodeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface MccCodeJpaRepository extends JpaRepository<MccCodeJpaEntity, UUID>,
        JpaSpecificationExecutor<MccCodeJpaEntity> {
    Optional<MccCodeJpaEntity> findByCode(String code);
}
