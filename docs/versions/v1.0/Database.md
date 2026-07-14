# Especificación de Base de Datos - v1.0

OncoScan / SkinCancerApp utiliza la base de datos relacional **SkinDB** (SQLite localmente para desarrollo rápido y PostgreSQL en producción). La persistencia de datos y consultas se ejecutan mediante el cliente `pg` y modelos Javascript con queries parametrizadas.

---

## 🗺️ Diagrama de Entidad-Relación (ER)

```
  ┌──────────────────────────┐             ┌──────────────────────────┐
  │         usuarios         │             │    imagenes_lesiones     │
  ├──────────────────────────┤             ├──────────────────────────┤
  │ PK id_usuario (SERIAL)  │◄───────────┼│ FK id_usuario (INTEGER)  │
  │    email (VARCHAR)       │             │    nombre_archivo        │
  │    nombre (VARCHAR)      │             │    ruta_archivo          │
  │    password_hash         │             └────────────┬─────────────┘
  └────────────┬─────────────┘                          │ 1
               │                                        │
               │ 1                                      │ 1
               │                                        ▼
               │ 1..*                      ┌──────────────────────────┐
               ├──────────────────────────┼│       analisis_ia        │
               │                           ├──────────────────────────┤
               │                           │ PK id_analisis (SERIAL)  │◄┐
               │                           │ FK id_usuario (INTEGER)  │ │
               │                           │ FK id_imagen (INTEGER)   │ │
               │                           │    clase_predicha        │ │
               │                           │    confianza (NUMERIC)   │ │
               │                           │    nivel_riesgo          │ │
               │                           └────────────┬─────────────┘ │
               │                                        │               │
               │ 1                                      │ 1             │ 1
               ▼ 1..*                                   ▼ 1..*          │ 1..*
  ┌──────────────────────────┐             ┌──────────────────────────┐ │
  │      chat_historial      │             │     recomendaciones      │ │
  ├──────────────────────────┤             ├──────────────────────────┤ │
  │ PK id_mensaje (SERIAL)   │             │ PK id_recomendacion      │ │
  │ FK id_usuario (INTEGER) ─┘             │    clase (VARCHAR, UK) ──┼─┘
  │ FK id_analisis (INTEGER) ──────────────┼──────────────────────────┘
  │    rol (VARCHAR)                 
  │    contenido (TEXT)
  └──────────────────────────┘
```

---

## 🗂️ Estructura de las Tablas (SkinDB)

### 1. Tabla: `usuarios`
Almacena las cuentas de los médicos y credenciales de acceso.
- **`id_usuario`** (SERIAL, PK): Identificador secuencial autoincrementable.
- **`email`** (VARCHAR(255), Unique, Not Null): Correo corporativo del médico.
- **`nombre`** (VARCHAR(150), Not Null): Nombre completo del médico.
- **`password_hash`** (VARCHAR(255), Not Null): Contraseña cifrada con Bcrypt.
- **`license`** (VARCHAR(50), Default `'CO-00000-GEN'`): Cédula profesional.
- **`specialty`** (VARCHAR(100), Default `'Dermatología General'`): Especialidad médica.
- **`analyses`** (INTEGER, Default `0`): Conteo acumulado de análisis realizados.
- **`precision`** (INTEGER, Default `95`): Precisión de diagnóstico asignada.
- **`rol`** (VARCHAR(20), Default `'usuario'`): Rol de acceso (`'usuario'` o `'admin'`).
- **`created_at`** (TIMESTAMP, Default `NOW()`): Fecha de creación del registro.

### 2. Tabla: `imagenes_lesiones`
Almacena las referencias físicas de los archivos de imagen subidos.
- **`id_imagen`** (SERIAL, PK): Identificador único.
- **`id_usuario`** (INTEGER, FK -> `usuarios.id_usuario`, Cascade Delete): Médico que subió el archivo.
- **`nombre_archivo`** (VARCHAR(255), Not Null): Nombre original o renombrado en el servidor.
- **`ruta_archivo`** (VARCHAR(500), Not Null): Ruta de almacenamiento en disco (ej. `uploads/1719284000-lesion.jpg`).
- **`mimetype`** (VARCHAR(100)): Tipo de archivo (ej. `image/jpeg`).
- **`size_bytes`** (INTEGER): Tamaño del archivo en bytes.
- **`uploaded_at`** (TIMESTAMP, Default `NOW()`).

### 3. Tabla: `recomendaciones`
Tabla maestra inmutable que asocia explicaciones médicas y guías de cuidado a cada una de las 7 clases del dataset HAM10000.
- **`id_recomendacion`** (SERIAL, PK).
- **`clase`** (VARCHAR(10), Unique, Not Null): Código de clase diagnóstica (`akiec`, `bcc`, `bkl`, `df`, `mel`, `nv`, `vasc`).
- **`nombre_amigable`** (VARCHAR(150), Not Null): Nombre clínico completo legible.
- **`nivel_riesgo`** (VARCHAR(20), Check Constraint): Nivel de riesgo (`'bajo'`, `'moderado'`, `'alto'`).
- **`descripcion`** (TEXT, Not Null): Explicación científica del tipo de lesión.
- **`recomendacion`** (TEXT, Not Null): Plan terapéutico sugerido y urgencia de derivación.

### 4. Tabla: `analisis_ia`
Almacena los reportes de diagnóstico generados por el microservicio de PyTorch.
- **`id_analisis`** (SERIAL, PK).
- **`id_usuario`** (INTEGER, FK -> `usuarios.id_usuario`, Cascade Delete): Médico que ordenó el test.
- **`id_imagen`** (INTEGER, FK -> `imagenes_lesiones.id_imagen`, Cascade Delete): Imagen procesada.
- **`clase_predicha`** (VARCHAR(10), Not Null): Clase resultante del clasificador.
- **`confianza`** (NUMERIC(5, 2), Not Null): Confianza porcentual calculada por Softmax (0.00% a 100.00%).
- **`nivel_riesgo`** (VARCHAR(20), Not Null): Riesgo de la lesión.
- **`explicacion`** (TEXT): Copia o relación de la descripción.
- **`aviso_legal`** (TEXT): Texto legal de limitación de responsabilidad médica.
- **`fecha_analisis`** (TIMESTAMP, Default `NOW()`).

### 5. Tabla: `chat_historial`
Conversaciones y diálogos del asistente médico en base a cada reporte de análisis.
- **`id_mensaje`** (SERIAL, PK).
- **`id_analisis`** (INTEGER, FK -> `analisis_ia.id_analisis`, Cascade Delete): Análisis al que está asociado el chat.
- **`id_usuario`** (INTEGER, FK -> `usuarios.id_usuario`, Cascade Delete): Médico participante.
- **`rol`** (VARCHAR(20), Check Constraint): Autor del mensaje (`'usuario'` o `'asistente'`).
- **`contenido`** (TEXT, Not Null): Cuerpo del mensaje enviado.
- **`created_at`** (TIMESTAMP, Default `NOW()`).

---

## ⚡ Índices de Optimización de Consultas

El script `schema.sql` crea automáticamente índices relacionales para mejorar el rendimiento de lectura:
1. `idx_imagenes_usuario` en `imagenes_lesiones(id_usuario)`: Optimiza la carga del listado de imágenes del médico.
2. `idx_analisis_usuario` en `analisis_ia(id_usuario)`: Optimiza el listado de diagnósticos del panel principal.
3. `idx_analisis_fecha` en `analisis_ia(fecha_analisis DESC)`: Acelera las búsquedas por orden cronológico.
4. `idx_chat_analisis` en `chat_historial(id_analisis)`: Acelera la reconstrucción del historial conversacional en la ventana del chat.
