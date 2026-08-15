package com.johndeere.agrio.auth.usecase;

import com.johndeere.agrio.auth.domain.exception.DuplicateEmailException;
import com.johndeere.agrio.auth.domain.model.User;
import com.johndeere.agrio.auth.domain.model.UserRole;
import com.johndeere.agrio.auth.domain.service.PasswordEncoderService;
import com.johndeere.agrio.auth.infrastructure.persistence.UserEntity;
import com.johndeere.agrio.auth.infrastructure.persistence.UserEntityMapper;
import com.johndeere.agrio.auth.infrastructure.persistence.UserJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RegisterUserUseCaseTest {

    private UserJpaRepository repository;
    private PasswordEncoderService encoder;
    private UserEntityMapper mapper;
    private RegisterUserUseCase useCase;

    @BeforeEach
    void setUp() {
        repository = mock(UserJpaRepository.class);
        encoder = mock(PasswordEncoderService.class);
        mapper = new UserEntityMapper();
        useCase = new RegisterUserUseCase(repository, encoder, mapper);
    }

    @Test
    @DisplayName("Deve registrar um novo usuário e devolver o User de domínio")
    void shouldRegisterNewUser() {
        when(repository.existsByEmail("joao@johndeere.com")).thenReturn(false);
        when(encoder.encode("Secret123!")).thenReturn("hashed::Secret123!");
        when(repository.save(any(UserEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = useCase.execute("Joao", "joao@johndeere.com", "Secret123!", UserRole.ROLE_OPERADOR);

        assertThat(result.getId()).startsWith("usr-");
        assertThat(result.getEmail()).isEqualTo("joao@johndeere.com");
        assertThat(result.getRole()).isEqualTo(UserRole.ROLE_OPERADOR);
        assertThat(result.getPasswordHash()).isEqualTo("hashed::Secret123!");
    }

    @Test
    @DisplayName("A senha plain-text JAMAIS deve ser persistida (apenas o hash)")
    void shouldNeverPersistPlainPassword() {
        // Realistic BCrypt-shaped hash that does NOT contain the raw password.
        String realisticHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        when(repository.existsByEmail(any())).thenReturn(false);
        when(encoder.encode("Secret123!")).thenReturn(realisticHash);
        when(repository.save(any(UserEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);

        useCase.execute("Joao", "joao@johndeere.com", "Secret123!", UserRole.ROLE_OPERADOR);

        org.mockito.Mockito.verify(repository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash())
                .isEqualTo(realisticHash)
                .doesNotContain("Secret123!");
    }

    @Test
    @DisplayName("Deve lançar DuplicateEmailException quando o email já existe")
    void shouldThrowOnDuplicateEmail() {
        when(repository.existsByEmail("dup@johndeere.com")).thenReturn(true);

        assertThatThrownBy(() -> useCase.execute("Joao", "dup@johndeere.com", "Secret123!", UserRole.ROLE_OPERADOR))
                .isInstanceOf(DuplicateEmailException.class);
    }
}
