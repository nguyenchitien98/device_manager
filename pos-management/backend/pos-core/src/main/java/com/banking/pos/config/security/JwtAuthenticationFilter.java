package com.banking.pos.config.security;

import com.banking.pos.identity.infrastructure.persistence.entity.UserJpaEntity;
import com.banking.pos.identity.infrastructure.persistence.repository.UserJpaRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Filter xác thực JWT — chạy một lần cho mọi HTTP request.
 *
 * <p>Tại sao kế thừa OncePerRequestFilter thay vì Filter thẳng? OncePerRequestFilter
 * đảm bảo filter chỉ chạy đúng một lần cho mỗi request, kể cả khi request được forward
 * nội bộ (ví dụ: /error forward). Tránh double-authentication.
 *
 * <p>Luồng xử lý:
 * <ol>
 *   <li>Lấy header Authorization: Bearer {token}</li>
 *   <li>Extract username từ JWT</li>
 *   <li>Load UserDetails từ DB</li>
 *   <li>Validate token (chữ ký + expiry)</li>
 *   <li>Inject Authentication vào SecurityContext</li>
 * </ol>
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserJpaRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Bỏ qua nếu không có Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String username = jwtTokenService.extractUsername(jwt);

            // Chỉ xử lý nếu chưa có Authentication trong context
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserJpaEntity user = userRepository.findByUsername(username).orElse(null);

                if (user != null && !user.isCurrentlyLocked()) {
                    // Build Spring Security UserDetails từ JPA entity
                    List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                            .flatMap(role -> {
                                // Thêm cả ROLE_ prefix và permission codes
                                List<SimpleGrantedAuthority> auths = new java.util.ArrayList<>();
                                auths.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
                                role.getPermissions().forEach(perm ->
                                        auths.add(new SimpleGrantedAuthority(perm.getCode())));
                                return auths.stream();
                            })
                            .collect(Collectors.toList());

                    org.springframework.security.core.userdetails.User springUser =
                            new org.springframework.security.core.userdetails.User(
                                    user.getUsername(), user.getPasswordHash(), authorities);

                    if (jwtTokenService.isTokenValid(jwt, springUser)) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        springUser, null, authorities);
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);

                        log.debug("JWT authentication successful for user: {}", username);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("JWT authentication failed: {}", e.getMessage());
            // Không throw — để Security config xử lý 401 response
        }

        filterChain.doFilter(request, response);
    }
}
