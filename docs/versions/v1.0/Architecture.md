# Especificación de Arquitectura de Software - v1.0

Este documento describe la arquitectura modular del sistema SkinCancerApp, detallando el flujo de comunicación y el desacoplamiento de componentes.

---

## 1. Diseño Arquitectónico: Microservicios Desacoplados

El sistema divide sus responsabilidades en tres capas lógicas para asegurar alta disponibilidad y facilitar el escalado horizontal del motor de inteligencia artificial:

```
   ┌──────────────────────────────────────────────┐
   │             Cliente Web (React)              │
   └──────────────────────┬───────────────────────┘
                          │ HTTPS / JSON
                          ▼
   ┌──────────────────────────────────────────────┐
   │         Servidor Express.js (Node.js)        │ <───> [PostgreSQL / Redis]
   └──────────────────────┬───────────────────────┘
                          │ HTTP / Multipart Form-Data
                          ▼
   ┌──────────────────────────────────────────────┐
   │         Microservicio IA (FastAPI)           │ <───> [DenseNet201 Weights]
   └──────────────────────────────────────────────┘
```

### A. Cliente Web React (Presentación)
Cargado en el navegador del médico. Gestiona el renderizado de la interfaz, el estado visual del chat, y la carga y envío de imágenes médicas.

### B. Servidor Express.js (Reglas de Negocio y Control de Acceso)
Es el orquestador principal del sistema:
- **Modelo-Vista-Controlador (MVC):** Mantiene la lógica de enrutamiento en `/src/routes/`, la lógica de procesamiento en `/src/controllers/`, y la interacción con la base de datos a través de clases modelo en `/src/models/`.
- **Control de Acceso:** Resguarda los recursos médicos mediante JWT. Ningún usuario puede acceder al historial o chat de otro médico.
- **Lógica de Chatbot:** Ejecuta un analizador de expresiones regulares local para procesar las consultas del chatbot sin incurrir en latencias de red externas.

### C. Microservicio de Inferencia IA (Servidor Python FastAPI)
Un microservicio independiente optimizado para procesamiento matemático:
- **Framework FastAPI:** Expone el endpoint `/predict` y maneja eficientemente las conversiones de archivos binarios a tensores de PyTorch.
- **Inferencia en PyTorch:** Utiliza la arquitectura DenseNet-201. Carga los pesos en memoria de forma estática en el arranque (`modelo.py`) para servir predicciones inmediatas.

---

## 2. Decisiones de Diseño y Patrones

- **Comunicación REST HTTP:** La comunicación entre Node.js y Python se realiza mediante HTTP convencional enviando la imagen como un flujo binario multipart, evitando el uso de sockets pesados.
- **Consultas SQL Parametrizadas:** Las interacciones de base de datos en los modelos de Node.js utilizan consultas preparadas (`client.query('SELECT ... WHERE id = $1', [id])`) provistas por el driver `pg` para evitar ataques de inyección SQL (SQLi).
- **Controladores de Error Centralizados:** En Express, las excepciones son dirigidas mediante la llamada a `next(err)` hacia un middleware global de captura de errores, garantizando respuestas JSON estructuradas ante cualquier caída imprevista del backend.
