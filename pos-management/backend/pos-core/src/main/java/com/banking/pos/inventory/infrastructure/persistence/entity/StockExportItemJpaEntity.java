package com.banking.pos.inventory.infrastructure.persistence.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "stock_export_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockExportItemJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "export_request_id", nullable = false)
    @JsonIgnore
    private StockExportJpaEntity export;

    @Transient
    private String serialNumber;

    @Column(name = "device_id")
    private UUID deviceId;
}
