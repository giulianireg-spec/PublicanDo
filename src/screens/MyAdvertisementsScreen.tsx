// src/screens/MyAdvertisementsScreen.tsx
// REEMPLAZAR TODO EL CONTENIDO CON ESTE CÓDIGO

import React, { useState, useEffect, useCallback } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getMyAdvertisements, deleteAdvertisement } from '../services/api';
import { Advertisement } from '../types';
import { COLORS } from '../constants/colors';

const MyAdvertisementsScreen = ({ navigation }: any) => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      Alert.alert('Error', 'No se pudieron cargar tus publicidades');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyAdvertisements();
    setRefreshing(false);
  };

  const handleDelete = (ad: Advertisement) => {
    Alert.alert(
      'Desactivar publicidad',
      `¿Estás seguro que deseas desactivar "${ad.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdvertisement(ad._id);
              Alert.alert('Éxito', 'Publicidad desactivada correctamente');
              await loadMyAdvertisements();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo desactivar');
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = (ad: Advertisement) => {
    Alert.alert(
      'Eliminar permanentemente',
      `¿Estás seguro que deseas eliminar permanentemente "${ad.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdvertisement(ad._id);
              Alert.alert('Éxito', 'Publicidad eliminada permanentemente');
              await loadMyAdvertisements();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (ad: Advertisement) => {
    Alert.alert(
      'Próximamente',
      'La función de editar estará disponible pronto'
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
            
            <View style={[
              styles.statusBadge,
              item.isActive ? styles.statusActive : styles.statusInactive
            ]}>
              <Text style={styles.statusText}>
                {item.isActive ? 'Activa' : 'Inactiva'}
              </Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            {item.isActive && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(item)}
                >
                  <Ionicons name="create" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </>
            )}
            {!item.isActive && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handlePermanentDelete(item)}
              >
                <Ionicons name="trash-bin" size={20} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="eye" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>{item.views} vistas</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="hand-left" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>{item.clicks} clicks</Text>
          </View>
        </View>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Publicidades</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateAdvertisement')}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

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
  statsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
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

export default MyAdvertisementsScreen;