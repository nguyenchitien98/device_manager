package com.banking.pos.config.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service quản lý vòng đời JWT Token cho POS Management System.
 *
 * <p>Tại sao dùng HS256 thay vì RS256? Với hệ thống monolith internal (không expose API public),
 * HS256 (symmetric) đơn giản hơn và không cần quản lý public/private key pair.
 * Nếu sau này cần microservices hoặc external client verify token, switch sang RS256.
 *
 * <p>Cấu trúc JWT Claims:
 * <ul>
 *   <li>sub: username</li>
 *   <li>userId: UUID của user</li>
 *   <li>roles: mảng tên roles</li>
 *   <li>permissions: mảng permission codes</li>
 *   <li>businessUnitId: UUID của BU (nullable cho SUPER_ADMIN)</li>
 *   <li>iat/exp: issued at / expiry timestamps</li>
 * </ul>
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class JwtTokenService {

    @Value("${pos.jwt.secret}")
    private String jwtSecret;

    @Value("${pos.jwt.access-token-expiry:900}")
    private long accessTokenExpirySeconds;

    /**
     * Sinh Access Token JWT với đầy đủ claims của user.
     *
     * @param userDetails Spring Security UserDetails
     * @param extraClaims Claims bổ sung (roles, permissions, businessUnitId)
     * @return JWT token string
     */
    public String generateAccessToken(UserDetails userDetails, Map<String, Object> extraClaims) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpirySeconds * 1000))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Sinh Access Token với claims mặc định (không có extra claims).
     *
     * @param userDetails Spring Security UserDetails
     * @return JWT token string
     */
    public String generateAccessToken(UserDetails userDetails) {
        return generateAccessToken(userDetails, new HashMap<>());
    }

    /**
     * Trích xuất username từ JWT token.
     *
     * @param token JWT token
     * @return username (subject claim)
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Kiểm tra token có hợp lệ và thuộc về user không.
     *
     * @param token       JWT token cần kiểm tra
     * @param userDetails UserDetails của user hiện tại
     * @return true nếu token hợp lệ
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Kiểm tra token đã hết hạn chưa.
     *
     * @param token JWT token
     * @return true nếu token đã hết hạn
     */
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Trích xuất một claim bất kỳ từ token.
     *
     * @param token          JWT token
     * @param claimsResolver Function ánh xạ Claims sang giá trị cần lấy
     * @param <T>            Kiểu giá trị
     * @return Giá trị claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(jwtSecret.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
