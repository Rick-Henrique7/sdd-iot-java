package com.johndeere.agrio.fleet.usecase;

import com.johndeere.agrio.fleet.adapters.dto.EquipmentDTO;
import com.johndeere.agrio.fleet.domain.model.Equipment;
import com.johndeere.agrio.fleet.domain.model.EquipmentStatus;
import com.johndeere.agrio.fleet.domain.model.EquipmentType;
import com.johndeere.agrio.fleet.infrastructure.persistence.EntityMappers;
import com.johndeere.agrio.fleet.infrastructure.persistence.EquipmentEntity;
import com.johndeere.agrio.fleet.infrastructure.persistence.EquipmentJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RegisterEquipmentUseCaseTest {

    private EquipmentJpaRepository repository;
    private EntityMappers mappers;
    private RegisterEquipmentUseCase useCase;

    @BeforeEach
    void setUp() {
        repository = mock(EquipmentJpaRepository.class);
        mappers = new EntityMappers();
        useCase = new RegisterEquipmentUseCase(repository, mappers);
    }

    @Test
    @DisplayName("Deve persistir e devolver o DTO com os mesmos campos")
    void shouldPersistAndReturnDto() {
        EquipmentDTO dto = new EquipmentDTO(
                "TRAC-01", "Trator 7230J", "7230J", "1BM-0001",
                EquipmentType.TRACTOR, EquipmentStatus.OPERATIONAL,
                100.0, "2026-06-10");
        when(repository.save(any(EquipmentEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        EquipmentDTO result = useCase.execute(dto);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo("TRAC-01");
        assertThat(result.type()).isEqualTo(EquipmentType.TRACTOR);
        assertThat(result.lastMaintenanceDate()).isEqualTo("2026-06-10");
        verify(repository).save(any(EquipmentEntity.class));
    }

    @Test
    @DisplayName("Deve aceitar lastMaintenanceDate nula")
    void shouldAcceptNullLastMaintenanceDate() {
        EquipmentDTO dto = new EquipmentDTO(
                "TRAC-02", "Trator Novo", "7230J", "1BM-0002",
                EquipmentType.TRACTOR, EquipmentStatus.OPERATIONAL,
                0.0, null);
        when(repository.save(any(EquipmentEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        EquipmentDTO result = useCase.execute(dto);

        assertThat(result.lastMaintenanceDate()).isNull();
    }

    @Test
    @DisplayName("Deve rejeitar horometerHours negativo no dominio")
    void shouldRejectNegativeHorometerHours() {
        EquipmentDTO dto = new EquipmentDTO(
                "TRAC-03", "Trator Bug", "7230J", "1BM-0003",
                EquipmentType.TRACTOR, EquipmentStatus.OPERATIONAL,
                -1.0, null);

        org.assertj.core.api.Assertions
                .assertThatThrownBy(() -> useCase.execute(dto))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
