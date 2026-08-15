package com.johndeere.agrio.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.johndeere.agrio.auth.adapters.controller.ApiExceptionHandler;
import com.johndeere.agrio.auth.adapters.controller.AuthController;
import com.johndeere.agrio.auth.adapters.dto.LoginRequestDTO;
import com.johndeere.agrio.auth.adapters.dto.RegisterRequestDTO;
import com.johndeere.agrio.auth.domain.model.UserRole;
import com.johndeere.agrio.auth.infrastructure.security.JwtProvider;
import com.johndeere.agrio.auth.usecase.AuthenticateUserUseCase;
import com.johndeere.agrio.auth.usecase.RegisterUserUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Slice test of {@link AuthController} plus
 * {@link ApiExceptionHandler}. Use cases and the {@link JwtProvider}
 * are mocked so we exercise only the web layer.
 *
 * <p>{@code addFilters = false} disables Spring Security filters for
 * the test so we do not need to send a CSRF token on every POST.
 * Security is tested end-to-end via the {@code SecurityConfig}
 * separately when needed.</p>
 */
@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiExceptionHandler.class)
@TestPropertySource(properties = {
        "jwt.secret=test-secret-test-secret-test-secret-12345678"
})
class AuthControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private AuthenticateUserUseCase authenticateUserUseCase;
    @MockBean private RegisterUserUseCase registerUserUseCase;
    @MockBean private JwtProvider jwtProvider;

    @Test
    @DisplayName("POST /api/v1/auth/register 201 com payload válido")
    void shouldReturn201OnSuccessfulRegister() throws Exception {
        when(jwtProvider.getExpirationSeconds()).thenReturn(43200L);
        when(jwtProvider.generateToken(any())).thenReturn("fake.jwt.token");
        when(registerUserUseCase.execute(eq("Joao"), eq("joao@johndeere.com"),
                eq("Secret123!"), eq(UserRole.ROLE_OPERADOR)))
                .thenReturn(new com.johndeere.agrio.auth.domain.model.User(
                        "usr-1", "Joao", "joao@johndeere.com", "hashed", UserRole.ROLE_OPERADOR));

        var payload = new RegisterRequestDTO("Joao", "joao@johndeere.com", "Secret123!", UserRole.ROLE_OPERADOR);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("fake.jwt.token"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.expiresInSeconds").value(43200))
                .andExpect(jsonPath("$.user.email").value("joao@johndeere.com"))
                .andExpect(jsonPath("$.user.role").value("ROLE_OPERADOR"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login 200 com credenciais válidas")
    void shouldReturn200OnSuccessfulLogin() throws Exception {
        when(jwtProvider.getExpirationSeconds()).thenReturn(43200L);
        when(jwtProvider.generateToken(any())).thenReturn("fake.jwt.token");
        when(authenticateUserUseCase.execute(eq("joao@johndeere.com"), eq("Secret123!")))
                .thenReturn(new com.johndeere.agrio.auth.domain.model.User(
                        "usr-1", "Joao", "joao@johndeere.com", "hashed", UserRole.ROLE_OPERADOR));

        var payload = new LoginRequestDTO("joao@johndeere.com", "Secret123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake.jwt.token"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login 401 quando as credenciais são inválidas")
    void shouldReturn401OnInvalidCredentials() throws Exception {
        when(authenticateUserUseCase.execute(any(), any()))
                .thenThrow(new com.johndeere.agrio.auth.domain.exception.InvalidCredentialsException("nope"));

        var payload = new LoginRequestDTO("joao@johndeere.com", "WrongPass");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_INVALID_CREDENTIALS"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register 400 quando o body é inválido")
    void shouldReturn400OnInvalidBody() throws Exception {
        String badJson = "{\"email\": \"not-an-email\", \"password\": \"\"}";

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("AUTH_VALIDATION_ERROR"));
    }
}
