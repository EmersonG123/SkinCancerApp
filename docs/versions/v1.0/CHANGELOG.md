# CHANGELOG - Historial de Versiones

Todos los cambios notables realizados en el proyecto **SkinCancerApp** se registran en este documento.

---

## [1.0.0] - v1.0 Release
### Añadido
- **Servidor Backend MVC (Node.js/Express):** Desarrollo de controladores, modelos relacionales directos con `pg` y middleware de autenticación por JWT.
- **Carga de Archivos local (Multer):** Guardado físico y registro relacional de imágenes de lesiones en `uploads/`.
- **Microservicio de IA (Python/FastAPI):** Servidor local de inferencia en puerto 8001 cargando pesos de `densenet201_ham10000_entrenado.pt`.
- **Clasificación de 7 clases HAM10000:** Clasificador de lesiones dermatológicas (`akiec`, `bcc`, `bkl`, `df`, `mel`, `nv`, `vasc`) con confianza e inferencia acelerada sin gradientes (`torch.no_grad`).
- **Base de Datos SkinDB (PostgreSQL):** Esquemas relacionales y datos maestros inmutables para derivación clínica y alertas en `database/schema.sql`.
- **Chatbot Local de Palabras Clave:** Chatbot de soporte conversacional basado en reglas léxicas y regla diagnóstica ABCDE.
- **Suite de Pruebas Integrada:** Configuración de Vitest para pruebas unitarias de backend, Jest para integración y Testcontainers para levantar contenedores PostgreSQL temporales de testeo.
