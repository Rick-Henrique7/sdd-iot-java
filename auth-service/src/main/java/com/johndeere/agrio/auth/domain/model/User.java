package com.johndeere.agrio.auth.domain.model;

import java.util.Objects;

/**
 * Pure domain representation of an authenticated user. Holds the
 * <em>hash</em> of the password, never the plain text.
 */
public final class User {

    private final String id;
    private final String name;
    private final String email;
    private final String passwordHash;
    private final UserRole role;

    public User(String id,
                String name,
                String email,
                String passwordHash,
                UserRole role) {
        this.id = Objects.requireNonNull(id, "id");
        this.name = Objects.requireNonNull(name, "name");
        this.email = Objects.requireNonNull(email, "email");
        this.passwordHash = Objects.requireNonNull(passwordHash, "passwordHash");
        this.role = Objects.requireNonNull(role, "role");
    }

    public String getId()        { return id; }
    public String getName()      { return name; }
    public String getEmail()     { return email; }
    public String getPasswordHash() { return passwordHash; }
    public UserRole getRole()    { return role; }
}
