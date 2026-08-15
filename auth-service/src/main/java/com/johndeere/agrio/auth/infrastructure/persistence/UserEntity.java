package com.johndeere.agrio.auth.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;

/**
 * JPA mapping of the {@code users} table in the {@code auth}
 * schema. Field names mirror column names; column types are aligned
 * with the schema described in
 * {@code changes/002-auth-service/spec.md}.
 */
@Entity
@Table(name = "users", schema = "auth")
public class UserEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "email", length = 255, nullable = false, unique = true)
    private String email;

    @Column(name = "password", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "role", length = 32, nullable = false)
    private String role;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected UserEntity() {
        // JPA
    }

    public UserEntity(String id,
                      String name,
                      String email,
                      String passwordHash,
                      String role,
                      Instant createdAt) {
        this.id = Objects.requireNonNull(id);
        this.name = Objects.requireNonNull(name);
        this.email = Objects.requireNonNull(email);
        this.passwordHash = Objects.requireNonNull(passwordHash);
        this.role = Objects.requireNonNull(role);
        this.createdAt = Objects.requireNonNull(createdAt);
    }

    public String getId()           { return id; }
    public String getName()         { return name; }
    public String getEmail()        { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole()         { return role; }
    public Instant getCreatedAt()   { return createdAt; }

    public void setId(String id)             { this.id = id; }
    public void setName(String name)         { this.name = name; }
    public void setEmail(String email)       { this.email = email; }
    public void setPasswordHash(String hash) { this.passwordHash = hash; }
    public void setRole(String role)         { this.role = role; }
    public void setCreatedAt(Instant t)      { this.createdAt = t; }
}
