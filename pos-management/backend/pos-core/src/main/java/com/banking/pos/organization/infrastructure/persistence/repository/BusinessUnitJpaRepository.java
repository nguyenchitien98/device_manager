package com.banking.pos.organization.infrastructure.persistence.repository;

import com.banking.pos.organization.infrastructure.persistence.entity.BusinessUnitJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface BusinessUnitJpaRepository extends JpaRepository<BusinessUnitJpaEntity, UUID>,
        JpaSpecificationExecutor<BusinessUnitJpaEntity> {
    Optional<BusinessUnitJpaEntity> findByCode(String code);
}
