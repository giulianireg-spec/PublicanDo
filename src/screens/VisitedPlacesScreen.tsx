// src/screens/VisitedPlacesScreen.tsx
// "Lugares visitados": los sellos del usuario agrupados por categoría y subcategoría,
// con una tarjeta resumen que se puede compartir como imagen.

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES_CONFIG } from '../constants/categories';
import { getMyStamps, syncPendingStamps, Stamp } from '../services/stamps';

const formatDate = (d: string) => new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

interface CategoryGroup {
  category: string;
  emoji: string;
  name: string;
  total: number;
  subgroups: { name: string | null; stamps: Stamp[] }[];
}

const VisitedPlacesScreen = ({ navigation }: any) => {
  const { colors: COLORS } = useTheme();
  const insets = useSafeAreaInsets();
  const shareCardRef = useRef<View>(null);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);

  const load = async () => {
    const { synced, rejected } = await syncPendingStamps();
    if (synced) Toast.show({ type: 'success', text1: `🏅 ${synced} sello${synced > 1 ? 's' : ''} validado${synced > 1 ? 's' : ''}`, position: 'bottom' });
    if (rejected.length) Toast.show({ type: 'error', text1: 'Algunos sellos no se pudieron validar', text2: rejected[0], position: 'bottom' });
    setStamps(await getMyStamps());
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Agrupado en el orden de las categorías de la app, y dentro por subcategoría
  const groups = useMemo<CategoryGroup[]>(() => {
    return CATEGORIES_CONFIG.map((config) => {
      const inCategory = stamps.filter((s) => s.category === config.fullName);
      const subNames = [...config.subcategories.map((s) => s.name), null];
      const subgroups = subNames
        .map((name) => ({
          name,
          stamps: inCategory.filter((s) => (name === null ? !config.subcategories.some((x) => x.name === s.subcategory) : s.subcategory === name)),
        }))
        .filter((g) => g.stamps.length > 0);
      return { category: config.fullName, emoji: config.emoji, name: config.name, total: inCategory.length, subgroups };
    }).filter((g) => g.total > 0);
  }, [stamps]);

  const cities = useMemo(() => new Set(stamps.map((s) => s.city).filter(Boolean)).size, [stamps]);

  const handleShare = async () => {
    try {
      setSharing(true);
      if (!(await Sharing.isAvailableAsync())) {
        Toast.show({ type: 'error', text1: 'Compartir no está disponible en este dispositivo', position: 'bottom' });
        return;
      }
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir mis lugares visitados' });
    } catch (error) {
      console.error('Error compartiendo sellos:', error);
      Toast.show({ type: 'error', text1: 'No se pudo compartir', position: 'bottom' });
    } finally {
      setSharing(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 12 + insets.top },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.onPrimary },
    placeholder: { width: 40 },
    content: { padding: 16, paddingBottom: 32 + insets.bottom },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    // Tarjeta para compartir: colores fijos para que la imagen se vea igual en modo claro y oscuro
    shareCard: { backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 12 },
    shareBrand: { color: '#A3E635', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
    shareTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 6 },
    shareStats: { flexDirection: 'row', marginTop: 14, gap: 24 },
    shareStatNumber: { color: '#A3E635', fontSize: 28, fontWeight: '800' },
    shareStatLabel: { color: '#D4D4D4', fontSize: 12 },
    shareChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
    shareChip: { backgroundColor: '#1F2937', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
    shareChipText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    shareRecent: { color: '#D4D4D4', fontSize: 12, marginTop: 14 },
    shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 12, marginBottom: 20 },
    shareButtonText: { color: COLORS.onPrimary, fontWeight: '700', fontSize: 15 },
    categoryBlock: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 14, elevation: 2, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
    categoryTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
    subTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primaryText, marginTop: 12, marginBottom: 4, textTransform: 'uppercase' },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
    thumb: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.grayLight },
    rowText: { flex: 1 },
    rowTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    rowSub: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
    pendingBadge: { fontSize: 11, color: COLORS.warning || '#D97706', fontWeight: '700' },
    emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
    emptyText: { marginTop: 16, fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
    emptySubtext: { marginTop: 8, fontSize: 14, color: COLORS.gray, textAlign: 'center' },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lugares visitados</Text>
        <View style={styles.placeholder} />
      </View>

      {loading && stamps.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryText} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryText]} tintColor={COLORS.primaryText} />}
        >
          {stamps.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="ribbon-outline" size={72} color={COLORS.grayLight} />
              <Text style={styles.emptyText}>Todavía no tenés sellos</Text>
              <Text style={styles.emptySubtext}>
                Cuando visites un lugar de GuianDo, abrí su ficha y tocá "Recolectar" para sumar su sello a tu colección.
              </Text>
            </View>
          ) : (
            <>
              <View ref={shareCardRef} collapsable={false} style={styles.shareCard}>
                <Text style={styles.shareBrand}>GUIANDO</Text>
                <Text style={styles.shareTitle}>Mis lugares visitados</Text>
                <View style={styles.shareStats}>
                  <View>
                    <Text style={styles.shareStatNumber}>{stamps.length}</Text>
                    <Text style={styles.shareStatLabel}>{stamps.length === 1 ? 'sello' : 'sellos'}</Text>
                  </View>
                  <View>
                    <Text style={styles.shareStatNumber}>{cities}</Text>
                    <Text style={styles.shareStatLabel}>{cities === 1 ? 'localidad' : 'localidades'}</Text>
                  </View>
                </View>
                <View style={styles.shareChips}>
                  {groups.map((g) => (
                    <View key={g.category} style={styles.shareChip}>
                      <Text style={styles.shareChipText}>{g.emoji} {g.name} · {g.total}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.shareRecent} numberOfLines={2}>
                  Últimos: {stamps.slice(0, 3).map((s) => s.title).join(' · ')}
                </Text>
              </View>

              <TouchableOpacity style={styles.shareButton} onPress={handleShare} disabled={sharing}>
                {sharing ? <ActivityIndicator color={COLORS.onPrimary} /> : <Ionicons name="share-social" size={20} color={COLORS.onPrimary} />}
                <Text style={styles.shareButtonText}>Compartir mis sellos</Text>
              </TouchableOpacity>

              {groups.map((g) => (
                <View key={g.category} style={styles.categoryBlock}>
                  <Text style={styles.categoryTitle}>{g.emoji} {g.name} · {g.total}</Text>
                  {g.subgroups.map((sub) => (
                    <View key={sub.name ?? 'general'}>
                      {sub.name !== null && <Text style={styles.subTitle}>{sub.name} · {sub.stamps.length}</Text>}
                      {sub.stamps.map((s) => (
                        <View key={s._id} style={styles.row}>
                          {s.imageUrl ? <Image source={{ uri: s.imageUrl }} style={styles.thumb} /> : <View style={styles.thumb} />}
                          <View style={styles.rowText}>
                            <Text style={styles.rowTitle} numberOfLines={1}>
                              {s.title}{s.edition ? ` ${s.edition}` : ''}
                            </Text>
                            <Text style={styles.rowSub}>
                              {s.city ? `${s.city} · ` : ''}{formatDate(s.visitedAt)}
                            </Text>
                            {s.pending && <Text style={styles.pendingBadge}>Pendiente de validar (sin conexión)</Text>}
                          </View>
                          <Ionicons name="ribbon" size={22} color={s.pending ? COLORS.gray : COLORS.success} />
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default VisitedPlacesScreen;
