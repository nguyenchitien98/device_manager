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
@Table(name = "stock_export_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockExportJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "request_code", nullable = false, unique = true, length = 50)
    private String exportCode;

    @Column(name = "warehouse_id", nullable = false)
    private UUID fromWarehouseId;

    @Transient
    private UUID approvalId;

    @Column(name = "destination", length = 255)
    private String destination;

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

    @OneToMany(mappedBy = "export", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<StockExportItemJpaEntity> items = new ArrayList<>();
}
