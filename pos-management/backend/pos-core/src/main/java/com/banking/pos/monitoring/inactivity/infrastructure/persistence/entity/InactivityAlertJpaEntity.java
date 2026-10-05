package com.banking.pos.monitoring.inactivity.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inactivity_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InactivityAlertJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "terminal_id", nullable = false)
    private UUID terminalId;

    @Column(name = "merchant_id")
    private UUID merchantId;

    @Column(name = "device_id")
    private UUID deviceId;

    @Column(name = "days_inactive", nullable = false)
    @Builder.Default
    private Integer daysInactive = 30;

    @Column(name = "last_tx_at")
    private Instant lastTxAt;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "NEW";

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
