package com.johndeere.agrio.fleet.domain.service;

import com.johndeere.agrio.fleet.domain.model.GeoPoint;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Domain services for the fleet + mapping module.
 *
 * <p>Currently only the polygon-area calculation. The Haversine
 * formula treats the polygon as a flat ring of equirectangular
 * distances and sums the triangle areas from a reference vertex.
 * Accurate enough for plots in the 0.1–100 ha range; PostGIS is
 * the future.</p>
 */
@Service
public class FleetDomainService {

    /** Earth's mean radius in metres. */
    private static final double EARTH_RADIUS_M = 6_371_008.8;

    /**
     * Approximate area in hectares of a closed polygon. The
     * polygon does NOT need to be closed (first == last) — the
     * algorithm closes it implicitly.
     */
    public double polygonAreaHectares(List<GeoPoint> polygon) {
        if (polygon == null || polygon.size() < 3) {
            return 0.0;
        }

        // Convert each vertex to a local equirectangular projection
        // (degrees → metres) around the polygon's mean latitude.
        double meanLat = polygon.stream().mapToDouble(GeoPoint::latitude).average().orElse(0.0);
        double latRad = Math.toRadians(meanLat);
        double metresPerDegLat = 111_132.92;
        double metresPerDegLng = 111_412.84 * Math.cos(latRad);

        double sum = 0.0;
        for (int i = 0; i < polygon.size(); i++) {
            GeoPoint a = polygon.get(i);
            GeoPoint b = polygon.get((i + 1) % polygon.size());
            double ax = a.longitude() * metresPerDegLng;
            double ay = a.latitude()  * metresPerDegLat;
            double bx = b.longitude() * metresPerDegLng;
            double by = b.latitude()  * metresPerDegLat;
            sum += (ax * by - bx * ay);
        }

        double areaM2 = Math.abs(sum) / 2.0;
        return areaM2 / 10_000.0; // m² → ha
    }

    /** Exposed for tests; not used in production code paths. */
    public static double earthRadiusMetres() { return EARTH_RADIUS_M; }
}
