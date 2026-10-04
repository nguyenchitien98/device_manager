package com.banking.pos.inventory.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "stock_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransactionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "transaction_code", nullable = false, length = 50)
    @Builder.Default
    private String transactionCode = "TX-" + UUID.randomUUID().toString().substring(0, 8);

    @Column(name = "transaction_type", nullable = false, length = 30)
    private String transactionType;

    @Column(name = "device_id")
    private UUID deviceId;

    @Transient
    private String serialNumber;

    @Column(name = "warehouse_id", nullable = false)
    private UUID fromWarehouseId;

    @Column(name = "target_warehouse_id")
    private UUID toWarehouseId;

    @Column(name = "po_id")
    private UUID poId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "performed_by")
    private UUID createdBy;
}
