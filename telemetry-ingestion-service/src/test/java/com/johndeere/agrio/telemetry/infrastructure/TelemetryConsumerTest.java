package com.johndeere.agrio.telemetry.infrastructure;

import com.johndeere.agrio.telemetry.domain.model.TelemetryPayload;
import com.johndeere.agrio.telemetry.infrastructure.persistence.TelemetryJpaRepository;
import com.johndeere.agrio.telemetry.infrastructure.redis.LatestStateRepository;
import com.johndeere.agrio.telemetry.usecase.ProcessTelemetryUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.util.concurrent.TimeUnit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

/**
 * Boots an in-memory Kafka broker, publishes a telemetry message to
 * {@code agri.telemetry.raw} and asserts the consumer + use case
 * chain fires. The Redis / JPA sinks are mocked so the test does
 * not need a real infrastructure stack.
 */
@SpringBootTest
@EmbeddedKafka(
        partitions = 1,
        topics = { "agri.telemetry.raw", "agri.telemetry.processed" },
        brokerProperties = { "listeners=PLAINTEXT://localhost:0" }
)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}"
})
class TelemetryConsumerTest {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @MockBean
    private ProcessTelemetryUseCase processTelemetryUseCase;

    @MockBean
    private LatestStateRepository latestStateRepository;

    @MockBean
    private TelemetryJpaRepository telemetryJpaRepository;

    @Test
    @DisplayName("Deve consumir uma mensagem valida e disparar o use case")
    void shouldConsumeValidMessageAndExecuteUseCase() {
        String payload = """
                {
                  "equipmentId": "TRAC-99",
                  "timestamp": "2026-08-15T12:00:00Z",
                  "gps": { "latitude": -21.17, "longitude": -47.81 },
                  "metrics": { "engineTemp": 88.0, "rpm": 2000, "fuelLevel": 75.0, "speed": 12.0 }
                }
                """;

        kafkaTemplate.send("agri.telemetry.raw", "TRAC-99", payload);

        // Mockito's `timeout` polls the mock until either the
        // verification succeeds or the 10 s budget elapses.
        verify(processTelemetryUseCase, timeout(10_000).atLeastOnce())
                .execute(any(TelemetryPayload.class));
    }

    @Test
    @DisplayName("Mensagem malformada deve ser pulada sem chamar o use case")
    void shouldSkipMalformedMessageWithoutCallingUseCase() throws InterruptedException {
        String bad = "{ this is not valid json";

        kafkaTemplate.send("agri.telemetry.raw", "broken", bad);

        // Give the consumer time to consume (and skip) the bad
        // message. If parsing throws, the consumer logs and
        // commits the offset without delegating to the use case.
        TimeUnit.MILLISECONDS.sleep(500);

        verify(processTelemetryUseCase, never()).execute(any(TelemetryPayload.class));
    }
}
