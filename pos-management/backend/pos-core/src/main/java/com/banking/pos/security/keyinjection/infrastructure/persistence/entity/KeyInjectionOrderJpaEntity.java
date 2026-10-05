package com.banking.pos.security.keyinjection.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "key_injection_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyInjectionOrderJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(name = "device_id", nullable = false)
    private UUID deviceId;

    @Column(name = "hsm_profile_id", nullable = false, length = 100)
    @Builder.Default
    private String hsmProfileId = "HSM_PCI_PTS_PROD";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "injected_by")
    private UUID injectedBy;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "hsm_response_code", length = 50)
    @Builder.Default
    private String hsmResponseCode = "00_SUCCESS";

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
