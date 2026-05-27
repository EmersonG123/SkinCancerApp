// src/services/iaClient.js – Cliente para el microservicio Python FastAPI
const axios = require('axios');
const FormData = require('form-data');

/**
 * Envía una imagen al microservicio de IA y retorna la predicción.
 * @param {Buffer} bufferImagen  – Buffer de la imagen (desde multer memoryStorage)
 * @param {string} nombreArchivo – Nombre del archivo (para el Content-Disposition)
 * @returns {{ clase: string, confianza: number }}
 */
async function predecir(bufferImagen, nombreArchivo) {
  const form = new FormData();
  form.append('file', bufferImagen, {
    filename: nombreArchivo,
    contentType: 'image/jpeg',
  });

  try {
    const response = await axios.post(process.env.IA_URL, form, {
      headers: form.getHeaders(),
      timeout: 15000, // 15 segundos máximo
    });

    // Esperamos: { clase: "mel", confianza: 84.7 }
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('El microservicio de IA no está disponible. Asegúrese de que FastAPI esté corriendo en el puerto 8001.');
    }
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      throw new Error('El microservicio de IA tardó demasiado en responder. Intente nuevamente.');
    }
    throw new Error(`Error del servicio de IA: ${error.response?.data?.detail || error.message}`);
  }
}

module.exports = { predecir };
