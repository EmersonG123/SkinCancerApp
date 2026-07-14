# Tasks

## Backend

### TASK-001
Nombre: Revisión de Cobertura de Pruebas Unitarias
Descripción: Validar que todos los controladores y middlewares cumplan con el 100% de cobertura de código (Jest) establecido en los scripts del proyecto.
Estado: Pendiente
Prioridad: Alta
Dependencias: Ninguna

### TASK-002
Nombre: Integración de Validaciones de Archivos Centralizadas
Descripción: Reforzar la limitación de payload y validación de extensiones a nivel de Express (por ejemplo, con multer) antes de reenviar el binario al microservicio de IA.
Estado: Pendiente
Prioridad: Media
Dependencias: Ninguna

## Frontend

### TASK-003
Nombre: Ampliar E2E Testing para el Flujo Completo
Descripción: Implementar tests adicionales en Playwright para cubrir los casos de error en la respuesta del microservicio de Inteligencia Artificial en el Tab de Análisis.
Estado: Pendiente
Prioridad: Alta
Dependencias: TASK-002

## Base de datos

### TASK-004
Nombre: Auditoría del Modelo Relacional
Descripción: Revisar y validar explícitamente que las relaciones (Foreign Keys) y los índices en PostgreSQL estén optimizados para la carga masiva y consultas del módulo Historial.
Estado: Pendiente
Prioridad: Media
Dependencias: Ninguna

## Inteligencia Artificial

### TASK-005
Nombre: Monitorización de Tiempos de Inferencia
Descripción: Añadir telemetría básica en los logs del endpoint `/predict` para evaluar el tiempo de respuesta real del modelo DenseNet201 (HAM10000) bajo estrés.
Estado: Pendiente
Prioridad: Media
Dependencias: Ninguna

## Testing

### TASK-006
Nombre: Automatización del Pipeline de Pruebas
Descripción: Unificar la ejecución de Jest (backend) y Playwright (frontend) para que se ejecuten secuencialmente en un solo script global o pre-commit hook.
Estado: Pendiente
Prioridad: Alta
Dependencias: TASK-001, TASK-003

## DevOps

### TASK-007
Nombre: Dockerización Integral del Ecosistema
Descripción: Escribir o consolidar un archivo `docker-compose.yml` que orqueste simultáneamente PostgreSQL, la API Node.js, el Frontend y el microservicio Python de IA.
Estado: Pendiente
Prioridad: Alta
Dependencias: Ninguna

## Seguridad

### TASK-008
Nombre: Implementación de Rotación de Tokens JWT
Descripción: Añadir lógica de refresh tokens en el backend para manejar sesiones de larga duración, evitando desconexiones abruptas durante operativas clínicas extensas.
Estado: Pendiente
Prioridad: Alta
Dependencias: Ninguna
