package com.johndeere.agrio.fleet.usecase;

import com.johndeere.agrio.fleet.adapters.dto.HeatmapPointDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * MVP heatmap data source. Generates a deterministic array of
 * {@code HeatmapPointDTO} for the requested {@code fieldId}:
 *
 * <ul>
 *     <li>Centre point is derived deterministically from the
 *         {@code fieldId} hash code (bounded around a fixed
 *         origin in São Paulo state, Brazil — 22°S, 47°W).</li>
 *     <li>Eight points are placed on a 0.001-degree-radius
 *         circle around the centre.</li>
 *     <li>Intensity oscillates between 0.6 and 1.0 using a
 *         deterministic function of the index and the
 *         {@code fieldId}.</li>
 * </ul>
 *
 * <p>Same {@code fieldId} always returns the same array, so the
 * front-end can cache snapshots without re-fetching on every
 * page load.</p>
 */
@Service
public class GetHeatmapDataUseCase {

    private static final int    POINT_COUNT     = 8;
    private static final double ORIGIN_LATITUDE  = -22.0; // reference for the synthetic map
    private static final double ORIGIN_LONGITUDE = -47.0;
    private static final double RADIUS_DEGREES   = 0.001;
    private static final double MIN_INTENSITY   = 0.6;
    private static final double MAX_INTENSITY   = 1.0;

    public List<HeatmapPointDTO> execute(String fieldId) {
        Objects.requireNonNull(fieldId, "fieldId");
        if (fieldId.isBlank()) {
            return List.of();
        }

        int hash = Math.abs(fieldId.hashCode());
        double centerLat = ORIGIN_LATITUDE  + ((hash % 1000) / 1000.0 - 0.5) * 0.1;
        double centerLng = ORIGIN_LONGITUDE + (((hash / 1000) % 1000) / 1000.0 - 0.5) * 0.1;

        List<HeatmapPointDTO> result = new ArrayList<>(POINT_COUNT);
        for (int i = 0; i < POINT_COUNT; i++) {
            double angle = 2.0 * Math.PI * i / POINT_COUNT;
            double lat = centerLat + RADIUS_DEGREES * Math.sin(angle);
            double lng = centerLng + RADIUS_DEGREES * Math.cos(angle);
            double intensity = MIN_INTENSITY
                    + (MAX_INTENSITY - MIN_INTENSITY)
                      * Math.abs(Math.sin(angle + hash));
            result.add(new HeatmapPointDTO(round6(lat), round6(lng), round6(intensity)));
        }
        return result;
    }

    private static double round6(double v) {
        return Math.round(v * 1_000_000.0) / 1_000_000.0;
    }
}
