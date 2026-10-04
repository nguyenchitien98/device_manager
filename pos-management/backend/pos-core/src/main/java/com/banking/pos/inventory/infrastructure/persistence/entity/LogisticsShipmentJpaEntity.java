package com.banking.pos.inventory.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "logistics_trackings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticsShipmentJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reference_type", nullable = false, length = 50)
    @Builder.Default
    private String referenceType = "TRANSFER";

    @Column(name = "reference_id", nullable = false)
    @Builder.Default
    private UUID referenceId = UUID.randomUUID();

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    public String getWaybillNumber() { return trackingNumber; }
    public void setWaybillNumber(String number) { this.trackingNumber = number; }

    @Column(name = "carrier_name", length = 200)
    private String carrierName;

    @Column(name = "from_address", columnDefinition = "TEXT")
    private String fromAddress;

    @Column(name = "to_address", columnDefinition = "TEXT")
    private String toAddress;

    @Column(name = "from_warehouse_id")
    private UUID fromWarehouseId;

    @Column(name = "to_warehouse_id")
    private UUID toWarehouseId;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "CREATED";

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
}
