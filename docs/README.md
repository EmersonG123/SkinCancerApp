# SkinCancerApp - Documentación General

Bienvenido a la suite de documentación oficial de **SkinCancerApp**, un sistema clínico web diseñado para la detección temprana y clasificación asistida de lesiones de piel (basado en el dataset internacional HAM10000), combinando un microservicio de Inteligencia Artificial (DenseNet201 en PyTorch) con un backend MVC en Node.js y un chat de consulta basado en reglas.

---

## 🗺️ Mapa de la Documentación

La documentación está organizada de forma lógica para facilitar la navegación a desarrolladores, patólogos, ingenieros de ML y analistas de calidad:

### 🚀 1. Ciclo de Versiones (`docs/versions/`)
Documentación asociada al desarrollo del software, dividida por versiones del producto.

#### 📌 Versión 1.0 (Actual)
- 📝 [PRD (Documento de Requisitos de Producto)](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/versions/v1.0/PRD.md): Objetivos clínicos, perfiles de usuario, y especificaciones.
- 📐 [SDD (Descripción del Diseño de Software)](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/versions/v1.0/SDD.md): Arquitectura física, flujos y componentes.
- 📋 [Backlog de Tareas](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/versions/v1.0/Tasks.md): Estado de tareas de desarrollo de la v1.0.
- 🏗️ [Arquitectura](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/versions/v1.0/Architecture.md): Diseño MVC en Node.js, controladores, y comunicación con microservicio IA.
- 🔌 [API Reference](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/versions/v1.0/API.md): Rutas HTTP REST, parámetros y respuestas.
- 💾 [Modelo de Base de Datos](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/versions/v1.0/Database.md): Estructura relacional de las tablas (SkinDB) y campos.
- 🏃‍♂️ [Sprint 1](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/versions/v1.0/Sprint-1.md) y [Sprint 2](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/versions/v1.0/Sprint-2.md): Entregables y reportes de sprint.
- 📜 [CHANGELOG](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/versions/v1.0/CHANGELOG.md): Historial de versiones y hotfixes.
- 📁 **v1.1/ y v2.0/:** Carpetas reservadas para futuras versiones con archivos `.gitkeep`.

---

### 🧪 2. Investigación Científica (`docs/research/`)
Artículos, análisis teóricos y comparativas tecnológicas.
- 📚 [Referencias](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/research/referencias.md): Referencias médicas y de datasets internacionales (HAM10000, ISIC).
- 📊 [Benchmark](file:///D:/D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/research/benchmark.md): Métricas de rendimiento y latencia del modelo DenseNet201.
- 🛠️ [Evaluación de Tecnologías](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/research/tecnologias.md): Elección de Node.js, Express, PostgreSQL, Python FastAPI y Redis.

---

### 📊 3. Diagramas del Sistema (`docs/diagrams/`)
Plantillas vectoriales en formato `.drawio` compatibles con Draw.io/Diagrams.net.
- 🏢 [Arquitectura General (C4 Container)](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/diagrams/arquitectura.drawio)
- 👤 [Casos de Uso Clínicos](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/diagrams/casos-uso.drawio)
- 🔄 [Diagrama de Secuencia de Diagnóstico](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/diagrams/secuencia.drawio)
- 🌐 [Arquitectura de Despliegue](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/diagrams/despliegue.drawio)

---

### 🩺 4. Aseguramiento de Calidad (`docs/testing/`)
- 🧪 [Pruebas Unitarias](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/testing/unit-tests.md)
- 🔗 [Pruebas de Integración](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/testing/integration-tests.md)
- 📈 [Cobertura de Código (Coverage)](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/testing/coverage.md)
- 🎯 [Plan de Pruebas General](file:///D:/2026-1/LAB_CALIDAD/SkinCancerApp/docs/testing/test-plan.md)

---

## 🏗️ Estructura del Sistema

El sistema está compuesto de tres servicios desacoplados:
1. **Frontend Client (React SPA):** Interfaz médica interactiva para visualización de informes y chat.
2. **Backend Server (Node.js MVC):** Servidor Express.js que gestiona las peticiones de usuario, persistencia en PostgreSQL (`SkinDB`) y lógica del chatbot.
3. **IA Service (Python FastAPI):** Servidor de inferencia local que recibe imágenes de lesiones y corre el clasificador DenseNet201.
