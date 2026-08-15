package com.johndeere.agrio.fleet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Agro-IoT fleet-mapping-service.
 *
 * <p>Behind the api-gateway. Provides the master data (equipment,
 * field plots) and the heatmap data consumed by the front-end's
 * {@code leaflet.heat} layer.</p>
 */
@SpringBootApplication
public class FleetMappingApplication {

    public static void main(String[] args) {
        SpringApplication.run(FleetMappingApplication.class, args);
    }
}
