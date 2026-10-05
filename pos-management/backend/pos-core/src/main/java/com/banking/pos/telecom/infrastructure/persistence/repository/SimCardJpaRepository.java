package com.banking.pos.telecom.infrastructure.persistence.repository;

import com.banking.pos.telecom.infrastructure.persistence.entity.SimCardJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SimCardJpaRepository extends JpaRepository<SimCardJpaEntity, UUID>, JpaSpecificationExecutor<SimCardJpaEntity> {
    Optional<SimCardJpaEntity> findBySimSerial(String simSerial);
    Optional<SimCardJpaEntity> findByPhoneNumber(String phoneNumber);
    boolean existsBySimSerial(String simSerial);
    boolean existsByPhoneNumber(String phoneNumber);
}
