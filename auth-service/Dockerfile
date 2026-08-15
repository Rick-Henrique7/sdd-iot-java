# ============================================================
#  auth-service — multi-stage build
#  Stage 1: build with Maven on Temurin 17
#  Stage 2: minimal runtime on Temurin 17 JRE Alpine (non-root)
# ============================================================

# ---------- Stage 1: Build ----------
FROM maven:3-eclipse-temurin-26 AS builder
WORKDIR /workspace

# Cache dependencies first for faster incremental builds
COPY pom.xml ./pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml
COPY auth-service/pom.xml ./auth-service/pom.xml
COPY telemetry-ingestion-service/pom.xml ./telemetry-ingestion-service/pom.xml
COPY alert-processing-service/pom.xml ./alert-processing-service/pom.xml
COPY fleet-mapping-service/pom.xml ./fleet-mapping-service/pom.xml

RUN mvn -B -pl auth-service -am dependency:go-offline

# Copy source and build only this module
COPY auth-service/src ./auth-service/src
RUN mvn -B -pl auth-service -am package -DskipTests

# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built jar from the builder stage
COPY --from=builder /workspace/auth-service/target/auth-service.jar /app/app.jar

USER appuser

EXPOSE 8083

# Sensible JVM defaults for containers
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Graceful shutdown (matches server.shutdown=graceful in application.yml)
STOPSIGNAL SIGTERM

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
