// src/controllers/analisisController.js
const path  = require('path');
const fs    = require('fs');
const sharp = require('sharp');

const ImagenLesion  = require('../models/ImagenLesion');
const AnalisisIA    = require('../models/AnalisisIA');
const Recomendacion = require('../models/Recomendacion');
const { predecir }  = require('../services/iaClient');

// ── Mapa de clases HAM10000 ──────────────────────────────────
const riesgoMap = {
  akiec: 'moderado',
  bcc:   'moderado',
  bkl:   'bajo',
  df:    'bajo',
  mel:   'alto',
  nv:    'bajo',
  vasc:  'bajo',
};

const AVISO_LEGAL =
  '⚠️ AVISO LEGAL: Este análisis ha sido generado por un sistema de inteligencia artificial ' +
  'con fines informativos y educativos únicamente. NO constituye un diagnóstico médico, ' +
  'NO reemplaza la consulta con un médico dermatólogo certificado, y NO debe utilizarse ' +
  'como base para tomar decisiones médicas. Consulte siempre a un profesional de la salud.';

// ── POST /api/analisis ───────────────────────────────────────
const analizar = async (req, res, next) => {
  const id_usuario = req.usuario.id_usuario;

  try {
    // 1. Tomar el buffer de la imagen (multer memoryStorage)
    const { buffer, originalname, mimetype, size } = req.file;

    // 2. Guardar la imagen en disco: uploads/{id_usuario}/
    const dirUsuario = path.join(__dirname, '..', '..', '..', 'uploads', String(id_usuario));
    if (!fs.existsSync(dirUsuario)) {
      fs.mkdirSync(dirUsuario, { recursive: true });
    }

    const timestamp     = Date.now();
    const ext           = path.extname(originalname) || '.jpg';
    const nombreArchivo = `lesion_${timestamp}${ext}`;
    const rutaAbsoluta  = path.join(dirUsuario, nombreArchivo);
    const rutaRelativa  = `uploads/${id_usuario}/${nombreArchivo}`;

    // Optimizar imagen con sharp (máx 1024px, calidad 85)
    await sharp(buffer)
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .toFile(rutaAbsoluta);

    // 3. Registrar imagen en BD
    const imagen = await ImagenLesion.crear(
      id_usuario,
      nombreArchivo,
      rutaRelativa,
      mimetype,
      size
    );

    // 4. Llamar al microservicio de IA
    let prediccion;
    try {
      prediccion = await predecir(buffer, originalname);
    } catch (iaError) {
      // Si la IA falla, limpiamos el archivo guardado y la BD
      await ImagenLesion.eliminar(imagen.id_imagen);
      fs.unlinkSync(rutaAbsoluta);
      return res.status(503).json({
        error: 'Servicio de IA no disponible',
        mensaje: iaError.message,
      });
    }

    const { clase, confianza } = prediccion;

    // 5. Asignar nivel de riesgo
    const nivel_riesgo = riesgoMap[clase] || 'bajo';

    // 6. Obtener recomendación de la BD
    const recomendacion = await Recomendacion.findByClase(clase);

    // 7. Construir explicación
    const explicacion = recomendacion
      ? `${recomendacion.descripcion}\n\nRecomendación: ${recomendacion.recomendacion}`
      : `Se detectó una lesión de tipo "${clase}" con una confianza del ${confianza.toFixed(1)}%.`;

    // 8. Guardar análisis en BD
    const analisis = await AnalisisIA.crear(
      id_usuario,
      imagen.id_imagen,
      clase,
      confianza,
      nivel_riesgo,
      explicacion,
      AVISO_LEGAL
    );

    // 9. Respuesta completa al cliente
    return res.status(201).json({
      mensaje: 'Análisis completado exitosamente.',
      analisis: {
        id_analisis:    analisis.id_analisis,
        clase_predicha: clase,
        nombre_amigable: recomendacion?.nombre_amigable || clase,
        confianza:      confianza,
        nivel_riesgo,
        explicacion,
        recomendacion:  recomendacion?.recomendacion || '',
        aviso_legal:    AVISO_LEGAL,
        imagen: {
          id_imagen:      imagen.id_imagen,
          nombre_archivo: nombreArchivo,
          url_imagen:     `/${rutaRelativa}`,
        },
        fecha_analisis: analisis.fecha_analisis,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { analizar };
