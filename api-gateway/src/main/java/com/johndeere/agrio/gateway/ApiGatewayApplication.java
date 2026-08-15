package com.johndeere.agrio.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Agro-IoT platform's edge service.
 *
 * <p>Built on Spring Cloud Gateway (reactive, Netty-based). This service
 * is the single point of entry: it routes REST traffic to the
 * appropriate downstream microservice, validates JWTs at the edge, and
 * centralizes CORS for the Next.js shell app.</p>
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
