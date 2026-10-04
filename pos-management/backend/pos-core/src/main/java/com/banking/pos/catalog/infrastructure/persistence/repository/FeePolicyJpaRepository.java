package com.banking.pos.catalog.infrastructure.persistence.repository;

import com.banking.pos.catalog.infrastructure.persistence.entity.FeePolicyJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface FeePolicyJpaRepository extends JpaRepository<FeePolicyJpaEntity, UUID>,
        JpaSpecificationExecutor<FeePolicyJpaEntity> {
    Optional<FeePolicyJpaEntity> findByCode(String code);
}
