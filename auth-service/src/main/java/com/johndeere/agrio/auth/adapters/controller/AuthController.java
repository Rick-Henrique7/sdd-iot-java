package com.johndeere.agrio.auth.adapters.controller;

import com.johndeere.agrio.auth.adapters.dto.AuthResponseDTO;
import com.johndeere.agrio.auth.adapters.dto.LoginRequestDTO;
import com.johndeere.agrio.auth.adapters.dto.RegisterRequestDTO;
import com.johndeere.agrio.auth.adapters.dto.UserSummaryDTO;
import com.johndeere.agrio.auth.domain.model.User;
import com.johndeere.agrio.auth.infrastructure.security.JwtProvider;
import com.johndeere.agrio.auth.usecase.AuthenticateUserUseCase;
import com.johndeere.agrio.auth.usecase.RegisterUserUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public authentication endpoints. Both routes are intentionally
 * unauthenticated (the api-gateway exposes {@code /api/v1/auth/**}
 * as public and forwards traffic to this controller).
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticateUserUseCase authenticateUserUseCase;
    private final RegisterUserUseCase registerUserUseCase;
    private final JwtProvider jwtProvider;

    public AuthController(AuthenticateUserUseCase authenticateUserUseCase,
                          RegisterUserUseCase registerUserUseCase,
                          JwtProvider jwtProvider) {
        this.authenticateUserUseCase = authenticateUserUseCase;
        this.registerUserUseCase = registerUserUseCase;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        User user = authenticateUserUseCase.execute(request.email(), request.password());
        return ResponseEntity.ok(buildResponse(user));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        User user = registerUserUseCase.execute(
                request.name(),
                request.email(),
                request.password(),
                request.role());
        return ResponseEntity.status(HttpStatus.CREATED).body(buildResponse(user));
    }

    private AuthResponseDTO buildResponse(User user) {
        String token = jwtProvider.generateToken(user);
        UserSummaryDTO summary = new UserSummaryDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole());
        return AuthResponseDTO.bearer(token, jwtProvider.getExpirationSeconds(), summary);
    }
}
