package com.johndeere.agrio.fleet.usecase;

import com.johndeere.agrio.fleet.adapters.dto.EquipmentDTO;
import com.johndeere.agrio.fleet.domain.model.EquipmentStatus;
import com.johndeere.agrio.fleet.domain.model.EquipmentType;
import com.johndeere.agrio.fleet.infrastructure.persistence.EntityMappers;
import com.johndeere.agrio.fleet.infrastructure.persistence.EquipmentEntity;
import com.johndeere.agrio.fleet.infrastructure.persistence.EquipmentJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ListFleetUseCaseTest {

    private EquipmentJpaRepository repository;
    private EntityMappers mappers;
    private ListFleetUseCase useCase;

    @BeforeEach
    void setUp() {
        repository = mock(EquipmentJpaRepository.class);
        mappers = new EntityMappers();
        useCase = new ListFleetUseCase(repository, mappers);
    }

    @Test
    @DisplayName("Deve listar todos os equipamentos ordenados por id")
    void shouldListAllEquipment() {
        EquipmentEntity e1 = new EquipmentEntity(
                "TRAC-01", "Tractor 1", "7230J", "SN-1",
                "TRACTOR", "OPERATIONAL", 100.0, null);
        EquipmentEntity e2 = new EquipmentEntity(
                "TRAC-02", "Tractor 2", "7230J", "SN-2",
                "TRACTOR", "OPERATIONAL", 200.0, null);
        when(repository.findAll(any(Sort.class))).thenReturn(List.of(e1, e2));

        List<EquipmentDTO> result = useCase.execute();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo("TRAC-01");
        assertThat(result.get(1).id()).isEqualTo("TRAC-02");
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando nao ha equipamento")
    void shouldReturnEmptyListWhenNoEquipment() {
        when(repository.findAll(any(Sort.class))).thenReturn(List.of());

        List<EquipmentDTO> result = useCase.execute();

        assertThat(result).isEmpty();
    }
}
