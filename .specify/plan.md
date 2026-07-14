# Technical Plan

## Arquitectura del sistema

Usuario
↓
Frontend (React + Vite + TailwindCSS)
↓
Backend API (Node.js + Express)
↓ (HTTP/REST)
IA Service (FastAPI + PyTorch)
↓
Base de datos (PostgreSQL)

## Componentes

### 1. Frontend Web App
- **Nombre**: SkinCancerApp Client
- **Responsabilidad**: Interfaz de usuario interactiva, enrutamiento local, captura y visualización de datos médicos.
- **Entrada**: Interacciones de usuario, carga de imágenes (DropZone), tokens de sesión local.
- **Salida**: Peticiones asíncronas REST, renderizado del DOM de resultados médicos.

### 2. Backend Principal
- **Nombre**: Core API Server
- **Responsabilidad**: Gestión centralizada de lógica de negocio, seguridad, orquestación, e interacción con base de datos.
- **Entrada**: Peticiones HTTP del Frontend, subida de binarios y JSONs.
- **Salida**: Respuestas JSON estructuradas, redirección de archivos de imagen para inferencias al servicio de IA.

### 3. Microservicio de Inteligencia Artificial
- **Nombre**: Clasificador HAM10000 (DenseNet201)
- **Responsabilidad**: Ejecutar el modelo de Deep Learning entrenado sobre imágenes de piel solicitadas.
- **Entrada**: Archivos de imágenes (UploadFile multipart).
- **Salida**: JSON con etiqueta de "clase" inferida y "confianza".

### 4. Base de Datos
- **Nombre**: PostgreSQL Database
- **Responsabilidad**: Persistencia segura de datos relacionales, usuarios e historiales clínicos.
- **Entrada**: Queries SQL de inserción, lectura y borrado.
- **Salida**: Registros y resultados de transacciones a través de conexión Pool.

## Diseño de base de datos

Se contemplan las siguientes entidades (Información basada en endpoints y controladores, pendiente de validación esquemática exhaustiva en producción):

- **usuarios**: id_usuario (PK), email, password (hashed), nombre, rol, especialidad, license, analyses.
- **imagenes_lesiones**: id_imagen (PK), path_archivo, formato, metadata (ej: timestamps).
- **analisis_ia**: id_analisis (PK), id_usuario (FK), id_imagen (FK), clase_predicha, nivel_riesgo, confianza, fecha.
- **recomendaciones**: id_recomendacion (PK), id_analisis (FK), texto_recomendacion.
- **chat_historial**: id_mensaje (PK), id_usuario (FK), contenido, timestamp.

## APIs

### Endpoint: Autenticación
- **Método HTTP**: POST
- **Ruta**: `/api/auth/login` y `/api/auth/register`
- **Parámetros**: email, password, (y nombre, rol en caso de registro).
- **Respuesta**: Token JWT y payload con datos básicos del usuario.

### Endpoint: Inferencia IA (Microservicio Python)
- **Método HTTP**: POST
- **Ruta**: `/predict`
- **Parámetros**: file (multipart/form-data).
- **Respuesta**: `{ "clase": "mel", "confianza": 84.73 }`

### Endpoint: Registro de Análisis
- **Método HTTP**: POST
- **Ruta**: `/api/analisis`
- **Parámetros**: Metadata de análisis e imagen asociada.
- **Respuesta**: Confirmación de guardado y ID de análisis generado.

### Endpoint: Historial Clínico
- **Método HTTP**: GET
- **Ruta**: `/api/historial`
- **Parámetros**: Autenticación vía Header (Token).
- **Respuesta**: Colección JSON de registros clínicos previos.

## Flujo del sistema

Entrada (Subida de Imagen por Operador/Médico en Frontend)
↓
Procesamiento (Backend valida Token y Body -> Envía a IA Service Python -> IA Service procesa el tensor y responde -> Backend guarda en Base de Datos Postgres)
↓
Resultado (Frontend recibe JSON procesado completo y grafica resultados visualmente)

## Seguridad técnica
- Almacenamiento de credenciales protegido mediante hash criptográfico (`bcrypt`).
- Verificación estricta de sesión mediante middleware interceptor verificador de `jsonwebtoken`.
- CORS (Cross-Origin Resource Sharing) configurado específicamente para los orígenes de frontend permitidos (3000, 5173, 4173).
- Validación de tipos MIME en la capa del servicio de IA antes de procesar buffers de memoria en PyTorch.
- Manejador central de errores para ocultar stack traces sensibles al cliente final.

## Estrategia de despliegue
- **Ambientes**: Soporte dual para Entorno Local de Desarrollo (npm run dev) y Testing Automatizado.
- **Servidores**: El servidor Core (Express) y el Microservicio ML (uvicorn) funcionan en subprocesos independientes (puertos separados).
- **Contenedores**: Potencial uso de infraestructuras contenerizadas para facilitar integraciones o pruebas modulares (indicios en scripts locales).
- **Servicios utilizados**: Entorno de ejecución en Node.js, Python FastAPI backend, servicio relacional Postgres.
