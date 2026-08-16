package com.johndeere.agrio.alert.infrastructure.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP configuration for the alert and telemetry channels.
 *
 * <ul>
 *     <li>Endpoint: {@code /ws} (plain WebSocket — no SockJS).
 *         The front-end connects directly with
 *         {@code @stomp/stompjs} v7's native WebSocket factory,
 *         which is simpler than bundling a SockJS client.</li>
 *     <li>Simple in-memory broker on {@code /topic} (so
 *         {@code SimpMessagingTemplate.convertAndSend("/topic/alerts", ...)}
 *         and {@code /topic/telemetry} reach every subscribed
 *         client).</li>
 *     <li>Application destination prefix: {@code /app} (reserved
 *         for future client-to-server messages).</li>
 * </ul>
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
