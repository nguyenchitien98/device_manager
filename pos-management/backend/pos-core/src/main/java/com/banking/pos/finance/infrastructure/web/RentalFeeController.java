package com.banking.pos.finance.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.finance.application.RentalFeeEngineService;
import com.banking.pos.finance.infrastructure.persistence.entity.MonthlyFeeChargeJpaEntity;
import com.banking.pos.finance.infrastructure.persistence.entity.RentalFeePolicyJpaEntity;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/finance/rental-fees")
@RequiredArgsConstructor
public class RentalFeeController {

    private final RentalFeeEngineService rentalFeeEngineService;

    @GetMapping("/policies")
    public ApiResponse<List<RentalFeePolicyJpaEntity>> getPolicies() {
        return ApiResponse.success(rentalFeeEngineService.getAllPolicies());
    }

    @PostMapping("/policies")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RentalFeePolicyJpaEntity> createPolicy(@RequestBody RentalFeePolicyJpaEntity policy) {
        return ApiResponse.success(rentalFeeEngineService.createPolicy(policy), "Tạo mới chính sách phí thành công");
    }

    @GetMapping("/charges")
    public ApiResponse<PageResponse<MonthlyFeeChargeJpaEntity>> getCharges(
            @RequestParam(required = false) String period,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var resultPage = rentalFeeEngineService.getCharges(period, PageRequest.of(page, size));
        return ApiResponse.success(PageResponse.from(resultPage));
    }

    @PostMapping("/calculate-period")
    public ApiResponse<List<MonthlyFeeChargeJpaEntity>> calculatePeriodFees(
            @RequestParam(required = false) String period) {
        return ApiResponse.success(
                rentalFeeEngineService.calculatePeriodFees(period),
                "Tính toán phí thuê máy theo kỳ thành công"
        );
    }

    @PostMapping("/charges/{id}/charge")
    public ApiResponse<MonthlyFeeChargeJpaEntity> chargeFee(@PathVariable Long id) {
        return ApiResponse.success(
                rentalFeeEngineService.chargeFee(id),
                "Thực hiện trích nợ tự động T24 thành công"
        );
    }

    @PostMapping("/charges/{id}/waive")
    public ApiResponse<MonthlyFeeChargeJpaEntity> waiveFee(@PathVariable Long id) {
        return ApiResponse.success(
                rentalFeeEngineService.waiveFee(id),
                "Miễn phí thuê máy thành công"
        );
    }
}
