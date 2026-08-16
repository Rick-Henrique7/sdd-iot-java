package com.johndeere.agrio.operations.adapters.dto;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * Generic page envelope for paginated GET endpoints (Change 022).
 *
 * <p>We don't expose Spring's {@code Page<T>} directly because its JSON
 * shape is implementation-specific and can change between Spring versions.
 */
public record PageResponseDTO<T>(
        List<T> content,
        long totalElements,
        int totalPages,
        int page,
        int size) {

    public static <S, T> PageResponseDTO<T> of(Page<S> page, Function<S, T> mapper) {
        return new PageResponseDTO<>(
                page.getContent().stream().map(mapper).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize());
    }
}
