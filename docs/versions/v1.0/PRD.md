# Documento de Requisitos de Producto (PRD) - v1.0

## 1. Introducción y Visión General
**SkinCancerApp** es una plataforma clínica de soporte a la decisión diagnóstica diseñada para ayudar a médicos generales y especialistas a evaluar de forma preliminar imágenes dermatoscópicas de lesiones cutáneas. La herramienta clasifica lesiones sospechosas utilizando un modelo de Deep Learning entrenado con el dataset HAM10000, asocia recomendaciones médicas específicas según el nivel de riesgo de cada lesión y provee un asistente conversacional de interconsulta basado en reglas.

---

## 2. Objetivos Clínicos y del Producto
- **Diagnóstico Asistido Rápido:** Proveer una predicción automatizada sobre 7 clases diferentes de lesiones dermatológicas en un tiempo menor a 2.5 segundos.
- **Categorización de Riesgo:** Clasificar las lesiones en tres niveles claros de riesgo (Bajo, Moderado, Alto) para priorizar la derivación médica:
  - **Alto:** Melanoma (`mel`).
  - **Moderado:** Carcinoma Basocelular (`bcc`), Queratosis Actínica / Enfermedad de Bowen (`akiec`).
  - **Bajo:** Queratosis Benigna (`bkl`), Dermatofibroma (`df`), Nevo Melanocítico (`nv`), Lesión Vascular (`vasc`).
- **Bitácora de Historial:** Mantener un historial completo de las imágenes subidas y análisis de IA para cada usuario.
- **Chatbot Clínico:** Proveer un chatbot de soporte integrado en la ficha de cada diagnóstico que responda preguntas basándose en la regla diagnóstica ABCDE y guías dermatológicas estándares.

---

## 3. Personas del Usuario
### 👤 Dra. Isabel Cáceres (Médico General de Atención Primaria)
- **Necesidad:** Encontrar una herramienta rápida que le sirva de apoyo al evaluar lunares o erupciones sospechosas en pacientes antes de decidir derivarlos a dermatología.
- **Uso:** Inicia sesión, sube una foto de la lesión cutánea tomada con su dermatoscopio y lee el reporte preliminar con su nivel de riesgo.

### 👤 Dr. Martín Vega (Médico Residente de Dermatología)
- **Necesidad:** Consultar guías y reglas como el ABCDE rápidamente durante su práctica clínica diaria.
- **Uso:** Usa el chatbot interactivo asociado al reporte de análisis para hacer preguntas rápidas sobre el manejo y características de la lesión detectada.

---

## 4. Requisitos Funcionales (v1.0)
- **FR-1: Autenticación de Usuarios:** Registro e inicio de sesión seguro para médicos utilizando cifrado de contraseñas con Bcrypt y JWT (JSON Web Tokens).
- **FR-2: Gestión de Carga de Imágenes:** Carga y validación en el servidor Express de formatos de imagen comunes (JPEG, PNG, WEBP, BMP) e inyección en el disco de almacenamiento local.
- **FR-3: Microservicio de Inferencia de IA:**
  - Envío de la imagen subida al microservicio Python.
  - Clasificación en 7 clases HAM10000 mediante un modelo DenseNet201.
  - Retorno de clase predicha y nivel de confianza porcentual.
- **FR-4: Mapeo de Recomendaciones Clínicas:** Carga automática de la base de datos de las explicaciones médicas y recomendaciones de cuidado que corresponden a la clase y nivel de riesgo predicho por la IA.
- **FR-5: Chatbot Clínico de Soporte:** Chatbot integrado que analiza mediante reglas de palabras clave y clase predicha las preguntas del usuario sobre ABCDE, niveles de riesgo, derivación, sol y tratamientos.
- **FR-6: Historial Clínico Personal:** Vista del historial de análisis del médico autenticado.

---

## 5. Requisitos No Funcionales (v1.0)
- **Rendimiento:** Latencia de inferencia de la IA < 2.0s por imagen.
- **Seguridad:** Cifrado hash robusto en base de datos PostgreSQL, verificación estricta de propiedad de registros en todas las peticiones del chat y del historial.
- **Mantenibilidad:** Arquitectura modular en el backend de Node.js (Patrón MVC) y microservicio desacoplado en Python FastAPI.
