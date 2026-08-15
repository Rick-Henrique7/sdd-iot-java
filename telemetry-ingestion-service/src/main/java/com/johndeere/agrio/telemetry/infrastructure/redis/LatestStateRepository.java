package com.johndeere.agrio.telemetry.infrastructure.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.johndeere.agrio.telemetry.domain.model.TelemetryPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

/**
 * Redis-backed latest-state cache. The key is
 * {@code telemetry:latest:<equipmentId>} and the value is the JSON
 * serialisation of the {@link TelemetryPayload}.
 */
@Component
public class LatestStateRepository {

    private static final Logger log = LoggerFactory.getLogger(LatestStateRepository.class);
    private static final String KEY_PREFIX = "telemetry:latest:";

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final Duration ttl;

    public LatestStateRepository(StringRedisTemplate redis,
                                 ObjectMapper objectMapper,
                                 @Value("${telemetry.cache.ttl-seconds:0}")
                                 long ttlSeconds) {
        this.redis = redis;
        this.objectMapper = objectMapper;
        this.ttl = ttlSeconds > 0 ? Duration.ofSeconds(ttlSeconds) : null;
    }

    public void saveState(String equipmentId, TelemetryPayload payload) {
        try {
            String body = objectMapper.writeValueAsString(payload);
            String key = KEY_PREFIX + equipmentId;
            if (ttl != null) {
                redis.opsForValue().set(key, body, ttl);
            } else {
                redis.opsForValue().set(key, body);
            }
        } catch (JsonProcessingException ex) {
            log.error("Could not serialise telemetry payload for Redis: {}", ex.getMessage());
            throw new IllegalStateException("Failed to serialise telemetry", ex);
        }
    }

    public Optional<String> readState(String equipmentId) {
        return Optional.ofNullable(redis.opsForValue().get(KEY_PREFIX + equipmentId));
    }
}
