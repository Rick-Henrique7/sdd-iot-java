package com.johndeere.agrio.fleet.adapters.dto;

import java.util.List;

public record FieldPlotDTO(
        String id,
        String name,
        List<GeoPointDTO> polygon,
        double areaHectares
) { }
