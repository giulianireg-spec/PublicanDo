// src/utils/imageUtils.ts
// REEMPLAZAR TODO EL CONTENIDO DEL ARCHIVO CON ESTE CÓDIGO

import * as FileSystem from 'expo-file-system/legacy';

/**
 * Convierte una imagen local a base64
 * @param uri URI local de la imagen (file://)
 * @returns String base64 con formato data:image/jpeg;base64,...
 */
export const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    console.log('🔄 URI de imagen:', uri);
    
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('✅ Conversión exitosa, tamaño:', base64.length);
    
    // Determinar el tipo MIME basado en la extensión
    let mimeType = 'image/jpeg';
    if (uri.toLowerCase().endsWith('.png')) {
      mimeType = 'image/png';
    } else if (uri.toLowerCase().endsWith('.gif')) {
      mimeType = 'image/gif';
    } else if (uri.toLowerCase().endsWith('.webp')) {
      mimeType = 'image/webp';
    }
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('❌ Error convirtiendo imagen a base64:', error);
    throw new Error('No se pudo procesar la imagen');
  }
};