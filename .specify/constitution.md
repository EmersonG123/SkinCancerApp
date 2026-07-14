# Constitution

## Propósito del sistema
SkinCancerApp (MedAI Skin) es una plataforma médica de asistencia al diagnóstico diseñada para proporcionar clasificación de lesiones cutáneas en tiempo real utilizando inteligencia artificial, facilitando el análisis, el seguimiento histórico de pacientes y el soporte de decisiones clínicas para profesionales de la salud.

## Principios arquitectónicos
- **Arquitectura utilizada**: Arquitectura orientada a microservicios (Backend Node.js/Express para lógica de negocio y FastAPI/PyTorch para inferencia de IA) con un Frontend SPA en React.
- **Separación de responsabilidades**:
  - Frontend: Interfaz de usuario, captura de imágenes, visualización de resultados.
  - Backend: Gestión de usuarios, autenticación, historial médico, orquestación de la IA y chat.
  - IA Service: Microservicio especializado exclusivamente en inferencia de modelos de Machine Learning (DenseNet201).
- **Organización de módulos**: Organización por dominios en backend (auth, analisis, historial, chat, usuarios).
- **Patrones de diseño**: MVC (Model-View-Controller) en backend, patrón repositorio implícito en servicios de DB, e inyección de dependencias en React.

## Reglas de desarrollo
- **Estándares de código**: TypeScript estricto para Frontend, JavaScript modular para Backend, Python estructurado (PEP8) para IA.
- **Convenciones**: Nombres de variables descriptivos, componentes React en PascalCase, controladores y rutas en camelCase.
- **Manejo de errores**: Middleware centralizado de errores en Express (`errorHandler`), manejo de excepciones HTTP en FastAPI, feedback visual en Frontend.
- **Documentación**: Swagger para APIs REST (Swagger UI), JSDoc y comentarios en código.

## Seguridad
- **Autenticación**: Basada en JSON Web Tokens (JWT) y encriptación de contraseñas con bcrypt.
- **Autorización**: Roles de usuario (Admin, Profesional/Operador, Paciente) con control de acceso basado en roles (RBAC).
- **Protección de información**: Cifrado en tránsito, almacenamiento seguro de historiales clínicos (sandbox de datos locales), cumplimiento referencial a normativas de privacidad médicas (HIPAA/RGPD referencial).
- **Validaciones**: Sanitización de inputs, límite de payload (10mb para imágenes), validación de tipos MIME soportados (JPEG, PNG, WEBP, BMP) previo a la inferencia.

## Calidad del software
- **Mantenibilidad**: Modularización de componentes React y separación de servicios backend.
- **Escalabilidad**: Desacoplamiento del servicio de IA intensivo en recursos, permitiendo su escalado independiente del Core API.
- **Rendimiento**: Cacheo de respuestas en el API (`cacheRoutes`), imágenes cargadas de manera asíncrona.
- **Pruebas**: Unit testing y coverage con Jest, E2E testing con Playwright.

## Gestión documental
constitution.md:
Cambios arquitectónicos.

spec.md:
Cambios funcionales.

plan.md:
Cambios técnicos.

tasks.md:
Cambios de implementación.
