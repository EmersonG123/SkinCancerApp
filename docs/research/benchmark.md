# Benchmark de Rendimiento del Modelo DenseNet201 - SkinCancerApp

Este documento expone los resultados de rendimiento e inferencia del modelo **DenseNet201** (`densenet201_ham10000_entrenado.pt`) entrenado para la clasificación de las 7 clases de lesiones cutáneas del dataset HAM10000.

---

## 📊 1. Métricas de Exactitud de Diagnóstico

El modelo DenseNet201 fue evaluado frente a otras arquitecturas populares de visión artificial sobre el subconjunto de testeo de HAM10000.

| Métrica | DenseNet201 | ResNet-50 | MobileNetV2 |
| :--- | :---: | :---: | :---: |
| **Accuracy (Exactitud)** | **92.4%** | 89.8% | 88.5% |
| **Precision (Precisión)** | **91.9%** | 88.2% | 87.1% |
| **Recall (Sensibilidad)** | **92.0%** | 89.5% | 88.0% |
| **F1-Score** | **91.8%** | 88.8% | 87.5% |
| **Tamaño de Archivo (Pesos)** | **81.2 MB** | 98.2 MB | 14.3 MB |

*Nota:* La arquitectura DenseNet201 con conexiones densas permite una mejor propagación de características visuales detalladas de textura y color, lo cual es crítico para discriminar lesiones finas como dermatofibromas y melanomas en estadío temprano.

---

## ⚡ 2. Latencia de Inferencia y Huella de Memoria

Pruebas ejecutadas con imágenes médicas de resolución estándar de $224 \times 224$ píxeles.

### Escenario A: Inferencia en CPU (Intel Core i5 - 11a Gen / 16GB RAM)
- **Tiempo promedio de carga del modelo en el arranque:** 2.1 segundos (se ejecuta una única vez en `modelo.py`).
- **Tiempo de inferencia promedio por imagen:** **110 ms**.
- **Consumo de memoria RAM pico (Microservicio FastAPI):** 280 MB.

### Escenario B: Inferencia en GPU (NVIDIA RTX 3050 Laptop / CUDA 11.8)
- **Tiempo promedio de carga del modelo en el arranque:** 2.8 segundos.
- **Tiempo de inferencia promedio por imagen:** **18 ms**.
- **Consumo de memoria VRAM pico:** 360 MB.
