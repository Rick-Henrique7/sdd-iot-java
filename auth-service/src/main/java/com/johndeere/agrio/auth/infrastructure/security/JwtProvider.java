package com.johndeere.agrio.auth.infrastructure.security;

import com.johndeere.agrio.auth.domain.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Issues HS256 JWTs that satisfy the contract enforced by the
 * api-gateway's {@code JwtAuthenticationFilter}:
 * <ul>
 *     <li>{@code sub}    — user email</li>
 *     <li>{@code userId} — stable user identifier</li>
 *     <li>{@code roles}  — role name (e.g. {@code ROLE_OPERADOR})</li>
 *     <li>{@code iat}    — issued at</li>
 *     <li>{@code exp}    — expires at</li>
 * </ul>
 *
 * <p>The secret is shared with the api-gateway. In production it MUST
 * be injected via the {@code JWT_SECRET} environment variable.</p>
 */
@Component
public class JwtProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtProvider.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms:43200000}") // 12h default
    private long expirationMs;

    private SecretKey signingKey;

    @PostConstruct
    void init() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "jwt.secret must be at least 32 bytes for HS256. " +
                            "Configure the JWT_SECRET environment variable.");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        log.info("JwtProvider initialised (HS256, expirationMs={})", expirationMs);
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("roles", user.getRole().name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public long getExpirationSeconds() {
        return expirationMs / 1000L;
    }
}
