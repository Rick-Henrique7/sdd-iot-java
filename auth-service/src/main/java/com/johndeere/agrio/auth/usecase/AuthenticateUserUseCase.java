package com.johndeere.agrio.auth.usecase;

import com.johndeere.agrio.auth.domain.exception.InvalidCredentialsException;
import com.johndeere.agrio.auth.domain.model.User;
import com.johndeere.agrio.auth.domain.service.PasswordEncoderService;
import com.johndeere.agrio.auth.infrastructure.persistence.UserEntity;
import com.johndeere.agrio.auth.infrastructure.persistence.UserEntityMapper;
import com.johndeere.agrio.auth.infrastructure.persistence.UserJpaRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Authenticates a user given an email and a raw password.
 *
 * <p>Returns the {@link User} on success, throws
 * {@link InvalidCredentialsException} on any failure (unknown email
 * <em>or</em> wrong password). The two failure modes are deliberately
 * indistinguishable to the caller to avoid leaking which emails are
 * registered.</p>
 */
@Service
public class AuthenticateUserUseCase {

    private final UserJpaRepository repository;
    private final PasswordEncoderService encoder;
    private final UserEntityMapper mapper;

    public AuthenticateUserUseCase(UserJpaRepository repository,
                                  PasswordEncoderService encoder,
                                  UserEntityMapper mapper) {
        this.repository = repository;
        this.encoder = encoder;
        this.mapper = mapper;
    }

    public User execute(String email, String rawPassword) {
        Optional<UserEntity> entity = repository.findByEmail(email);
        if (entity.isEmpty()) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        UserEntity found = entity.get();
        if (!encoder.matches(rawPassword, found.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        return mapper.toDomain(found);
    }
}
