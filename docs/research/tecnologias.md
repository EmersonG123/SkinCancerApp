# Evaluación Tecnológica del Sistema - SkinCancerApp

Este documento justifica la selección de tecnologías para el ecosistema de SkinCancerApp.

---

## 💻 1. Servidor Backend: Node.js con Express (MVC)

- **Node.js & Express:**
  - *Justificación:* Node.js proporciona un modelo asíncrono y orientado a eventos ideal para crear servidores I/O intensivos que manejan carga de archivos en disco e invocan servicios de red asíncronos. Express provee un framework minimalista y flexible para implementar el patrón MVC sin sobrecargas arquitectónicas.
  - *Control de Dependencias:* El uso de `jsonwebtoken` (JWT) y `bcrypt` resuelve las necesidades de autenticación ligera y cifrado sin recurrir a servidores de identidad externos y complejos.
  - *Carga de archivos:* `multer` procesa eficientemente cargas multipart de imágenes y las almacena localmente de forma segura en disco.

---

## 🔌 2. Servidor de Inteligencia Artificial: Python con FastAPI

- **FastAPI:**
  - *Justificación:* Microservicio ágil y con tipado estático nativo mediante Pydantic. Ofrece tiempos de respuesta inferiores a Flask y genera automáticamente la documentación interactiva Swagger.
- **PyTorch:**
  - *Justificación:* Framework líder para computación y deep learning. Su integración con torchvision facilita la aplicación de normalizaciones estandarizadas de ImageNet en GPU/CPU con muy pocas líneas de código.

---

## 💾 3. Persistencia de Datos: PostgreSQL y Redis

- **PostgreSQL (`pg` driver nativo):**
  - *Justificación:* SkinCancerApp maneja consultas SQL directas optimizadas sin sobrecargar la CPU del servidor con ORMs pesados. PostgreSQL garantiza transacciones ACID y velocidad en consultas complejas sobre el historial médico.
- **Redis Cache (`ioredis`):**
  - *Justificación:* Permite cachear resultados de consultas del historial de análisis o datos de perfil de usuario frecuentes, reduciendo la carga de lectura en la base de datos relacional y acelerando la respuesta del API.

---

## 🧪 4. Suite de Pruebas: Vitest, Jest, Supertest y Testcontainers

- **Vitest & Jest:**
  - *Justificación:* Vitest ofrece una velocidad de ejecución de tests unitarios inigualable en entornos Node moderno. Jest se reserva para pruebas de integración con contenedores y soporte de tests clásicos.
- **Testcontainers & Supertest:**
  - *Justificación:* Testcontainers permite instanciar contenedores Docker reales de PostgreSQL durante los tests de integración, garantizando que el backend se pruebe contra un motor SQL real y no contra mocks falsos. `supertest` facilita las llamadas simuladas de red HTTP al servidor Express.
