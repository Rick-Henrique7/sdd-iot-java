package com.johndeere.agrio.operations.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DowntimeJpaRepository extends JpaRepository<DowntimeEntity, String> {
}
