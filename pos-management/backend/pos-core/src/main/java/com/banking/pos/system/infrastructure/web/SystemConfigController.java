package com.banking.pos.system.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.system.infrastructure.persistence.entity.SystemConfigJpaEntity;
import com.banking.pos.system.infrastructure.persistence.repository.SystemConfigJpaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/admin/config", "/api/v1/admin/configs", "/api/v1/system/configs"})
@RequiredArgsConstructor
@Tag(name = "System Configuration", description = "APIs quản lý cấu hình hệ thống")
public class SystemConfigController {

    private final SystemConfigJpaRepository configRepository;

    @GetMapping
    @Operation(summary = "Lấy toàn bộ cấu hình hệ thống")
    public ResponseEntity<ApiResponse<Map<String, String>>> getConfigs() {
        Map<String, String> result = new HashMap<>();
        configRepository.findAll().forEach(cfg -> result.put(cfg.getConfigKey(), cfg.getConfigValue()));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PutMapping
    @Operation(summary = "Cập nhật cấu hình hệ thống")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateConfigs(@RequestBody Map<String, String> configs) {
        if (configs != null) {
            configs.forEach((key, val) -> {
                SystemConfigJpaEntity entity = configRepository.findByConfigKey(key)
                        .orElseGet(() -> SystemConfigJpaEntity.builder().configKey(key).build());
                entity.setConfigValue(val);
                configRepository.save(entity);
            });
        }
        return getConfigs();
    }
}
