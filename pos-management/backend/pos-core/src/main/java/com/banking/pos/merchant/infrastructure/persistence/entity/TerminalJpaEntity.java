package com.banking.pos.merchant.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "terminal_ids")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TerminalJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String tid;

    @Column(name = "mid_id")
    private UUID midId;

    @Column(name = "device_id")
    private UUID deviceId;

    @Column(name = "installation_address", columnDefinition = "TEXT")
    private String installationAddress;

    @Column(name = "terminal_type", nullable = false, length = 30)
    @Builder.Default
    private String terminalType = "COUNTER";

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "max_amount_per_tx", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private java.math.BigDecimal maxAmountPerTx = new java.math.BigDecimal("50000000.00");

    @Column(name = "allow_contactless", nullable = false)
    @Builder.Default
    private Boolean allowContactless = true;

    @Column(name = "allow_qr", nullable = false)
    @Builder.Default
    private Boolean allowQr = true;

    @Column(name = "settlement_cycle", nullable = false, length = 20)
    @Builder.Default
    private String settlementCycle = "T+1";

    @Column(name = "last_transaction_at")
    private Instant lastTransactionAt;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "UNASSIGNED";

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
