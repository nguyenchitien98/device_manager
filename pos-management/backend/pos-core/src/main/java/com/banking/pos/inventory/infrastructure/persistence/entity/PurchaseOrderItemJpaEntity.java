package com.banking.pos.inventory.infrastructure.persistence.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "purchase_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItemJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", nullable = false)
    @JsonIgnore
    private PurchaseOrderJpaEntity po;

    @Column(name = "device_model_id", nullable = false)
    private UUID deviceModelId;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "received_qty", nullable = false)
    @Builder.Default
    private Integer receivedQty = 0;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
