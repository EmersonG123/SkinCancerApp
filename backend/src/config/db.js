// src/config/db.js – Pool de conexión a PostgreSQL
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'eng947750',
  database: process.env.DB_NAME     || 'SkinDB',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Crear tablas e inicializar recomendaciones si no existen
const crearTablasEInicializar = async (client) => {
  try {
    // 1. Crear tablas
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
          id_usuario    SERIAL PRIMARY KEY,
          email         VARCHAR(255) UNIQUE NOT NULL,
          nombre        VARCHAR(150)        NOT NULL,
          password_hash VARCHAR(255)        NOT NULL,
          license       VARCHAR(50)         DEFAULT 'CO-00000-GEN',
          specialty     VARCHAR(100)        DEFAULT 'Dermatología General',
          analyses      INTEGER             DEFAULT 0,
          precision     INTEGER             DEFAULT 95,
          rol           VARCHAR(20)         DEFAULT 'usuario',
          created_at    TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS imagenes_lesiones (
          id_imagen    SERIAL PRIMARY KEY,
          id_usuario   INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
          nombre_archivo VARCHAR(255) NOT NULL,
          ruta_archivo VARCHAR(500) NOT NULL,
          mimetype     VARCHAR(100),
          size_bytes   INTEGER,
          uploaded_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recomendaciones (
          id_recomendacion SERIAL PRIMARY KEY,
          clase            VARCHAR(10) UNIQUE NOT NULL,
          nombre_amigable  VARCHAR(150) NOT NULL,
          nivel_riesgo     VARCHAR(20)  NOT NULL CHECK (nivel_riesgo IN ('bajo', 'moderado', 'alto')),
          descripcion      TEXT         NOT NULL,
          recomendacion    TEXT         NOT NULL
      );
    `);

    await client.query(`
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
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_historial (
          id_mensaje   SERIAL PRIMARY KEY,
          id_analisis  INTEGER NOT NULL REFERENCES analisis_ia(id_analisis) ON DELETE CASCADE,
          id_usuario   INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
          rol          VARCHAR(20) NOT NULL CHECK (rol IN ('usuario', 'asistente')),
          contenido    TEXT        NOT NULL,
          created_at   TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Tablas verificadas/creadas correctamente.');

    // 2. Inicializar recomendaciones si la tabla está vacía
    const recsCount = await client.query('SELECT COUNT(*) FROM recomendaciones');
    if (parseInt(recsCount.rows[0].count, 10) === 0) {
      console.log('📌 Inicializando recomendaciones en base de datos...');
      const recomendacionesIniciales = [
        ['akiec', 'Queratosis Actínica / Enfermedad de Bowen', 'moderado', 'La queratosis actínica es una lesión precancerosa causada por exposición crónica al sol. La enfermedad de Bowen es un carcinoma in situ de crecimiento lento.', 'Consulte a un dermatólogo en los próximos 30 días para evaluación. Evite la exposición solar directa en la zona afectada. Use protector solar SPF 50+ diariamente. No intente tratar la lesión por cuenta propia.'],
        ['bcc', 'Carcinoma Basocelular', 'moderado', 'El carcinoma basocelular es el tipo más común de cáncer de piel. Crece lentamente y raramente hace metástasis, pero requiere tratamiento médico.', 'Solicite una cita con dermatología de forma urgente (preferiblemente en los próximos 15 días). El tratamiento temprano es muy efectivo. Evite exposición UV sin protección. No frote ni lastime la zona.'],
        ['bkl', 'Queratosis Benigna', 'bajo', 'Las queratosis seborreicas y lesiones similares son crecimientos benignos de la piel, comunes con la edad. No son cancerosas.', 'No se requiere tratamiento urgente. Monitoree cualquier cambio en tamaño, color o forma. Consulte a un dermatólogo en su próxima revisión de rutina. Mantenga la piel hidratada.'],
        ['df', 'Dermatofibroma', 'bajo', 'El dermatofibroma es un tumor benigno cutáneo firme, generalmente de origen reactivo. Es muy común y no representa riesgo para la salud.', 'No requiere tratamiento médico inmediato. Si la lesión cambia de aspecto o causa molestias, consulte a su médico. Evite traumatismos en la zona. Revisión de rutina anual recomendada.'],
        ['mel', 'Melanoma', 'alto', 'El melanoma es el tipo más peligroso de cáncer de piel. Se origina en los melanocitos y tiene alta capacidad de metástasis si no se trata a tiempo.', '⚠️ ACUDA A UN MÉDICO DERMATÓLOGO INMEDIATAMENTE. El diagnóstico temprano es crucial para el tratamiento exitoso. No exponga la lesión al sol. No intente ningún tratamiento casero. Si no puede ver a un especialista en 48 horas, acuda a urgencias.'],
        ['nv', 'Nevo Melanocítico (Lunar)', 'bajo', 'Los nevos melanocíticos son lunares comunes, generalmente benignos. La mayoría de las personas los tienen y no representan peligro.', 'Realice autoexamen mensual usando la regla ABCDE (Asimetría, Borde, Color, Diámetro, Evolución). Consulte a un dermatólogo si nota cambios. Proteja la zona del sol. Revisión anual preventiva recomendada.'],
        ['vasc', 'Lesión Vascular', 'bajo', 'Las lesiones vasculares incluyen angiomas, angioqueratomas y hemangiomas. En general son benignas y de origen vascular.', 'Generalmente no requieren tratamiento. Evite traumatismos que puedan causar sangrado. Consulte a su médico si la lesión sangra, crece rápidamente o causa dolor. Revisión dermatológica de rutina.']
      ];

      for (const rec of recomendacionesIniciales) {
        await client.query(
          `INSERT INTO recomendaciones (clase, nombre_amigable, nivel_riesgo, descripcion, recomendacion)
           VALUES ($1, $2, $3, $4, $5)`,
          rec
        );
      }
      console.log('✅ Recomendaciones inicializadas.');
    }
  } catch (err) {
    console.error('❌ Error en la creación o población inicial de tablas:', err.message);
  }
};

// Inicializar Administrador por defecto si no existe
const inicializarAdmin = async (client) => {
  try {
    const res = await client.query('SELECT * FROM usuarios WHERE email = $1', ['emerson@gmail.com']);
    if (res.rows.length === 0) {
      console.log('📌 Creando administrador predeterminado emerson@gmail.com...');
      const passwordHash = await bcrypt.hash('eng947750', 10);
      await client.query(
        `INSERT INTO usuarios (email, nombre, password_hash, license, specialty, analyses, precision, rol)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'emerson@gmail.com',
          'Ing. Emerson (Admin)',
          passwordHash,
          'ADM-947750-X',
          'Administrador de Sistema',
          0,
          100,
          'admin'
        ]
      );
      console.log('✅ Administrador emerson@gmail.com creado exitosamente.');
    } else {
      // Asegurarse de que sea admin si ya existe
      const admin = res.rows[0];
      if (admin.rol !== 'admin') {
        await client.query('UPDATE usuarios SET rol = $1 WHERE email = $2', ['admin', 'emerson@gmail.com']);
        console.log('✅ Rol de emerson@gmail.com actualizado a admin.');
      }
    }
  } catch (error) {
    console.error('❌ Error inicializando administrador:', error.message);
  }
};

// Inicializar Historial de análisis predeterminado si no existe
const inicializarHistorial = async (client) => {
  try {
    const adminRes = await client.query('SELECT id_usuario FROM usuarios WHERE email = $1', ['emerson@gmail.com']);
    if (adminRes.rows.length > 0) {
      const adminId = adminRes.rows[0].id_usuario;
      const historyRes = await client.query('SELECT 1 FROM analisis_ia WHERE id_usuario = $1 LIMIT 1', [adminId]);
      
      if (historyRes.rows.length === 0) {
        console.log('📌 Inicializando historial de análisis para emerson@gmail.com...');
        
        // 1. Insertar Imagen 1 (Melanoma)
        const img1 = await client.query(
          `INSERT INTO imagenes_lesiones (id_usuario, nombre_archivo, ruta_archivo, mimetype, size_bytes)
           VALUES ($1, $2, $3, $4, $5) RETURNING id_imagen`,
          [
            adminId,
            'melanoma_inicial.jpg',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCJdhfAXnuVUbxjqbU2WDXYWAXKNFbwjMYOsu3rm34JlhnqQfrhowQurcJVXSxzieshBnA0sish6o59-M3_K34-nro77bvYKMcL6nNfPvAFPx2b7CvY_3ftKDH2bQyB-c-geualz7bU0PvRu9n5qTB0EpPnB5okfoFhZQK7VvlZNCLRSZyfPLlkNmKmlN7t2Km0v-2l8KOf2UD_FNSWvLe2X3l7d7xhZ_Ahre13_4AIqIUWPnzwmJmVI_gSBmJVZRGmbGEIeb1vnRqh',
            'image/jpeg',
            102400
          ]
        );
        const img1Id = img1.rows[0].id_imagen;
        
        await client.query(
          `INSERT INTO analisis_ia (id_usuario, id_imagen, clase_predicha, confianza, nivel_riesgo, explicacion, aviso_legal, fecha_analisis)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '2 days')`,
          [
            adminId,
            img1Id,
            'mel',
            94.2,
            'alto',
            'La imagen presenta bordes irregulares, asimetría marcada y policromía (variación de tonos marrones y negros), patrones altamente asociados con lesiones melanocíticas malignas según el protocolo ABCDE.',
            'AVISO LEGAL: Esta herramienta utiliza IA como apoyo al diagnóstico clínico. No sustituye el juicio de un profesional médico. Los resultados deben ser validados por un dermatólogo colegiado.',
          ]
        );

        // 2. Insertar Imagen 2 (Nevus)
        const img2 = await client.query(
          `INSERT INTO imagenes_lesiones (id_usuario, nombre_archivo, ruta_archivo, mimetype, size_bytes)
           VALUES ($1, $2, $3, $4, $5) RETURNING id_imagen`,
          [
            adminId,
            'nevus_inicial.jpg',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBsw1WYWTqgORdTJIQu7rHgmNTZeVrmPJuyDgnlw_H42CUtQzmuOur3FPDqlOggRrT0lkBlJ-ryFL6ptX4VEIWBoGTGbimpoZ-krUHW9Mi9KcyltlVi9EmXmrH1Il2nZBXobMDp6tW-nVo6jlfdurYEicD4JfT6gi60QcYpdeVrc_-_OOCp5FSoIg32ah_YVMSjQY1meb10cX43ncB0F8kpgUTboIy0deagsYmIKUkbevmdyqYakTuWt0r2R_looPGBRXQ8oWtcboPw',
            'image/jpeg',
            102400
          ]
        );
        const img2Id = img2.rows[0].id_imagen;
        
        await client.query(
          `INSERT INTO analisis_ia (id_usuario, id_imagen, clase_predicha, confianza, nivel_riesgo, explicacion, aviso_legal, fecha_analisis)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '8 days')`,
          [
            adminId,
            img2Id,
            'nv',
            98.4,
            'bajo',
            'Mácula simétrica circular, uniforme de contornos nítidos y coloración homogénea marrón clara. Sin signos observables de atipia estructural ni desorganización reticular.',
            'AVISO LEGAL: Esta herramienta utiliza IA como apoyo al diagnóstico clínico. No sustituye el juicio de un profesional médico. Los resultados deben ser validados por un dermatólogo colegiado.',
          ]
        );

        // 3. Insertar Imagen 3 (Queratosis)
        const img3 = await client.query(
          `INSERT INTO imagenes_lesiones (id_usuario, nombre_archivo, ruta_archivo, mimetype, size_bytes)
           VALUES ($1, $2, $3, $4, $5) RETURNING id_imagen`,
          [
            adminId,
            'queratosis_inicial.jpg',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDmI4q5DsWRKkGVruRPKCml9xReRgEN6Zp2FOnNNzZxifQGztI7u6m46FQ3rJjnrzap1lIQKuz-Mj3YJ9fhmhjyFsa0kY9RTRLXWf-wvT68ETk2AaR9gptrl_HW7xWVvccoMnIhxr-VYFzjnHEETM7rjQSmyzzM3tca8GK7h3T6G9zQufe8T7gykx5TpWSZxf7CJpztNDz30PUTrFlHtJo4IJXd1K8Z4tH8TBDT9XIKr_dUTdfO2tiMIsQsFU8Q3wHfD8myf4RgPFuU',
            'image/jpeg',
            102400
          ]
        );
        const img3Id = img3.rows[0].id_imagen;
        
        await client.query(
          `INSERT INTO analisis_ia (id_usuario, id_imagen, clase_predicha, confianza, nivel_riesgo, explicacion, aviso_legal, fecha_analisis)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '14 days')`,
          [
            adminId,
            img3Id,
            'bkl',
            87.5,
            'bajo',
            'Lesión benigna no malignizante de aspecto \'adherido\' o verrugoso, con tapones queratósicos cobrizos uniformes evidentes. Presenta bajo riesgo pero puede irritarse con el roce de prendas.',
            'AVISO LEGAL: Esta herramienta utiliza IA como apoyo al diagnóstico clínico. No sustituye el juicio de un profesional médico. Los resultados deben ser validados por un dermatólogo colegiado.',
          ]
        );

        // Actualizar el contador de análisis
        await client.query('UPDATE usuarios SET analyses = 3 WHERE id_usuario = $1', [adminId]);
        console.log('✅ Historial de análisis inicial cargado exitosamente.');
      }
    }
  } catch (error) {
    console.error('❌ Error inicializando historial de análisis:', error.message);
  }
};

// Verificar conexión al arrancar y correr inicializadores (solo si no es entorno de pruebas)
if (process.env.NODE_ENV !== 'test') {
  pool.connect(async (err, client, release) => {
    if (err) {
      console.error('❌ Error conectando a PostgreSQL:', err.message);
      return;
    }
    const dbName = process.env.DB_NAME || 'SkinDB';
    console.log('✅ Conectado a PostgreSQL – base de datos:', dbName);

    try {
      // Inicializar tablas, recomendaciones y admin
      await crearTablasEInicializar(client);
      await inicializarAdmin(client);
      await inicializarHistorial(client);

      // Logs de depuración para ver los registros reales e imágenes en base de datos
      const countRes = await client.query('SELECT COUNT(*) FROM analisis_ia');
      console.log(`📊 Cantidad de análisis en DB: ${countRes.rows[0].count}`);
      
      const recordsRes = await client.query(`
        SELECT a.id_analisis, a.id_usuario, u.email, i.ruta_archivo 
        FROM analisis_ia a
        JOIN usuarios u ON a.id_usuario = u.id_usuario
        JOIN imagenes_lesiones i ON a.id_imagen = i.id_imagen
        LIMIT 10
      `);
      console.log('📋 Registros en DB:', JSON.stringify(recordsRes.rows, null, 2));
    } catch (dbError) {
      console.error('❌ Error al depurar la base de datos:', dbError.message);
    }

    release();
  });
}

module.exports = pool;
