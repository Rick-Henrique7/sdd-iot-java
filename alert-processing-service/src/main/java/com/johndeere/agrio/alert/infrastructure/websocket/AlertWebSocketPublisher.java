package com.johndeere.agrio.alert.infrastructure.websocket;

import com.johndeere.agrio.alert.adapters.dto.AlertDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes alert frames on the STOMP {@code /topic/alerts}
 * destination. {@code SimpMessagingTemplate} is auto-configured
 * by {@code @EnableWebSocketMessageBroker}.
 */
@Component
public class AlertWebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public AlertWebSocketPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishAlert(AlertDTO alertDTO) {
        messagingTemplate.convertAndSend("/topic/alerts", alertDTO);
    }
}
