// src/controllers/chatController.js
const AnalisisIA    = require('../models/AnalisisIA');
const ChatHistorial = require('../models/ChatHistorial');

// ── Base de conocimiento simple basada en palabras clave ─────
const RESPUESTAS = [
  {
    keywords: ['melanoma', 'mel', 'maligno', 'peligroso', 'grave', 'cancer', 'cáncer'],
    respuesta:
      'El melanoma es el tipo más agresivo de cáncer de piel. Es URGENTE que consulte a un dermatólogo lo antes posible. El diagnóstico y tratamiento temprano son fundamentales para un buen pronóstico. No demore la consulta médica.',
  },
  {
    keywords: ['bcc', 'basocelular', 'carcinoma basocelular'],
    respuesta:
      'El carcinoma basocelular es el cáncer de piel más común y de crecimiento lento. Rara vez hace metástasis, pero requiere tratamiento médico. Solicite una cita con dermatología en los próximos 15 días.',
  },
  {
    keywords: ['akiec', 'queratosis actínica', 'actínica', 'bowen'],
    respuesta:
      'La queratosis actínica es una lesión precancerosa causada por exposición solar. Con tratamiento temprano tiene excelente pronóstico. Evite el sol en la zona y consulte al dermatólogo en los próximos 30 días.',
  },
  {
    keywords: ['nv', 'lunar', 'nevus', 'nevo', 'benigno'],
    respuesta:
      'Los nevos melanocíticos (lunares) generalmente son benignos. Realice autoexamen mensual usando la regla ABCDE: Asimetría, Bordes, Color, Diámetro, Evolución. Consulte si nota algún cambio.',
  },
  {
    keywords: ['confianza', 'precisión', 'exactitud', 'porcentaje', 'seguro'],
    respuesta:
      'La confianza indica qué tan seguro está el modelo de IA de su predicción. Un valor alto (>80%) sugiere mayor certeza, pero SIEMPRE debe confirmarse con un médico dermatólogo. La IA es una herramienta de apoyo, no un diagnóstico definitivo.',
  },
  {
    keywords: ['riesgo', 'peligro', 'nivel', 'grave', 'urgente'],
    respuesta:
      'Los niveles de riesgo son: BAJO (lesiones benignas como lunares, dermatofibromas), MODERADO (lesiones que requieren evaluación médica como carcinoma basocelular o queratosis actínica), y ALTO (melanoma – requiere atención urgente).',
  },
  {
    keywords: ['sol', 'solar', 'uv', 'protector', 'bronceado', 'playa'],
    respuesta:
      'La exposición solar excesiva es el principal factor de riesgo para el cáncer de piel. Use protector solar SPF 50+ diariamente, evite el sol entre las 10am y las 4pm, y use ropa protectora. Revise su piel regularmente.',
  },
  {
    keywords: ['tratamiento', 'cirugía', 'medicamento', 'cura', 'curar'],
    respuesta:
      'El tratamiento depende del tipo y estadío de la lesión. Las opciones incluyen crioterapia, cirugía, terapia fotodinámica, radioterapia e inmunoterapia. Solo un dermatólogo puede determinar el tratamiento adecuado para su caso.',
  },
  {
    keywords: ['doctor', 'médico', 'dermatólogo', 'especialista', 'consulta'],
    respuesta:
      'Le recomendamos buscar un médico dermatólogo certificado. Si el nivel de riesgo es ALTO, busque atención en las próximas 24-48 horas. Para niveles MODERADOS, solicite cita en los próximos 15-30 días. Para niveles BAJOS, una revisión de rutina anual es suficiente.',
  },
  {
    keywords: ['abcde', 'regla', 'autoexamen', 'examinar'],
    respuesta:
      'La regla ABCDE ayuda a identificar lunares sospechosos:\n• A - Asimetría: las dos mitades no son iguales\n• B - Bordes: irregulares o mal definidos\n• C - Color: múltiples colores o cambio de color\n• D - Diámetro: mayor a 6mm (tamaño de un borrador)\n• E - Evolución: cualquier cambio en tamaño, forma o color\nConsulte si detecta alguna de estas características.',
  },
];

const RESPUESTA_DEFECTO =
  'Entiendo su consulta. Recuerde que este es un sistema de apoyo informativo y no reemplaza la opinión de un médico dermatólogo. Le recomiendo consultar con un profesional de la salud para obtener un diagnóstico y tratamiento adecuado a su situación específica. ¿Tiene alguna otra pregunta sobre su análisis?';

/**
 * Genera una respuesta basada en palabras clave.
 */
const generarRespuesta = (pregunta, clasePredicha) => {
  const texto = pregunta.toLowerCase();

  for (const item of RESPUESTAS) {
    if (item.keywords.some((kw) => texto.includes(kw))) {
      return item.respuesta;
    }
  }

  // Si pregunta por la clase predicha específicamente
  if (clasePredicha && texto.includes(clasePredicha.toLowerCase())) {
    const item = RESPUESTAS.find((r) => r.keywords.includes(clasePredicha.toLowerCase()));
    if (item) return item.respuesta;
  }

  return RESPUESTA_DEFECTO;
};

// ── POST /api/chat/:id_analisis ──────────────────────────────
const preguntar = async (req, res, next) => {
  try {
    const id_usuario  = req.usuario.id_usuario;
    const id_analisis = parseInt(req.params.id_analisis, 10);
    const { pregunta } = req.body;

    if (!pregunta || pregunta.trim().length === 0) {
      return res.status(400).json({
        error: 'Pregunta requerida',
        mensaje: 'Debe enviar una pregunta en el campo "pregunta".',
      });
    }

    // Verificar que el análisis existe y pertenece al usuario
    const analisis = await AnalisisIA.findById(id_analisis);
    if (!analisis) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Análisis no encontrado.' });
    }
    if (analisis.id_usuario !== id_usuario) {
      return res.status(403).json({ error: 'Acceso denegado', mensaje: 'No tiene permisos.' });
    }

    // Guardar mensaje del usuario
    await ChatHistorial.crear(id_analisis, id_usuario, 'usuario', pregunta.trim());

    // Generar respuesta
    const respuesta = generarRespuesta(pregunta, analisis.clase_predicha);

    // Guardar respuesta del asistente
    const mensajeAsistente = await ChatHistorial.crear(
      id_analisis,
      id_usuario,
      'asistente',
      respuesta
    );

    return res.json({
      respuesta,
      mensaje: {
        id_mensaje: mensajeAsistente.id_mensaje,
        rol:        'asistente',
        contenido:  respuesta,
        created_at: mensajeAsistente.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/chat/:id_analisis ───────────────────────────────
const obtenerHistorialChat = async (req, res, next) => {
  try {
    const id_usuario  = req.usuario.id_usuario;
    const id_analisis = parseInt(req.params.id_analisis, 10);

    // Verificar propiedad del análisis
    const analisis = await AnalisisIA.findById(id_analisis);
    if (!analisis) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Análisis no encontrado.' });
    }
    if (analisis.id_usuario !== id_usuario) {
      return res.status(403).json({ error: 'Acceso denegado', mensaje: 'No tiene permisos.' });
    }

    const mensajes = await ChatHistorial.findByAnalisis(id_analisis);
    return res.json({ mensajes, total: mensajes.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { preguntar, obtenerHistorialChat };
