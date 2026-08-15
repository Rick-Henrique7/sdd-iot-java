package com.johndeere.agrio.alert.infrastructure.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP / SockJS configuration for the alert channel.
 *
 * <ul>
 *     <li>Endpoint: {@code /ws} (with SockJS fallback).</li>
 *     <li>Simple in-memory broker on {@code /topic} (so
 *         {@code SimpMessagingTemplate.convertAndSend("/topic/alerts", ...)}
 *         reaches all subscribed clients).</li>
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
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
