package com.johndeere.agrio.gateway.filter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.cloud.client.DefaultServiceInstance;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.ReactiveDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Contract test for the JWT filter, using WebTestClient against a
 * fully-wired Spring Cloud Gateway application. The downstream
 * services are stubbed via a {@link ReactiveDiscoveryClient} bean
 * that always returns a single localhost instance.
 */
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.cloud.loadbalancer.enabled=false",
                "jwt.secret=test-secret-test-secret-test-secret-12345678",
                "spring.profiles.active=test"
        }
)
@TestPropertySource(properties = "spring.main.allow-bean-definition-overriding=true")
@Import(JwtAuthenticationFilterTest.StubDiscoveryConfig.class)
class JwtAuthenticationFilterTest {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    @DisplayName("Deve retornar 401 quando o cabeçalho Authorization estiver ausente")
    void shouldReturn401WhenAuthorizationHeaderIsMissing() {
        webTestClient.get()
                .uri("/api/v1/fleet")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Deve retornar 401 quando o cabeçalho não começar com 'Bearer '")
    void shouldReturn401WhenAuthorizationHeaderIsNotBearer() {
        webTestClient.get()
                .uri("/api/v1/fleet")
                .header(HttpHeaders.AUTHORIZATION, "Basic dXNlcjpwYXNz")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Deve retornar 401 quando o token JWT for inválido ou malformado")
    void shouldReturn401WhenTokenIsInvalid() {
        webTestClient.get()
                .uri("/api/v1/fleet")
                .header(HttpHeaders.AUTHORIZATION, "Bearer not.a.valid.jwt")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Rota pública /actuator/health não deve exigir JWT")
    void shouldAllowPublicActuatorWithoutToken() {
        // The contract we care about is: the JWT filter MUST NOT block
        // the public actuator endpoint. The exact response status
        // depends on the gateway's readiness state and may be 200
        // (everything UP) or 503 (still starting up) — what matters
        // is that it is never 401.
        var status = webTestClient.get()
                .uri("/actuator/health")
                .exchange()
                .returnResult(org.springframework.http.ResponseEntity.class)
                .getStatus();

        assertThat(status)
                .as("actuator must never be blocked by the JWT filter")
                .isNotEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Constantes do filtro não devem mudar silenciosamente")
    void filterConstantsShouldNotChange() {
        assertThat(JwtAuthenticationFilter.injectedHeaders())
                .containsExactlyInAnyOrder(
                        JwtAuthenticationFilter.HEADER_USER_EMAIL,
                        JwtAuthenticationFilter.HEADER_USER_ID,
                        JwtAuthenticationFilter.HEADER_USER_ROLES);
    }

    /**
     * Provides a deterministic in-memory {@link ReactiveDiscoveryClient}
     * so the gateway's load balancer can resolve every {@code lb://*}
     * URI to a stub localhost instance during tests.
     */
    @TestConfiguration
    static class StubDiscoveryConfig {

        @Bean
        ReactiveDiscoveryClient stubReactiveDiscoveryClient() {
            return new StubReactiveDiscoveryClient();
        }
    }

    static class StubReactiveDiscoveryClient implements ReactiveDiscoveryClient {
        @Override
        public String description() {
            return "stub-discovery-client";
        }

        @Override
        public Flux<ServiceInstance> getInstances(String serviceId) {
            return Flux.just(new DefaultServiceInstance(
                    serviceId + "-1", serviceId, "localhost", 9_999, false));
        }

        @Override
        public Flux<String> getServices() {
            // Returning every known service id keeps the gateway's
            // discovery lookup happy without bringing up real services.
            return Flux.just("auth-service", "fleet-mapping-service",
                    "telemetry-ingestion-service", "alert-processing-service");
        }
    }
}
