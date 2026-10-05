package com.banking.pos.telecom.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sam_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SamCardJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sam_serial", nullable = false, unique = true, length = 50)
    private String samSerial;

    @Column(name = "sam_type", nullable = false, length = 50)
    @Builder.Default
    private String samType = "HSM_SECURITY_SAM";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "INSTOCK";

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
