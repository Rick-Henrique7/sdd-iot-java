package com.johndeere.agrio.alert.domain.service;

import com.johndeere.agrio.alert.domain.model.Alert;
import com.johndeere.agrio.alert.domain.model.AlertSeverity;
import com.johndeere.agrio.alert.domain.model.TelemetryData;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Pure rule engine. {@code @Service} is the *only* framework
 * hint: it lets Spring find and instantiate the bean. The class
 * body itself is framework-agnostic.
 *
 * <p>Rules (evaluated in order, first match wins):</p>
 * <ol>
 *     <li>{@code engineTemp > MAX_ENGINE_TEMP} → {@link AlertSeverity#CRITICAL}</li>
 *     <li>{@code rpm > MAX_RPM} → {@link AlertSeverity#WARNING}</li>
 * </ol>
 */
@Service
public class AlertEvaluatorService {

    /** Hard limit for engine temperature, in degrees Celsius. */
    public static final double MAX_ENGINE_TEMP = 95.0;

    /** Hard limit for engine RPM. */
    public static final double MAX_RPM = 2500.0;

    public Optional<Alert> evaluate(TelemetryData telemetry) {
        if (telemetry.getEngineTemp() > MAX_ENGINE_TEMP) {
            return Optional.of(new Alert(
                    UUID.randomUUID().toString(),
                    telemetry.getEquipmentId(),
                    AlertSeverity.CRITICAL,
                    "engineTemp",
                    telemetry.getEngineTemp(),
                    MAX_ENGINE_TEMP,
                    "Temperatura do motor acima do limite crítico seguro ("
                            + telemetry.getEngineTemp() + "°C).",
                    Instant.now()
            ));
        }

        if (telemetry.getRpm() > MAX_RPM) {
            return Optional.of(new Alert(
                    UUID.randomUUID().toString(),
                    telemetry.getEquipmentId(),
                    AlertSeverity.WARNING,
                    "rpm",
                    telemetry.getRpm(),
                    MAX_RPM,
                    "Operação em rotação elevada ("
                            + telemetry.getRpm() + " RPM). Risco de desgaste prematuro.",
                    Instant.now()
            ));
        }

        return Optional.empty();
    }
}
