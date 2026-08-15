package com.johndeere.agrio.auth.adapters.dto;

import com.johndeere.agrio.auth.domain.model.UserRole;

public record UserSummaryDTO(
        String id,
        String name,
        String email,
        UserRole role
) { }
