package com.johndeere.agrio.telemetry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Agro-IoT telemetry-ingestion-service.
 *
 * <p>Pure background worker: consumes {@code agri.telemetry.raw},
 * updates Redis, persists to PostgreSQL, republishes to
 * {@code agri.telemetry.processed}. No REST endpoints are exposed
 * in this change.</p>
 */
@SpringBootApplication
public class TelemetryIngestionApplication {

    public static void main(String[] args) {
        SpringApplication.run(TelemetryIngestionApplication.class, args);
    }
}
