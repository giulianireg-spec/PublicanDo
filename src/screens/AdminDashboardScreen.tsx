// src/screens/AdminDashboardScreen.tsx
// ACTUALIZADO: Incluye moderación de Guías

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  getAdminAdvertisements,
  getAdminStats,
  approveAdvertisement,
  rejectAdvertisement,
  toggleFeatureAdmin,
  deletePermanently,
  getAdminGuides,
  approveGuide,
  rejectGuide,
} from '../services/api';
import { Advertisement } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { RejectModal } from '../components/RejectModal';
import TemporalBadge from '../components/TemporalBadge';

type TabType = 'pending' | 'approved' | 'rejected' | 'all';
type ContentType = 'advertisements' | 'guides';

interface Guide {
  _id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  category: string;
  createdBy: {
    _id: string;
    name: string;
    profileImage?: string;
    trusted?: boolean;
  };
  points: any[];
  mainLocation: {
    city: string;
    province: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  requiresModeration: boolean;
  rejectionReason?: string;
  viewCount: number;
  saveCount: number;
  averageRating: number;
  ratingCount: number;
  createdAt: string;
}

const AdminDashboardScreen = ({ navigation }: any) => {
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
  usersButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  // Selector de contenido
  contentSelectorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  contentSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 8,
  },
  contentSelectorActive: {
    backgroundColor: COLORS.primary,
  },
  contentSelectorText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  contentSelectorTextActive: {
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statPending: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  statApproved: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  statRejected: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  reportsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  reportsCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportsCardContent: {
    flex: 1,
  },
  reportsCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  reportsCardSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  tabTextActive: {
    color: COLORS.white,
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
  guideBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  guideBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
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
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  advertiserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  advertiserText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  trustedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
    gap: 2,
  },
  trustedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
  },
  moderationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  moderationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF9800',
  },
  temporalBadgeContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusApproved: {
    backgroundColor: '#E8F5E9',
  },
  statusRejected: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextPending: {
    color: '#F57C00',
  },
  statusTextApproved: {
    color: '#2E7D32',
  },
  statusTextRejected: {
    color: '#C62828',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 2,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  cardActions: {
    flexDirection: 'column',
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
  approveButton: {
    backgroundColor: '#E8F5E9',
  },
  rejectButton: {
    backgroundColor: '#FFEBEE',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 'auto',
  },
  rejectionReason: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
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
    textAlign: 'center',
  },
});

  const { user } = useAuth();
  const [contentType, setContentType] = useState<ContentType>('advertisements');
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('pending');
  const [stats, setStats] = useState<any>(null);
  
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [itemToReject, setItemToReject] = useState<{ id: string; title: string; type: ContentType } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (user?.role !== 'admin' && user?.role !== 'moderator') {
        Toast.show({
          type: 'error',
          text1: 'Acceso denegado',
          text2: 'No tienes permisos para acceder',
          position: 'bottom',
        });
        navigation.goBack();
        return;
      }
      loadData();
    }, [selectedTab, contentType])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (contentType === 'advertisements') {
        const [adsData, statsData] = await Promise.all([
          getAdminAdvertisements(selectedTab),
          getAdminStats(),
        ]);
        setAdvertisements(adsData.data);
        setStats(statsData);
      } else {
        const guidesData = await getAdminGuides(selectedTab);
        setGuides(guidesData.data || guidesData);
      }
    } catch (error) {
      console.error('Error cargando datos admin:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los datos',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ==================== HANDLERS PUBLICACIONES ====================

  const handleApproveAd = async (ad: Advertisement) => {
    try {
      await approveAdvertisement(ad._id);
      
      Toast.show({
        type: 'success',
        text1: '✅ Publicidad aprobada',
        text2: `"${ad.title}" ya está visible`,
        position: 'bottom',
        visibilityTime: 3000,
      });
      
      await loadData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo aprobar',
        position: 'bottom',
      });
    }
  };

  const handleToggleFeature = async (ad: Advertisement) => {
    try {
      await toggleFeatureAdmin(ad._id);
      
      Toast.show({
        type: 'success',
        text1: ad.featured ? '⭐ Destaque removido' : '⭐ Publicidad destacada',
        text2: ad.featured ? 'Ya no aparecerá primero' : 'Aparecerá en los primeros lugares',
        position: 'bottom',
        visibilityTime: 3000,
      });
      
      await loadData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        position: 'bottom',
      });
    }
  };

  const handleDeleteAd = async (ad: Advertisement) => {
    try {
      await deletePermanently(ad._id);
      
      Toast.show({
        type: 'error',
        text1: '🗑️ Publicidad eliminada',
        text2: 'Se eliminó permanentemente de la base de datos',
        position: 'bottom',
        visibilityTime: 3000,
      });
      
      await loadData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        position: 'bottom',
      });
    }
  };

  // ==================== HANDLERS GUÍAS ====================

  const handleApproveGuide = async (guide: Guide) => {
    try {
      await approveGuide(guide._id);
      
      Toast.show({
        type: 'success',
        text1: '✅ Guía aprobada',
        text2: `"${guide.title}" ya está visible`,
        position: 'bottom',
        visibilityTime: 3000,
      });
      
      await loadData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo aprobar',
        position: 'bottom',
      });
    }
  };

  // ==================== REJECT COMÚN ====================

  const handleReject = (id: string, title: string, type: ContentType) => {
    setItemToReject({ id, title, type });
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!itemToReject) return;

    try {
      if (itemToReject.type === 'advertisements') {
        await rejectAdvertisement(itemToReject.id, reason);
      } else {
        await rejectGuide(itemToReject.id, reason);
      }
      
      Toast.show({
        type: 'info',
        text1: `❌ ${itemToReject.type === 'advertisements' ? 'Publicidad' : 'Guía'} rechazada`,
        text2: 'El usuario podrá editarla y volver a enviarla',
        position: 'bottom',
        visibilityTime: 4000,
      });
      
      setRejectModalVisible(false);
      setItemToReject(null);
      await loadData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo rechazar',
        position: 'bottom',
      });
    }
  };

  // ==================== RENDER STATS ====================

  const renderStatsCard = () => {
    if (!stats || contentType !== 'advertisements') return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="newspaper" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{stats.advertisements.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, styles.statPending]}>
          <Ionicons name="time" size={24} color={COLORS.secondary} />
          <Text style={styles.statNumber}>{stats.advertisements.pending}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={[styles.statCard, styles.statApproved]}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.advertisements.approved}</Text>
          <Text style={styles.statLabel}>Aprobadas</Text>
        </View>
        <View style={[styles.statCard, styles.statRejected]}>
          <Ionicons name="close-circle" size={24} color={COLORS.error} />
          <Text style={styles.statNumber}>{stats.advertisements.rejected}</Text>
          <Text style={styles.statLabel}>Rechazadas</Text>
        </View>
      </View>
    );
  };

  // ==================== RENDER ADVERTISEMENT CARD ====================

  const renderAdvertisementCard = ({ item }: { item: Advertisement }) => {
    const advertiser = item.advertiser as any;
    const isTrusted = advertiser?.trusted;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardCategory}>{item.category}</Text>

              <View style={styles.advertiserInfo}>
                <Ionicons name="person" size={14} color={COLORS.gray} />
                <Text style={styles.advertiserText}>
                  {advertiser?.name || 'Desconocido'}
                </Text>
                {isTrusted && (
                  <View style={styles.trustedBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#4CAF50" />
                    <Text style={styles.trustedText}>Trusted</Text>
                  </View>
                )}
              </View>

              {item.endDate && (
                <View style={styles.temporalBadgeContainer}>
                  <TemporalBadge endDate={item.endDate} size="small" />
                </View>
              )}

              <View
                style={[
                  styles.statusBadge,
                  item.status === 'approved' && styles.statusApproved,
                  item.status === 'pending' && styles.statusPending,
                  item.status === 'rejected' && styles.statusRejected,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'approved' && styles.statusTextApproved,
                    item.status === 'pending' && styles.statusTextPending,
                    item.status === 'rejected' && styles.statusTextRejected,
                  ]}
                >
                  {item.status === 'approved' && '✓ Aprobada'}
                  {item.status === 'pending' && '⏳ Pendiente'}
                  {item.status === 'rejected' && '✕ Rechazada'}
                </Text>
              </View>

              {item.featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={12} color={COLORS.secondary} />
                  <Text style={styles.featuredText}>Destacada</Text>
                </View>
              )}
            </View>

            <View style={styles.cardActions}>
              {item.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApproveAd(item)}
                  >
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item._id, item.title, 'advertisements')}
                  >
                    <Ionicons name="close" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </>
              )}

              {item.status === 'approved' && (
                <>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleFeature(item)}
                  >
                    <Ionicons
                      name={item.featured ? 'star' : 'star-outline'}
                      size={20}
                      color={COLORS.secondary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item._id, item.title, 'advertisements')}
                  >
                    <Ionicons name="eye-off" size={20} color={COLORS.error} />
                  </TouchableOpacity>

                  {user?.role === 'admin' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteAd(item)}
                    >
                      <Ionicons name="trash" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </>
              )}

              {item.status === 'rejected' && user?.role === 'admin' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteAd(item)}
                >
                  <Ionicons name="trash" size={20} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={14} color={COLORS.gray} />
              <Text style={styles.statItemText}>{item.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="hand-left" size={14} color={COLORS.gray} />
              <Text style={styles.statItemText}>{item.clicks}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('es-AR')}
            </Text>
          </View>

          {item.status === 'rejected' && item.rejectionReason && (
            <View style={styles.rejectionReason}>
              <Text style={styles.rejectionReasonText}>
                Razón: {item.rejectionReason}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ==================== RENDER GUIDE CARD ====================

  const renderGuideCard = ({ item }: { item: Guide }) => {
    const creator = item.createdBy;
    const isTrusted = creator?.trusted;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.coverImageUrl }} style={styles.cardImage} />

        {/* Badge de guía */}
        <View style={styles.guideBadge}>
          <Ionicons name="map" size={12} color={COLORS.white} />
          <Text style={styles.guideBadgeText}>{item.points?.length || 0} puntos</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardCategory}>{item.category}</Text>

              <View style={styles.locationInfo}>
                <Ionicons name="location" size={14} color={COLORS.gray} />
                <Text style={styles.locationText}>
                  {item.mainLocation?.city}, {item.mainLocation?.province}
                </Text>
              </View>

              <View style={styles.advertiserInfo}>
                <Ionicons name="person" size={14} color={COLORS.gray} />
                <Text style={styles.advertiserText}>
                  {creator?.name || 'Desconocido'}
                </Text>
                {isTrusted && (
                  <View style={styles.trustedBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#4CAF50" />
                    <Text style={styles.trustedText}>Trusted</Text>
                  </View>
                )}
              </View>

              {item.requiresModeration && (
                <View style={styles.moderationBadge}>
                  <Ionicons name="alert-circle" size={12} color="#FF9800" />
                  <Text style={styles.moderationText}>Tiene puntos personalizados</Text>
                </View>
              )}

              <View
                style={[
                  styles.statusBadge,
                  item.status === 'approved' && styles.statusApproved,
                  item.status === 'pending' && styles.statusPending,
                  item.status === 'rejected' && styles.statusRejected,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'approved' && styles.statusTextApproved,
                    item.status === 'pending' && styles.statusTextPending,
                    item.status === 'rejected' && styles.statusTextRejected,
                  ]}
                >
                  {item.status === 'approved' && '✓ Aprobada'}
                  {item.status === 'pending' && '⏳ Pendiente'}
                  {item.status === 'rejected' && '✕ Rechazada'}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              {/* Botón previsualizar */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.primary + '20' }]}
                onPress={() => navigation.navigate('GuideDetail', { guideId: item._id })}
              >
                <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>

              {item.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApproveGuide(item)}
                  >
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item._id, item.title, 'guides')}
                  >
                    <Ionicons name="close" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </>
              )}

              {item.status === 'approved' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(item._id, item.title, 'guides')}
                >
                  <Ionicons name="eye-off" size={20} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={14} color={COLORS.gray} />
              <Text style={styles.statItemText}>{item.viewCount || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="bookmark" size={14} color={COLORS.gray} />
              <Text style={styles.statItemText}>{item.saveCount || 0}</Text>
            </View>
            {item.ratingCount > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Text style={styles.statItemText}>
                  {item.averageRating?.toFixed(1)} ({item.ratingCount})
                </Text>
              </View>
            )}
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('es-AR')}
            </Text>
          </View>

          {item.status === 'rejected' && item.rejectionReason && (
            <View style={styles.rejectionReason}>
              <Text style={styles.rejectionReasonText}>
                Razón: {item.rejectionReason}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ==================== RENDER ====================

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando panel...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {user?.role === 'admin' ? 'Panel Admin' : 'Panel Moderador'}
        </Text>
        {user?.role === 'admin' ? (
          <TouchableOpacity
            style={styles.usersButton}
            onPress={() => navigation.navigate('UsersManagement')}
          >
            <Ionicons name="people" size={24} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Selector de contenido: Publicaciones vs Guías */}
      <View style={styles.contentSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.contentSelector,
            contentType === 'advertisements' && styles.contentSelectorActive,
          ]}
          onPress={() => {
            setContentType('advertisements');
            setSelectedTab('pending');
          }}
        >
          <Ionicons
            name="megaphone"
            size={20}
            color={contentType === 'advertisements' ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[
              styles.contentSelectorText,
              contentType === 'advertisements' && styles.contentSelectorTextActive,
            ]}
          >
            Publicaciones
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.contentSelector,
            contentType === 'guides' && styles.contentSelectorActive,
          ]}
          onPress={() => {
            setContentType('guides');
            setSelectedTab('pending');
          }}
        >
          <Ionicons
            name="map"
            size={20}
            color={contentType === 'guides' ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[
              styles.contentSelectorText,
              contentType === 'guides' && styles.contentSelectorTextActive,
            ]}
          >
            Guías
          </Text>
        </TouchableOpacity>
      </View>

      {renderStatsCard()}

      {/* Card de acceso a reportes (solo para publicaciones) */}
      {contentType === 'advertisements' && (
        <TouchableOpacity
          style={styles.reportsCard}
          onPress={() => navigation.navigate('ReportsManagement')}
          activeOpacity={0.8}
        >
          <View style={styles.reportsCardIcon}>
            <Ionicons name="flag" size={28} color={COLORS.error} />
          </View>
          <View style={styles.reportsCardContent}>
            <Text style={styles.reportsCardTitle}>Gestión de Reportes</Text>
            <Text style={styles.reportsCardSubtitle}>
              Revisar denuncias de usuarios
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      )}

      <View style={styles.tabsContainer}>
        {(['pending', 'approved', 'rejected', 'all'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
              {tab === 'pending' && 'Pendientes'}
              {tab === 'approved' && 'Aprobadas'}
              {tab === 'rejected' && 'Rechazadas'}
              {tab === 'all' && 'Todas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={contentType === 'advertisements' ? advertisements : guides}
        renderItem={contentType === 'advertisements' ? renderAdvertisementCard : renderGuideCard}
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
            <Ionicons name="folder-open-outline" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>
              No hay {contentType === 'advertisements' ? 'publicidades' : 'guías'}{' '}
              {selectedTab !== 'all' && selectedTab === 'pending' && 'pendientes'}
              {selectedTab !== 'all' && selectedTab === 'approved' && 'aprobadas'}
              {selectedTab !== 'all' && selectedTab === 'rejected' && 'rechazadas'}
            </Text>
          </View>
        }
      />

      <RejectModal
        visible={rejectModalVisible}
        advertisementTitle={itemToReject?.title || ''}
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setItemToReject(null);
        }}
      />
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;
