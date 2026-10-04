package com.banking.pos.catalog.infrastructure.persistence.repository;

import com.banking.pos.catalog.infrastructure.persistence.entity.VendorJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface VendorJpaRepository extends JpaRepository<VendorJpaEntity, UUID>,
        JpaSpecificationExecutor<VendorJpaEntity> {
    Optional<VendorJpaEntity> findByCode(String code);
}
