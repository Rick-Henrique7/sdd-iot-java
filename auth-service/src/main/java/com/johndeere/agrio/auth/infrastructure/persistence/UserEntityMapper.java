package com.johndeere.agrio.auth.infrastructure.persistence;

import com.johndeere.agrio.auth.domain.model.User;
import com.johndeere.agrio.auth.domain.model.UserRole;
import org.springframework.stereotype.Component;

/**
 * Maps between the JPA {@link UserEntity} and the pure-domain
 * {@link User}. Lives in infrastructure so the domain layer never
 * imports JPA classes.
 */
@Component
public class UserEntityMapper {

    public User toDomain(UserEntity entity) {
        return new User(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPasswordHash(),
                UserRole.valueOf(entity.getRole())
        );
    }
}
