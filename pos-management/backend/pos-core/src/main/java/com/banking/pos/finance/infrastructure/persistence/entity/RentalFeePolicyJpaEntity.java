package com.banking.pos.finance.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "rental_fee_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalFeePolicyJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "min_monthly_volume", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal minMonthlyVolume = BigDecimal.ZERO;

    @Column(name = "monthly_rental_fee", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal monthlyRentalFee = BigDecimal.ZERO;

    @Column(name = "penalty_fee", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal penaltyFee = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
