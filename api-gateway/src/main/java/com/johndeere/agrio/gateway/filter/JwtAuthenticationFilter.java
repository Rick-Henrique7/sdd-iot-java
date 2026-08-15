package com.johndeere.agrio.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Reactive JWT authentication filter wired to non-public routes via
 * {@code application.yml}.
 *
 * <p>Behavior is defined by {@code changes/001-api-gateway/spec.md}:</p>
 * <ul>
 *     <li>Missing or malformed {@code Authorization} header → {@code 401}.</li>
 *     <li>Invalid / expired token → {@code 401}.</li>
 *     <li>Valid token → strip the {@code Authorization} header, inject
 *         {@code X-User-Email}, {@code X-User-Id} and {@code X-User-Roles}
 *         headers, and forward the request.</li>
 * </ul>
 *
 * <p>The original {@code Authorization} header is never forwarded to
 * downstream services, eliminating the risk of a double-parse or
 * accidental logging of the token.</p>
 */
@Component
public class JwtAuthenticationFilter
        extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    public static final String HEADER_USER_EMAIL = "X-User-Email";
    public static final String HEADER_USER_ID    = "X-User-Id";
    public static final String HEADER_USER_ROLES = "X-User-Roles";

    private static final String BEARER_PREFIX = "Bearer ";

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey signingKey;

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @PostConstruct
    void init() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "jwt.secret must be at least 32 bytes for HS256. " +
                            "Configure the JWT_SECRET environment variable.");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        log.info("JwtAuthenticationFilter initialised (HS256).");
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, HttpStatus.UNAUTHORIZED, "Missing Authorization header");
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
                return onError(exchange, HttpStatus.UNAUTHORIZED,
                        "Authorization header must start with 'Bearer '");
            }

            String token = authHeader.substring(BEARER_PREFIX.length()).trim();
            if (token.isEmpty()) {
                return onError(exchange, HttpStatus.UNAUTHORIZED, "Empty bearer token");
            }

            Claims claims;
            try {
                claims = Jwts.parser()
                        .verifyWith(signingKey)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
            } catch (JwtException | IllegalArgumentException ex) {
                log.debug("JWT validation failed: {}", ex.getMessage());
                return onError(exchange, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
            }

            ServerHttpRequest.Builder mutated = request.mutate()
                    .headers(httpHeaders -> {
                        // Never forward the raw JWT to downstream services.
                        httpHeaders.remove(HttpHeaders.AUTHORIZATION);
                        httpHeaders.set(HEADER_USER_EMAIL, safe(claims.getSubject()));
                        Object userId = claims.get("userId");
                        if (userId != null) {
                            httpHeaders.set(HEADER_USER_ID, userId.toString());
                        }
                        Object roles = claims.get("roles");
                        if (roles != null) {
                            httpHeaders.set(HEADER_USER_ROLES, roles.toString());
                        }
                    });

            return chain.filter(exchange.mutate().request(mutated.build()).build());
        };
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }

    private Mono<Void> onError(ServerWebExchange exchange,
                               HttpStatus status,
                               String reason) {
        log.debug("Rejecting request: status={} reason={} path={}",
                status, reason, exchange.getRequest().getPath());
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    /**
     * Marker config; reserved for future per-route options
     * (e.g. allowed roles, claim-to-header mapping).
     */
    public static class Config {
        // Intentionally empty.
    }

    /**
     * Defensive helper for tests and downstream consumers that need
     * the list of custom headers injected by this filter.
     */
    public static List<String> injectedHeaders() {
        return List.of(HEADER_USER_EMAIL, HEADER_USER_ID, HEADER_USER_ROLES);
    }
}
