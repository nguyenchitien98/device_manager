package com.banking.pos.monitoring.inactivity.infrastructure.persistence.repository;

import com.banking.pos.monitoring.inactivity.infrastructure.persistence.entity.InactivityAlertJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InactivityAlertJpaRepository extends JpaRepository<InactivityAlertJpaEntity, UUID>, JpaSpecificationExecutor<InactivityAlertJpaEntity> {
    boolean existsByTerminalIdAndStatus(UUID terminalId, String status);
}
