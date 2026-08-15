package com.johndeere.agrio.auth.usecase;

import com.johndeere.agrio.auth.domain.exception.DuplicateEmailException;
import com.johndeere.agrio.auth.domain.model.User;
import com.johndeere.agrio.auth.domain.model.UserRole;
import com.johndeere.agrio.auth.domain.service.PasswordEncoderService;
import com.johndeere.agrio.auth.infrastructure.persistence.UserEntity;
import com.johndeere.agrio.auth.infrastructure.persistence.UserEntityMapper;
import com.johndeere.agrio.auth.infrastructure.persistence.UserJpaRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

/**
 * Registers a new user, enforcing:
 * <ul>
 *     <li>Email uniqueness (mapped to {@code 409 Conflict}).</li>
 *     <li>Password hashing via the domain
 *         {@link PasswordEncoderService} — the plain text is never
 *         persisted.</li>
 *     <li>Stable, opaque user id generation
 *         ({@code usr-<8 random hex chars>}).</li>
 * </ul>
 */
@Service
public class RegisterUserUseCase {

    private final UserJpaRepository repository;
    private final PasswordEncoderService encoder;
    private final UserEntityMapper mapper;

    public RegisterUserUseCase(UserJpaRepository repository,
                               PasswordEncoderService encoder,
                               UserEntityMapper mapper) {
        this.repository = repository;
        this.encoder = encoder;
        this.mapper = mapper;
    }

    public User execute(String name, String email, String rawPassword, UserRole role) {
        if (repository.existsByEmail(email)) {
            throw new DuplicateEmailException(email);
        }

        String id = "usr-" + UUID.randomUUID().toString().substring(0, 8);
        String hash = encoder.encode(rawPassword);
        Instant now = Instant.now();

        UserEntity entity = new UserEntity(id, name, email, hash, role.name(), now);
        UserEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }
}
