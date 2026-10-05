package com.banking.pos.finance.application;

import com.banking.pos.finance.infrastructure.persistence.entity.MonthlyFeeChargeJpaEntity;
import com.banking.pos.finance.infrastructure.persistence.entity.RentalFeePolicyJpaEntity;
import com.banking.pos.finance.infrastructure.persistence.repository.MonthlyFeeChargeJpaRepository;
import com.banking.pos.finance.infrastructure.persistence.repository.RentalFeePolicyJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RentalFeeEngineService {

    private final RentalFeePolicyJpaRepository policyRepository;
    private final MonthlyFeeChargeJpaRepository chargeRepository;

    @Transactional(readOnly = true)
    public List<RentalFeePolicyJpaEntity> getAllPolicies() {
        return policyRepository.findAll();
    }

    @Transactional
    public RentalFeePolicyJpaEntity createPolicy(RentalFeePolicyJpaEntity policy) {
        return policyRepository.save(policy);
    }

    @Transactional(readOnly = true)
    public Page<MonthlyFeeChargeJpaEntity> getCharges(String period, Pageable pageable) {
        if (period != null && !period.isBlank()) {
            return chargeRepository.findByPeriodContaining(period, pageable);
        }
        return chargeRepository.findAll(pageable);
    }

    @Transactional
    public List<MonthlyFeeChargeJpaEntity> calculatePeriodFees(String period) {
        String targetPeriod = (period != null && !period.isBlank()) ? period : YearMonth.now().toString();
        log.info("Calculating monthly rental fees for period: {}", targetPeriod);

        // Fetch policies
        List<RentalFeePolicyJpaEntity> policies = policyRepository.findAll();
        BigDecimal defaultMinVolume = new BigDecimal("50000000.00");
        BigDecimal defaultFee = new BigDecimal("300000.00");

        if (!policies.isEmpty()) {
            defaultMinVolume = policies.get(0).getMinMonthlyVolume();
            defaultFee = policies.get(0).getMonthlyRentalFee();
        }

        // Mock calculation for sample merchants 1..5 if not exists
        for (long merchantId = 1L; merchantId <= 5L; merchantId++) {
            if (chargeRepository.findByPeriodAndMerchantId(targetPeriod, merchantId).isEmpty()) {
                BigDecimal mockVolume = new BigDecimal(merchantId * 15000000L); // 15m, 30m, 45m, 60m, 75m
                BigDecimal fee = mockVolume.compareTo(defaultMinVolume) >= 0 ? BigDecimal.ZERO : defaultFee;
                String status = fee.compareTo(BigDecimal.ZERO) == 0 ? "WAIVED" : "PENDING";

                MonthlyFeeChargeJpaEntity charge = MonthlyFeeChargeJpaEntity.builder()
                        .period(targetPeriod)
                        .merchantId(merchantId)
                        .terminalId(100L + merchantId)
                        .actualVolume(mockVolume)
                        .feeAmount(fee)
                        .status(status)
                        .build();

                chargeRepository.save(charge);
            }
        }

        return chargeRepository.findByPeriod(targetPeriod);
    }

    @Transactional
    public MonthlyFeeChargeJpaEntity chargeFee(Long id) {
        MonthlyFeeChargeJpaEntity charge = chargeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Monthly fee charge not found with ID: " + id));

        charge.setStatus("CHARGED");
        charge.setT24ReferenceNo("T24-FT" + System.currentTimeMillis() / 1000);
        charge.setChargedAt(Instant.now());
        return chargeRepository.save(charge);
    }

    @Transactional
    public MonthlyFeeChargeJpaEntity waiveFee(Long id) {
        MonthlyFeeChargeJpaEntity charge = chargeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Monthly fee charge not found with ID: " + id));

        charge.setStatus("WAIVED");
        charge.setFeeAmount(BigDecimal.ZERO);
        return chargeRepository.save(charge);
    }
}
