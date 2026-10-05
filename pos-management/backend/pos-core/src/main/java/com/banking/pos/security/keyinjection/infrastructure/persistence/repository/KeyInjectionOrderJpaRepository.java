package com.banking.pos.security.keyinjection.infrastructure.persistence.repository;

import com.banking.pos.security.keyinjection.infrastructure.persistence.entity.KeyInjectionOrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface KeyInjectionOrderJpaRepository extends JpaRepository<KeyInjectionOrderJpaEntity, UUID>, JpaSpecificationExecutor<KeyInjectionOrderJpaEntity> {
    Optional<KeyInjectionOrderJpaEntity> findByOrderNumber(String orderNumber);
    boolean existsByOrderNumber(String orderNumber);
}
