# Reporte de Sprint 2 - v1.0

## 🎯 Objetivos del Sprint 2
El objetivo del segundo sprint fue construir el servidor web backend en Node.js (Express), implementar el flujo MVC de control de usuarios e inicio de sesión, conectar el backend con el microservicio de inferencia de IA y programar el chatbot de interconsulta clínica basado en palabras clave.

---

## 📦 Entregables e Incrementos

### 1. Servidor Backend MVC (Node.js + Express)
- Estructuración de la arquitectura MVC (Model-View-Controller) e inicialización de enrutadores en `app.js`.
- Configuración de la persistencia relacional SQL en la carpeta `/src/models/` mediante llamadas directas usando el módulo `pg`.
- Implementación de registro de usuarios y hash de contraseñas utilizando Bcrypt.
- Configuración de generación de tokens JWT en el inicio de sesión y protección de rutas privadas mediante `authMiddleware.js`.
- Integración de Multer en el endpoint de análisis para cargar y guardar imágenes de tomografías/lesiones en la carpeta local `/uploads/`.

### 2. Integración de Servicios (Node.js a FastAPI)
- Implementación del flujo de análisis: al recibir una imagen de lesión cutánea, el backend la persiste en base de datos, envía el binario al microservicio FastAPI (puerto 8001) mediante `axios` utilizando cabeceras `multipart/form-data`.
- Captura de la clase predicha, búsqueda inmediata en `recomendaciones` en base al código de clase y almacenamiento del diagnóstico resultante en `analisis_ia`.

### 3. Chatbot Clínico de Soporte por Palabras Clave
- Desarrollo del controlador del chatbot (`chatController.js`).
- Creación de un resolvedor analítico local (`generarRespuesta`) estructurado con respuestas médicas estandarizadas en base a palabras clave:
  - Melanoma (`mel`, `maligno`, `cáncer`), Carcinoma Basocelular (`bcc`), Queratosis Actínica (`akiec`), Lunares (`nv`, `lunar`), etc.
  - Regla `ABCDE` (Asimetría, Bordes, Color, Diámetro, Evolución).
  - Factores de riesgo, protección solar, y derivación con especialistas.
- Persistencia automática de los mensajes del chat en la base de datos relacional (`chat_historial`).
