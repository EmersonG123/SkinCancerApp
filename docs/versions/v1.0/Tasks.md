# Control de Tareas del Proyecto (Backlog) - v1.0

Lista de tareas de desarrollo planificadas e implementadas en la versión **v1.0** de SkinCancerApp.

---

## 🛠️ Backlog de Servidor Backend (Node.js MVC)

- [x] **Configuración del Servidor Express**
  - [x] Estructurar el punto de entrada `server.js` y el módulo middleware en `app.js`.
  - [x] Configurar carga y almacenamiento de archivos locales mediante Multer.
- [x] **Arquitectura y Enrutamiento (MVC)**
  - [x] Crear enrutadores independientes y controladores para auth, usuario, análisis y chat.
  - [x] Implementar middleware de autenticación por Token JWT (`authMiddleware.js`).
- [x] **Modelado y Persistencia en Base de Datos**
  - [x] Crear scripts de definición de esquemas SQL en `database/schema.sql`.
  - [x] Programar consultas SQL nativas parametrizadas para evitar inyecciones SQL en los modelos (`Usuario.js`, `ImagenLesion.js`, `Recomendacion.js`, `AnalisisIA.js`, `ChatHistorial.js`).
- [x] **Chatbot Clínico Local (Reglas y Palabras Clave)**
  - [x] Diseñar un diccionario estructurado de palabras clave (`RESPUESTAS`) sobre melanoma, carcinoma, queratosis, lunares, nivel de riesgo, factor solar, regla ABCDE y tratamientos.
  - [x] Programar la lógica del resolvedor del chat (`generarRespuesta`).
  - [x] Implementar almacenamiento relacional automático de las conversaciones en la tabla `chat_historial`.

---

## 🧠 Backlog de Microservicio de IA (Python + PyTorch)

- [x] **Inicialización del Microservicio**
  - [x] Configurar servidor FastAPI y endpoints en `ia_service/main.py`.
  - [x] Implementar validación estricta de extensiones de archivo (JPEG, PNG, WEBP, BMP).
- [x] **Modelo de Clasificación DenseNet201**
  - [x] Carga automática del archivo de pesos entrenados (`densenet201_ham10000_entrenado.pt`).
  - [x] Configurar mapeo ordenado de las 7 clases diagnósticas HAM10000.
  - [x] Aplicar transformaciones estandarizadas de ImageNet (Resize 224x224, normalización de canales de color).
  - [x] Inferencia con desactivación de cálculo de gradientes (`torch.no_grad`) para mejorar el rendimiento.

---

## 🧪 Backlog de Pruebas de Calidad (QA / Testing)

- [x] **Configuración de Suite de Pruebas**
  - [x] Configurar Vitest en backend para pruebas de controladores y middlewares.
  - [x] Configurar Jest en backend para pruebas de integración que involucren contenedores Docker con Testcontainers.
- [x] **Pruebas de Componentes**
  - [x] Pruebas unitarias de modelos relacionales (Express) y del microservicio de IA (FastAPI).
  - [x] Pruebas de integración de endpoints (login, registro, análisis y chat).
