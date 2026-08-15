package com.johndeere.agrio.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Security configuration for the reactive gateway.
 *
 * <p>The actual JWT enforcement happens at the route level via
 * {@code JwtAuthenticationFilter}. Here we disable Spring Security's
 * defaults (CSRF, form login, basic auth) which are not applicable to
 * a stateless API gateway. Route-level {@code permitAll} is
 * intentional: the {@code JwtAuthenticationFilter} attached to each
 * protected route is the single source of truth for authentication.</p>
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .logout(ServerHttpSecurity.LogoutSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/actuator/health/**", "/actuator/info").permitAll()
                        .anyExchange().permitAll()
                )
                .build();
    }
}
