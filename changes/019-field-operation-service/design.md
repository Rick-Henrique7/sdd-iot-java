# Design — Field Operation Service

## Clean Architecture (igual aos outros 5 microsserviços)

A camada `domain/` é **pura** — sem imports de Spring, JPA, Kafka ou Jackson:

```java
// domain/model/WorkOrder.java — POJO puro
public class WorkOrder {
    private final String id;
    private final String equipmentId;
    private final String fieldId;
    private final String operatorId;
    private final WorkOrderStatus status;
    // getters, equals, hashCode — sem nada de framework
}
```

A camada `usecase/` orquestra regras de negócio:

```java
// usecase/CreateWorkOrderUseCase.java
public class CreateWorkOrderUseCase {
    public WorkOrder execute(WorkOrder draft) {
        if (draft.equipmentId() == null) throw new IllegalArgumentException(...);
        // ... validações
        return domainService.create(draft);
    }
}
```

A camada `infrastructure/` é onde mora o framework:

```java
// infrastructure/persistence/WorkOrderJpaRepository.java
public interface WorkOrderJpaRepository extends JpaRepository<WorkOrderEntity, String> {}
```

A camada `adapters/` faz a tradução HTTP ↔ domain:

```java
// adapters/controller/DowntimeController.java
@PostMapping("/api/v1/operations/downtime")
public ResponseEntity<DowntimeDTO> record(@RequestBody DowntimeDTO dto) {
    var record = recordDowntimeUseCase.execute(DowntimeDTO.toDomain(dto));
    return ResponseEntity.status(201).body(DowntimeDTO.fromDomain(record));
}
```

## Estratégia de testes

| Teste | Tipo | Cobertura |
| --- | --- | --- |
| `WorkOrderTest` | Unit (POJO) | validação de transições de status, invariantes |
| `CreateWorkOrderUseCaseTest` | Unit (Mockito) | mocks do `OperationDomainService` |
| `RecordDowntimeUseCaseTest` | Unit (Mockito) | cálculo de duração, validação de motivos |
| `WorkOrderControllerIntegrationTest` | `@SpringBootTest` + H2 | end-to-end do `PATCH` |
| `DowntimeControllerIntegrationTest` | `@SpringBootTest` + H2 | end-to-end do `POST` |

Total: **5 testes**, alinhado com os 11 testes de cada microsserviço existente
(45 totais + 5 = 50).

## Mudanças no `docker-compose.yml`

Bloco a ser adicionado (substitui o TODO atual):

```yaml
  field-operation-service:
    build:
      context: ./field-operation-service
      dockerfile: Dockerfile
    container_name: agrio-field-operation
    ports:
      - "8085:8085"
    environment:
      - SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:29092
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/agrio_db?currentSchema=operations
      - SPRING_DATASOURCE_USERNAME=agrio_user
      - SPRING_DATASOURCE_PASSWORD=agrio_password
    depends_on:
      - kafka
      - postgres
    networks:
      - agrio-network
```

E adicionar `field-operation-service` na lista `depends_on` do `api-gateway`.

## Mudanças no `init.sql`

Linha a ser adicionada:

```sql
CREATE SCHEMA IF NOT EXISTS operations;
```

## Mudanças no `api-gateway`

Adicionar rota no `application.yml` (ou application.properties):

```yaml
spring.cloud.gateway.routes:
  - id: field-operation-service
    uri: http://field-operation-service:8085
    predicates:
      - Path=/api/v1/operations/**
```

## Mudanças no `pom.xml` raiz

Adicionar o módulo na tag `<modules>`:

```xml
<modules>
  ...
  <module>field-operation-service</module>
</modules>
```
