# ============================================================
#  field-operation-service — multi-stage build
#  Stage 1: build with Maven on Temurin 17
#  Stage 2: minimal runtime on Temurin 17 JRE Alpine (non-root)
# ============================================================

# ---------- Stage 1: Build ----------
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /workspace

# Cache dependencies first for faster incremental builds
COPY pom.xml ./pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml
COPY auth-service/pom.xml ./auth-service/pom.xml
COPY telemetry-ingestion-service/pom.xml ./telemetry-ingestion-service/pom.xml
COPY alert-processing-service/pom.xml ./alert-processing-service/pom.xml
COPY fleet-mapping-service/pom.xml ./fleet-mapping-service/pom.xml
COPY field-operation-service/pom.xml ./field-operation-service/pom.xml

RUN mvn -B -pl field-operation-service -am dependency:go-offline

# Copy source and build only this module
COPY field-operation-service/src ./field-operation-service/src
RUN mvn -B -pl field-operation-service -am package -DskipTests

# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built jar from the builder stage
COPY --from=builder /workspace/field-operation-service/target/field-operation-service.jar /app/app.jar

USER appuser

EXPOSE 8085

# Sensible JVM defaults for containers
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Graceful shutdown (matches server.shutdown=graceful in application.yml)
STOPSIGNAL SIGTERM

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
