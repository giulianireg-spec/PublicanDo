// src/screens/GuidesListScreen.tsx
// Pantalla principal de guías de GuianDo

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import { getGuides, getFeaturedGuides, deleteGuide, moderateGuide } from '../services/guidesApi';
import { GuideSummary, GuideFilters } from '../types/guide.types';
import { useTheme } from '../context/ThemeContext';
import {
  GUIDE_CATEGORIES,
  getGuideCategoryConfig,
  formatDuration,
  GUIDE_DIFFICULTIES,
} from '../constants/guides';


const TagSearchInput = React.memo(({ selectedTag, onTagSelect, COLORS }: {
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  COLORS: any;
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = () => {
    const t = tagInput.trim().toLowerCase();
    onTagSelect(t || null);
  };

  const handleClear = () => {
    setTagInput('');
    onTagSelect(null);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}>
      <Ionicons name="pricetag-outline" size={16} color={COLORS.gray} />
      <TextInput
        style={{ flex: 1, backgroundColor: COLORS.inputBackground, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, fontSize: 13, color: COLORS.text }}
        placeholder="Buscar por tag..."
        placeholderTextColor={COLORS.gray}
        value={tagInput}
        onChangeText={setTagInput}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />
      {selectedTag && (
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="close-circle" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
});

const GuidesListScreen = ({ navigation }: any) => {
  const { colors: COLORS } = useTheme();
  const { user } = useAuth();
  const [guides, setGuides] = useState<GuideSummary[]>([]);
  const [featuredGuides, setFeaturedGuides] = useState<GuideSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating'>('recent');
  const [hasMore, setHasMore] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null);
  const [skip, setSkip] = useState(0);
  const LIMIT = 10;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: COLORS.gray },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
    headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text },
    createButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingBottom: 20 },
    featuredSection: { marginBottom: 16 },
    sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    featuredList: { paddingHorizontal: 12 },
    featuredCard: { width: 200, height: 150, marginHorizontal: 4, borderRadius: 12, overflow: 'hidden' },
    featuredImage: { width: '100%', height: '100%' },
    featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.6)' },
    featuredTitle: { color: COLORS.white, fontWeight: '600', fontSize: 14, marginBottom: 4 },
    featuredStats: { flexDirection: 'row', alignItems: 'center' },
    featuredRating: { color: COLORS.white, fontSize: 12, marginLeft: 4 },
    filtersSection: { backgroundColor: COLORS.white, paddingVertical: 12 },
    categoriesContainer: { paddingHorizontal: 12, paddingVertical: 8 },
    categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 4, borderRadius: 16, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.grayLight },
    categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    categoryChipIcon: { marginRight: 4 },
    categoryChipText: { fontSize: 13, color: COLORS.text },
    categoryChipTextActive: { color: COLORS.white, fontWeight: '600' },
    sortContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8, gap: 8 },
    sortOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: COLORS.background },
    sortOptionActive: { backgroundColor: COLORS.secondary + '20' },
    sortOptionText: { fontSize: 12, color: COLORS.gray },
    sortOptionTextActive: { color: COLORS.secondary, fontWeight: '600' },
    guideCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 12, borderRadius: 16, overflow: 'hidden', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardImage: { width: '100%', height: 160, backgroundColor: COLORS.grayLight },
    categoryBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    categoryBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
    featuredBadge: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    cardContent: { padding: 14 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
    creatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    creatorAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
    creatorName: { fontSize: 13, color: COLORS.gray, flex: 1 },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 16 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 12, color: COLORS.gray },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    locationText: { fontSize: 12, color: COLORS.primary, fontWeight: '500', flex: 1, marginLeft: 4 },
    difficultyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    difficultyText: { fontSize: 11, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 16, fontSize: 16, color: COLORS.gray },
    createFirstButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 24, gap: 8 },
    createFirstText: { color: COLORS.white, fontWeight: '600' },
    footerLoader: { paddingVertical: 20 },
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadGuides(true);
  }, [selectedCategory, sortBy, selectedTag]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [featured, regularGuides] = await Promise.all([
        getFeaturedGuides(user?.preferredLocation?.province),
        getGuides({ sort: 'recent' }, LIMIT, 0),
      ]);
      setFeaturedGuides(featured);
      setGuides(regularGuides.data);
      setHasMore(regularGuides.pagination.hasMore);
      setSkip(LIMIT);
    } catch (error) {
      console.error('Error cargando guías:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGuides = async (reset = false) => {
    if (!reset && loadingMore) return;
    try {
      if (reset) { setLoading(true); setSkip(0); }
      else { setLoadingMore(true); }

      const filters: GuideFilters = { sort: sortBy };
      if (selectedCategory) filters.category = selectedCategory as any;
      if (selectedTag) filters.tags = [selectedTag];

      const newSkip = reset ? 0 : skip;
      const response = await getGuides(filters, LIMIT, newSkip);

      if (reset) setGuides(response.data);
      else setGuides(prev => [...prev, ...response.data]);

      setHasMore(response.pagination.hasMore);
      setSkip(newSkip + LIMIT);
    } catch (error) {
      console.error('Error cargando guías:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) loadGuides(false);
  };
  const confirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'El comentario es obligatorio', position: 'bottom' });
      return;
    }
    try {
      await moderateGuide(rejectTarget.id, 'reject', rejectReason.trim());
      Toast.show({ type: 'info', text1: '📋 Enviada a revisión', text2: 'El creador verá tu comentario', position: 'bottom' });
      setShowRejectModal(false);
      setRejectTarget(null);
      loadGuides(true);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message, position: 'bottom' });
    }
  };

  const handleAdminActions = (item: GuideSummary) => {
    Alert.alert(
      '⚙️ Moderación',
      `"${item.title}"`,
      [
        {
          text: '📋 Enviar a revisión',
          onPress: () => {
            setRejectTarget({ id: item._id, title: item.title });
            setRejectReason('');
            setShowRejectModal(true);
          },
        },
        {
          text: '🗑️ Eliminar permanentemente',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmar eliminación',
              `¿Eliminar "${item.title}" permanentemente?`,
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteGuide(item._id);
                      Toast.show({ type: 'success', text1: '🗑️ Guía eliminada', position: 'bottom' });
                      loadGuides(true);
                    } catch (e: any) {
                      Toast.show({ type: 'error', text1: 'Error', text2: e.message, position: 'bottom' });
                    }
                  },
                },
              ]
            );
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<Ionicons key={i} name="star" size={12} color="#FFD700" />);
      else if (i === fullStars && hasHalfStar) stars.push(<Ionicons key={i} name="star-half" size={12} color="#FFD700" />);
      else stars.push(<Ionicons key={i} name="star-outline" size={12} color="#FFD700" />);
    }
    return stars;
  };

  const renderGuideCard = ({ item }: { item: GuideSummary }) => {
    const categoryConfig = getGuideCategoryConfig(item.category);
    const difficultyConfig = GUIDE_DIFFICULTIES[item.difficulty];

    return (
      <TouchableOpacity
        style={styles.guideCard}
        onPress={() => navigation.navigate('GuideDetail', { guideId: item._id })}
        onLongPress={
          user?.role === 'admin' || user?.role === 'moderator'
            ? () => handleAdminActions(item)
            : undefined
        }
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.coverImageUrl }} style={styles.cardImage} />
        <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
          <Text style={styles.categoryBadgeText}>{categoryConfig.icon} {item.category}</Text>
        </View>
        {item.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.creatorRow}>
            <Image source={{ uri: item.createdBy.profileImage || 'https://via.placeholder.com/30' }} style={styles.creatorAvatar} />
            <Text style={styles.creatorName} numberOfLines={1}>{item.createdBy.name}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              {renderStars(item.averageRating)}
              <Text style={styles.statText}>{item.averageRating > 0 ? item.averageRating.toFixed(1) : 'Sin rating'}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.gray} />
              <Text style={styles.statText}>{formatDuration(item.estimatedDuration)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.gray} />
              <Text style={styles.statText}>{item.pointsCount || '?'} puntos</Text>
            </View>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="navigate" size={12} color={COLORS.primary} />
            <Text style={styles.locationText}>{item.mainLocation.city}, {item.mainLocation.province}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyConfig.color + '20' }]}>
              <Text style={[styles.difficultyText, { color: difficultyConfig.color }]}>
                {difficultyConfig.icon} {difficultyConfig.label}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeaturedSection = () => {
    if (featuredGuides.length === 0) return null;
    return (
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⭐ Guías destacadas</Text>
        </View>
        <FlatList
          horizontal
          data={featuredGuides}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.featuredCard} onPress={() => navigation.navigate('GuideDetail', { guideId: item._id })}>
              <Image source={{ uri: item.coverImageUrl }} style={styles.featuredImage} />
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.featuredStats}>
                  {renderStars(item.averageRating)}
                  <Text style={styles.featuredRating}>{item.ratingCount > 0 ? `(${item.ratingCount})` : ''}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => `featured-${item._id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        />
      </View>
    );
  };

  const renderCategoryFilter = () => (
    <FlatList
      horizontal
      data={['Todas', ...GUIDE_CATEGORIES]}
      renderItem={({ item }) => {
        const isSelected = item === 'Todas' ? !selectedCategory : selectedCategory === item;
        const config = item !== 'Todas' ? getGuideCategoryConfig(item) : null;
        return (
          <TouchableOpacity
            style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(item === 'Todas' ? null : item)}
          >
            {config && <Text style={styles.categoryChipIcon}>{config.icon}</Text>}
            <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
              {item === 'Todas' ? '🌟 Todas' : item}
            </Text>
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    />
  );

  const renderSortOptions = () => (
    <View>
      <View style={styles.sortContainer}>
        {(['recent', 'popular', 'rating'] as const).map((option) => {
          const labels = { recent: '🕐 Recientes', popular: '🔥 Populares', rating: '⭐ Mejor valoradas' };
          const isSelected = sortBy === option;
          return (
            <TouchableOpacity key={option} style={[styles.sortOption, isSelected && styles.sortOptionActive]} onPress={() => setSortBy(option)}>
              <Text style={[styles.sortOptionText, isSelected && styles.sortOptionTextActive]}>{labels[option]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TagSearchInput selectedTag={selectedTag} onTagSelect={setSelectedTag} COLORS={COLORS} />
      {selectedTag && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '20', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 }}>
            <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600' }}>#{selectedTag}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View>
      {renderFeaturedSection()}
      <View style={styles.filtersSection}>
        <Text style={styles.sectionTitle}>Explorar guías</Text>
        {renderCategoryFilter()}
        {renderSortOptions()}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <View style={styles.footerLoader}><ActivityIndicator size="small" color={COLORS.primary} /></View>;
  };

  if (loading && guides.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando guías...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Guías</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateGuide')}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={guides}
        renderItem={renderGuideCard}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>No hay guías disponibles</Text>
            <TouchableOpacity style={styles.createFirstButton} onPress={() => navigation.navigate('CreateGuide')}>
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.createFirstText}>Crear la primera guía</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
      />
      {/* Modal revisión */}
      <Modal visible={showRejectModal} transparent animationType="fade" onRequestClose={() => setShowRejectModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 16, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 }}>📋 Enviar a revisión</Text>
            <Text style={{ fontSize: 14, color: COLORS.gray, marginBottom: 16 }}>{rejectTarget?.title}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 }}>Comentario para el creador *</Text>
            <TextInput
              style={{ backgroundColor: COLORS.inputBackground, borderRadius: 8, padding: 12, fontSize: 15, color: COLORS.text, minHeight: 80, textAlignVertical: 'top' }}
              placeholder="Explicá qué debe corregir..."
              placeholderTextColor={COLORS.gray}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              maxLength={200}
              autoFocus
            />
            <Text style={{ fontSize: 12, color: COLORS.gray, textAlign: 'right', marginTop: 4, marginBottom: 16 }}>{rejectReason.length}/200</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={{ flex: 1, padding: 14, borderRadius: 8, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center' }} onPress={() => setShowRejectModal(false)}>
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, padding: 14, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center' }} onPress={confirmReject}>
                <Text style={{ color: COLORS.white, fontWeight: '700' }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GuidesListScreen;
