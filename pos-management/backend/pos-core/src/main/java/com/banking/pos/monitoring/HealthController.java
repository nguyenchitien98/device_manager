package com.banking.pos.monitoring;

import com.banking.pos.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Controller cung cấp health check endpoint cho POS Management System.
 *
 * <p>Tại sao cần endpoint tùy chỉnh bên cạnh Spring Actuator? Actuator /health
 * cung cấp thông tin kỹ thuật chi tiết. Endpoint này trả về format chuẩn của dự án
 * {@link ApiResponse} để frontend/monitoring tools dễ tích hợp,
 * đồng thời bổ sung thông tin version và timestamp.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health", description = "Kiểm tra trạng thái hoạt động của hệ thống")
public class HealthController {

    @Value("${spring.application.name:pos-management-core}")
    private String applicationName;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    private final HealthEndpoint healthEndpoint;

    public HealthController(HealthEndpoint healthEndpoint) {
        this.healthEndpoint = healthEndpoint;
    }

    /**
     * Endpoint kiểm tra trạng thái hệ thống — dùng cho Docker HEALTHCHECK và load balancer.
     *
     * @return 200 OK với thông tin status, version, timestamp
     */
    @GetMapping("/health")
    @Operation(summary = "Health Check", description = "Kiểm tra trạng thái hoạt động của backend API")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        HealthComponent systemHealth = healthEndpoint.health();
        String status = (systemHealth instanceof Health h) ? h.getStatus().getCode() : "UNKNOWN";

        Map<String, Object> healthData = Map.of(
                "status", status,
                "application", applicationName,
                "version", appVersion,
                "timestamp", Instant.now().toString()
        );

        log.debug("Health check requested — status: {}", status);
        return ResponseEntity.ok(ApiResponse.success(healthData, "Hệ thống đang hoạt động bình thường"));
    }
}
