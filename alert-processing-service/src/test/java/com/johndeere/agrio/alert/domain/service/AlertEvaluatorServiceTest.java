package com.johndeere.agrio.alert.domain.service;

import com.johndeere.agrio.alert.domain.model.Alert;
import com.johndeere.agrio.alert.domain.model.AlertSeverity;
import com.johndeere.agrio.alert.domain.model.TelemetryData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class AlertEvaluatorServiceTest {

    private AlertEvaluatorService evaluator;

    @BeforeEach
    void setUp() {
        evaluator = new AlertEvaluatorService();
    }

    @Test
    @DisplayName("CRITICAL quando engineTemp > 95°C")
    void shouldGenerateCriticalWhenEngineTempExceedsThreshold() {
        TelemetryData t = new TelemetryData("TRAC-01", Instant.now(), 98.5, 2000.0, 50.0, 10.0);

        Optional<Alert> result = evaluator.evaluate(t);

        assertThat(result).isPresent();
        Alert a = result.get();
        assertThat(a.getSeverity()).isEqualTo(AlertSeverity.CRITICAL);
        assertThat(a.getMetricName()).isEqualTo("engineTemp");
        assertThat(a.getCurrentValue()).isEqualTo(98.5);
        assertThat(a.getThresholdValue()).isEqualTo(95.0);
        assertThat(a.getMessage()).contains("98.5");
        assertThat(a.getEquipmentId()).isEqualTo("TRAC-01");
    }

    @Test
    @DisplayName("WARNING quando rpm > 2500 (e temperatura normal)")
    void shouldGenerateWarningWhenRpmExceedsThreshold() {
        TelemetryData t = new TelemetryData("TRAC-02", Instant.now(), 90.0, 2600.0, 50.0, 10.0);

        Optional<Alert> result = evaluator.evaluate(t);

        assertThat(result).isPresent();
        Alert a = result.get();
        assertThat(a.getSeverity()).isEqualTo(AlertSeverity.WARNING);
        assertThat(a.getMetricName()).isEqualTo("rpm");
        assertThat(a.getCurrentValue()).isEqualTo(2600.0);
        assertThat(a.getThresholdValue()).isEqualTo(2500.0);
    }

    @Test
    @DisplayName("Sem alerta quando metricas dentro dos limites")
    void shouldNotGenerateAlertWhenMetricsAreNormal() {
        TelemetryData t = new TelemetryData("TRAC-03", Instant.now(), 88.0, 2000.0, 60.0, 12.0);

        Optional<Alert> result = evaluator.evaluate(t);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Limite exatamente em 95.0 / 2500.0 NAO dispara alerta (regra e' estritamente '>')")
    void shouldNotGenerateAlertAtExactThreshold() {
        TelemetryData atTempLimit = new TelemetryData("TRAC-04", Instant.now(), 95.0, 2000.0, 50.0, 10.0);
        TelemetryData atRpmLimit  = new TelemetryData("TRAC-05", Instant.now(), 90.0, 2500.0, 50.0, 10.0);

        assertThat(evaluator.evaluate(atTempLimit)).isEmpty();
        assertThat(evaluator.evaluate(atRpmLimit)).isEmpty();
    }
}
