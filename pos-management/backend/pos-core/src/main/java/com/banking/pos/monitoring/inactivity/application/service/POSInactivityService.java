package com.banking.pos.monitoring.inactivity.application.service;

import com.banking.pos.common.exception.ErrorCode;
import com.banking.pos.common.exception.PosBusinessException;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.monitoring.inactivity.dto.InactivityAlertResponse;
import com.banking.pos.monitoring.inactivity.infrastructure.persistence.entity.InactivityAlertJpaEntity;
import com.banking.pos.monitoring.inactivity.infrastructure.persistence.repository.InactivityAlertJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class POSInactivityService {

    private final InactivityAlertJpaRepository alertRepository;

    @Transactional(readOnly = true)
    public PageResponse<InactivityAlertResponse> searchAlerts(String status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var pageResult = alertRepository.findAll(pageable).map(this::mapToResponse);
        return PageResponse.from(pageResult);
    }

    @Transactional
    public InactivityAlertResponse triggerRecall(UUID alertId, UUID resolvedByUserId) {
        var alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new PosBusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy cảnh báo inactive"));
        
        alert.setStatus("RECALLED");
        alert.setResolvedAt(Instant.now());
        alert.setResolvedBy(resolvedByUserId);
        alert.setNotes("Đã kích hoạt phiếu thu hồi thiết bị POS do > 30 ngày không có giao dịch quẹt thẻ");

        return mapToResponse(alertRepository.save(alert));
    }

    private InactivityAlertResponse mapToResponse(InactivityAlertJpaEntity entity) {
        return new InactivityAlertResponse(
                entity.getId(),
                entity.getTerminalId(),
                entity.getMerchantId(),
                entity.getDeviceId(),
                entity.getDaysInactive(),
                entity.getLastTxAt(),
                entity.getStatus(),
                entity.getResolvedAt(),
                entity.getResolvedBy(),
                entity.getNotes(),
                entity.getCreatedAt()
        );
    }
}
