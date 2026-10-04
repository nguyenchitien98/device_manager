package com.banking.pos.inventory.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "repair_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepairOrderJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "repair_code", nullable = false, unique = true, length = 50)
    private String repairCode;

    @Column(name = "device_id", nullable = false)
    private UUID deviceId;

    @Column(name = "serial_number", nullable = false, length = 100)
    private String serialNumber;

    @Column(name = "vendor_id")
    private UUID vendorId;

    @Column(name = "issue_description", nullable = false, columnDefinition = "TEXT")
    private String issueDescription;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "UNDER_REPAIR";

    @Column(name = "repair_cost", precision = 15, scale = 2)
    private BigDecimal repairCost;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_by")
    private UUID createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}
