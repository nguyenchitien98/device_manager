package com.banking.pos.security.keyinjection.application.service;

import com.banking.pos.common.exception.ErrorCode;
import com.banking.pos.common.exception.PosBusinessException;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.inventory.infrastructure.persistence.repository.DeviceJpaRepository;
import com.banking.pos.security.keyinjection.dto.*;
import com.banking.pos.security.keyinjection.infrastructure.persistence.entity.KeyInjectionOrderJpaEntity;
import com.banking.pos.security.keyinjection.infrastructure.persistence.repository.KeyInjectionOrderJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KeyInjectionService {

    private final KeyInjectionOrderJpaRepository repository;
    private final DeviceJpaRepository deviceRepository;

    @Transactional(readOnly = true)
    public PageResponse<KeyInjectionOrderResponse> searchOrders(String status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var pageResult = repository.findAll(pageable).map(this::mapToResponse);
        return PageResponse.from(pageResult);
    }

    @Transactional
    public KeyInjectionOrderResponse createOrder(CreateKeyInjectionOrderRequest request) {
        var device = deviceRepository.findById(request.deviceId())
                .orElseThrow(() -> new PosBusinessException(ErrorCode.DEVICE_NOT_FOUND));

        var orderNumber = "KIO-" + System.currentTimeMillis();
        var entity = KeyInjectionOrderJpaEntity.builder()
                .orderNumber(orderNumber)
                .deviceId(request.deviceId())
                .hsmProfileId(request.hsmProfileId() != null ? request.hsmProfileId() : "HSM_PCI_PTS_PROD")
                .status("PENDING")
                .notes(request.notes())
                .build();

        return mapToResponse(repository.save(entity));
    }

    @Transactional
    public KeyInjectionOrderResponse executeInjection(UUID orderId, UUID userId) {
        var order = repository.findById(orderId)
                .orElseThrow(() -> new PosBusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy lệnh nạp khóa"));

        order.setStatus("SUCCESS");
        order.setInjectedBy(userId);
        order.setHsmResponseCode("00_SUCCESS");

        var deviceOpt = deviceRepository.findById(order.getDeviceId());
        if (deviceOpt.isPresent()) {
            var device = deviceOpt.get();
            device.setKeyInjectedStatus("INJECTED");
            device.setKeyInjectedAt(Instant.now());
            deviceRepository.save(device);
        }

        return mapToResponse(repository.save(order));
    }

    private KeyInjectionOrderResponse mapToResponse(KeyInjectionOrderJpaEntity entity) {
        return new KeyInjectionOrderResponse(
                entity.getId(),
                entity.getOrderNumber(),
                entity.getDeviceId(),
                entity.getHsmProfileId(),
                entity.getStatus(),
                entity.getInjectedBy(),
                entity.getApprovedBy(),
                entity.getHsmResponseCode(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
