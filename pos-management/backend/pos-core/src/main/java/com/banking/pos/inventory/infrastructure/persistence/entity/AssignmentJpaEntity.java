package com.banking.pos.inventory.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "assignment_code", nullable = false, unique = true, length = 50)
    private String assignmentCode;

    @Column(name = "device_id", nullable = false)
    private UUID deviceId;

    @Transient
    private String serialNumber;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "terminal_id", length = 50)
    private String terminalId;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "assigned_date", nullable = false)
    @Builder.Default
    private Instant assignedDate = Instant.now();

    @Column(name = "returned_date")
    private Instant returnedDate;

    public Instant getReturnedAt() { return returnedDate; }
    public void setReturnedAt(Instant date) { this.returnedDate = date; }

    @Column(name = "notes", columnDefinition = "TEXT")
    private String note;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;
}
