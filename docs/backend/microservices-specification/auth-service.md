```markdown
# Especificação Técnica: Auth Service (`auth-service`)

Este documento especifica o microsserviço **Auth Service**, responsável pela gestão de identidades, autenticação de usuários, controle de perfis de acesso e emissão/renovação de tokens JWT na **Plataforma Agro-IoT Integrada**[cite: 1].

---

## 1. Escopo e Responsabilidades

* **Gestão de Usuários:** Cadastro, atualização e manutenção do ciclo de vida de operadores, agrônomos e gestores de frota[cite: 1].
* **Autenticação & Autorização:** Validação de credenciais de acesso via Spring Security com criptografia BCrypt[cite: 1].
* **Emissão e Assinatura de JWT:** Geração de tokens JSON Web Token contendo claims de identidade e permissões (`ROLE_OPERADOR`, `ROLE_AGRONOMO`, `ROLE_GESTOR`)[cite: 1].
* **Persistência de Credenciais:** Controle de dados sensíveis em esquema isolado no PostgreSQL (`schema: auth`)[cite: 1].

---

## 2. Arquitetura do Componente & Estrutura de Pastas

O microsserviço adota Clean Architecture isolada, segregando completamente a lógica de segurança e autenticação do restante da infraestrutura[cite: 1].

```text
auth-service/
├── Dockerfile
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/johndeere/agrio/auth/
    │   │   ├── AuthApplication.java
    │   │   ├── domain/
    │   │   │   ├── model/
    │   │   │   │   ├── User.java
    │   │   │   │   └── UserRole.java
    │   │   │   └── service/
    │   │   │       └── PasswordEncoderService.java
    │   │   ├── usecase/
    │   │   │   ├── AuthenticateUserUseCase.java
    │   │   │   └── RegisterUserUseCase.java
    │   │   ├── infrastructure/
    │   │   │   ├── config/
    │   │   │   │   └── SecurityConfig.java
    │   │   │   ├── security/
    │   │   │   │   └── JwtProvider.java
    │   │   │   └── persistence/
    │   │   │       ├── UserEntity.java
    │   │   │       └── UserJpaRepository.java
    │   │   └── adapters/
    │   │       ├── controller/
    │   │       │   └── AuthController.java
    │   │       └── dto/
    │   │           ├── LoginRequestDTO.java
    │   │           ├── RegisterRequestDTO.java
    │   │           └── AuthResponseDTO.java
    │   └── resources/
    │       └── application.yml
    └── test/
        └── java/com/johndeere/agrio/auth/
            ├── usecase/AuthenticateUserUseCaseTest.java
            └── controller/AuthControllerIntegrationTest.java

```

---

## 3. Contratos de API (Endpoints REST & DTOs)

### 3.1. Autenticação de Usuário (`POST /api/v1/auth/login`)

#### Payload de Requisição (`LoginRequestDTO.java`)

```json
{
  "email": "operador.campo@johndeere.com",
  "password": "SecretPassword123!"
}

```

#### Payload de Resposta (`AuthResponseDTO.java`)

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvcGVyYWRvci5jYW1wb0Bqb2huZGVlcmUuY29tIiwicm9sZXMiOiJST0xFX09QRVJBRE9SIiwiaWF0IjoxNzI0NjI0MDAwLCJleHAiOjE3MjQ2NjcyMDB9...",
  "type": "Bearer",
  "expiresInSeconds": 43200,
  "user": {
    "id": "usr-883921-2026",
    "name": "João da Silva",
    "email": "operador.campo@johndeere.com",
    "role": "ROLE_OPERADOR"
  }
}

```

---

## 4. Emissor de Tokens JWT (`JwtProvider.java`)

Componente infraestrutural responsável por assinar e gerar os tokens JWT consumidos pelo `api-gateway`:

```java
package com.johndeere.agrio.auth.infrastructure.security;

import com.johndeere.agrio.auth.domain.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration-ms:43200000}") // 12 Horas de validade por padrão
    private long expirationMs;

    public String generateToken(User user) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())
                .claim("roles", user.getRole().name())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}

```

---

## 5. Controlador REST de Autenticação (`AuthController.java`)

```java
package com.johndeere.agrio.auth.adapters.controller;

import com.johndeere.agrio.auth.adapters.dto.AuthResponseDTO;
import com.johndeere.agrio.auth.adapters.dto.LoginRequestDTO;
import com.johndeere.agrio.auth.adapters.dto.RegisterRequestDTO;
import com.johndeere.agrio.auth.usecase.AuthenticateUserUseCase;
import com.johndeere.agrio.auth.usecase.RegisterUserUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticateUserUseCase authenticateUserUseCase;
    private final RegisterUserUseCase registerUserUseCase;

    public AuthController(AuthenticateUserUseCase authenticateUserUseCase,
                          RegisterUserUseCase registerUserUseCase) {
        this.authenticateUserUseCase = authenticateUserUseCase;
        this.registerUserUseCase = registerUserUseCase;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authenticateUserUseCase.execute(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = registerUserUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

```

---

## 6. Suíte de Testes Automatizados (JUnit 5 + Mockito)

Validação isolada da lógica de negócios de autenticação e validação de senhas criptografadas:

```java
package com.johndeere.agrio.auth.usecase;

import com.johndeere.agrio.auth.adapters.dto.AuthResponseDTO;
import com.johndeere.agrio.auth.adapters.dto.LoginRequestDTO;
import com.johndeere.agrio.auth.domain.model.User;
import com.johndeere.agrio.auth.domain.model.UserRole;
import com.johndeere.agrio.auth.infrastructure.persistence.UserEntity;
import com.johndeere.agrio.auth.infrastructure.persistence.UserJpaRepository;
import com.johndeere.agrio.auth.infrastructure.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuthenticateUserUseCaseTest {

    private UserJpaRepository userRepository;
    private BCryptPasswordEncoder passwordEncoder;
    private JwtProvider jwtProvider;
    private AuthenticateUserUseCase authenticateUserUseCase;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserJpaRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        jwtProvider = Mockito.mock(JwtProvider.class);
        authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, passwordEncoder, jwtProvider);
    }

    @Test
    @DisplayName("Deve autenticar o usuário com sucesso e retornar o token JWT")
    void shouldAuthenticateUserSuccessfully() {
        String rawPassword = "SecretPassword123!";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        UserEntity userEntity = new UserEntity("usr-01", "João", "joao@johndeere.com", encodedPassword, UserRole.ROLE_OPERADOR);

        when(userRepository.findByEmail("joao@johndeere.com")).thenReturn(Optional.of(userEntity));
        when(jwtProvider.generateToken(any(User.class))).thenReturn("fake_jwt_token");

        LoginRequestDTO request = new LoginRequestDTO("joao@johndeere.com", rawPassword);
        AuthResponseDTO response = authenticateUserUseCase.execute(request);

        assertNotNull(response);
        assertEquals("fake_jwt_token", response.getToken());
        assertEquals("joao@johndeere.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Deve lançar exceção quando as credenciais forem inválidas")
    void shouldThrowExceptionWhenPasswordIsInvalid() {
        UserEntity userEntity = new UserEntity("usr-01", "João", "joao@johndeere.com", "encoded_pass", UserRole.ROLE_OPERADOR);

        when(userRepository.findByEmail("joao@johndeere.com")).thenReturn(Optional.of(userEntity));

        LoginRequestDTO request = new LoginRequestDTO("joao@johndeere.com", "WrongPassword");

        assertThrows(RuntimeException.class, () -> authenticateUserUseCase.execute(request));
    }
}

```

---

## 7. Containerização Isolada (`Dockerfile`)

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/target/*.jar app.jar
USER appuser
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]

```

```

```