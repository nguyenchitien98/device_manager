package com.banking.pos.crm.fieldservice.application.service;

import com.banking.pos.common.exception.ErrorCode;
import com.banking.pos.common.exception.PosBusinessException;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.crm.fieldservice.dto.*;
import com.banking.pos.crm.fieldservice.infrastructure.persistence.entity.MaintenanceTicketJpaEntity;
import com.banking.pos.crm.fieldservice.infrastructure.persistence.repository.MaintenanceTicketJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FieldServiceTicketService {

    private final MaintenanceTicketJpaRepository repository;

    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> searchTickets(String status, String priority, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var pageResult = repository.findAll(pageable).map(this::mapToResponse);
        return PageResponse.from(pageResult);
    }

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request) {
        var ticketNumber = "TKT-" + System.currentTimeMillis();
        var entity = MaintenanceTicketJpaEntity.builder()
                .ticketNumber(ticketNumber)
                .merchantId(request.merchantId())
                .terminalId(request.terminalId())
                .deviceId(request.deviceId())
                .issueType(request.issueType())
                .priority(request.priority() != null ? request.priority() : "MEDIUM")
                .status("OPEN")
                .description(request.description())
                .build();

        return mapToResponse(repository.save(entity));
    }

    @Transactional
    public TicketResponse assignTechnician(UUID ticketId, UUID technicianId) {
        var ticket = repository.findById(ticketId)
                .orElseThrow(() -> new PosBusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Ticket hỗ trợ"));

        ticket.setTechnicianId(technicianId);
        ticket.setStatus("ASSIGNED");
        return mapToResponse(repository.save(ticket));
    }

    @Transactional
    public TicketResponse resolveTicket(UUID ticketId, String resolutionNotes) {
        var ticket = repository.findById(ticketId)
                .orElseThrow(() -> new PosBusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Ticket hỗ trợ"));

        ticket.setResolutionNotes(resolutionNotes);
        ticket.setStatus("RESOLVED");
        return mapToResponse(repository.save(ticket));
    }

    private TicketResponse mapToResponse(MaintenanceTicketJpaEntity entity) {
        return new TicketResponse(
                entity.getId(),
                entity.getTicketNumber(),
                entity.getMerchantId(),
                entity.getTerminalId(),
                entity.getDeviceId(),
                entity.getIssueType(),
                entity.getPriority(),
                entity.getStatus(),
                entity.getDescription(),
                entity.getTechnicianId(),
                entity.getResolutionNotes(),
                entity.getHandoverDocUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
