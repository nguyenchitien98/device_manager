package com.banking.pos.config.security;

import com.banking.pos.common.exception.GlobalExceptionHandler;
import com.banking.pos.common.response.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.banking.pos.identity.infrastructure.persistence.repository.UserJpaRepository;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

/**
 * Cấu hình Spring Security 6 cho POS Management System.
 *
 * <p>Tại sao dùng Stateless Session? Vì hệ thống dùng JWT — server không cần
 * lưu session state. Mỗi request tự xác thực bằng token. Phù hợp với kiến trúc
 * horizontally scalable (nhiều instance không cần share session).
 *
 * <p>Tại sao dùng @EnableMethodSecurity thay vì @EnableGlobalMethodSecurity?
 * @EnableGlobalMethodSecurity bị deprecated từ Spring Security 5.6.
 * @EnableMethodSecurity là API mới, hỗ trợ @PreAuthorize, @PostAuthorize,
 * @Secured và cho phép proxy-based AOP.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Import(GlobalExceptionHandler.class)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserJpaRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * Endpoints công khai — không cần Authentication.
     */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/health",
            "/actuator/health",
            "/actuator/info",
            "/actuator/prometheus",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/api-docs/**",
            "/v3/api-docs/**"
    };

    /**
     * Security Filter Chain — cấu hình CORS, CSRF, Session, Auth, JWT.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // Tắt CSRF vì dùng JWT stateless (không cần cookie)
                .csrf(AbstractHttpConfigurer::disable)

                // CORS config — cho phép Angular dev server (port 4200)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Stateless session — KHÔNG lưu session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )

                // Handler 401 khi chưa xác thực
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(this::handleAuthenticationException)
                )

                // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                .build();
    }

    /**
     * UserDetailsService — load user từ DB theo username.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .map(user -> new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        user.getPasswordHash(),
                        user.getRoles().stream()
                                .flatMap(role -> {
                                    List<org.springframework.security.core.authority.SimpleGrantedAuthority> auths =
                                            new java.util.ArrayList<>();
                                    auths.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                            "ROLE_" + role.getName()));
                                    role.getPermissions().forEach(perm ->
                                            auths.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                    perm.getCode())));
                                    return auths.stream();
                                })
                                .toList()
                ))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * CORS config — cho phép Angular Dev Server và Production URL.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:4200", "http://localhost:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "X-Idempotency-Key"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Trả về 401 JSON response chuẩn ApiErrorResponse thay vì Spring default redirect.
     * Tại sao? Vì frontend Angular cần parse JSON error, không phải HTML 401 page.
     */
    private void handleAuthenticationException(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        log.warn("[POS-9001] Unauthorized access attempt to: {}", request.getRequestURI());

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .errorCode("POS-9001")
                .message("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}
