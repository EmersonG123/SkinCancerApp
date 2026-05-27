-- ============================================================
-- SkinCancerApp – Script SQL completo
-- Base de datos: SkinDB
-- ============================================================

-- Crear la base de datos (ejecutar conectado a postgres)
-- CREATE DATABASE "SkinDB";

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario    SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    nombre        VARCHAR(150)        NOT NULL,
    password_hash VARCHAR(255)        NOT NULL,
    license       VARCHAR(50)         DEFAULT 'CO-00000-GEN',
    specialty     VARCHAR(100)        DEFAULT 'Dermatología General',
    analyses      INTEGER             DEFAULT 0,
    precision     INTEGER             DEFAULT 95,
    rol           VARCHAR(20)         DEFAULT 'usuario', -- 'usuario' | 'admin'
    created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: imagenes_lesiones
-- ============================================================
CREATE TABLE IF NOT EXISTS imagenes_lesiones (
    id_imagen    SERIAL PRIMARY KEY,
    id_usuario   INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    mimetype     VARCHAR(100),
    size_bytes   INTEGER,
    uploaded_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: recomendaciones
-- ============================================================
CREATE TABLE IF NOT EXISTS recomendaciones (
    id_recomendacion SERIAL PRIMARY KEY,
    clase            VARCHAR(10) UNIQUE NOT NULL,
    nombre_amigable  VARCHAR(150) NOT NULL,
    nivel_riesgo     VARCHAR(20)  NOT NULL CHECK (nivel_riesgo IN ('bajo', 'moderado', 'alto')),
    descripcion      TEXT         NOT NULL,
    recomendacion    TEXT         NOT NULL
);

-- ============================================================
-- TABLA: analisis_ia
-- ============================================================
CREATE TABLE IF NOT EXISTS analisis_ia (
    id_analisis      SERIAL PRIMARY KEY,
    id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_imagen        INTEGER NOT NULL REFERENCES imagenes_lesiones(id_imagen) ON DELETE CASCADE,
    clase_predicha   VARCHAR(10) NOT NULL,
    confianza        NUMERIC(5, 2) NOT NULL,
    nivel_riesgo     VARCHAR(20)   NOT NULL,
    explicacion      TEXT,
    aviso_legal      TEXT,
    fecha_analisis   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: chat_historial
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_historial (
    id_mensaje   SERIAL PRIMARY KEY,
    id_analisis  INTEGER NOT NULL REFERENCES analisis_ia(id_analisis) ON DELETE CASCADE,
    id_usuario   INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    rol          VARCHAR(20) NOT NULL CHECK (rol IN ('usuario', 'asistente')),
    contenido    TEXT        NOT NULL,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- DATOS INICIALES: Administrador por defecto (Contraseña: eng947750)
-- ============================================================
-- El hash bcrypt corresponde a la contraseña "eng947750"
INSERT INTO usuarios (email, nombre, password_hash, license, specialty, analyses, precision, rol)
VALUES (
  'emerson@gmail.com',
  'Ing. Emerson',
  '$2b$10$w6h4s0o1V67/0ZgR3KkYd.oQe9rD/ZfD7f58.2sVl9Yg5s/t89sD.',
  'ADM-947750-X',
  'Administrador de Sistema',
  0,
  100,
  'admin'
)
ON CONFLICT (email) DO UPDATE
  SET rol = 'admin';

-- ============================================================
-- DATOS INICIALES: Recomendaciones por clase HAM10000
-- ============================================================
INSERT INTO recomendaciones (clase, nombre_amigable, nivel_riesgo, descripcion, recomendacion)
VALUES
  (
    'akiec',
    'Queratosis Actínica / Enfermedad de Bowen',
    'moderado',
    'La queratosis actínica es una lesión precancerosa causada por exposición crónica al sol. La enfermedad de Bowen es un carcinoma in situ de crecimiento lento.',
    'Consulte a un dermatólogo en los próximos 30 días para evaluación. Evite la exposición solar directa en la zona afectada. Use protector solar SPF 50+ diariamente. No intente tratar la lesión por cuenta propia.'
  ),
  (
    'bcc',
    'Carcinoma Basocelular',
    'moderado',
    'El carcinoma basocelular es el tipo más común de cáncer de piel. Crece lentamente y raramente hace metástasis, pero requiere tratamiento médico.',
    'Solicite una cita con dermatología de forma urgente (preferiblemente en los próximos 15 días). El tratamiento temprano es muy efectivo. Evite exposición UV sin protección. No frote ni lastime la zona.'
  ),
  (
    'bkl',
    'Queratosis Benigna',
    'bajo',
    'Las queratosis seborreicas y lesiones similares son crecimientos benignos de la piel, comunes con la edad. No son cancerosas.',
    'No se requiere tratamiento urgente. Monitoree cualquier cambio en tamaño, color o forma. Consulte a un dermatólogo en su próxima revisión de rutina. Mantenga la piel hidratada.'
  ),
  (
    'df',
    'Dermatofibroma',
    'bajo',
    'El dermatofibroma es un tumor benigno cutáneo firme, generalmente de origen reactivo. Es muy común y no representa riesgo para la salud.',
    'No requiere tratamiento médico inmediato. Si la lesión cambia de aspecto o causa molestias, consulte a su médico. Evite traumatismos en la zona. Revisión de rutina anual recomendada.'
  ),
  (
    'mel',
    'Melanoma',
    'alto',
    'El melanoma es el tipo más peligroso de cáncer de piel. Se origina en los melanocitos y tiene alta capacidad de metástasis si no se trata a tiempo.',
    '⚠️ ACUDA A UN MÉDICO DERMATÓLOGO INMEDIATAMENTE. El diagnóstico temprano es crucial para el tratamiento exitoso. No exponga la lesión al sol. No intente ningún tratamiento casero. Si no puede ver a un especialista en 48 horas, acuda a urgencias.'
  ),
  (
    'nv',
    'Nevo Melanocítico (Lunar)',
    'bajo',
    'Los nevos melanocíticos son lunares comunes, generalmente benignos. La mayoría de las personas los tienen y no representan peligro.',
    'Realice autoexamen mensual usando la regla ABCDE (Asimetría, Borde, Color, Diámetro, Evolución). Consulte a un dermatólogo si nota cambios. Proteja la zona del sol. Revisión anual preventiva recomendada.'
  ),
  (
    'vasc',
    'Lesión Vascular',
    'bajo',
    'Las lesiones vasculares incluyen angiomas, angioqueratomas y hemangiomas. En general son benignas y de origen vascular.',
    'Generalmente no requieren tratamiento. Evite traumatismos que puedan causar sangrado. Consulte a su médico si la lesión sangra, crece rápidamente o causa dolor. Revisión dermatológica de rutina.'
  )
ON CONFLICT (clase) DO UPDATE
  SET nombre_amigable = EXCLUDED.nombre_amigable,
      nivel_riesgo    = EXCLUDED.nivel_riesgo,
      descripcion     = EXCLUDED.descripcion,
      recomendacion   = EXCLUDED.recomendacion;

-- ============================================================
-- Índices para rendimiento
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_imagenes_usuario ON imagenes_lesiones(id_usuario);
CREATE INDEX IF NOT EXISTS idx_analisis_usuario ON analisis_ia(id_usuario);
CREATE INDEX IF NOT EXISTS idx_analisis_fecha ON analisis_ia(fecha_analisis DESC);
CREATE INDEX IF NOT EXISTS idx_chat_analisis ON chat_historial(id_analisis);
