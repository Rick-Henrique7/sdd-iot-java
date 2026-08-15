package com.johndeere.agrio.alert;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Agro-IoT alert-processing-service.
 *
 * <p>Behind the api-gateway. Subscribes to
 * {@code agri.telemetry.processed}, evaluates rules, persists to
 * PostgreSQL and broadcasts alerts on the STOMP
 * {@code /topic/alerts} channel. No REST endpoints in this change.</p>
 */
@SpringBootApplication
public class AlertProcessingApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlertProcessingApplication.class, args);
    }
}
