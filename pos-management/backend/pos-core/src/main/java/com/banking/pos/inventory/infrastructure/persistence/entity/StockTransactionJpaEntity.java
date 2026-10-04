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

    @Column(name = "transaction_type", nullable = false, length = 30)
    private String transactionType;

    @Column(name = "device_id")
    private UUID deviceId;

    @Column(name = "serial_number", nullable = false, length = 100)
    private String serialNumber;

    @Column(name = "from_warehouse_id")
    private UUID fromWarehouseId;

    @Column(name = "to_warehouse_id")
    private UUID toWarehouseId;

    @Column(name = "po_id")
    private UUID poId;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "created_by")
    private UUID createdBy;
}
