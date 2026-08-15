package com.johndeere.agrio.alert.infrastructure;

import com.johndeere.agrio.alert.domain.model.TelemetryData;
import com.johndeere.agrio.alert.infrastructure.kafka.ProcessedTelemetryConsumer;
import com.johndeere.agrio.alert.infrastructure.persistence.AlertJpaRepository;
import com.johndeere.agrio.alert.infrastructure.websocket.AlertWebSocketPublisher;
import com.johndeere.agrio.alert.usecase.EvaluateTelemetryAlertUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

/**
 * Boots an in-memory Kafka broker, publishes a telemetry envelope
 * to {@code agri.telemetry.processed} and asserts the consumer +
 * use case chain fires. The JPA / WebSocket layers are mocked so
 * the test does not need a real infrastructure stack.
 */
@SpringBootTest
@EmbeddedKafka(
        partitions = 1,
        topics = { "agri.telemetry.processed" },
        brokerProperties = { "listeners=PLAINTEXT://localhost:0" }
)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}"
})
class ProcessedTelemetryConsumerTest {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @MockBean
    private EvaluateTelemetryAlertUseCase useCase;

    @MockBean
    private AlertJpaRepository alertJpaRepository;

    @MockBean
    private AlertWebSocketPublisher alertWebSocketPublisher;

    @MockBean
    private SimpMessagingTemplate messagingTemplate;

    @Test
    @DisplayName("Deve consumir uma mensagem valida e chamar o use case")
    void shouldConsumeValidMessageAndExecuteUseCase() {
        String payload = """
                {
                  "equipmentId": "TRAC-99",
                  "timestamp": "2026-08-15T18:00:00Z",
                  "gps": { "latitude": -21.17, "longitude": -47.81 },
                  "metrics": { "engineTemp": 99.5, "rpm": 2000, "fuelLevel": 50.0, "speed": 12.0 }
                }
                """;

        kafkaTemplate.send("agri.telemetry.processed", "TRAC-99", payload);

        verify(useCase, timeout(10_000).atLeastOnce())
                .execute(any(TelemetryData.class));
    }

    @Test
    @DisplayName("Deve re-broadcast no /topic/telemetry para o dashboard")
    void shouldPublishToTelemetryTopicForDashboard() {
        String payload = """
                {
                  "equipmentId": "TRAC-99",
                  "timestamp": "2026-08-15T18:00:00Z",
                  "gps": { "latitude": -21.17, "longitude": -47.81 },
                  "metrics": { "engineTemp": 99.5, "rpm": 2000, "fuelLevel": 50.0, "speed": 12.0 }
                }
                """;

        kafkaTemplate.send("agri.telemetry.processed", "TRAC-99", payload);

        // The consumer fans the envelope out to the broker on the
        // /topic/telemetry destination so the front-end dashboard
        // can stream live values (Change 008).
        verify(messagingTemplate, timeout(10_000).atLeastOnce())
                .convertAndSend(eq("/topic/telemetry"), any(Object.class));
    }

    @Test
    @DisplayName("Mensagem malformada deve ser pulada sem chamar o use case")
    void shouldSkipMalformedMessageWithoutCallingUseCase() throws InterruptedException {
        String bad = "{ this is not valid json";

        kafkaTemplate.send("agri.telemetry.processed", "broken", bad);

        // Give the consumer time to consume and skip the bad message.
        Thread.sleep(500);

        verify(useCase, never()).execute(any(TelemetryData.class));
    }
}
