package com.johndeere.agrio.auth.domain.exception;

/**
 * Thrown when authentication fails for any reason: unknown email,
 * wrong password, or both. The message MUST NOT disclose which of
 * the two failed — the API contract returns a single
 * {@code 401 Unauthorized} with a generic message.
 */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
