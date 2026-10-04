package com.banking.pos.catalog.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "device_models")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceModelJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "device_type_id", nullable = false)
    private UUID deviceTypeId;

    @Column(name = "vendor_id", nullable = false)
    private UUID vendorId;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

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
