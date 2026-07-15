// src/services/iaClient.js – Cliente para el microservicio Python FastAPI
const axios = require('axios');
const FormData = require('form-data');

// Validar que IA_URL esté configurada al arrancar
const IA_BASE = process.env.IA_URL;
if (!IA_BASE) {
  console.error('⚠️  ERROR: La variable de entorno IA_URL no está configurada.');
  console.error('   Configure IA_URL en las variables de entorno de Render apuntando al ia_service.');
}

// Garantizar que siempre apunte a /predict, sin importar cómo esté configurada IA_URL
// Ej: "https://ia-service-roxp.onrender.com" → "https://ia-service-roxp.onrender.com/predict"
//     "https://ia-service-roxp.onrender.com/predict" → "https://ia-service-roxp.onrender.com/predict"
const IA_URL = IA_BASE
  ? (IA_BASE.endsWith('/predict') ? IA_BASE : IA_BASE.replace(/\/$/, '') + '/predict')
  : null;

console.log(`[iaClient] IA_URL efectiva: ${IA_URL}`);

/**
 * Envía una imagen al microservicio de IA y retorna la predicción.
 * @param {Buffer} bufferImagen  – Buffer de la imagen (desde multer memoryStorage)
 * @param {string} nombreArchivo – Nombre del archivo (para el Content-Disposition)
 * @returns {{ clase: string, confianza: number }}
 */
async function predecir(bufferImagen, nombreArchivo) {
  if (!IA_URL) {
    throw new Error('IA_URL no está configurada en las variables de entorno del servidor.');
  }

  const form = new FormData();
  form.append('file', bufferImagen, {
    filename: nombreArchivo,
    contentType: 'image/jpeg',
  });

  try {
    console.log(`[iaClient] Llamando a IA en: ${IA_URL}`);
    const response = await axios.post(IA_URL, form, {
      headers: form.getHeaders(),
      timeout: 90000, // 90 segundos – necesario para el cold start del plan gratuito de Render
    });

    // Esperamos: { clase: "mel", confianza: 84.7 }
    return response.data;
  } catch (error) {
    console.error('[iaClient] Error al contactar el ia_service:', error.code, error.message);
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`El microservicio de IA no está disponible en: ${IA_URL}`);
    }
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      throw new Error('El microservicio de IA tardó demasiado en responder (posible cold start). Intente nuevamente en 1 minuto.');
    }
    throw new Error(`Error del servicio de IA: ${error.response?.data?.detail || error.message}`);
  }
}

module.exports = { predecir };
