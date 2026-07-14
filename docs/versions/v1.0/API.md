# API Reference - v1.0

Especificación técnica de los endpoints REST expuestos en el backend de SkinCancerApp.

---

## 🟢 1. Autenticación y Registro

### A. Registro de Médicos
- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "email": "doctor@hospital.com",
    "nombre": "Dr. Juan Pérez",
    "password": "mi_password_seguro",
    "license": "CO-12345-MED",
    "specialty": "Dermatología Oncológica"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "mensaje": "Usuario registrado exitosamente",
    "id_usuario": 5
  }
  ```

### B. Inicio de Sesión (Login)
- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "email": "doctor@hospital.com",
    "password": "mi_password_seguro"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "mensaje": "Inicio de sesión exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usuario": 5,
      "email": "doctor@hospital.com",
      "nombre": "Dr. Juan Pérez",
      "rol": "usuario"
    }
  }
  ```

---

## 🔵 2. Inferencia y Diagnóstico de Lesiones

### A. Cargar y Analizar Imagen de Lesión
Sube una imagen física al backend Express, la almacena en disco local, registra la carga, invoca la inferencia en el microservicio Python y retorna el diagnóstico completo con las recomendaciones correspondientes desde la base de datos `SkinDB`.

- **URL:** `/api/analisis/analizar`
- **Method:** `POST`
- **Headers:** 
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: multipart/form-data`
- **Request Body (Form-Data):**
  - `image`: (Archivo binario JPG, PNG, WEBP o BMP)
- **Response (200 OK):**
  ```json
  {
    "mensaje": "Análisis completado",
    "analisis": {
      "id_analisis": 12,
      "clase_predicha": "mel",
      "confianza": 87.5,
      "nivel_riesgo": "alto",
      "explicacion": "El melanoma es el tipo más peligroso de cáncer de piel...",
      "recomendacion": "⚠️ ACUDA A UN MÉDICO DERMATÓLOGO INMEDIATAMENTE...",
      "nombre_amigable": "Melanoma",
      "fecha_analisis": "2026-07-08T18:26:00.000Z",
      "imagen": {
        "id_imagen": 24,
        "nombre_archivo": "1719284000-lesion.jpg",
        "ruta_archivo": "uploads/1719284000-lesion.jpg"
      }
    }
  }
  ```

---

## 🔵 3. Chatbot Conversacional de Soporte

### A. Enviar Pregunta al Chatbot
- **URL:** `/api/chat/:id_analisis`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body (JSON):**
  ```json
  {
    "pregunta": "¿Qué significa que el riesgo sea alto?"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "respuesta": "Los niveles de riesgo son: BAJO (lesiones benignas como lunares, dermatofibromas), MODERADO (lesiones que requieren evaluación médica como carcinoma basocelular o queratosis actínica), y ALTO (melanoma – requiere atención urgente).",
    "mensaje": {
      "id_mensaje": 45,
      "rol": "asistente",
      "contenido": "Los niveles de riesgo son: BAJO...",
      "created_at": "2026-07-08T18:27:00.000Z"
    }
  }
  ```

### B. Obtener Historial de Chat de un Análisis
- **URL:** `/api/chat/:id_analisis`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK):**
  ```json
  {
    "mensajes": [
      {
        "id_mensaje": 44,
        "rol": "usuario",
        "contenido": "¿Qué significa que el riesgo sea alto?",
        "created_at": "2026-07-08T18:26:50.000Z"
      },
      {
        "id_mensaje": 45,
        "rol": "asistente",
        "contenido": "Los niveles de riesgo son...",
        "created_at": "2026-07-08T18:27:00.000Z"
      }
    ],
    "total": 2
  }
  ```

---

## 🟢 4. Microservicio de Inferencia (Python - Port 8001)

### A. Health Check de la IA
- **URL:** `http://localhost:8001/health`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  {
    "status": "OK",
    "modelo": "DenseNet201 HAM10000",
    "device": "cpu",
    "clases": ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
  }
  ```

### B. Predicción Directa (Multipart)
- **URL:** `http://localhost:8001/predict`
- **Method:** `POST`
- **Headers:** `Content-Type: multipart/form-data`
- **Request Body (Form-Data):**
  - `file`: (Archivo de imagen binario)
- **Response (200 OK):**
  ```json
  {
    "clase": "nv",
    "confianza": 97.43
  }
  ```
