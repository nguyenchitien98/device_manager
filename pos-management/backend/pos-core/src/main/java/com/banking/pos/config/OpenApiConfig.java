package com.banking.pos.config;

import com.banking.pos.common.exception.GlobalExceptionHandler;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * Cấu hình OpenAPI 3 / Swagger UI cho toàn bộ POS Management API.
 *
 * <p>Tại sao cần file này? SpringDoc tự động scan controllers nhưng cần cấu hình
 * thêm để: (1) thêm JWT Bearer Auth scheme vào Swagger UI,
 * (2) hiển thị thông tin dự án, (3) import GlobalExceptionHandler từ pos-common.
 *
 * <p>Truy cập Swagger UI tại: http://localhost:8080/swagger-ui.html
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@Configuration
@Import(GlobalExceptionHandler.class)
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    /**
     * Định nghĩa OpenAPI metadata và JWT security scheme cho toàn bộ API.
     */
    @Bean
    public OpenAPI posManagementOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("POS Management System API")
                        .description("""
                                Hệ thống quản lý vòng đời thiết bị POS và Merchant cho ngân hàng.
                                
                                **Các module chính:**
                                - 🔐 Authentication & RBAC
                                - 📦 Quản lý Kho (Inventory)
                                - 🏪 Quản lý Merchant & TID
                                - 📱 Vòng đời Thiết bị (Device Lifecycle)
                                - 🔗 Cấp phát & Thu hồi (Assignment)
                                - ✅ Quy trình Phê duyệt (Approval Workflow)
                                - 📊 Giám sát & Báo cáo (Monitoring)
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("POS Management Team")
                                .email("pos-dev@banking.com"))
                        .license(new License()
                                .name("Internal Use Only")
                                .url("https://banking.com")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Nhập JWT Access Token — format: Bearer {token}")));
    }
}
