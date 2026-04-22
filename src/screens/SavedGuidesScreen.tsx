// src/screens/SavedGuidesScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getSavedGuides, toggleSaveGuide } from '../services/guidesApi';
import { GuideSummary } from '../types/guide.types';
import { GUIDE_DIFFICULTIES, formatDuration, getGuideCategoryConfig } from '../constants/guides';
import Toast from 'react-native-toast-message';

const SavedGuidesScreen = ({ navigation }: any) => {
  const { colors: COLORS } = useTheme();
  const [guides, setGuides] = useState<GuideSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
    placeholder: { width: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 32 },
    card: { backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 3, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    cardImage: { width: '100%', height: 150, backgroundColor: COLORS.grayLight },
    categoryBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    categoryBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
    unsaveButton: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    cardContent: { padding: 14 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 12, color: COLORS.gray },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    locationText: { fontSize: 12, color: COLORS.primary, fontWeight: '500', flex: 1, marginLeft: 4 },
    difficultyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    difficultyText: { fontSize: 11, fontWeight: '600' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600', color: COLORS.gray },
    emptySubtext: { marginTop: 8, fontSize: 14, color: COLORS.gray, textAlign: 'center', paddingHorizontal: 32 },
    exploreButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 24, gap: 8 },
    exploreButtonText: { color: COLORS.white, fontWeight: '600' },
  });

  useFocusEffect(
    useCallback(() => {
      loadSavedGuides();
    }, [])
  );

  const loadSavedGuides = async () => {
    try {
      setLoading(true);
      const data = await getSavedGuides();
      setGuides(data);
    } catch (error) {
      console.error('Error cargando guías guardadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedGuides();
    setRefreshing(false);
  };

  const handleUnsave = async (guide: GuideSummary) => {
    try {
      await toggleSaveGuide(guide._id);
      setGuides(prev => prev.filter(g => g._id !== guide._id));
      Toast.show({ type: 'info', text1: 'Guía removida de guardados', position: 'bottom' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'bottom' });
    }
  };

  const renderCard = ({ item }: { item: GuideSummary }) => {
    const categoryConfig = getGuideCategoryConfig(item.category);
    const difficultyConfig = GUIDE_DIFFICULTIES[item.difficulty];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GuideDetail', { guideId: item._id })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.coverImageUrl }} style={styles.cardImage} />
        <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
          <Text style={styles.categoryBadgeText}>{categoryConfig.icon} {item.category}</Text>
        </View>
        <TouchableOpacity style={styles.unsaveButton} onPress={() => handleUnsave(item)}>
          <Ionicons name="bookmark" size={16} color="#FFD700" />
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.gray} />
              <Text style={styles.statText}>{formatDuration(item.estimatedDuration)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.gray} />
              <Text style={styles.statText}>{item.pointsCount || '?'} puntos</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.statText}>{item.averageRating > 0 ? item.averageRating.toFixed(1) : '-'}</Text>
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

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔖 Guías guardadas</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔖 Guías guardadas</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={guides}
        renderItem={renderCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={guides.length === 0 ? { flex: 1 } : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>No tenés guías guardadas</Text>
            <Text style={styles.emptySubtext}>Guardá guías que te interesen para acceder a ellas rápidamente</Text>
            <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.goBack()}>
              <Ionicons name="compass" size={20} color={COLORS.white} />
              <Text style={styles.exploreButtonText}>Explorar guías</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default SavedGuidesScreen;
