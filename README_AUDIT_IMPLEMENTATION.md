# Sistema de Auditoría Granular E2E - Changelog de Implementación

Este documento resume todos los cambios, dependencias, patrones arquitectónicos y configuraciones implementadas durante el desarrollo e integración del **Sistema de Auditoría** centralizado, el cual registra transacciones y mutaciones de estado de los diferentes microservicios usando **RabbitMQ**.

## 🚀 Arquitectura y Flujo

1. **Kong API Gateway**: 
   - Procesa la autenticación (vía JWT a `gestion-usuarios`).
   - Inyecta headers con la identidad del usuario (`X-User-Id`, `X-User-Username`, `X-User-Roles`).
   - Bloquea peticiones CORS malformadas o intercepta Options a través de Lua scripts (Pre-function).

2. **Interceptores por Microservicio**:
   - Cada microservicio intercepta las peticiones de mutación (`POST`, `PUT`, `PATCH`, `DELETE`).
   - Captura la **IP**, **MAC Address** (`X-MAC-Address`), **Usuario** y **Acción**.
   - Publica un evento asíncrono (sin bloquear el hilo principal) en RabbitMQ en el exchange `audit_exchange`.

3. **Microservicio de Auditoría (`ms-auditoria`)**:
   - Escucha la cola `audit_queue`.
   - Valida el payload con estrictos DTOs (verificando formato de IPs, MACs, y strings).
   - Persiste la trazabilidad en su base de datos independiente (`db-audit`).

---

## 📦 Dependencias Agregadas por Ecosistema

### 🟢 **NestJS** (`gestion-usuarios`, `assignment-service`, `vehiculos-service`)
- **Dependencias**: `amqplib`, `@types/amqplib`.
- **Implementación**: 
  - Se creó un `AuditInterceptor` (Global) implementando `NestInterceptor`.
  - Se configuró la inyección de este interceptor en el `app.module.ts` como proveedor global (`APP_INTERCEPTOR`).
  - Publica los mensajes convirtiéndolos a Buffer mediante la librería amqplib.

### 🐍 **FastAPI** (`ticket-service`)
- **Dependencias**: `aio-pika`.
- **Implementación**:
  - Se implementó la clase asíncrona `AuditMiddleware` que hereda de `BaseHTTPMiddleware` (Starlette).
  - La conexión hacia RabbitMQ se gestiona mediante eventos de ciclo de vida (`@app.on_event("startup")` y `"shutdown"`).
  - Se envían los mensajes asíncronamente con `aio-pika` al finalizar la respuesta.

### ☕ **Spring Boot** (`ModuloZonas`)
- **Dependencias**: `spring-boot-starter-amqp` (RabbitMQ).
- **Implementación**:
  - Se creó un Filtro Servlet: `AuditFilter` heredando de `OncePerRequestFilter`.
  - Se desarrolló el `AuditPublisher` apoyándose en el bean `RabbitTemplate` que inyecta Spring automáticamente.
  - Se extrajo el usuario directamente del contexto de seguridad de Spring (Decodificador JWT) y como fallback desde los headers de Kong.

---

## ⚙️ Cambios Clave en la Configuración

1. **`docker-compose.yml`**:
   - Se añadió y estandarizó las variables de entorno de mensajería para todos los servicios:
     - `RABBITMQ_HOST` / `RABBITMQ_PORT`
     - `RABBITMQ_QUEUE` (`audit_queue`)
     - `RABBITMQ_EXCHANGE` (`audit_exchange`)
     - `RABBITMQ_ROUTING_KEY` (`audit.event`)
   - Se configuró el puerto `3003` para `audit-service`.
   - Se añadió el endpoint `/docs/auditoria` dentro del contenedor global de **Swagger-UI**.

2. **Kong Gateway (`kong.yml`)**:
   - Se registró el backend protegido de `audit-service` mapeado a `/api/v1/audit`.
   - Se integró el esquema público `/docs/auditoria` redirigiendo al `.json` crudo de Swagger de NestJS, unificando así toda la documentación bajo un solo portal.

3. **`ms-auditoria` (Corrección de DTOs y Consumer)**:
   - Se corrigió el uso del validador de UUIDs para usar correctamente la librería `class-validator`.
   - Se ajustó el campo `datos` en el `CreateAuditEventDto` para aceptar objetos (`Record<string, any>`) en lugar de arrojar excepciones por strings literales.
   - Se amplió la validación del nombre de usuario (`usuario`) a 50 caracteres (permitiendo alojar UUIDs provenientes de otros microservicios).

---

## 🧪 Pruebas y Validación (Scripts Creados)

- Se generó el script de integración End-To-End: **`test_audit.py`**.
- **Flujo cubierto:** Realiza el inicio de sesión automático, extrae el JWT, crea un Espacio (`POST /api/v1/espacios/`) forzando la MAC address falsa y, mediante el CLI de Docker, consulta en vivo la base de datos `db-audit` verificando la inserción de la tupla generada.
