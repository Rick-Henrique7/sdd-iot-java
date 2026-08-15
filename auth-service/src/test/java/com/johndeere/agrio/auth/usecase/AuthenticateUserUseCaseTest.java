package com.johndeere.agrio.auth.usecase;

import com.johndeere.agrio.auth.domain.exception.InvalidCredentialsException;
import com.johndeere.agrio.auth.domain.model.User;
import com.johndeere.agrio.auth.domain.model.UserRole;
import com.johndeere.agrio.auth.domain.service.PasswordEncoderService;
import com.johndeere.agrio.auth.infrastructure.persistence.UserEntity;
import com.johndeere.agrio.auth.infrastructure.persistence.UserEntityMapper;
import com.johndeere.agrio.auth.infrastructure.persistence.UserJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthenticateUserUseCaseTest {

    private UserJpaRepository repository;
    private PasswordEncoderService encoder;
    private UserEntityMapper mapper;
    private AuthenticateUserUseCase useCase;

    @BeforeEach
    void setUp() {
        repository = mock(UserJpaRepository.class);
        encoder = mock(PasswordEncoderService.class);
        mapper = new UserEntityMapper();
        useCase = new AuthenticateUserUseCase(repository, encoder, mapper);
    }

    @Test
    @DisplayName("Deve retornar o usuário quando o email existe e a senha bate")
    void shouldReturnUserWhenCredentialsAreValid() {
        String raw = "Secret123!";
        String hash = "hashed::Secret123!";
        UserEntity entity = new UserEntity(
                "usr-1", "Joao", "joao@johndeere.com",
                hash, UserRole.ROLE_OPERADOR.name(), Instant.now());

        when(repository.findByEmail("joao@johndeere.com")).thenReturn(Optional.of(entity));
        when(encoder.matches(raw, hash)).thenReturn(true);

        User result = useCase.execute("joao@johndeere.com", raw);

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("joao@johndeere.com");
        assertThat(result.getRole()).isEqualTo(UserRole.ROLE_OPERADOR);
    }

    @Test
    @DisplayName("Deve lançar InvalidCredentialsException quando o email não existe")
    void shouldThrowWhenEmailNotFound() {
        when(repository.findByEmail("ghost@johndeere.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute("ghost@johndeere.com", "any"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    @DisplayName("Deve lançar InvalidCredentialsException quando a senha não bate")
    void shouldThrowWhenPasswordDoesNotMatch() {
        String hash = "hashed::Secret123!";
        UserEntity entity = new UserEntity(
                "usr-1", "Joao", "joao@johndeere.com",
                hash, UserRole.ROLE_OPERADOR.name(), Instant.now());

        when(repository.findByEmail("joao@johndeere.com")).thenReturn(Optional.of(entity));
        when(encoder.matches(eq("WrongPass"), eq(hash))).thenReturn(false);

        assertThatThrownBy(() -> useCase.execute("joao@johndeere.com", "WrongPass"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    @DisplayName("Mensagem da exceção NÃO deve diferenciar email inexistente de senha errada")
    void shouldNotLeakWhichCredentialFailed() {
        when(repository.findByEmail("ghost@johndeere.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute("ghost@johndeere.com", "any"))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid");
    }
}
