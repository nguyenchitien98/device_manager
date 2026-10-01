package com.banking.pos.identity.application.service;

import com.banking.pos.common.exception.ErrorCode;
import com.banking.pos.common.exception.PosBusinessException;
import com.banking.pos.config.security.JwtTokenService;
import com.banking.pos.identity.application.dto.LoginRequest;
import com.banking.pos.identity.application.dto.LoginResponse;
import com.banking.pos.identity.application.dto.UserInfoDto;
import com.banking.pos.identity.infrastructure.persistence.entity.RefreshTokenJpaEntity;
import com.banking.pos.identity.infrastructure.persistence.entity.UserJpaEntity;
import com.banking.pos.identity.infrastructure.persistence.repository.RefreshTokenJpaRepository;
import com.banking.pos.identity.infrastructure.persistence.repository.UserJpaRepository;
import com.banking.pos.shared.util.MaskingUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý toàn bộ nghiệp vụ xác thực trong POS Management System.
 *
 * <p>Tại sao tách AuthService riêng thay vì để trong Controller? Service layer
 * encapsulate logic nghiệp vụ (rate limit, lock account, token rotation) —
 * Controller chỉ là thin adapter nhận HTTP request và trả HTTP response.
 * Điều này giúp viết unit test không cần HTTP context.
 *
 * <p>Luồng Login:
 * <ol>
 *   <li>Kiểm tra account locked</li>
 *   <li>AuthenticationManager xác thực username/password</li>
 *   <li>Nếu sai: tăng failed_attempts, lock nếu >= 5</li>
 *   <li>Nếu đúng: reset failed_attempts, sinh Access Token + Refresh Token</li>
 *   <li>Lưu Refresh Token hash vào DB</li>
 *   <li>Trả về LoginResponse</li>
 * </ol>
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 30;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final UserJpaRepository userRepository;
    private final RefreshTokenJpaRepository refreshTokenRepository;

    @Value("${pos.jwt.access-token-expiry:900}")
    private long accessTokenExpirySeconds;

    @Value("${pos.jwt.refresh-token-expiry:604800}")
    private long refreshTokenExpirySeconds;

    /**
     * Xử lý đăng nhập — xác thực credentials và sinh JWT tokens.
     *
     * @param request LoginRequest với username/password
     * @return LoginResponse với access token, refresh token và thông tin user
     * @throws PosBusinessException ACCOUNT_LOCKED nếu tài khoản bị khóa
     * @throws PosBusinessException INVALID_CREDENTIALS nếu sai username/password
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 1. Tìm user — dùng email hoặc username
        UserJpaEntity user = userRepository.findByUsername(request.username())
                .or(() -> userRepository.findByEmail(request.username()))
                .orElseThrow(() -> {
                    log.warn("[AUTH] Login attempt with unknown user: {}", MaskingUtils.maskEmail(request.username()));
                    return new PosBusinessException(ErrorCode.INVALID_CREDENTIALS);
                });

        // 2. Kiểm tra account locked
        if (user.isCurrentlyLocked()) {
            log.warn("[AUTH] Login attempt on locked account: {}", MaskingUtils.maskEmail(user.getEmail()));
            throw new PosBusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        // 3. Xác thực password qua AuthenticationManager
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.password()));
        } catch (BadCredentialsException e) {
            handleFailedLogin(user);
            throw new PosBusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 4. Login thành công — reset failed attempts
        userRepository.resetFailedAttemptsAndUpdateLoginAt(user.getId(), Instant.now());

        // 5. Build claims cho JWT
        Map<String, Object> claims = buildJwtClaims(user);

        // Build Spring UserDetails để sinh token
        List<SimpleGrantedAuthority> authorities = buildAuthorities(user);
        User springUser = new User(user.getUsername(), user.getPasswordHash(), authorities);

        String accessToken = jwtTokenService.generateAccessToken(springUser, claims);

        // 6. Sinh Refresh Token và lưu vào DB (hash để không lưu raw)
        String rawRefreshToken = UUID.randomUUID().toString();
        String tokenHash = hashToken(rawRefreshToken);

        RefreshTokenJpaEntity refreshTokenEntity = RefreshTokenJpaEntity.builder()
                .userId(user.getId())
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusSeconds(refreshTokenExpirySeconds))
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        log.info("[AUTH] Login successful for user: {}", MaskingUtils.maskEmail(user.getEmail()));

        UserInfoDto userInfo = buildUserInfo(user);
        return LoginResponse.of(accessToken, rawRefreshToken, accessTokenExpirySeconds, userInfo);
    }

    /**
     * Refresh Access Token bằng Refresh Token — implement Token Rotation.
     *
     * <p>Token Rotation: Mỗi lần refresh, Refresh Token cũ bị thu hồi và
     * Refresh Token mới được sinh ra. Điều này phát hiện token theft —
     * nếu attacker dùng token cũ để refresh, hệ thống biết token đã bị stolen.
     *
     * @param rawRefreshToken Refresh Token raw (chưa hash)
     * @return LoginResponse với tokens mới
     */
    @Transactional
    public LoginResponse refresh(String rawRefreshToken) {
        String tokenHash = hashToken(rawRefreshToken);

        RefreshTokenJpaEntity storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new PosBusinessException(ErrorCode.REFRESH_TOKEN_INVALID));

        if (!storedToken.isValid()) {
            log.warn("[AUTH] Attempt to use invalid/expired refresh token");
            throw new PosBusinessException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        UserJpaEntity user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new PosBusinessException(ErrorCode.REFRESH_TOKEN_INVALID));

        if (user.isCurrentlyLocked()) {
            throw new PosBusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        // Thu hồi token cũ (Token Rotation)
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // Sinh token mới
        Map<String, Object> claims = buildJwtClaims(user);
        List<SimpleGrantedAuthority> authorities = buildAuthorities(user);
        User springUser = new User(user.getUsername(), user.getPasswordHash(), authorities);
        String newAccessToken = jwtTokenService.generateAccessToken(springUser, claims);

        String newRawRefreshToken = UUID.randomUUID().toString();
        RefreshTokenJpaEntity newRefreshToken = RefreshTokenJpaEntity.builder()
                .userId(user.getId())
                .tokenHash(hashToken(newRawRefreshToken))
                .expiresAt(Instant.now().plusSeconds(refreshTokenExpirySeconds))
                .build();
        refreshTokenRepository.save(newRefreshToken);

        log.debug("[AUTH] Token refreshed for user: {}", MaskingUtils.maskEmail(user.getEmail()));
        return LoginResponse.of(newAccessToken, newRawRefreshToken, accessTokenExpirySeconds, buildUserInfo(user));
    }

    /**
     * Đăng xuất — thu hồi toàn bộ refresh token của user.
     *
     * @param userId UUID của user đang đăng xuất
     */
    @Transactional
    public void logout(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
        log.info("[AUTH] User logged out, all refresh tokens revoked: {}", userId);
    }

    // ─── Private helpers ───────────────────────────────────────────────────

    private void handleFailedLogin(UserJpaEntity user) {
        userRepository.incrementFailedAttempts(user.getId());
        int newAttempts = user.getFailedLoginAttempts() + 1;

        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
            Instant lockUntil = Instant.now().plusSeconds(LOCK_DURATION_MINUTES * 60);
            userRepository.lockUser(user.getId(), lockUntil);
            log.warn("[AUTH] Account locked after {} failed attempts: {}",
                    MAX_FAILED_ATTEMPTS, MaskingUtils.maskEmail(user.getEmail()));
        }
    }

    private Map<String, Object> buildJwtClaims(UserJpaEntity user) {
        List<String> roleNames = user.getRoles().stream()
                .map(r -> r.getName())
                .collect(Collectors.toList());

        List<String> permissionCodes = user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(p -> p.getCode())
                .distinct()
                .collect(Collectors.toList());

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("roles", roleNames);
        claims.put("permissions", permissionCodes);
        if (user.getBusinessUnitId() != null) {
            claims.put("businessUnitId", user.getBusinessUnitId().toString());
        }
        return claims;
    }

    private List<SimpleGrantedAuthority> buildAuthorities(UserJpaEntity user) {
        return user.getRoles().stream()
                .flatMap(role -> {
                    List<SimpleGrantedAuthority> auths = new ArrayList<>();
                    auths.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
                    role.getPermissions().forEach(perm ->
                            auths.add(new SimpleGrantedAuthority(perm.getCode())));
                    return auths.stream();
                })
                .collect(Collectors.toList());
    }

    private UserInfoDto buildUserInfo(UserJpaEntity user) {
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName()).collect(Collectors.toList());
        List<String> permissions = user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(p -> p.getCode()).distinct().collect(Collectors.toList());

        return new UserInfoDto(
                user.getId(), user.getUsername(), user.getEmail(),
                user.getFullName(), roles, permissions,
                user.getBusinessUnitId(), null
        );
    }

    /** Hash refresh token bằng MD5 để lưu DB (không lưu raw token). */
    private String hashToken(String rawToken) {
        return DigestUtils.md5DigestAsHex(rawToken.getBytes(StandardCharsets.UTF_8));
    }
}
