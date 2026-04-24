// src/utils/imageUtils.ts
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Comprime y convierte una imagen local a base64
 * Redimensiona a máximo 1200px de ancho y 70% de calidad
 */
export const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (compressed.base64) {
      return `data:image/jpeg;base64,${compressed.base64}`;
    }

    throw new Error('No se pudo obtener base64');
  } catch (error) {
    console.error('❌ Error procesando imagen:', error);
    throw new Error('No se pudo procesar la imagen');
  }
};
