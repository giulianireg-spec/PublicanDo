// src/components/MediaPicker.tsx
// ACTUALIZADO: Nuevos límites de imágenes (Free: 5, Premium: 10 + video)

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useTheme } from '../context/ThemeContext';

// ✅ NUEVOS LÍMITES
const MAX_IMAGES_FREE = 5;      // Free: 5 imágenes total
const MAX_IMAGES_PREMIUM = 10;  // Premium: 10 imágenes + 1 video
const MAX_VIDEO_DURATION = 60;  // 60 segundos máximo
const MAX_VIDEO_SIZE_MB = 50;   // 50 MB máximo

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

interface MediaPickerProps {
  isPremium: boolean;
  images: MediaItem[];
  video: MediaItem | null;
  onImagesChange: (images: MediaItem[]) => void;
  onVideoChange: (video: MediaItem | null) => void;
}

const MediaPicker: React.FC<MediaPickerProps> = ({
  isPremium,
  images,
  video,
  onImagesChange,
  onVideoChange,
}) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  limitBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  limitText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    lineHeight: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.grayLight,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
  },
  mainBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  videoBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: COLORS.secondary,
    padding: 4,
    borderRadius: 8,
  },
  videoPlaceholder: {
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
  },
  addButtonDisabled: {
    borderColor: COLORS.grayLight,
    backgroundColor: '#F5F5F5',
  },
  addButtonHidden: {
    display: 'none',
  },
  addButtonText: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButtonTextDisabled: {
    color: COLORS.gray,
  },
  videoIconContainer: {
    position: 'relative',
  },
  premiumStar: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
  remainingText: {
    marginTop: 12,
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  fullContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  fullText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
});

  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // ✅ Calcular límites según tipo de usuario
  const maxImages = isPremium ? MAX_IMAGES_PREMIUM : MAX_IMAGES_FREE;
  const canAddVideo = isPremium;
  const remainingImages = maxImages - images.length;

  const pickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert(
        'Límite alcanzado',
        isPremium 
          ? `Ya tienes ${maxImages} imágenes. Elimina alguna para agregar más.`
          : `Las cuentas gratuitas pueden subir hasta ${maxImages} imágenes. ¡Hazte Premium para subir hasta 10!`
      );
      return;
    }

    try {
      setLoadingImage(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar imágenes');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: remainingImages,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          type: 'image' as const,
        }));

        // Verificar que no exceda el límite
        const totalImages = images.length + newImages.length;
        if (totalImages > maxImages) {
          const allowedNew = maxImages - images.length;
          Alert.alert(
            'Límite de imágenes',
            `Solo puedes agregar ${allowedNew} imagen(es) más. Se seleccionaron las primeras ${allowedNew}.`
          );
          onImagesChange([...images, ...newImages.slice(0, allowedNew)]);
        } else {
          onImagesChange([...images, ...newImages]);
        }
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setLoadingImage(false);
    }
  };

  const takePhoto = async () => {
    if (images.length >= maxImages) {
      Alert.alert(
        'Límite alcanzado',
        isPremium 
          ? `Ya tienes ${maxImages} imágenes. Elimina alguna para agregar más.`
          : `Las cuentas gratuitas pueden subir hasta ${maxImages} imágenes.`
      );
      return;
    }

    try {
      setLoadingImage(true);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para tomar fotos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage: MediaItem = {
          uri: result.assets[0].uri,
          type: 'image',
        };
        onImagesChange([...images, newImage]);
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    } finally {
      setLoadingImage(false);
    }
  };

  const pickVideo = async () => {
    if (!canAddVideo) {
      Alert.alert(
        '⭐ Funcionalidad Premium',
        'Los videos solo están disponibles para usuarios Premium. ¡Actualiza tu cuenta para agregar videos a tus publicidades!'
      );
      return;
    }

    if (video) {
      Alert.alert(
        'Video existente',
        'Ya tienes un video. ¿Deseas reemplazarlo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reemplazar', onPress: () => selectVideo() },
        ]
      );
      return;
    }

    await selectVideo();
  };

  const selectVideo = async () => {
    try {
      setLoadingVideo(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar videos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: MAX_VIDEO_DURATION,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Verificar duración
        if (asset.duration && asset.duration > MAX_VIDEO_DURATION * 1000) {
          Alert.alert(
            'Video muy largo',
            `El video no puede exceder ${MAX_VIDEO_DURATION} segundos. Tu video dura ${Math.round(asset.duration / 1000)} segundos.`
          );
          return;
        }

        // Verificar tamaño (aproximado)
        if (asset.fileSize && asset.fileSize > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          Alert.alert(
            'Video muy pesado',
            `El video no puede exceder ${MAX_VIDEO_SIZE_MB}MB.`
          );
          return;
        }

        const newVideo: MediaItem = {
          uri: asset.uri,
          type: 'video',
        };
        onVideoChange(newVideo);
      }
    } catch (error) {
      console.error('Error seleccionando video:', error);
      Alert.alert('Error', 'No se pudo seleccionar el video');
    } finally {
      setLoadingVideo(false);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert(
      'Eliminar imagen',
      '¿Deseas eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const newImages = [...images];
            newImages.splice(index, 1);
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  const removeVideo = () => {
    Alert.alert(
      'Eliminar video',
      '¿Deseas eliminar este video?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onVideoChange(null),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con límites */}
      <View style={styles.header}>
        <Text style={styles.title}>📸 Imágenes y Video</Text>
        <View style={styles.limitBadge}>
          <Text style={styles.limitText}>
            {images.length}/{maxImages} imágenes
          </Text>
        </View>
      </View>

      {/* Info de límites */}
      <View style={styles.infoContainer}>
        <Ionicons 
          name={isPremium ? 'star' : 'information-circle'} 
          size={16} 
          color={isPremium ? COLORS.accent : COLORS.primary} 
        />
        <Text style={styles.infoText}>
          {isPremium 
            ? `Puedes subir hasta ${MAX_IMAGES_PREMIUM} imágenes + 1 video (máx ${MAX_VIDEO_DURATION}s)`
            : `Puedes subir hasta ${MAX_IMAGES_FREE} imágenes. ¡Hazte Premium para más!`
          }
        </Text>
      </View>

      {/* Grid de imágenes */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mediaGrid}
      >
        {/* Imágenes existentes */}
        {images.map((img, index) => (
          <View key={`img-${index}`} style={styles.mediaItem}>
            <Image source={{ uri: img.uri }} style={styles.thumbnail} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
            {index === 0 && (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>Principal</Text>
              </View>
            )}
          </View>
        ))}

        {/* Video existente */}
        {video && (
          <View style={styles.mediaItem}>
            <View style={[styles.thumbnail, styles.videoPlaceholder]}>
              <Ionicons name="videocam" size={40} color={COLORS.white} />
              <Text style={styles.videoPlaceholderText}>Video</Text>
            </View>
            <View style={styles.videoBadge}>
              <Ionicons name="videocam" size={16} color={COLORS.white} />
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeVideo}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Botón agregar imagen */}
        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={pickImage}
            disabled={loadingImage}
          >
            {loadingImage ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="images" size={32} color={COLORS.primary} />
                <Text style={styles.addButtonText}>
                  Agregar{'\n'}imagen
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Botón tomar foto */}
        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={takePhoto}
            disabled={loadingImage}
          >
            {loadingImage ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="camera" size={32} color={COLORS.primary} />
                <Text style={styles.addButtonText}>
                  Tomar{'\n'}foto
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Botón agregar video (solo Premium) */}
        <TouchableOpacity
          style={[
            styles.addButton,
            !canAddVideo && styles.addButtonDisabled,
            video && styles.addButtonHidden,
          ]}
          onPress={pickVideo}
          disabled={loadingVideo || !!video}
        >
          {loadingVideo ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <>
              <View style={styles.videoIconContainer}>
                <Ionicons 
                  name="videocam" 
                  size={32} 
                  color={canAddVideo ? COLORS.secondary : COLORS.gray} 
                />
                {!canAddVideo && (
                  <Ionicons 
                    name="star" 
                    size={14} 
                    color={COLORS.accent} 
                    style={styles.premiumStar}
                  />
                )}
              </View>
              <Text style={[
                styles.addButtonText,
                !canAddVideo && styles.addButtonTextDisabled
              ]}>
                {canAddVideo ? 'Agregar\nvideo' : 'Video\n⭐ Premium'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Mensaje de imágenes restantes */}
      {remainingImages > 0 && remainingImages < maxImages && (
        <Text style={styles.remainingText}>
          Puedes agregar {remainingImages} imagen(es) más
        </Text>
      )}

      {/* Mensaje cuando está lleno */}
      {images.length >= maxImages && (
        <View style={styles.fullContainer}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.fullText}>
            Has alcanzado el límite de imágenes
          </Text>
        </View>
      )}
    </View>
  );
};

export default MediaPicker;