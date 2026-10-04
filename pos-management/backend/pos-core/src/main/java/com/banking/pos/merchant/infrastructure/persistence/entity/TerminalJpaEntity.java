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
