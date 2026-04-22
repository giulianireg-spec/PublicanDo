// src/screens/MyAdvertisementsScreen.tsx
// CORREGIDO: 
// - SafeAreaView de react-native-safe-area-context (no deprecated)
// - Con botón de estadísticas para usuarios Premium/Business

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
// ✅ CORREGIDO: Usar SafeAreaView de react-native-safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { 
  getMyAdvertisements, 
  deleteAdvertisement,
  reactivateAdvertisement,
  deletePermanently,
} from '../services/api';
import { Advertisement } from '../types';
import { useTheme } from '../context/ThemeContext';
import TemporalBadge from '../components/TemporalBadge';

const MyAdvertisementsScreen = ({ navigation }: any) => {
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  addButton: {
    padding: 4,
  },
  // ✅ NUEVO: Banner premium
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  premiumBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.grayLight,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  temporalBadgeContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusInactive: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#2E7D32',
  },
  statusTextInactive: {
    color: '#C62828',
  },
  statusPendingMod: {
    backgroundColor: '#FFF3E0',
  },
  statusTextPendingMod: {
    color: '#F57C00',
  },
  statusRejected: {
    backgroundColor: '#FFEBEE',
  },
  statusTextRejected: {
    color: '#C62828',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ✅ NUEVO: Estilo para botón de stats
  statsButton: {
    backgroundColor: COLORS.secondary,
  },
  editButton: {},
  statsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  // ✅ NUEVO: Link a estadísticas
  viewStatsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 4,
  },
  viewStatsText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  rejectionReason: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  rejectionReasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 4,
  },
  rejectionReasonText: {
    fontSize: 12,
    color: '#C62828',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

  const { user } = useAuth();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Verificar si el usuario puede ver estadísticas
  const canViewStats = user?.isPremium || 
                       user?.subscriptionTier === 'premium' || 
                       user?.subscriptionTier === 'business' ||
                       user?.role === 'seeder_free' ||
                       user?.role === 'seeder_business';

  useFocusEffect(
    useCallback(() => {
      loadMyAdvertisements();
    }, [])
  );

  const loadMyAdvertisements = async () => {
    try {
      setLoading(true);
      const data = await getMyAdvertisements();
      setAdvertisements(data);
    } catch (error) {
      console.error('Error cargando publicidades:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar tus publicidades',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyAdvertisements();
    setRefreshing(false);
  };

  const handleEdit = (ad: Advertisement) => {
    navigation.navigate('EditAdvertisement', { advertisement: ad });
  };

  // ✅ NUEVO: Navegar a estadísticas
  const handleViewStats = (ad: Advertisement) => {
    navigation.navigate('AdvertisementStats', {
      advertisementId: ad._id,
      advertisementTitle: ad.title,
    });
  };

  const handleDeactivate = (ad: Advertisement) => {
    Alert.alert(
      'Desactivar publicidad',
      `¿Estás seguro que deseas desactivar "${ad.title}"? Podrás reactivarla después.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdvertisement(ad._id);
              Toast.show({
                type: 'success',
                text1: '✓ Publicidad desactivada',
                text2: 'Puedes reactivarla cuando quieras',
              });
              await loadMyAdvertisements();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'No se pudo desactivar',
              });
            }
          },
        },
      ]
    );
  };

  const handleReactivate = (ad: Advertisement) => {
    Alert.alert(
      'Reactivar publicidad',
      `¿Deseas reactivar "${ad.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reactivar',
          style: 'default',
          onPress: async () => {
            try {
              await reactivateAdvertisement(ad._id);
              Toast.show({
                type: 'success',
                text1: '✓ Publicidad reactivada',
                text2: 'Tu publicidad vuelve a estar visible',
              });
              await loadMyAdvertisements();
            } catch (error: any) {
              console.error('Error reactivando:', error);
              
              if (error.response?.data?.code === 'CATEGORY_LIMIT_REACHED') {
                Toast.show({
                  type: 'info',
                  text1: '⚠️ Categoría ocupada',
                  text2: error.response.data.message,
                  visibilityTime: 5000,
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: error.message || 'No se pudo reactivar',
                });
              }
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = (ad: Advertisement) => {
    Alert.alert(
      'Eliminar permanentemente',
      `¿Estás seguro que deseas eliminar permanentemente "${ad.title}"? Esta acción NO se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePermanently(ad._id);
              Toast.show({
                type: 'error',
                text1: '🗑️ Publicidad eliminada',
                text2: 'Se eliminó permanentemente',
              });
              await loadMyAdvertisements();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'No se pudo eliminar',
              });
            }
          },
        },
      ]
    );
  };

  const renderAdvertisementCard = ({ item }: { item: Advertisement }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardCategory}>{item.category}</Text>
            
            {/* Badge temporal */}
            {item.endDate && (
              <View style={styles.temporalBadgeContainer}>
                <TemporalBadge endDate={item.endDate} size="small" />
              </View>
            )}

            <View style={[
              styles.statusBadge,
              item.isActive ? styles.statusActive : styles.statusInactive
            ]}>
              <Text style={[
                styles.statusText,
                item.isActive ? styles.statusTextActive : styles.statusTextInactive
              ]}>
                {item.isActive ? '✓ Activa' : '✕ Inactiva'}
              </Text>
            </View>

            {item.status === 'pending' && (
              <View style={[styles.statusBadge, styles.statusPendingMod]}>
                <Text style={[styles.statusText, styles.statusTextPendingMod]}>
                  ⏳ Pendiente de aprobación
                </Text>
              </View>
            )}

            {item.status === 'rejected' && (
              <View style={[styles.statusBadge, styles.statusRejected]}>
                <Text style={[styles.statusText, styles.statusTextRejected]}>
                  ✕ Rechazada
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardActions}>
            {/* ✅ NUEVO: Botón de estadísticas (solo premium/business) */}
            {canViewStats && item.isActive && item.status === 'approved' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.statsButton]}
                onPress={() => handleViewStats(item)}
              >
                <Ionicons name="stats-chart" size={20} color={COLORS.white} />
              </TouchableOpacity>
            )}

            {item.isActive && item.status === 'approved' && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(item)}
                >
                  <Ionicons name="create" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeactivate(item)}
                >
                  <Ionicons name="eye-off" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </>
            )}

            {item.status === 'rejected' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="create" size={20} color={COLORS.secondary} />
              </TouchableOpacity>
            )}

            {!item.isActive && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleReactivate(item)}
                >
                  <Ionicons name="refresh" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handlePermanentDelete(item)}
                >
                  <Ionicons name="trash-bin" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* ✅ ACTUALIZADO: Stats container con botón "Ver más" para premium */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="eye" size={16} color={COLORS.gray} />
              <Text style={styles.statText}>{item.views} vistas</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="hand-left" size={16} color={COLORS.gray} />
              <Text style={styles.statText}>{item.clicks} clicks</Text>
            </View>
          </View>
          
          {/* ✅ NUEVO: Link a estadísticas detalladas */}
          {canViewStats && item.isActive && item.status === 'approved' && (
            <TouchableOpacity 
              style={styles.viewStatsLink}
              onPress={() => handleViewStats(item)}
            >
              <Text style={styles.viewStatsText}>Ver estadísticas detalladas</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {item.status === 'rejected' && (item as any).rejectionReason && (
          <View style={styles.rejectionReason}>
            <Text style={styles.rejectionReasonLabel}>Razón del rechazo:</Text>
            <Text style={styles.rejectionReasonText}>{(item as any).rejectionReason}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando publicidades...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Lugares Publicados</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateAdvertisement')}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* ✅ NUEVO: Banner informativo para usuarios premium */}
      {canViewStats && advertisements.length > 0 && (
        <View style={styles.premiumBanner}>
          <Ionicons name="analytics" size={20} color={COLORS.secondary} />
          <Text style={styles.premiumBannerText}>
            Tocá el ícono 📊 o "Ver estadísticas" para analizar el rendimiento
          </Text>
        </View>
      )}

      <FlatList
        data={advertisements}
        renderItem={renderAdvertisementCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>
              Aún no tienes publicidades
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateAdvertisement')}
            >
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.createButtonText}>Crear mi primera publicidad</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default MyAdvertisementsScreen;