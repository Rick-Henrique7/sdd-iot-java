package com.johndeere.agrio.auth.infrastructure.security;

import com.johndeere.agrio.auth.domain.service.PasswordEncoderService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Bridges the domain {@link PasswordEncoderService} to Spring
 * Security's {@link BCryptPasswordEncoder}. Lives in the
 * infrastructure layer so the domain stays free of Spring imports.
 */
@Component
public class BcryptPasswordEncoderAdapter implements PasswordEncoderService {

    private final BCryptPasswordEncoder delegate;

    public BcryptPasswordEncoderAdapter(BCryptPasswordEncoder delegate) {
        this.delegate = delegate;
    }

    @Override
    public String encode(String rawPassword) {
        return delegate.encode(rawPassword);
    }

    @Override
    public boolean matches(String rawPassword, String storedHash) {
        return delegate.matches(rawPassword, storedHash);
    }
}
