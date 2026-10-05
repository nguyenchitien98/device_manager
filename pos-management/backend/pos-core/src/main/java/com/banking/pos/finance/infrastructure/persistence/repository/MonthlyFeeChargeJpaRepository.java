package com.banking.pos.finance.infrastructure.persistence.repository;

import com.banking.pos.finance.infrastructure.persistence.entity.MonthlyFeeChargeJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyFeeChargeJpaRepository extends JpaRepository<MonthlyFeeChargeJpaEntity, Long> {
    Page<MonthlyFeeChargeJpaEntity> findByPeriodContaining(String period, Pageable pageable);
    List<MonthlyFeeChargeJpaEntity> findByPeriod(String period);
    Optional<MonthlyFeeChargeJpaEntity> findByPeriodAndMerchantId(String period, Long merchantId);
}
