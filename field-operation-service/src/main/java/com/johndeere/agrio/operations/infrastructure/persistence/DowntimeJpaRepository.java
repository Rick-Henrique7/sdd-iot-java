package com.johndeere.agrio.operations.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DowntimeJpaRepository extends JpaRepository<DowntimeEntity, String> {

    Page<DowntimeEntity> findAllByOrderByStartTimeDesc(Pageable pageable);

    Page<DowntimeEntity> findByEquipmentId(String equipmentId, Pageable pageable);
}
