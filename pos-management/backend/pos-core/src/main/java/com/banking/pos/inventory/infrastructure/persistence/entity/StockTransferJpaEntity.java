package com.banking.pos.inventory.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "stock_transfer_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransferJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "request_code", nullable = false, unique = true, length = 50)
    private String transferCode;

    @Column(name = "source_warehouse_id", nullable = false)
    private UUID fromWarehouseId;

    @Column(name = "target_warehouse_id", nullable = false)
    private UUID toWarehouseId;

    @Transient
    private UUID approvalId;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING_APPROVAL";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String note;

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

    @Column(name = "created_by")
    private UUID createdBy;

    @OneToMany(mappedBy = "transfer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<StockTransferItemJpaEntity> items = new ArrayList<>();
}
