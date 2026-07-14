# Reporte de Pruebas de Integración - SkinCancerApp

## 1. Objetivo

Las pruebas de integración tienen como objetivo verificar que los diferentes componentes de SkinCancerApp funcionen correctamente al interactuar entre sí.

Se validó la comunicación entre la API REST, controladores, servicios, base de datos PostgreSQL y sistema de caché Redis utilizando ambientes reales mediante Testcontainers.

---

# 2. Herramientas utilizadas

| Herramienta | Uso |
|---|---|
| Vitest | Ejecución del framework de pruebas |
| Supertest | Pruebas de endpoints HTTP |
| Testcontainers | Creación de ambientes reales aislados |
| PostgreSQL Container | Pruebas con base de datos real |
| Redis Container | Pruebas del sistema de caché |

---

# 3. Arquitectura evaluada


Cliente
|
↓
API REST Express
|
↓
Rutas
|
↓
Controladores
|
↓
Servicios
|
↓
PostgreSQL / Redis


---

# 4. Escenarios de integración evaluados

## 4.1 Integración con PostgreSQL

Se verificó la comunicación entre la aplicación y una instancia real de PostgreSQL ejecutada mediante Testcontainers.

Pruebas realizadas:

- Registro de usuario.
- Consulta de usuarios.
- Inicio de sesión.
- Validación de persistencia de información.
- Carga inicial mediante schema.sql.

Resultado:

✅ Correcto

---

## 4.2 Integración con Redis

Se validó el funcionamiento del sistema de caché utilizando un contenedor Redis.

Pruebas realizadas:

- Creación de datos en caché.
- Consulta de información almacenada.
- Actualización de datos.
- Eliminación de registros.
- Comunicación mediante endpoints de la API.

Resultado:

✅ Correcto

---

## 4.3 Integración de API REST

Se verificó el comportamiento general del backend.

Endpoints evaluados:

- `GET /api/health`
- `GET /`
- `GET /api/diagnostics`
- Rutas inexistentes.

Validaciones realizadas:

- Respuestas HTTP correctas.
- Manejo de errores.
- Estado del servicio.
- Comunicación con la base de datos.

Resultado:

✅ Correcto

---

# 5. Resultados de ejecución

| Métrica | Resultado |
|---|---:|
| Archivos de prueba ejecutados | 1 |
| Casos de prueba ejecutados | 8 |
| Casos aprobados | 8 |
| Casos fallidos | 0 |
| Porcentaje de éxito | 100% |

---