package com.johndeere.agrio.auth.domain.model;

/**
 * Roles supported by the platform. The literal string returned by
 * {@code name()} is the value embedded in JWT claims and is what the
 * front-end and downstream services use to authorize actions.
 *
 * <p>All values carry the {@code ROLE_} prefix by Spring Security
 * convention so they can be matched directly by
 * {@code hasRole("OPERADOR")} in any future security expression.</p>
 */
public enum UserRole {
    ROLE_OPERADOR,
    ROLE_AGRONOMO,
    ROLE_GESTOR;

    public static UserRole fromString(String raw) {
        if (raw == null) {
            throw new IllegalArgumentException("role is required");
        }
        try {
            return UserRole.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Unknown role: " + raw + ". Expected one of "
                            + java.util.Arrays.toString(values()));
        }
    }
}
