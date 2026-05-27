// src/utils/imageValidator.js – Validación de imágenes con sharp
const sharp = require('sharp');

const MIN_WIDTH  = 64;
const MIN_HEIGHT = 64;
const MAX_WIDTH  = 8000;
const MAX_HEIGHT = 8000;

/**
 * Valida las dimensiones y formato de una imagen.
 * @param {Buffer} buffer – Buffer de la imagen
 * @returns {{ valida: boolean, ancho: number, alto: number, formato: string, mensaje?: string }}
 */
const validarImagen = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();

    const { width, height, format } = metadata;

    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
      return {
        valida: false,
        ancho: width,
        alto: height,
        formato: format,
        mensaje: `La imagen es demasiado pequeña (${width}x${height}px). Mínimo: ${MIN_WIDTH}x${MIN_HEIGHT}px.`,
      };
    }

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      return {
        valida: false,
        ancho: width,
        alto: height,
        formato: format,
        mensaje: `La imagen es demasiado grande (${width}x${height}px). Máximo: ${MAX_WIDTH}x${MAX_HEIGHT}px.`,
      };
    }

    return { valida: true, ancho: width, alto: height, formato: format };
  } catch (err) {
    return {
      valida: false,
      ancho: 0,
      alto: 0,
      formato: 'desconocido',
      mensaje: `No se pudo leer la imagen: ${err.message}`,
    };
  }
};

/**
 * Obtiene metadata de una imagen.
 * @param {Buffer} buffer
 */
const obtenerMetadata = async (buffer) => {
  const meta = await sharp(buffer).metadata();
  return {
    ancho:   meta.width,
    alto:    meta.height,
    formato: meta.format,
    canales: meta.channels,
    espacio: meta.space,
  };
};

module.exports = { validarImagen, obtenerMetadata };
