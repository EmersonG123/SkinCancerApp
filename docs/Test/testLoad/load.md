# Plan y Reporte de Pruebas de Carga - SkinCancerApp

## Información General

**Proyecto:** SkinCancerApp

**Módulo evaluado:** Microservicio de Inteligencia Artificial

**Framework de pruebas:** k6

**Endpoint evaluado:**

```
POST /predict
```

**URL de prueba**

```
http://localhost:8001/predict
```

---

# Objetivo

Evaluar el comportamiento del microservicio de predicción de lesiones cutáneas bajo distintos niveles de carga, determinando su capacidad de respuesta, estabilidad y escalabilidad.

---

# Herramientas

- k6
- FastAPI
- Python
- Docker (opcional)
- PostgreSQL
- Redis

---

# Escenarios de prueba

## Escenario 1 - Carga Base

**Usuarios virtuales**

```
39
```

**Objetivo**

Verificar el comportamiento del sistema bajo condiciones normales de uso.

Duración

- Rampa: 2 minutos
- Ejecución: 5 minutos

---

## Escenario 2 - Carga Media

**Usuarios virtuales**

```
193
```

**Objetivo**

Analizar el rendimiento cuando el sistema recibe una carga intermedia.

Duración

- Rampa: 2 minutos
- Ejecución: 5 minutos

---

## Escenario 3 - Carga Pico

**Usuarios virtuales**

```
385
```

**Objetivo**

Determinar el punto máximo de operación del sistema antes de presentar degradación del servicio.

Duración

- Rampa: 2 minutos
- Ejecución: 5 minutos

---

# Flujo evaluado

```
Usuario

     │

     ▼

POST /predict

     │

     ▼

FastAPI

     │

     ▼

Modelo DenseNet201

     │

     ▼

Predicción

     │

     ▼

Respuesta JSON
```

---

# Métricas evaluadas

- Tiempo promedio de respuesta
- Latencia p95
- Tiempo máximo
- Throughput (req/s)
- Solicitudes exitosas
- Solicitudes fallidas
- Tasa de error
- Usuarios virtuales concurrentes

---

# Criterios de aceptación

| Métrica | Valor esperado |
|----------|----------------|
| HTTP 200 | 100% |
| Error Rate | < 5% |
| p95 | < 3000 ms |
| Disponibilidad | 100% |

---

# Script utilizado

Archivo

```
reports/load-tests/scripts/load-test.js
```

---

# Resultados

## Escenario 1

| Métrica | Resultado |
|----------|-----------|
| Usuarios | |
| Tiempo promedio | |
| p95 | |
| Throughput | |
| Error Rate | |

---

## Escenario 2

| Métrica | Resultado |
|----------|-----------|
| Usuarios | |
| Tiempo promedio | |
| p95 | |
| Throughput | |
| Error Rate | |

---

## Escenario 3

| Métrica | Resultado |
|----------|-----------|
| Usuarios | |
| Tiempo promedio | |
| p95 | |
| Throughput | |
| Error Rate | |

---

# Conclusiones

(Completar una vez ejecutadas las pruebas.)

---

# Evidencias

- Captura de la consola de k6.
- Reporte HTML.
- Reporte JSON.
- Gráficas (opcional).