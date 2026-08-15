package com.johndeere.agrio.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Agro-IoT auth-service.
 *
 * <p>Behind the api-gateway. Exposes the public
 * {@code /api/v1/auth/**} endpoints (login + register) and is the
 * sole issuer of JWTs consumed by the rest of the platform.</p>
 */
@SpringBootApplication
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }
}
