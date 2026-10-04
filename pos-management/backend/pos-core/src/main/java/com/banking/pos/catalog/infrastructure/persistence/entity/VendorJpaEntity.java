package com.banking.pos.catalog.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String contact;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "tax_code", length = 20)
    private String taxCode;

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
