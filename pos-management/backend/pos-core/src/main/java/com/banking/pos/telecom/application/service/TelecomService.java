package com.banking.pos.telecom.application.service;

import com.banking.pos.common.exception.ErrorCode;
import com.banking.pos.common.exception.PosBusinessException;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.telecom.dto.*;
import com.banking.pos.telecom.infrastructure.persistence.entity.SamCardJpaEntity;
import com.banking.pos.telecom.infrastructure.persistence.entity.SimCardJpaEntity;
import com.banking.pos.telecom.infrastructure.persistence.repository.SamCardJpaRepository;
import com.banking.pos.telecom.infrastructure.persistence.repository.SimCardJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TelecomService {

    private final SimCardJpaRepository simCardRepository;
    private final SamCardJpaRepository samCardRepository;

    @Transactional(readOnly = true)
    public PageResponse<SimCardResponse> searchSimCards(String query, String telco, String status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var result = simCardRepository.findAll(pageable).map(this::mapSimToResponse);
        return PageResponse.from(result);
    }

    @Transactional
    public SimCardResponse createSimCard(CreateSimCardRequest request) {
        if (simCardRepository.existsBySimSerial(request.simSerial())) {
            throw new PosBusinessException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Số seri SIM đã tồn tại trong hệ thống");
        }
        if (simCardRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new PosBusinessException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Số điện thoại SIM đã tồn tại");
        }
        var entity = SimCardJpaEntity.builder()
                .simSerial(request.simSerial())
                .phoneNumber(request.phoneNumber())
                .telco(request.telco() != null ? request.telco() : "VIETTEL")
                .status("INSTOCK")
                .packageName(request.packageName() != null ? request.packageName() : "DATA_POS_4G")
                .monthlyFee(request.monthlyFee())
                .expiryDate(request.expiryDate())
                .notes(request.notes())
                .build();
        return mapSimToResponse(simCardRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public PageResponse<SamCardResponse> searchSamCards(String query, String status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var result = samCardRepository.findAll(pageable).map(this::mapSamToResponse);
        return PageResponse.from(result);
    }

    @Transactional
    public SamCardResponse createSamCard(CreateSamCardRequest request) {
        if (samCardRepository.existsBySamSerial(request.samSerial())) {
            throw new PosBusinessException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Số seri SAM đã tồn tại trong hệ thống");
        }
        var entity = SamCardJpaEntity.builder()
                .samSerial(request.samSerial())
                .samType(request.samType() != null ? request.samType() : "HSM_SECURITY_SAM")
                .status("INSTOCK")
                .notes(request.notes())
                .build();
        return mapSamToResponse(samCardRepository.save(entity));
    }

    private SimCardResponse mapSimToResponse(SimCardJpaEntity entity) {
        return new SimCardResponse(
                entity.getId(),
                entity.getSimSerial(),
                entity.getPhoneNumber(),
                entity.getTelco(),
                entity.getStatus(),
                entity.getPackageName(),
                entity.getMonthlyFee(),
                entity.getExpiryDate(),
                entity.getCurrentDeviceId(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private SamCardResponse mapSamToResponse(SamCardJpaEntity entity) {
        return new SamCardResponse(
                entity.getId(),
                entity.getSamSerial(),
                entity.getSamType(),
                entity.getStatus(),
                entity.getCurrentDeviceId(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
