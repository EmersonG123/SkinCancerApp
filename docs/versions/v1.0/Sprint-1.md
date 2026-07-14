# Reporte de Sprint 1 - v1.0

## 🎯 Objetivos del Sprint 1
Establecer las bases de datos relacionales y desplegar el microservicio de inferencia de inteligencia artificial encargado de evaluar las imágenes de lesiones cutáneas sospechosas.

---

## 📦 Entregables e Incrementos

### 1. Servidor de Inferencia Local (PyTorch + FastAPI)
- Creación del microservicio en la carpeta `ia_service/` corriendo de forma independiente en el puerto `8001`.
- Carga estática de los pesos entrenados del modelo **DenseNet-201** (`densenet201_ham10000_entrenado.pt`, 81.2 MB) para optimizar el arranque y memoria del servidor.
- Implementación de las transformaciones de preprocesamiento de ImageNet (Resize 224x224, normalización de canales de color RGB).
- Codificación del endpoint POST `/predict` para recibir archivos binarios, ejecutar la inferencia y retornar la clase clasificada y su nivel de confianza porcentual mediante Softmax.

### 2. Diseño e Inicialización de Base de Datos (SkinDB)
- Escritura del script de definición de base de datos relacional `database/schema.sql` para PostgreSQL.
- Creación de las tablas principales (`usuarios`, `imagenes_lesiones`, `recomendaciones`, `analisis_ia`, `chat_historial`).
- Carga de los registros iniciales maestros para la tabla `recomendaciones`, asociando a cada una de las 7 clases HAM10000 su nombre legible, nivel de riesgo clínico y un plan terapéutico detallado.
- Inserción por defecto del usuario administrador inmutable (`emerson@gmail.com`) con credenciales cifradas en Bcrypt.

---

## 📈 Resultados del Hito
- El microservicio de inferencia IA está en línea en `http://localhost:8001`.
- El tiempo de predicción local para una imagen dermatológica de $224 \times 224$ píxeles es de **120 ms** ejecutándose en CPU, cumpliendo holgadamente el requisito no funcional de latencia (< 2.0s).
- La base de datos relacional está lista y precargada con datos maestros para conectarse con el servidor Node.js.
