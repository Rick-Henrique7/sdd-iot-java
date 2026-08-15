package com.johndeere.agrio.telemetry.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TelemetryJpaRepository extends JpaRepository<TelemetryEntity, Long> {
}
