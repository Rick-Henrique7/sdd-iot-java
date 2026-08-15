package com.johndeere.agrio.gateway;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Smoke test that ensures the gateway's application context can be
 * loaded with the test secret and without real downstream services.
 *
 * <p>Uses the default {@code MOCK} web environment so the reactive
 * web server auto-configuration is loaded — Spring Cloud Gateway
 * requires {@code ServerProperties} which is only present in the web
 * auto-configuration chain.</p>
 */
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.MOCK,
        properties = {
                "jwt.secret=test-secret-test-secret-test-secret-12345678",
                "spring.profiles.active=test"
        }
)
@TestPropertySource(properties = "spring.main.allow-bean-definition-overriding=true")
class ApiGatewayApplicationTests {

    @Test
    @DisplayName("O contexto do api-gateway deve iniciar sem erros")
    void contextLoads() {
        // If the context fails to start, this test will not run.
    }
}
