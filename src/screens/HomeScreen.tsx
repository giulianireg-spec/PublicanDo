// src/screens/HomeScreen.tsx
// REEMPLAZAR TODO EL CONTENIDO DEL ARCHIVO CON ESTE CÓDIGO

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getAdvertisements, incrementViews } from '../services/api';
import { Advertisement } from '../types';
import { COLORS } from '../constants/colors';
import { FullScreenFlyerModal } from '../components/FullScreenFlyerModal';

const categories = [
  'Todas',
  'Electrónica',
  'Electrodomésticos',
  'Comidas',
  'Restaurantes y Bares',
  'Entretenimiento',
  'Eventos',
  'Servicios',
  'Turismo',
  'Inmuebles',
  'Vehículos',
  'Educación',
  'Salud',
];

const HomeScreen = ({ navigation }: any) => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [filteredAds, setFilteredAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState<'nearby' | 'featured'>('nearby');
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Estado para el modal de flyer
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    loadAdvertisements();
  }, []);

  useEffect(() => {
    filterAndSortAdvertisements();
  }, [advertisements, searchQuery, selectedCategory, sortBy, userLocation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  };

  const loadAdvertisements = async () => {
    try {
      setLoading(true);
      const data = await getAdvertisements();
      setAdvertisements(data);
    } catch (error) {
      console.error('Error cargando publicidades:', error);
      Alert.alert('Error', 'No se pudieron cargar las publicidades');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdvertisements();
    setRefreshing(false);
  };

  const calculateDistance = (ad: Advertisement) => {
    if (!userLocation) return null;

    const [adLng, adLat] = ad.location.coordinates;
    const R = 6371;
    const dLat = ((adLat - userLocation.latitude) * Math.PI) / 180;
    const dLon = ((adLng - userLocation.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.latitude * Math.PI) / 180) *
        Math.cos((adLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterAndSortAdvertisements = () => {
    let filtered = advertisements.filter((ad) => {
      const matchesSearch =
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Todas' || ad.category === selectedCategory;
      return matchesSearch && matchesCategory && ad.isActive;
    });

    const adsWithDistance = filtered.map((ad) => ({
      ...ad,
      distance: calculateDistance(ad),
    }));

    if (sortBy === 'nearby' && userLocation) {
      adsWithDistance.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    } else if (sortBy === 'featured') {
      adsWithDistance.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.views - a.views;
      });
    }

    setFilteredAds(adsWithDistance);
  };

  const handleAdPress = async (ad: Advertisement) => {
    try {
      // Incrementar vistas
      await incrementViews(ad._id);

      if (ad.isPremium) {
        // PREMIUM: Navegar a DetailScreen (como antes)
        // Asegurarse de pasar el objeto completo
        navigation.navigate('Detail', { 
          advertisement: {
            ...ad,
            // Asegurar que todos los campos necesarios existan
            contact: ad.contact || {},
            location: ad.location || { coordinates: [0, 0], address: '' }
          }
        });
      } else {
        // STANDARD: Abrir modal de flyer en pantalla completa
        setSelectedAd(ad);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error al abrir publicidad:', error);
      Alert.alert('Error', 'No se pudo abrir la publicidad');
    }
  };

  const formatDistance = (distance: number | null | undefined) => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

 const renderAdvertisementCard = ({ item }: { item: Advertisement }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => handleAdPress(item)}
    activeOpacity={0.8}
  >
    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    {item.featured && (
      <View style={styles.featuredBadge}>
        <Ionicons name="flash" size={14} color={COLORS.white} />
      </View>
    )}
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.cardCategory}>{item.category}</Text>
      {item.distance && (
        <View style={styles.distanceContainer}>
          <Ionicons name="location" size={14} color={COLORS.primary} />
          <Text style={styles.distanceText}>
            {formatDistance(item.distance)}
          </Text>
        </View>
      )}
      {item.price && (
        <Text style={styles.priceText}>
          ${item.price.toLocaleString('es-AR')}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar publicidades..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filtros de categoría */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Botones de ordenamiento */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'nearby' && styles.sortButtonActive]}
          onPress={() => setSortBy('nearby')}
        >
          <Ionicons
            name="location"
            size={16}
            color={sortBy === 'nearby' ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[
              styles.sortText,
              sortBy === 'nearby' && styles.sortTextActive,
            ]}
          >
            Más cercanos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'featured' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('featured')}
        >
          <Ionicons
            name="star"
            size={16}
            color={sortBy === 'featured' ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[
              styles.sortText,
              sortBy === 'featured' && styles.sortTextActive,
            ]}
          >
            Destacados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de publicidades */}
      <FlatList
        data={filteredAds}
        renderItem={renderAdvertisementCard}
        keyExtractor={(item) => item._id}
        numColumns={2}
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
            <Ionicons name="search" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>
              {loading ? 'Cargando...' : 'No se encontraron publicidades'}
            </Text>
          </View>
        }
      />

      {/* Modal para publicidades Standard */}
      <FullScreenFlyerModal
        visible={modalVisible}
        advertisement={selectedAd}
        onClose={() => {
          setModalVisible(false);
          setSelectedAd(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sortText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  sortTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContainer: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.grayLight,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  distanceText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 4,
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
  },
});

export default HomeScreen;