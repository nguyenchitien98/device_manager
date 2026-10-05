package com.banking.pos.finance.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "monthly_fee_charges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyFeeChargeJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 7)
    private String period; // Format: 'YYYY-MM'

    @Column(name = "merchant_id", nullable = false)
    private Long merchantId;

    @Column(name = "terminal_id")
    private Long terminalId;

    @Column(name = "actual_volume", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal actualVolume = BigDecimal.ZERO;

    @Column(name = "fee_amount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal feeAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, CHARGED, FAILED, WAIVED

    @Column(name = "t24_reference_no", length = 100)
    private String t24ReferenceNo;

    @Column(name = "charged_at")
    private Instant chargedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
