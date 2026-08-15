package com.johndeere.agrio.fleet.usecase;

import com.johndeere.agrio.fleet.adapters.dto.HeatmapPointDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GetHeatmapDataUseCaseTest {

    private GetHeatmapDataUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = new GetHeatmapDataUseCase();
    }

    @Test
    @DisplayName("Deve devolver 8 pontos para um fieldId valido")
    void shouldReturnEightPoints() {
        List<HeatmapPointDTO> result = useCase.execute("FLD-01");

        assertThat(result).hasSize(8);
    }

    @Test
    @DisplayName("Mesma fieldId deve produzir array identico (determinismo)")
    void shouldBeDeterministic() {
        List<HeatmapPointDTO> first  = useCase.execute("FLD-01");
        List<HeatmapPointDTO> second = useCase.execute("FLD-01");

        assertThat(first).isEqualTo(second);
    }

    @Test
    @DisplayName("Intensities devem estar entre 0.6 e 1.0 (inclusivo)")
    void intensityShouldBeWithinBounds() {
        List<HeatmapPointDTO> result = useCase.execute("FLD-42");

        for (HeatmapPointDTO p : result) {
            assertThat(p.intensity()).isBetween(0.6, 1.0);
        }
    }

    @Test
    @DisplayName("fieldId em branco deve produzir lista vazia")
    void blankFieldIdReturnsEmpty() {
        assertThat(useCase.execute("")).isEmpty();
        assertThat(useCase.execute("   ")).isEmpty();
    }
}
