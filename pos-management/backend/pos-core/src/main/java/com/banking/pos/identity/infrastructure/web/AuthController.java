package com.banking.pos.identity.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.identity.application.dto.LoginRequest;
import com.banking.pos.identity.application.dto.LoginResponse;
import com.banking.pos.identity.application.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.banking.pos.identity.infrastructure.persistence.repository.UserJpaRepository;

import java.util.Map;
import java.util.UUID;

/**
 * REST Controller xử lý các API xác thực (Authentication).
 *
 * <p>Tại sao Controller gọi trực tiếp AuthService thay vua qua Port?
 * Với nghiệp vụ Auth — đây là điểm giao tiếp chính với framework HTTP,
 * không có business logic phức tạp cần isolate. AuthService là application
 * service thuần, không phụ thuộc vào HTTP context.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Đăng nhập, làm mới token, đăng xuất")
public class AuthController {

    private final AuthService authService;
    private final UserJpaRepository userRepository;

    /**
     * Đăng nhập bằng username/password.
     *
     * @param request LoginRequest chứa username và password
     * @return AccessToken, RefreshToken và thông tin user
     */
    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Xác thực username/password, trả về JWT access token và refresh token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Đăng nhập thành công"));
    }

    /**
     * Làm mới Access Token bằng Refresh Token (Token Rotation).
     *
     * @param body Map chứa refreshToken
     * @return LoginResponse với tokens mới
     */
    @PostMapping("/refresh")
    @Operation(summary = "Làm mới token", description = "Dùng Refresh Token để lấy Access Token mới (Token Rotation)")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.success(null, "refreshToken không được để trống"));
        }
        LoginResponse response = authService.refresh(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response, "Token đã được làm mới"));
    }

    /**
     * Đăng xuất — thu hồi toàn bộ refresh token của user hiện tại.
     *
     * @param currentUser UserDetails của user đang đăng nhập
     * @return Thông báo đăng xuất thành công
     */
    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất", description = "Thu hồi Refresh Token, kết thúc phiên làm việc")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser != null) {
            userRepository.findByUsername(currentUser.getUsername())
                    .ifPresent(user -> authService.logout(user.getId()));
        }
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công"));
    }

    /**
     * Lấy thông tin user hiện tại đang đăng nhập.
     *
     * @param currentUser UserDetails inject từ Security Context
     * @return Thông tin user
     */
    @GetMapping("/me")
    @Operation(summary = "Thông tin tôi", description = "Lấy thông tin user đang đăng nhập")
    public ResponseEntity<ApiResponse<Object>> me(
            @AuthenticationPrincipal UserDetails currentUser) {
        return userRepository.findByUsername(currentUser.getUsername())
                .map(user -> {
                    var roles = user.getRoles().stream().map(r -> r.getName()).toList();
                    var permissions = user.getRoles().stream()
                            .flatMap(r -> r.getPermissions().stream())
                            .map(p -> p.getCode()).distinct().toList();

                    Map<String, Object> info = Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "email", user.getEmail(),
                            "fullName", user.getFullName(),
                            "roles", roles,
                            "permissions", permissions
                    );
                    return ResponseEntity.ok(ApiResponse.success((Object) info));
                })
                .orElse(ResponseEntity.notFound().build());
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PutMapping("/me")
    @Operation(summary = "Cập nhật hồ sơ của tôi")
    public ResponseEntity<ApiResponse<Object>> updateMe(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody Map<String, String> body) {
        if (currentUser == null) return ResponseEntity.status(401).build();

        return userRepository.findByUsername(currentUser.getUsername())
                .map(user -> {
                    if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
                    if (body.containsKey("email")) user.setEmail(body.get("email"));
                    if (body.containsKey("phone")) user.setPhone(body.get("phone"));
                    userRepository.save(user);
                    return me(currentUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody Map<String, String> body) {
        if (currentUser == null) return ResponseEntity.status(401).build();

        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        if (oldPassword == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.success("Mật khẩu mới không được để trống"));
        }

        return userRepository.findByUsername(currentUser.getUsername())
                .map(user -> {
                    if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
                        return ResponseEntity.badRequest().body(ApiResponse.<Void>success("Mật khẩu cũ không chính xác"));
                    }
                    user.setPasswordHash(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                    return ResponseEntity.ok(ApiResponse.<Void>success("Đổi mật khẩu thành công"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
