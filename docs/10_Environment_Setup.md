# POS Management System — Environment Setup Guide

Tài liệu này hướng dẫn dựng toàn bộ môi trường local để phát triển hệ thống POS Management từ đầu. AI Agent đọc file này trước khi bắt đầu Sprint 00.

---

## 1. Yêu Cầu Hệ Thống (Prerequisites)

| Công Cụ | Phiên Bản | Kiểm Tra |
|---|---|---|
| Java JDK | 21+ | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| Node.js | 20+ LTS | `node -v` |
| Angular CLI | 22+ | `ng version` |
| Docker Desktop | 4.x+ | `docker -v` |
| Docker Compose | 2.x+ | `docker compose version` |
| Git | 2.x+ | `git --version` |

---

## 2. Cấu Trúc Thư Mục Monorepo

```
pos-management/                   ← Root của dự án
│
├── backend/                      ← Java Spring Boot (Maven multi-module)
│   ├── pom.xml                   ← Parent POM
│   ├── pos-common/               ← Shared library
│   │   ├── pom.xml
│   │   └── src/main/java/com/banking/pos/common/
│   │       ├── ApiResponse.java
│   │       ├── ApiErrorResponse.java
│   │       ├── GlobalExceptionHandler.java
│   │       └── ErrorCode.java
│   └── pos-core/                 ← Main Spring Boot Application
│       ├── pom.xml
│       └── src/
│           ├── main/
│           │   ├── java/com/banking/pos/
│           │   │   ├── PosManagementApplication.java
│           │   │   ├── identity/
│           │   │   ├── catalog/
│           │   │   ├── organization/
│           │   │   ├── inventory/
│           │   │   ├── merchant/
│           │   │   ├── device/
│           │   │   ├── assignment/
│           │   │   ├── approval/
│           │   │   ├── monitoring/
│           │   │   └── config/
│           │   └── resources/
│           │       ├── application.yml
│           │       ├── application-local.yml
│           │       └── db/migration/
│           │           ├── V1__init_base_schema.sql
│           │           ├── V2__create_identity_tables.sql
│           │           └── ...
│           └── test/
│
├── frontend/                     ← Angular 22 Web Admin
│   ├── package.json
│   ├── angular.json
│   └── src/app/
│       ├── core/
│       ├── shared/
│       ├── features/
│       ├── app.config.ts
│       └── app.routes.ts
│
├── infrastructure/               ← Docker và cấu hình hạ tầng
│   ├── docker-compose.yml        ← Dev environment
│   ├── docker-compose.prod.yml   ← Production-ready
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── dashboards/
│
└── docs/                         ← Tài liệu dự án
    ├── 00_Project_Vision.md
    ├── 01_Architecture_Bible.md
    └── ...
```

---

## 3. Docker Compose — Full Dev Environment

Lưu file tại `infrastructure/docker-compose.yml`:

```yaml
version: '3.9'

networks:
  pos-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  kafka-data:
  grafana-data:
  prometheus-data:

services:

  # ─── PostgreSQL 16 ───────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: pos-postgres
    networks: [pos-network]
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: pos_db
      POSTGRES_USER: pos_user
      POSTGRES_PASSWORD: pos_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pos_user -d pos_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── Redis 7 ─────────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: pos-redis
    networks: [pos-network]
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass pos_redis_password
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "pos_redis_password", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── Apache Kafka (KRaft mode — không cần Zookeeper) ─────────
  kafka:
    image: confluentinc/cp-kafka:7.6.0
    container_name: pos-kafka
    networks: [pos-network]
    ports:
      - "9092:9092"
      - "9093:9093"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LOG_DIRS: /var/lib/kafka/data
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      CLUSTER_ID: "MkU3OEVBNTcwNTJENDM2Qg"
    volumes:
      - kafka-data:/var/lib/kafka/data
    healthcheck:
      test: ["CMD-SHELL", "kafka-broker-api-versions --bootstrap-server localhost:9092"]
      interval: 30s
      timeout: 10s
      retries: 5

  # ─── Kafka UI (Monitoring Kafka) ─────────────────────────────
  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: pos-kafka-ui
    networks: [pos-network]
    ports:
      - "8090:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: pos-local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9092
    depends_on:
      kafka:
        condition: service_healthy

  # ─── MailHog (Mock Email cho Notification) ───────────────────
  mailhog:
    image: mailhog/mailhog:latest
    container_name: pos-mailhog
    networks: [pos-network]
    ports:
      - "1025:1025"   # SMTP server
      - "8025:8025"   # Web UI
    logging:
      driver: none

  # ─── Prometheus ───────────────────────────────────────────────
  prometheus:
    image: prom/prometheus:latest
    container_name: pos-prometheus
    networks: [pos-network]
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.enable-lifecycle'

  # ─── Grafana ──────────────────────────────────────────────────
  grafana:
    image: grafana/grafana:latest
    container_name: pos-grafana
    networks: [pos-network]
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_USERS_ALLOW_SIGN_UP: "false"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - prometheus

  # ─── Jaeger (Distributed Tracing) ────────────────────────────
  jaeger:
    image: jaegertracing/all-in-one:latest
    container_name: pos-jaeger
    networks: [pos-network]
    ports:
      - "16686:16686"  # Web UI
      - "14268:14268"  # HTTP collector
      - "6831:6831/udp"  # UDP compact thrift
    environment:
      COLLECTOR_ZIPKIN_HTTP_PORT: 9411
```

---

## 4. Prometheus Config

Lưu tại `infrastructure/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'pos-backend'
    static_configs:
      - targets: ['host.docker.internal:8080']
    metrics_path: '/actuator/prometheus'

  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka:9092']
```

---

## 5. Maven Multi-Module — Parent POM

Lưu tại `backend/pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.banking</groupId>
    <artifactId>pos-management</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <name>POS Management System</name>

    <modules>
        <module>pos-common</module>
        <module>pos-core</module>
    </modules>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <properties>
        <java.version>21</java.version>
        <spring-boot.version>3.3.4</spring-boot.version>
        <mapstruct.version>1.5.5.Final</mapstruct.version>
        <redisson.version>3.27.2</redisson.version>
        <resilience4j.version>2.2.0</resilience4j.version>
        <testcontainers.version>1.19.8</testcontainers.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- Internal modules -->
            <dependency>
                <groupId>com.banking</groupId>
                <artifactId>pos-common</artifactId>
                <version>${project.version}</version>
            </dependency>

            <!-- MapStruct -->
            <dependency>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct</artifactId>
                <version>${mapstruct.version}</version>
            </dependency>

            <!-- Redisson -->
            <dependency>
                <groupId>org.redisson</groupId>
                <artifactId>redisson-spring-boot-starter</artifactId>
                <version>${redisson.version}</version>
            </dependency>

            <!-- Resilience4j -->
            <dependency>
                <groupId>io.github.resilience4j</groupId>
                <artifactId>resilience4j-spring-boot3</artifactId>
                <version>${resilience4j.version}</version>
            </dependency>

            <!-- Testcontainers BOM -->
            <dependency>
                <groupId>org.testcontainers</groupId>
                <artifactId>testcontainers-bom</artifactId>
                <version>${testcontainers.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

---

## 6. Spring Boot — application.yml

Lưu tại `backend/pos-core/src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: pos-management-core
  
  datasource:
    url: jdbc:postgresql://localhost:5432/pos_db
    username: pos_user
    password: pos_password
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
  
  jpa:
    hibernate:
      ddl-auto: validate           # KHÔNG dùng create/update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    open-in-view: false            # Tắt để tránh LazyInitializationException
  
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
  
  data:
    redis:
      host: localhost
      port: 6379
      password: pos_redis_password
      timeout: 3000ms
      lettuce:
        pool:
          max-active: 20
          max-idle: 10
  
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
    consumer:
      group-id: pos-management-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      auto-offset-reset: earliest
      enable-auto-commit: false

# JWT Configuration
pos:
  jwt:
    secret: "your-very-long-jwt-secret-key-at-least-256-bits-for-hs256"
    access-token-expiry: 900        # 15 phút (giây)
    refresh-token-expiry: 604800    # 7 ngày (giây)
  
  security:
    rate-limit:
      login-max-attempts: 5
      login-window-seconds: 60
      account-lock-minutes: 30
  
  outbox:
    polling-delay-ms: 2000          # Poll outbox mỗi 2 giây
    max-retry: 5

# Spring Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true

# OpenAPI / Swagger
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operationsSorter: method

server:
  port: 8080
  servlet:
    context-path: /

logging:
  level:
    com.banking.pos: DEBUG
    org.springframework.security: INFO
    org.hibernate.SQL: DEBUG
```

---

## 7. Angular Project Setup

### 7.1 Khởi tạo project
```bash
# Di chuyển vào thư mục frontend
cd pos-management/frontend

# Khởi tạo Angular 22 project
ng new pos-admin \
  --routing=true \
  --style=scss \
  --standalone=true \
  --skip-git=true

# Cài đặt dependencies
npm install @angular/material@latest
npm install @ngrx/store@latest @ngrx/effects@latest @ngrx/entity@latest
npm install apexcharts ng-apexcharts
npm install @angular/cdk@latest
```

### 7.2 Environment Variables
Tạo `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  wsUrl: 'ws://localhost:8080/ws',
  appName: 'POS Management System',
  version: '1.0.0'
};
```

Tạo `frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  wsUrl: '/ws',
  appName: 'POS Management System',
  version: '1.0.0'
};
```

---

## 8. Các Kafka Topic Cần Tạo

Topics được auto-create khi Kafka start (`KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"`). Danh sách topics:

```bash
# Device topics
device-assigned
device-returned
device-lifecycle-changed
device-repair-created

# Inventory topics
stock-imported
stock-exported
stock-transferred

# Merchant topics
merchant-created
merchant-status-changed
terminal-status-changed

# Approval topics
approval-submitted
approval-approved
approval-rejected
approval-returned-for-edit

# Dead Letter Topics (DLT)
device-assigned.DLT
stock-exported.DLT
approval-submitted.DLT
```

---

## 9. Ports Reference

| Service | Port | URL | Mục Đích |
|---|---|---|---|
| Backend API | 8080 | http://localhost:8080 | Spring Boot API |
| Swagger UI | 8080 | http://localhost:8080/swagger-ui.html | API Documentation |
| Actuator | 8080 | http://localhost:8080/actuator | Health & Metrics |
| Angular Dev | 4200 | http://localhost:4200 | Frontend Dev Server |
| PostgreSQL | 5432 | localhost:5432 | Primary Database |
| Redis | 6379 | localhost:6379 | Cache & Session |
| Kafka | 9092 | localhost:9092 | Message Broker |
| Kafka UI | 8090 | http://localhost:8090 | Kafka Monitoring |
| MailHog SMTP | 1025 | localhost:1025 | Mock Email Server |
| MailHog Web | 8025 | http://localhost:8025 | Email Viewer |
| Prometheus | 9090 | http://localhost:9090 | Metrics Collection |
| Grafana | 3000 | http://localhost:3000 | Dashboard (admin/admin) |
| Jaeger | 16686 | http://localhost:16686 | Distributed Tracing |

---

## 10. Quick Start Commands

```bash
# 1. Start toàn bộ infrastructure
cd pos-management/infrastructure
docker compose up -d

# 2. Kiểm tra tất cả services đang UP
docker compose ps

# 3. Build backend
cd ../backend
mvn clean compile -q

# 4. Chạy backend (dev)
mvn spring-boot:run -pl pos-core -Dspring-boot.run.profiles=local

# 5. Build và chạy frontend
cd ../frontend
npm install
ng serve --open

# 6. Kiểm tra health
curl http://localhost:8080/actuator/health

# 7. Stop toàn bộ
cd ../infrastructure
docker compose down
```

---

## 11. Seed Data Mặc Định (V14__seed_identity_data.sql)

```sql
-- 1. SUPER_ADMIN user
INSERT INTO users (id, username, email, password_hash, full_name, status)
VALUES (
    gen_random_uuid(),
    'admin',
    'admin@pos.vn',
    '$2a$12$...BCrypt(Admin@123)...',  -- BCrypt của 'Admin@123'
    'Super Administrator',
    'ACTIVE'
);

-- 2. Test users cho từng role
-- INVENTORY_MANAGER: inventory.manager@pos.vn / Test@123
-- INVENTORY_STAFF: inventory.staff@pos.vn / Test@123
-- MERCHANT_MANAGER: merchant.manager@pos.vn / Test@123
-- DEVICE_OPERATOR: device.op@pos.vn / Test@123
-- ASSIGNMENT_OPERATOR: assignment.op@pos.vn / Test@123
-- AUDITOR: auditor@pos.vn / Test@123
-- VIEWER: viewer@pos.vn / Test@123
```

> ⚠️ **Quan trọng:** Thay `password_hash` bằng BCrypt hash thực tế khi seed.
> Dùng tool: https://bcrypt-generator.com/ hoặc `@Bean PasswordEncoder`.

