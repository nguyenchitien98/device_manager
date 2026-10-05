package com.banking.pos.crm.fieldservice.infrastructure.persistence.repository;

import com.banking.pos.crm.fieldservice.infrastructure.persistence.entity.MaintenanceTicketJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaintenanceTicketJpaRepository extends JpaRepository<MaintenanceTicketJpaEntity, UUID>, JpaSpecificationExecutor<MaintenanceTicketJpaEntity> {
    Optional<MaintenanceTicketJpaEntity> findByTicketNumber(String ticketNumber);
    boolean existsByTicketNumber(String ticketNumber);
}
