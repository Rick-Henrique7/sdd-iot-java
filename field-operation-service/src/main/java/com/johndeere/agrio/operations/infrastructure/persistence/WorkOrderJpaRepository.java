package com.johndeere.agrio.operations.infrastructure.persistence;

import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkOrderJpaRepository extends JpaRepository<WorkOrderEntity, String> {

    Page<WorkOrderEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<WorkOrderEntity> findByStatus(WorkOrderStatus status, Pageable pageable);

    Page<WorkOrderEntity> findByEquipmentId(String equipmentId, Pageable pageable);

    Page<WorkOrderEntity> findByStatusAndEquipmentId(
        WorkOrderStatus status,
        String equipmentId,
        Pageable pageable
    );
}
