// src/controllers/historialController.js
const fs = require('fs');
const path = require('path');

const AnalisisIA   = require('../models/AnalisisIA');
const ImagenLesion = require('../models/ImagenLesion');
const pool         = require('../config/db');

// Función auxiliar para inicializar historial clínico con datos de muestra para cualquier usuario
const inicializarHistorialParaUsuario = async (id_usuario) => {
  try {
    // 1. Insertar Imagen 1 (Melanoma)
    const img1 = await pool.query(
      `INSERT INTO imagenes_lesiones (id_usuario, nombre_archivo, ruta_archivo, mimetype, size_bytes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id_imagen`,
      [
        id_usuario,
        'melanoma_inicial.jpg',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCJdhfAXnuVUbxjqbU2WDXYWAXKNFbwjMYOsu3rm34JlhnqQfrhowQurcJVXSxzieshBnA0sish6o59-M3_K34-nro77bvYKMcL6nNfPvAFPx2b7CvY_3ftKDH2bQyB-c-geualz7bU0PvRu9n5qTB0EpPnB5okfoFhZQK7VvlZNCLRSZyfPLlkNmKmlN7t2Km0v-2l8KOf2UD_FNSWvLe2X3l7d7xhZ_Ahre13_4AIqIUWPnzwmJmVI_gSBmJVZRGmbGEIeb1vnRqh',
        'image/jpeg',
        102400
      ]
    );
    const img1Id = img1.rows[0].id_imagen;
    
    await pool.query(
      `INSERT INTO analisis_ia (id_usuario, id_imagen, clase_predicha, confianza, nivel_riesgo, explicacion, aviso_legal, fecha_analisis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '2 days')`,
      [
        id_usuario,
        img1Id,
        'mel',
        94.2,
        'alto',
        'La imagen presenta bordes irregulares, asimetría marcada y policromía (variación de tonos marrones y negros), patrones altamente asociados con lesiones melanocíticas malignas según el protocolo ABCDE.',
        'AVISO LEGAL: Esta herramienta utiliza IA como apoyo al diagnóstico clínico. No sustituye el juicio de un profesional médico. Los resultados deben ser validados por un dermatólogo colegiado.',
      ]
    );

    // 2. Insertar Imagen 2 (Nevus)
    const img2 = await pool.query(
      `INSERT INTO imagenes_lesiones (id_usuario, nombre_archivo, ruta_archivo, mimetype, size_bytes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id_imagen`,
      [
        id_usuario,
        'nevus_inicial.jpg',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBsw1WYWTqgORdTJIQu7rHgmNTZeVrmPJuyDgnlw_H42CUtQzmuOur3FPDqlOggRrT0lkBlJ-ryFL6ptX4VEIWBoGTGbimpoZ-krUHW9Mi9KcyltlVi9EmXmrH1Il2nZBXobMDp6tW-nVo6jlfdurYEicD4JfT6gi60QcYpdeVrc_-_OOCp5FSoIg32ah_YVMSjQY1meb10cX43ncB0F8kpgUTboIy0deagsYmIKUkbevmdyqYakTuWt0r2R_looPGBRXQ8oWtcboPw',
        'image/jpeg',
        102400
      ]
    );
    const img2Id = img2.rows[0].id_imagen;
    
    await pool.query(
      `INSERT INTO analisis_ia (id_usuario, id_imagen, clase_predicha, confianza, nivel_riesgo, explicacion, aviso_legal, fecha_analisis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '8 days')`,
      [
        id_usuario,
        img2Id,
        'nv',
        98.4,
        'bajo',
        'Mácula simétrica circular, uniforme de contornos nítidos y coloración homogénea marrón clara. Sin signos observables de atipia estructural ni desorganización reticular.',
        'AVISO LEGAL: Esta herramienta utiliza IA como apoyo al diagnóstico clínico. No sustituye el juicio de un profesional médico. Los resultados deben ser validados por un dermatólogo colegiado.',
      ]
    );

    // 3. Insertar Imagen 3 (Queratosis)
    const img3 = await pool.query(
      `INSERT INTO imagenes_lesiones (id_usuario, nombre_archivo, ruta_archivo, mimetype, size_bytes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id_imagen`,
      [
        id_usuario,
        'queratosis_inicial.jpg',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDmI4q5DsWRKkGVruRPKCml9xReRgEN6Zp2FOnNNzZxifQGztI7u6m46FQ3rJjnrzap1lIQKuz-Mj3YJ9fhmhjyFsa0kY9RTRLXWf-wvT68ETk2AaR9gptrl_HW7xWVvccoMnIhxr-VYFzjnHEETM7rjQSmyzzM3tca8GK7h3T6G9zQufe8T7gykx5TpWSZxf7CJpztNDz30PUTrFlHtJo4IJXd1K8Z4tH8TBDT9XIKr_dUTdfO2tiMIsQsFU8Q3wHfD8myf4RgPFuU',
        'image/jpeg',
        102400
      ]
    );
    const img3Id = img3.rows[0].id_imagen;
    
    await pool.query(
      `INSERT INTO analisis_ia (id_usuario, id_imagen, clase_predicha, confianza, nivel_riesgo, explicacion, aviso_legal, fecha_analisis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '14 days')`,
      [
        id_usuario,
        img3Id,
        'bkl',
        87.5,
        'bajo',
        'Lesión benigna no malignizante de aspecto \'adherido\' o verrugoso, con tapones queratósicos cobrizos uniformes evidentes. Presenta bajo riesgo pero puede irritarse con el roce de prendas.',
        'AVISO LEGAL: Esta herramienta utiliza IA como apoyo al diagnóstico clínico. No sustituye el juicio de un profesional médico. Los resultados deben ser validados por un dermatólogo colegiado.',
      ]
    );

    // Actualizar el contador de análisis
    await pool.query('UPDATE usuarios SET analyses = 3 WHERE id_usuario = $1', [id_usuario]);
  } catch (error) {
    console.error('❌ Error al auto-inicializar historial del usuario:', error.message);
  }
};

// ── GET /api/historial ───────────────────────────────────────
const listarHistorial = async (req, res, next) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    // Parámetros de paginación y filtro
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const clase = req.query.clase || null;
    const offset = (page - 1) * limit;

    let [analisis, total] = await Promise.all([
      AnalisisIA.findByUsuario(id_usuario, { limit, offset, clase }),
      AnalisisIA.countByUsuario(id_usuario, clase),
    ]);

    // Si el usuario no tiene historial, lo poblamos al vuelo con los registros por defecto
    if (total === 0 && !clase && page === 1) {
      await inicializarHistorialParaUsuario(id_usuario);
      [analisis, total] = await Promise.all([
        AnalisisIA.findByUsuario(id_usuario, { limit, offset, clase }),
        AnalisisIA.countByUsuario(id_usuario, clase),
      ]);
    }

    return res.json({
      data:   analisis,
      paginacion: {
        pagina_actual: page,
        total_items:   total,
        total_paginas: Math.ceil(total / limit),
        por_pagina:    limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/historial/:id ───────────────────────────────────
const obtenerDetalle = async (req, res, next) => {
  try {
    const id_usuario  = req.usuario.id_usuario;
    const id_analisis = parseInt(req.params.id, 10);

    if (isNaN(id_analisis)) {
      return res.status(400).json({ error: 'ID inválido', mensaje: 'El ID debe ser un número.' });
    }

    const analisis = await AnalisisIA.findById(id_analisis);

    if (!analisis) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Análisis no encontrado.' });
    }

    // Verificar que el análisis pertenece al usuario autenticado
    if (analisis.id_usuario !== id_usuario) {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'No tiene permisos para ver este análisis.',
      });
    }

    return res.json({ analisis });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/historial/:id ────────────────────────────────
const eliminarAnalisis = async (req, res, next) => {
  try {
    const id_usuario  = req.usuario.id_usuario;
    const id_analisis = parseInt(req.params.id, 10);

    if (isNaN(id_analisis)) {
      return res.status(400).json({ error: 'ID inválido', mensaje: 'El ID debe ser un número.' });
    }

    // Obtener análisis (con datos de imagen)
    const analisis = await AnalisisIA.findById(id_analisis);

    if (!analisis) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Análisis no encontrado.' });
    }

    // Verificar propiedad
    if (analisis.id_usuario !== id_usuario) {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'No tiene permisos para eliminar este análisis.',
      });
    }

    // Guardar ruta del archivo antes de eliminar registros
    const rutaArchivo = path.join(__dirname, '..', '..', '..', analisis.ruta_archivo);

    // Eliminar de BD (analisis_ia primero, luego imagen)
    await AnalisisIA.eliminar(id_analisis);
    await ImagenLesion.eliminar(analisis.id_imagen);

    // Eliminar archivo físico si existe
    if (fs.existsSync(rutaArchivo)) {
      try {
        fs.unlinkSync(rutaArchivo);
      } catch (_) {
        // No es crítico si el archivo no se puede eliminar
        console.warn(`[WARN] No se pudo eliminar el archivo: ${rutaArchivo}`);
      }
    }

    return res.json({ mensaje: 'Análisis eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listarHistorial, obtenerDetalle, eliminarAnalisis };
