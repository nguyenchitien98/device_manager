package com.banking.pos.merchant.infrastructure.persistence.repository;

import com.banking.pos.merchant.infrastructure.persistence.entity.MerchantJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface MerchantJpaRepository extends JpaRepository<MerchantJpaEntity, UUID>,
        JpaSpecificationExecutor<MerchantJpaEntity> {
    Optional<MerchantJpaEntity> findByMerchantCode(String merchantCode);
    long countByMerchantCodeStartingWith(String prefix);
}
