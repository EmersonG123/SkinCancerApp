# Plan de Implementación: Pruebas de Integración con Testcontainers (Node.js + Redis)

Este plan describe cómo instalar las dependencias requeridas, implementar el servicio de Redis con caché básico en la API, y configurar Jest junto a Testcontainers para realizar pruebas de integración de Redis ejecutándose en un contenedor Docker real.

## User Review Required

> [!IMPORTANT]
> - Se requiere que **Docker** esté en ejecución localmente durante la ejecución de las pruebas de integración con Testcontainers.
> - Se añadirá una nueva ruta `/api/cache` a la API de Express para validar las operaciones CRUD y el estado de la integración con Redis.
> - Las pruebas de Jest estarán aisladas de las de Vitest para evitar conflictos entre frameworks.

## Proposed Changes

---

### [Componente: Configuración y Dependencias]

#### [MODIFY] [package.json](file:///d:/2026-1/LAB_CALIDAD/SkinCancerApp/backend/package.json)
- Añadir dependencias en `"dependencies"`: `ioredis`
- Añadir dependencias en `"devDependencies"`: `jest`, `testcontainers` y `supertest` (si no están).
- Configurar un nuevo script `"test:containers": "jest --config jest.config.js"`.

#### [NEW] [jest.config.js](file:///d:/2026-1/LAB_CALIDAD/SkinCancerApp/backend/jest.config.js)
- Definir la configuración de Jest para buscar únicamente las pruebas en la carpeta `testsContainers`.
- Configurar timeout alto de 60 segundos debido a que levantar un contenedor Docker en las pruebas puede requerir descargar la imagen de Redis.

#### [MODIFY] [vitest.config.js](file:///d:/2026-1/LAB_CALIDAD/SkinCancerApp/backend/vitest.config.js)
- Excluir la carpeta `testsContainers` de la ejecución de Vitest para evitar conflictos de sintaxis o de entorno.

#### [MODIFY] [.env.example](file:///d:/2026-1/LAB_CALIDAD/SkinCancerApp/backend/.env.example)
- Documentar las variables de entorno de Redis (`REDIS_HOST`, `REDIS_PORT`).

---

### [Componente: Servicio y Rutas de Redis]

#### [NEW] [redisService.js](file:///d:/2026-1/LAB_CALIDAD/SkinCancerApp/backend/src/services/redisService.js)
- Servicio utilizando `ioredis` para conectarse a Redis.
- Métodos expuestos: `initRedis` (para inicialización dinámica en tests), `get`, `set` (con TTL) y `del`.

#### [NEW] [cacheController.js](file:///d:/2026-1/LAB_CALIDAD/SkinCancerApp/backend/src/controllers/cacheController.js)
- Controlador para manejar solicitudes HTTP de caché.
- Endpoints CRUD básicos expuestos.

#### [NEW] [cacheRoutes.js](file:///d:/2026-1/LAB_CALIDAD/SkinCancerApp/backend/src/routes/cacheRoutes.js)
- Enrutamiento para los métodos GET, POST y DELETE de la caché.

#### [MODIFY] [app.js](file:///d:/2026-1/LAB_CALIDAD/SkinCancerApp/backend/app.js)
- Registrar las rutas de caché bajo el prefijo `/api/cache`.

---

### [Componente: Pruebas de Integración con Testcontainers]

#### [NEW] [redisIntegration.test.js](file:///d:/2026-1/LAB_CALIDAD/SkinCancerApp/backend/testsContainers/redisIntegration.test.js)
- Configurar el setup `beforeAll` y `afterAll` con Testcontainers para levantar la imagen `redis:alpine` en Docker.
- Mockear la conexión a la base de datos PostgreSQL para no requerir una DB Postgres activa en este test específico.
- Validar las siguientes operaciones:
  - Inicialización correcta de la base de datos Redis.
  - CRUD directo en `redisService`.
  - Endpoint GET, POST y DELETE de `/api/cache` mediante `supertest`.

## Verification Plan

### Automated Tests
Para ejecutar las pruebas del contenedor de Redis de forma aislada, ejecutaremos:
```bash
cd backend
npm run test:containers
```
Y para verificar que los tests existentes de Vitest sigan funcionando correctamente:
```bash
npm run test
```

### Manual Verification
- Iniciar el servidor local y comprobar que el endpoint `/api/cache` funcione correctamente con un Redis local de desarrollo si estuviese activo.
