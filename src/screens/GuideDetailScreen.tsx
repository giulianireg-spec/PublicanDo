// src/screens/GuideDetailScreen.tsx
// Pantalla de detalle de una guía de GuianDo

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { getGuideById, rateGuide, toggleSaveGuide, deleteGuide } from '../services/guidesApi';
import { createGuideReport } from '../services/api';
import { ReportModal } from '../components/ReportModal';
import { Guide, GuidePoint } from '../types/guide.types';
import { useTheme } from '../context/ThemeContext';
import { 
  getGuideCategoryConfig, 
  formatDuration,
  GUIDE_DIFFICULTIES,
} from '../constants/guides';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GuideDetailScreen = ({ navigation, route }: any) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: COLORS.error,
  },
  // Cover
  coverContainer: {
    height: 280,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverActions: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  coverActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
  // Content
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  createdAt: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.grayLight,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 20,
  },
  // Rate
  rateSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  rateTitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 10,
  },
  // Map
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  markerText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  expandMapButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Points
  pointCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  pointNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  pointNumberText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  pointImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  pointMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointMetaText: {
    fontSize: 11,
    color: COLORS.gray,
    marginLeft: 3,
  },
  pointExpanded: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  pointDescription: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 10,
  },
  notesContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  pointActions: {
    flexDirection: 'row',
    gap: 10,
  },
  pointActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  pointActionSecondary: {
    backgroundColor: COLORS.primary + '15',
  },
  pointActionText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
  // Owner actions
  ownerActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '15',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontWeight: '600',
  },
});

  const { guideId } = route.params;
  const { user } = useAuth();
  
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [expandedPoint, setExpandedPoint] = useState<number | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const isOwner = guide?.createdBy._id === user?._id;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  useEffect(() => {
    loadGuide();
  }, [guideId]);

  const loadGuide = async () => {
    try {
      setLoading(true);
      const data = await getGuideById(guideId);
      setGuide(data);
      
      // Verificar si el usuario ya guardó esta guía
      if (user?.savedGuides?.includes(guideId)) {
        setIsSaved(true);
      }
      
      // Verificar si el usuario ya valoró
      const existingRating = data.ratings.find(r => r.userId === user?._id);
      if (existingRating) {
        setUserRating(existingRating.rating);
      }
    } catch (error) {
      console.error('Error cargando guía:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar la guía',
        position: 'bottom',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Toast.show({
        type: 'info',
        text1: 'Inicia sesión',
        text2: 'Debes iniciar sesión para guardar guías',
        position: 'bottom',
      });
      return;
    }

    try {
      const result = await toggleSaveGuide(guideId);
      setIsSaved(result.saved);
      Toast.show({
        type: 'success',
        text1: result.saved ? '💾 Guardada' : 'Removida de guardados',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error guardando guía:', error);
    }
  };

  const handleRate = async (rating: number) => {
    if (!user) {
      Toast.show({
        type: 'info',
        text1: 'Inicia sesión',
        text2: 'Debes iniciar sesión para valorar',
        position: 'bottom',
      });
      return;
    }

    try {
      const result = await rateGuide(guideId, rating);
      setUserRating(rating);
      setGuide(prev => prev ? {
        ...prev,
        averageRating: result.averageRating,
        ratingCount: result.ratingCount,
      } : null);
      
      Toast.show({
        type: 'success',
        text1: '⭐ Valoración guardada',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo guardar la valoración',
        position: 'bottom',
      });
    }
  };

  const handleReport = () => {
    if (!user) {
      Alert.alert('Iniciá sesión', 'Para reportar necesitás tener una cuenta', [{ text: 'Entendido' }]);
      return;
    }
    setReportModalVisible(true);
  };

  const handleConfirmReport = async (reason: string, description: string) => {
    try {
      await createGuideReport(guideId, reason, description);
      setReportModalVisible(false);
      Toast.show({ type: 'success', text1: '✅ Reporte enviado', text2: 'Será revisado por un moderador', position: 'bottom' });
    } catch (error: any) {
      setReportModalVisible(false);
      if (error.message.includes('anteriormente')) {
        Toast.show({ type: 'info', text1: '⚠️ Ya reportaste esta guía', position: 'bottom' });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'bottom' });
      }
    }
  };

  const handleShare = async () => {
    if (!guide) return;
    
    try {
      await Share.share({
        message: `🗺️ ${guide.title}\n\nDescubre esta guía en GuianDo: ${guide.mainLocation.city}, ${guide.mainLocation.province}\n\n${guide.description.substring(0, 100)}...`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '⚠️ Eliminar guía',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGuide(guideId);
              Toast.show({
                type: 'success',
                text1: '🗑️ Guía eliminada',
                position: 'bottom',
              });
              navigation.goBack();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo eliminar la guía',
                position: 'bottom',
              });
            }
          },
        },
      ]
    );
  };

  const handleOpenMaps = (point: GuidePoint) => {
    const coords = point.location.coordinates;
    if (!coords) {
      Toast.show({
        type: 'info',
        text1: 'Sin coordenadas',
        text2: 'Este punto no tiene ubicación exacta',
        position: 'bottom',
      });
      return;
    }

    const [lng, lat] = coords;
    const label = point.type === 'place' ? (point.placeId as any)?.title : point.customName;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    Linking.openURL(url);
  };

  const renderStars = (rating: number, interactive = false, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => interactive && handleRate(i)}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={size}
            color="#FFD700"
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  const renderPointCard = (point: GuidePoint, index: number) => {
    const isExpanded = expandedPoint === index;
    const pointName = point.type === 'place' ? (point.placeId as any)?.title : point.customName;
    const pointImage = point.type === 'place' ? (point.placeId as any)?.imageUrl : point.customImageUrl;
    const pointDescription = point.type === 'custom' ? point.customDescription : null;

    return (
      <TouchableOpacity
        key={index}
        style={styles.pointCard}
        onPress={() => setExpandedPoint(isExpanded ? null : index)}
        activeOpacity={0.8}
      >
        <View style={styles.pointHeader}>
          <View style={styles.pointNumber}>
            <Text style={styles.pointNumberText}>{point.order}</Text>
          </View>
          
          {pointImage && (
            <Image source={{ uri: pointImage }} style={styles.pointImage} />
          )}
          
          <View style={styles.pointInfo}>
            <Text style={styles.pointName} numberOfLines={2}>{pointName}</Text>
            <View style={styles.pointMeta}>
              <Ionicons name="time-outline" size={12} color={COLORS.gray} />
              <Text style={styles.pointMetaText}>
                {formatDuration(point.estimatedTime || 30)}
              </Text>
              <Ionicons name="location-outline" size={12} color={COLORS.gray} style={{ marginLeft: 8 }} />
              <Text style={styles.pointMetaText}>
                {point.location.city}
              </Text>
            </View>
          </View>
          
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray}
          />
        </View>

        {isExpanded && (
          <View style={styles.pointExpanded}>
            {pointDescription && (
              <Text style={styles.pointDescription}>{pointDescription}</Text>
            )}
            
            {point.notes && (
              <View style={styles.notesContainer}>
                <Ionicons name="chatbubble-outline" size={14} color={COLORS.primary} />
                <Text style={styles.notesText}>{point.notes}</Text>
              </View>
            )}

            <View style={styles.pointActions}>
              <TouchableOpacity
                style={styles.pointActionButton}
                onPress={() => handleOpenMaps(point)}
              >
                <Ionicons name="navigate" size={16} color={COLORS.white} />
                <Text style={styles.pointActionText}>Cómo llegar</Text>
              </TouchableOpacity>

              {point.type === 'place' && (point.placeId as any) && (
                <TouchableOpacity
                  style={[styles.pointActionButton, styles.pointActionSecondary]}
                  onPress={() => navigation.navigate('Detail', { advertisement: (point.placeId as any) })}
                >
                  <Ionicons name="information-circle" size={16} color={COLORS.primary} />
                  <Text style={[styles.pointActionText, { color: COLORS.primary }]}>Ver lugar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMap = () => {
    // TODO: Fix MapView crash
    return null;
    // TEMP: Deshabilitado para debug
    if (!guide) return null;

    const pointsWithCoords = guide.points.filter(p => p.location.coordinates);
    if (pointsWithCoords.length === 0) return null;

    const coordinates = pointsWithCoords.map(p => ({
      latitude: p.location.coordinates![1],
      longitude: p.location.coordinates![0],
    }));

    const initialRegion = {
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          // provider={PROVIDER_GOOGLE} // Deshabilitado - requiere config adicional
          initialRegion={initialRegion}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          {pointsWithCoords.map((point, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: point.location.coordinates![1],
                longitude: point.location.coordinates![0],
              }}
              title={point.type === 'place' ? (point.placeId as any)?.title : point.customName}
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>{point.order}</Text>
              </View>
            </Marker>
          ))}

          {coordinates.length > 1 && (
            <Polyline
              coordinates={coordinates}
              strokeColor={COLORS.primary}
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          )}
        </MapView>

        <TouchableOpacity style={styles.expandMapButton}>
          <Ionicons name="expand" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando guía...</Text>
      </View>
    );
  }

  if (!guide) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Guía no encontrada</Text>
      </View>
    );
  }

  const categoryConfig = getGuideCategoryConfig(guide.category);
  const difficultyConfig = GUIDE_DIFFICULTIES[guide.difficulty];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Imagen de portada */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: guide.coverImageUrl }} style={styles.coverImage} />
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.coverActions}>
            <TouchableOpacity style={styles.coverActionButton} onPress={handleShare}>
              <Ionicons name="share-social" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.coverActionButton} onPress={handleSave}>
              <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color="#FFFFFF" />
            </TouchableOpacity>
            {user && !isOwner && (
              <TouchableOpacity style={styles.coverActionButton} onPress={handleReport}>
                <Ionicons name="flag-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.coverOverlay}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
              <Text style={styles.categoryBadgeText}>
                {categoryConfig.icon} {guide.category}
              </Text>
            </View>
          </View>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          <Text style={styles.title}>{guide.title}</Text>

          {/* Creador */}
          <TouchableOpacity style={styles.creatorRow}>
            <Image
              source={{ uri: guide.createdBy.profileImage || 'https://via.placeholder.com/40' }}
              style={styles.creatorAvatar}
            />
            <View>
              <Text style={styles.creatorName}>{guide.createdBy.name}</Text>
              <Text style={styles.createdAt}>
                {new Date(guide.createdAt).toLocaleDateString('es-AR')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              {renderStars(guide.averageRating)}
              <Text style={styles.statValue}>
                {guide.averageRating > 0 ? guide.averageRating.toFixed(1) : '-'}
              </Text>
              <Text style={styles.statLabel}>({guide.ratingCount})</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{formatDuration(guide.estimatedDuration)}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{guide.points.length} puntos</Text>
            </View>
          </View>

          {/* Dificultad y ubicación */}
          <View style={styles.metaRow}>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyConfig.color + '20' }]}>
              <Text style={[styles.difficultyText, { color: difficultyConfig.color }]}>
                {difficultyConfig.icon} {difficultyConfig.label}
              </Text>
            </View>
            <View style={styles.locationBadge}>
              <Ionicons name="navigate" size={14} color={COLORS.primary} />
              <Text style={styles.locationText}>
                {guide.mainLocation.city}, {guide.mainLocation.province}
              </Text>
            </View>
          </View>

          {/* Descripción */}
          <Text style={styles.sectionTitle}>Sobre esta guía</Text>
          <Text style={styles.description}>{guide.description}</Text>

          {/* Valorar (si no es el dueño) */}
          {!isOwner && user && (
            <View style={styles.rateSection}>
              <Text style={styles.rateTitle}>¿Qué te pareció?</Text>
              {renderStars(userRating, true, 32)}
            </View>
          )}

          {/* Mapa */}
          {renderMap()}

          {/* Puntos de interés */}
          <Text style={styles.sectionTitle}>
            🗺️ Itinerario ({guide.points.length} paradas)
          </Text>
          
          {guide.points.map((point, index) => renderPointCard(point, index))}

          {/* Acciones del propietario */}
          {(isOwner || isAdmin) && (
            <View style={styles.ownerActions}>
              {isOwner && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate('EditGuide', { guideId })}
                >
                  <Ionicons name="pencil" size={18} color={COLORS.white} />
                  <Text style={styles.editButtonText}>Editar guía</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={18} color={COLORS.error} />
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      <ReportModal
        visible={reportModalVisible}
        advertisementTitle={guide?.title || ''}
        onConfirm={handleConfirmReport}
        onCancel={() => setReportModalVisible(false)}
      />
    </View>
  );
};

export default GuideDetailScreen;