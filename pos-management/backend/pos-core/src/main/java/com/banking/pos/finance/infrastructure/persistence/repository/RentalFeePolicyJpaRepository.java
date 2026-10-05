package com.banking.pos.finance.infrastructure.persistence.repository;

import com.banking.pos.finance.infrastructure.persistence.entity.RentalFeePolicyJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RentalFeePolicyJpaRepository extends JpaRepository<RentalFeePolicyJpaEntity, Long> {
    Optional<RentalFeePolicyJpaEntity> findByCode(String code);
}
