package com.banking.pos.telecom.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "sim_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimCardJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sim_serial", nullable = false, unique = true, length = 50)
    private String simSerial;

    @Column(name = "phone_number", nullable = false, unique = true, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String telco = "VIETTEL";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "INSTOCK";

    @Column(name = "package_name", length = 100)
    @Builder.Default
    private String packageName = "DATA_POS_4G";

    @Column(name = "monthly_fee", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal monthlyFee = new BigDecimal("50000.00");

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "current_device_id")
    private UUID currentDeviceId;

    @Column(columnDefinition = "TEXT")
    private String notes;

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
