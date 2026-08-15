package com.johndeere.agrio.auth.adapters.dto;

public record AuthResponseDTO(
        String token,
        String type,
        long expiresInSeconds,
        UserSummaryDTO user
) {
    public static AuthResponseDTO bearer(String token, long expiresInSeconds, UserSummaryDTO user) {
        return new AuthResponseDTO(token, "Bearer", expiresInSeconds, user);
    }
}
