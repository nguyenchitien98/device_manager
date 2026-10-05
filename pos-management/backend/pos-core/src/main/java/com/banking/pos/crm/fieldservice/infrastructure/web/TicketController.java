package com.banking.pos.crm.fieldservice.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.crm.fieldservice.application.service.FieldServiceTicketService;
import com.banking.pos.crm.fieldservice.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final FieldServiceTicketService ticketService;

    @GetMapping
    public ApiResponse<PageResponse<TicketResponse>> listTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(ticketService.searchTickets(status, priority, page, size));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        return ApiResponse.success(ticketService.createTicket(request), "Tiếp nhận Ticket hỗ trợ kỹ thuật thành công");
    }

    @PostMapping("/{id}/assign")
    public ApiResponse<TicketResponse> assignTechnician(
            @PathVariable UUID id,
            @RequestParam UUID technicianId) {
        return ApiResponse.success(ticketService.assignTechnician(id, technicianId), "Phân công kỹ thuật viên thành công");
    }

    @PostMapping("/{id}/resolve")
    public ApiResponse<TicketResponse> resolveTicket(
            @PathVariable UUID id,
            @RequestParam String resolutionNotes) {
        return ApiResponse.success(ticketService.resolveTicket(id, resolutionNotes), "Xử lý hoàn tất Ticket hỗ trợ");
    }
}
