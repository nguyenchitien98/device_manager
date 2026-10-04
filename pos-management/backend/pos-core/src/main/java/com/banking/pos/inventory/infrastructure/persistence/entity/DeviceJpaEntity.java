package com.banking.pos.inventory.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Column(name = "model_id", nullable = false)
    private UUID deviceModelId;

    @Column(name = "warehouse_id")
    private UUID warehouseId;

    @Column(name = "po_id")
    private UUID poId;

    @Column(name = "terminal_id")
    private UUID terminalId;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "INSTOCK";

    @Column(name = "mac_address", length = 50)
    private String macAddress;

    @Column(name = "sam_card_number", length = 100)
    private String samCardNumber;

    @Column(name = "sim_number", length = 50)
    private String simNumber;

    @Column(name = "firmware_version", length = 50)
    private String firmwareVersion;

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
