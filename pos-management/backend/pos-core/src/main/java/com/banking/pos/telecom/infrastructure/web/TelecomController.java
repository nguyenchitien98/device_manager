package com.banking.pos.telecom.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.telecom.application.service.TelecomService;
import com.banking.pos.telecom.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/telecom")
@RequiredArgsConstructor
public class TelecomController {

    private final TelecomService telecomService;

    @GetMapping("/sims")
    public ApiResponse<PageResponse<SimCardResponse>> listSims(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String telco,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(telecomService.searchSimCards(query, telco, status, page, size));
    }

    @PostMapping("/sims")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SimCardResponse> createSim(@Valid @RequestBody CreateSimCardRequest request) {
        return ApiResponse.success(telecomService.createSimCard(request), "Tạo mới SIM 4G thành công");
    }

    @GetMapping("/sams")
    public ApiResponse<PageResponse<SamCardResponse>> listSams(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(telecomService.searchSamCards(query, status, page, size));
    }

    @PostMapping("/sams")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SamCardResponse> createSam(@Valid @RequestBody CreateSamCardRequest request) {
        return ApiResponse.success(telecomService.createSamCard(request), "Tạo mới Thẻ SAM thành công");
    }
}
