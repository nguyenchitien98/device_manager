package com.banking.pos.telecom.infrastructure.persistence.repository;

import com.banking.pos.telecom.infrastructure.persistence.entity.SamCardJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SamCardJpaRepository extends JpaRepository<SamCardJpaEntity, UUID>, JpaSpecificationExecutor<SamCardJpaEntity> {
    Optional<SamCardJpaEntity> findBySamSerial(String samSerial);
    boolean existsBySamSerial(String samSerial);
}
