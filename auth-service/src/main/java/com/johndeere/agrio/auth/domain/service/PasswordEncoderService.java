package com.johndeere.agrio.auth.domain.service;

/**
 * Domain-level abstraction for password hashing. The implementation
 * (BCrypt, argon2, scrypt, ...) lives in the infrastructure layer so
 * the domain stays free of crypto libraries.
 */
public interface PasswordEncoderService {

    /**
     * @param rawPassword the plain-text password supplied by the user.
     * @return the cryptographic hash to be persisted.
     */
    String encode(String rawPassword);

    /**
     * @param rawPassword  the candidate plain-text password.
     * @param storedHash   the hash previously produced by {@link #encode}.
     * @return {@code true} iff the candidate matches the stored hash.
     */
    boolean matches(String rawPassword, String storedHash);
}
