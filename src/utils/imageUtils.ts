// src/utils/imageUtils.ts
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Comprime y convierte una imagen local a base64
 */
export const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    console.log('🔄 Comprimiendo imagen:', uri);

    // Comprimir la imagen antes de convertir
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // máximo 1200px de ancho
      {
        compress: 0.7, // 70% de calidad
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,  // pedir base64 directamente
      }
    );

    if (compressed.base64) {
      console.log('✅ Imagen comprimida, tamaño base64:', compressed.base64.length);
      return `data:image/jpeg;base64,${compressed.base64}`;
    }

    // Fallback: leer el archivo comprimido
    const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;

  } catch (error) {
    console.error('❌ Error procesando imagen:', error);
    throw new Error('No se pudo procesar la imagen');
  }
};
