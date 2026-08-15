package com.johndeere.agrio.auth.domain.exception;

/**
 * Thrown when registration is attempted with an email that already
 * exists in the repository. Mapped to {@code 409 Conflict} by the
 * controller advice.
 */
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super("Email already registered: " + email);
    }
}
