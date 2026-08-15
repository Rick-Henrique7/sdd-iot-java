package com.johndeere.agrio.fleet.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentJpaRepository extends JpaRepository<EquipmentEntity, String> {
}
