// src/screens/HomeScreen.tsx
// GUIANDO: Con subcategorías, filtro "Abierto ahora"

import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  getAdvertisements, 
  deletePermanently,
  rejectAdvertisement,
  toggleFeatureAdmin,
  searchLocalities,
  reverseGeocode,
} from '../services/api';
import { Advertisement } from '../types';
import { useTheme } from '../context/ThemeContext';
import { FullScreenFlyerModal } from '../components/FullScreenFlyerModal';
import { ARGENTINA_PROVINCES } from '../constants/argentinaLocations';
import { ADS_CONFIG } from '../config/adsConfig';
import { CATEGORIES, getCategoryConfig, getSubcategories, hasSubcategories } from '../constants/categories';
import { isOpenNow, getOpenStatus } from '../utils/scheduleUtils';

// Importar NativeAdCard de forma segura
let NativeAdCard: React.ComponentType<any> | null = null;
try {
  NativeAdCard = require('../components/NativeAdCard').default;
} catch (error) {
  console.warn('⚠️ NativeAdCard no disponible');
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// Helper para ordenar categorías según intereses del usuario
const getOrderedCategories = (userInterests: string[] = []): string[] => {
  const allCategories = ['Todas', ...CATEGORIES];
  
  if (userInterests.length === 0) {
    return allCategories;
  }
  
  const interestCategories = CATEGORIES.filter(cat => userInterests.includes(cat));
  const otherCategories = CATEGORIES.filter(cat => !userInterests.includes(cat));
  
  return ['Todas', ...interestCategories, ...otherCategories];
};

const ITEMS_PER_PAGE = 20;
const LOCATION_STORAGE_KEY = '@guiando_last_location';

// ==================== TIPOS ====================
interface FeedItem {
  type: 'advertisement' | 'ad';
  data?: any;
  id: string;
}

type FilterMode = 'location' | 'radius';

const HomeScreen = ({ navigation }: any) => {
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 8,
  },
  filterModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 4,
  },
  filterModeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterModeButtonDisabled: {
    borderColor: COLORS.gray,
    opacity: 0.6,
  },
  filterModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  filterModeTextActive: {
    color: COLORS.white,
  },
  filterModeTextDisabled: {
    color: COLORS.gray,
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    gap: 4,
  },
  filterChipText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },
  // Filtro "Abierto ahora"
  openNowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  openNowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openNowText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  openNowTextActive: {
    color: COLORS.success,
    fontWeight: '600',
  },
  // Subcategorías
  subcategoriesFilterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  subcategoryFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  subcategoryFilterChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  subcategoryFilterText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  subcategoryFilterTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  categoriesWrapper: {
    height: 44,
    marginBottom: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    height: 36,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  categoryButtonInterest: {
    backgroundColor: COLORS.secondary + '20',
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  categoryTextInterest: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  distanceFilterContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    zIndex: 1000,
  },
  distanceFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 8,
  },
  distanceFilterText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  distanceDropdown: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
    overflow: 'hidden',
  },
  distanceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  distanceOptionActive: {
    backgroundColor: COLORS.primary,
  },
  distanceOptionText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  distanceOptionTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  resultsText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
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
    maxWidth: CARD_WIDTH,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.grayLight,
  },
  licenseBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  openBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  openBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 12,
  },
  cardCategory: {
    fontSize: 11,
    color: COLORS.gray,
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },
  licenseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  licenseIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  adCardContainer: {
    flex: 1,
    margin: 8,
    maxWidth: CARD_WIDTH,
  },
  adPlaceholder: {
    flex: 1,
    margin: 8,
    maxWidth: CARD_WIDTH,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
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
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  clearFiltersText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    flex: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 8,
    flexShrink: 1,
  },
  modeInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  modeInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  provincesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  provinceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  provinceChipActive: {
    backgroundColor: COLORS.primary,
  },
  provinceChipText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  provinceChipTextActive: {
    color: COLORS.white,
  },
  localityInputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  inputLoader: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  localitySuggestionsModal: {
    maxHeight: 150,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    marginBottom: 12,
  },
  localitySuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
    gap: 8,
  },
  localitySuggestionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  selectedLocalityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  selectedLocalityText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 52,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    backgroundColor: COLORS.white,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});


  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  // Filtro "Abierto ahora"
  const [openNowFilter, setOpenNowFilter] = useState(false);
  
  // Modo de filtro (mutuamente excluyentes)
  const [filterMode, setFilterMode] = useState<FilterMode>('location');
  
  // Filtro de distancia (solo activo en modo 'radius')
  const [distanceFilter, setDistanceFilter] = useState<5 | 10 | 25 | 50>(25);
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  
  // Filtros geográficos (solo activos en modo 'location')
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<string | null>(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string; type: 'ad' | 'guide' } | null>(null);
  const [autoDetectedLocation, setAutoDetectedLocation] = useState<{
    province: string;
    locality: string;
  } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  
  const [tempProvince, setTempProvince] = useState<string | null>(null);
  const [tempLocality, setTempLocality] = useState<string | null>(null);
  
  const [localityQuery, setLocalityQuery] = useState('');
  const [localitySuggestions, setLocalitySuggestions] = useState<string[]>([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const loadingRef = useRef(false);
  const initialLoadDone = useRef(false);
  const prevCategoryRef = useRef<string>(selectedCategory);

  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Subcategorías disponibles para la categoría seleccionada
  const availableSubcategories = selectedCategory !== 'Todas' ? getSubcategories(selectedCategory) : [];
  const categoryHasSubcategories = selectedCategory !== 'Todas' && hasSubcategories(selectedCategory);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initializeLocation();
    }
  }, []);
  // Limpiar subcategoría cuando cambia la categoría Y cargar datos
  useEffect(() => {
    if (prevCategoryRef.current !== selectedCategory) {
      // Categoría cambió - limpiar subcategoría
      prevCategoryRef.current = selectedCategory;
      if (selectedSubcategory !== null) {
        setSelectedSubcategory(null);
        // El cambio de subcategory disparará otra carga
        return;
      }
      // Si subcategoría ya era null, cargar directamente
    }
    if (initialLoadDone.current) {
      loadAdvertisements(true);
    }
  }, [selectedCategory, selectedSubcategory, searchQuery, selectedProvince, selectedLocality, filterMode, distanceFilter]);
  useEffect(() => {
    filterAndSortAdvertisements();
  }, [advertisements, distanceFilter, userLocation, filterMode, openNowFilter]);

  useEffect(() => {
    generateFeedWithAds();
  }, [filteredAds, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localityQuery.trim().length >= 2 && tempProvince) {
        handleSearchLocalities(localityQuery);
      } else {
        setLocalitySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localityQuery, tempProvince]);
  // ==================== FEED CON ADS ====================

  const generateFeedWithAds = () => {
    const items: FeedItem[] = [];
    const shouldShowAds = true; // TEMP: NativeAdCard !== null;

    filteredAds.forEach((ad, index) => {
      items.push({
        type: 'advertisement',
        data: ad,
        id: ad._id,
      });

      if (shouldShowAds && (index + 1) % ADS_CONFIG.ADS_EVERY_N_ITEMS === 0) {
        items.push({
          type: 'ad',
          id: `ad-${index}`,
        });
        items.push({
          type: 'ad',
          id: `ad-placeholder-${index}`,
        });
      }
    });

    setFeedItems(items);
  };

  // ==================== LOCATION HANDLERS ====================

  const initializeLocation = async () => {
    try {
      setDetectingLocation(true);

      const savedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        setSelectedProvince(parsed.province);
        setSelectedLocality(parsed.locality);
        setAutoDetectedLocation(parsed);
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        if (!savedLocation) {
          const defaultLocation = { province: 'Córdoba', locality: 'Córdoba' };
          setSelectedProvince(defaultLocation.province);
          setSelectedLocality(defaultLocation.locality);
          setAutoDetectedLocation(defaultLocation);
        }
        
        setDetectingLocation(false);
      initialLoadDone.current = true;
      const finalSavedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      const locationToUse = finalSavedLocation ? JSON.parse(finalSavedLocation) : { province: 'Córdoba', locality: 'Córdoba' };
      setTimeout(() => loadAdvertisements(true, locationToUse.province, locationToUse.locality), 100);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation({ latitude, longitude });

      if (!savedLocation) {
        try {
          const result = await reverseGeocode(latitude, longitude);

          const detectedLocation = {
            province: result.province,
            locality: result.locality,
          };

          await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(detectedLocation));

          setSelectedProvince(result.province);
          setSelectedLocality(result.locality);
          setAutoDetectedLocation(detectedLocation);
        } catch (geoError) {
          console.error('Error en reverse geocoding:', geoError);
        }
      }

    } catch (error) {
      console.error('Error detectando ubicación:', error);
      
      const savedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (!savedLocation) {
        const defaultLocation = { province: 'Córdoba', locality: 'Córdoba' };
        setSelectedProvince(defaultLocation.province);
        setSelectedLocality(defaultLocation.locality);
        setAutoDetectedLocation(defaultLocation);
      }
    } finally {
      setDetectingLocation(false);
      initialLoadDone.current = true;
      const finalSavedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      const locationToUse = finalSavedLocation ? JSON.parse(finalSavedLocation) : { province: 'Córdoba', locality: 'Córdoba' };
      setTimeout(() => loadAdvertisements(true, locationToUse.province, locationToUse.locality), 100);
    }
  };

  const updateSavedLocation = async (province: string, locality: string) => {
    try {
      const locationData = { province, locality };
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
    } catch (error) {
      console.error('Error guardando ubicación:', error);
    }
  };

  const handleSearchLocalities = async (query: string) => {
    if (!tempProvince) return;
    
    try {
      setLoadingLocalities(true);
      const results = await searchLocalities(query, tempProvince);
      setLocalitySuggestions(results);
    } catch (error) {
      console.error('Error buscando localidades:', error);
      setLocalitySuggestions([]);
    } finally {
      setLoadingLocalities(false);
    }
  };

  // ==================== FILTER MODE HANDLERS ====================

  const switchToLocationMode = () => {
    if (filterMode !== 'location') {
      setFilterMode('location');
      if (autoDetectedLocation) {
        setSelectedProvince(autoDetectedLocation.province);
        setSelectedLocality(autoDetectedLocation.locality);
      }
      Toast.show({
        type: 'info',
        text1: '📍 Modo: Por localidad',
        text2: 'Mostrando lugares de la localidad seleccionada',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  };

  const switchToRadiusMode = () => {
    if (!userLocation) {
      Toast.show({
        type: 'error',
        text1: '📍 GPS no disponible',
        text2: 'Necesitamos tu ubicación para buscar cerca de ti',
        position: 'bottom',
      });
      return;
    }
    
    if (filterMode !== 'radius') {
      setFilterMode('radius');
      setSelectedProvince(null);
      setSelectedLocality(null);
      Toast.show({
        type: 'info',
        text1: '📡 Modo: Cerca de mí',
        text2: `Mostrando lugares en un radio de ${distanceFilter} km`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  };

  // ==================== ADVERTISEMENT HANDLERS ====================

  const loadAdvertisements = async (reset: boolean = false, overrideProvince?: string | null, overrideLocality?: string | null) => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;

      if (reset) {
        setLoading(true);
        setCurrentPage(0);
        setAdvertisements([]);
      } else {
        setLoadingMore(true);
      }

      const skip = reset ? 0 : currentPage * ITEMS_PER_PAGE;

      const provinceParam = filterMode === 'location' ? (overrideProvince !== undefined ? overrideProvince : selectedProvince) : undefined;
      const localityParam = filterMode === 'location' ? (overrideLocality !== undefined ? overrideLocality : selectedLocality) : undefined;

      const response = await getAdvertisements(
        selectedCategory !== 'Todas' ? selectedCategory : undefined,
        userLocation?.latitude,
        userLocation?.longitude,
        ITEMS_PER_PAGE,
        skip,
        searchQuery || undefined,
        provinceParam || undefined,
        localityParam || undefined,
        selectedSubcategory || undefined
      );

      if (reset) {
        setAdvertisements(response.data);
      } else {
        setAdvertisements((prev) => [...prev, ...response.data]);
      }

      setHasMore(response.pagination.hasMore);
      setTotalItems(response.pagination.total);
      setCurrentPage(reset ? 1 : currentPage + 1);
    } catch (error) {
      console.error('Error cargando lugares:', error);
      Alert.alert('Error', 'No se pudieron cargar los lugares');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdvertisements(true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loadingRef.current) {
      loadAdvertisements(false);
    }
  };

  const calculateDistance = (ad: Advertisement) => {
    if (!userLocation || !ad.location?.coordinates) {
      return null;
    }

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
    const adsWithDistance = advertisements.map((ad) => ({
      ...ad,
      distance: calculateDistance(ad),
    }));

    let filtered = adsWithDistance;

    // Filtro por radio
    if (filterMode === 'radius') {
      filtered = adsWithDistance.filter((ad) => {
        if (ad.distance === null) return false; // Excluir lugares sin coordenadas
        return ad.distance <= distanceFilter;
      });
    }

    // Filtro "Abierto ahora"
    if (openNowFilter) {
      filtered = filtered.filter((ad) => {
        if (!ad.schedule) return false;
        return isOpenNow(ad.schedule);
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.distance !== null && b.distance === null) return -1;
      if (a.distance === null && b.distance !== null) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredAds(filtered);
  };

  const handleAdPress = async (ad: Advertisement) => {
    if (ad.richDescription) {
      navigation.navigate('Detail', {
        advertisement: {
          ...ad,
          contact: ad.contactInfo || {},
          location: ad.location || { city: '', province: '', coordinates: [0, 0] },
        },
      });
    } else {
      setSelectedAd(ad);
      setModalVisible(true);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'El comentario es obligatorio', position: 'bottom' });
      return;
    }
    try {
      await rejectAdvertisement(rejectTarget.id, rejectReason.trim());
      Toast.show({ type: 'info', text1: '📋 Enviado a revisión', text2: 'El usuario verá tu comentario', position: 'bottom' });
      setShowRejectModal(false);
      setRejectTarget(null);
      loadAdvertisements(true);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'bottom' });
    }
  };

  const handleAdminActions = (ad: Advertisement) => {
    Alert.alert(
      '⚙️ Moderación',
      `"${ad.title}"`,
      [
        {
          text: '📋 Enviar a revisión',
          onPress: () => handleRejectAd(ad),
        },
        {
          text: '🗑️ Eliminar permanentemente',
          onPress: () => handleDeleteAd(ad),
          style: 'destructive',
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleRejectAd = (ad: Advertisement) => {
    setRejectTarget({ id: ad._id, title: ad.title, type: 'ad' });
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleDeleteAd = async (ad: Advertisement) => {
    Alert.alert(
      '⚠️ Eliminar permanentemente',
      'Esta acción NO se puede deshacer. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePermanently(ad._id);
              Toast.show({ type: 'error', text1: '🗑️ Lugar eliminado', position: 'bottom' });
              loadAdvertisements(true);
            } catch (error: any) {
              Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'bottom' });
            }
          },
        },
      ]
    );
  };

  const handleToggleFeature = async (ad: Advertisement) => {
    try {
      await toggleFeatureAdmin(ad._id);
      Toast.show({
        type: 'success',
        text1: ad.featured ? '⭐ Destaque removido' : '⭐ Destacado',
        position: 'bottom',
      });
      loadAdvertisements(true);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'bottom' });
    }
  };

  const handleClearFilters = async () => {
    setFilterMode('location');
    setSelectedSubcategory(null);
    setOpenNowFilter(false);
    if (autoDetectedLocation) {
      setSelectedProvince(autoDetectedLocation.province);
      setSelectedLocality(autoDetectedLocation.locality);
      Toast.show({
        type: 'info',
        text1: '🔄 Filtros restaurados',
        text2: `Mostrando: ${autoDetectedLocation.locality}, ${autoDetectedLocation.province}`,
        position: 'bottom',
      });
    } else {
      setSelectedProvince(null);
      setSelectedLocality(null);
    }
  };

  const handleApplyFilters = async () => {
    setFilterMode('location');
    setSelectedProvince(tempProvince);
    setSelectedLocality(tempLocality);
    setShowFiltersModal(false);
    
    if (tempProvince && tempLocality) {
      await updateSavedLocation(tempProvince, tempLocality);
      Toast.show({
        type: 'success',
        text1: '📍 Filtros aplicados',
        text2: `${tempLocality}, ${tempProvince}`,
        position: 'bottom',
      });
    }
  };
  
  const handleOpenFiltersModal = () => {
    setTempProvince(selectedProvince);
    setTempLocality(selectedLocality);
    setLocalityQuery(selectedLocality || '');
    setShowFiltersModal(true);
  };

  const formatDistance = (distance: number | null | undefined) => {
    if (distance === null || distance === undefined) return '';
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderAdvertisementCard = (item: any) => {
    const categoryConfig = getCategoryConfig(item.category);
    const openStatus = item.schedule ? getOpenStatus(item.schedule) : null;
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleAdPress(item)}
        onLongPress={
          user?.role === 'admin' || user?.role === 'moderator'
            ? () => handleAdminActions(item)
            : undefined
        }
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        
        {item.hasProfessionalLicense && (
          <View style={styles.licenseBadge}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.white} />
          </View>
        )}

        {/* Badge de estado abierto/cerrado */}
        {openStatus && (
          <View style={[styles.openBadge, { backgroundColor: openStatus.color }]}>
            <Text style={styles.openBadgeText}>
              {openStatus.isOpen ? 'Abierto' : 'Cerrado'}
            </Text>
          </View>
        )}
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          
          {/* Categoría con icono */}
          <View style={styles.categoryRow}>
            <Text style={styles.categoryIcon}>{categoryConfig?.emoji || '📍'}</Text>
            <Text style={styles.cardCategory} numberOfLines={1}>
              {item.subcategory || item.category?.replace(/^[^\s]+\s/, '')}
            </Text>
          </View>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={12} color={COLORS.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location?.city}, {item.location?.province}
            </Text>
          </View>
          
          {item.hasProfessionalLicense && (
            <View style={styles.licenseIndicator}>
              <Ionicons name="document-text" size={12} color="#4CAF50" />
              <Text style={styles.licenseIndicatorText}>Matriculado</Text>
            </View>
          )}
          
          {item.distance !== null && item.distance !== undefined && (
            <View style={styles.distanceContainer}>
              <Ionicons name="navigate" size={14} color={COLORS.primary} />
              <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderNativeAdCard = (itemId: string) => {
    if (itemId.includes('placeholder')) {
      return <View style={styles.adPlaceholder} />;
    }

    if (!NativeAdCard) {
      return <View style={styles.card} />;
    }

    try {
      return (
        <View style={styles.adCardContainer}>
          <NativeAdCard 
            onAdLoaded={() => console.log('✅ Native Ad loaded in feed')}
            onAdFailed={() => console.log('❌ Native Ad failed in feed')}
          />
        </View>
      );
    } catch (error) {
      console.warn('⚠️ Error rendering NativeAdCard:', error);
      return <View style={styles.card} />;
    }
  };

  const renderFeedItem = ({ item, index }: { item: FeedItem; index: number }) => {
    try {
      if (item.type === 'ad') {
        return renderNativeAdCard(item.id);
      }
      return renderAdvertisementCard(item.data);
    } catch (error) {
      console.warn('⚠️ Error rendering feed item:', error);
      return <View style={styles.card} />;
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Cargando más...</Text>
      </View>
    );
  };

  const renderFilterModeSelector = () => (
    <View style={styles.filterModeContainer}>
      <TouchableOpacity
        style={[
          styles.filterModeButton,
          filterMode === 'location' && styles.filterModeButtonActive,
        ]}
        onPress={switchToLocationMode}
      >
        <Ionicons 
          name="location" 
          size={18} 
          color={filterMode === 'location' ? COLORS.white : COLORS.primary} 
        />
        <Text style={[
          styles.filterModeText,
          filterMode === 'location' && styles.filterModeTextActive,
        ]}>
          Por localidad
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterModeButton,
          filterMode === 'radius' && styles.filterModeButtonActive,
          !userLocation && styles.filterModeButtonDisabled,
        ]}
        onPress={switchToRadiusMode}
        disabled={!userLocation}
      >
        <Ionicons 
          name="radio-button-on" 
          size={18} 
          color={filterMode === 'radius' ? COLORS.white : (!userLocation ? COLORS.gray : COLORS.primary)} 
        />
        <Text style={[
          styles.filterModeText,
          filterMode === 'radius' && styles.filterModeTextActive,
          !userLocation && styles.filterModeTextDisabled,
        ]}>
          Cerca de mí
        </Text>
      </TouchableOpacity>
      {filterMode === 'location' && (
        <TouchableOpacity
          style={[styles.filterButton, (selectedProvince || selectedLocality) && styles.filterButtonActive]}
          onPress={handleOpenFiltersModal}
        >
          <Ionicons
            name="filter"
            size={20}
            color={(selectedProvince || selectedLocality) ? COLORS.white : COLORS.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderActiveFilters = () => {
    if (filterMode === 'radius') return null;
    if (!selectedProvince && !selectedLocality) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedProvince && (
            <View style={styles.filterChip}>
              <Ionicons name="map" size={14} color={COLORS.white} />
              <Text style={styles.filterChipText}>{selectedProvince}</Text>
              <TouchableOpacity onPress={() => setSelectedProvince(null)}>
                <Ionicons name="close-circle" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
          {selectedLocality && (
            <View style={styles.filterChip}>
              <Ionicons name="location" size={14} color={COLORS.white} />
              <Text style={styles.filterChipText}>{selectedLocality}</Text>
              <TouchableOpacity onPress={() => setSelectedLocality(null)}>
                <Ionicons name="close-circle" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderSubcategoriesFilter = () => {
    if (!categoryHasSubcategories || availableSubcategories.length === 0) return null;

    return (
      <View style={styles.subcategoriesFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.subcategoryFilterChip,
              !selectedSubcategory && styles.subcategoryFilterChipActive,
            ]}
            onPress={() => setSelectedSubcategory(null)}
          >
            <Text style={[
              styles.subcategoryFilterText,
              !selectedSubcategory && styles.subcategoryFilterTextActive,
            ]}>
              Todas
            </Text>
          </TouchableOpacity>
          {availableSubcategories.map((sub) => (
            <TouchableOpacity
              key={sub}
              style={[
                styles.subcategoryFilterChip,
                selectedSubcategory === sub && styles.subcategoryFilterChipActive,
              ]}
              onPress={() => setSelectedSubcategory(selectedSubcategory === sub ? null : sub)}
            >
              <Text style={[
                styles.subcategoryFilterText,
                selectedSubcategory === sub && styles.subcategoryFilterTextActive,
              ]}>
                {sub}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderOpenNowFilter = () => (
    <View style={styles.openNowContainer}>
      <View style={styles.openNowContent}>
        <Ionicons 
          name={openNowFilter ? "time" : "time-outline"} 
          size={18} 
          color={openNowFilter ? COLORS.success : COLORS.gray} 
        />
        <Text style={[styles.openNowText, openNowFilter && styles.openNowTextActive]}>
          Abierto ahora
        </Text>
      </View>
      <Switch
        value={openNowFilter}
        onValueChange={setOpenNowFilter}
        trackColor={{ false: COLORS.grayLight, true: COLORS.success + '50' }}
        thumbColor={openNowFilter ? COLORS.success : COLORS.gray}
      />
    </View>
  );

  // ==================== LOADING STATE ====================

  if (detectingLocation || (loading && !refreshing)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          {detectingLocation ? 'Detectando ubicación...' : 'Cargando lugares...'}
        </Text>
      </View>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>


      {renderFilterModeSelector()}
      {renderActiveFilters()}

      {/* Filtro "Abierto ahora" */}
      {renderOpenNowFilter()}

      {/* Categorías con iconos */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={getOrderedCategories(user?.interests)}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item }) => {
            const isInterest = user?.interests?.includes(item);
            const isSelected = selectedCategory === item;
            const config = getCategoryConfig(item);
            
            return (
              <TouchableOpacity
                style={[
                  styles.categoryButton, 
                  isSelected && styles.categoryButtonActive,
                  isInterest && !isSelected && styles.categoryButtonInterest,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                {item !== 'Todas' && config?.emoji && (
                  <Text style={styles.categoryEmoji}>{config.emoji}</Text>
                )}
                <Text
                  style={[
                    styles.categoryText, 
                    isSelected && styles.categoryTextActive,
                    isInterest && !isSelected && styles.categoryTextInterest,
                  ]}
                  numberOfLines={1}
                >
                  {item === 'Todas' ? '🌟 Todas' : item.replace(/^[^\s]+\s/, '')}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Subcategorías (si aplica) */}
      {renderSubcategoriesFilter()}

      {filterMode === 'radius' && (
        <View style={styles.distanceFilterContainer}>
          <TouchableOpacity
            style={styles.distanceFilterButton}
            onPress={() => setShowDistanceDropdown(!showDistanceDropdown)}
          >
            <Ionicons name="radio-button-on" size={18} color={COLORS.primary} />
            <Text style={styles.distanceFilterText}>Radio: {distanceFilter} km</Text>
            <Ionicons name={showDistanceDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.primary} />
          </TouchableOpacity>

          {showDistanceDropdown && (
            <View style={styles.distanceDropdown}>
              {[5, 10, 25, 50].map((km) => (
                <TouchableOpacity
                  key={km}
                  style={[styles.distanceOption, distanceFilter === km && styles.distanceOptionActive]}
                  onPress={() => {
                    setDistanceFilter(km as 5 | 10 | 25 | 50);
                    setShowDistanceDropdown(false);
                  }}
                >
                  <Text style={[styles.distanceOptionText, distanceFilter === km && styles.distanceOptionTextActive]}>
                    {km} km o menos
                  </Text>
                  {distanceFilter === km && <Ionicons name="checkmark" size={18} color={COLORS.white} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filterMode === 'radius' 
            ? `${filteredAds.length} lugares en un radio de ${distanceFilter} km`
            : `Mostrando ${filteredAds.length} de ${totalItems} lugares`
          }
          {openNowFilter ? ' (abiertos ahora)' : ''}
        </Text>
      </View>

      <FlatList
        data={feedItems}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="compass" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>
              {loading ? 'Cargando...' : 
                openNowFilter ? 'No hay lugares abiertos en este momento' :
                filterMode === 'radius' 
                  ? `No hay lugares en un radio de ${distanceFilter} km`
                  : 'No se encontraron lugares'
              }
            </Text>
            {openNowFilter && (
              <TouchableOpacity 
                style={styles.clearFiltersButton} 
                onPress={() => setOpenNowFilter(false)}
              >
                <Text style={styles.clearFiltersText}>Mostrar todos</Text>
              </TouchableOpacity>
            )}
            {filterMode === 'radius' && !openNowFilter && (
              <TouchableOpacity 
                style={styles.clearFiltersButton} 
                onPress={() => setDistanceFilter(50)}
              >
                <Text style={styles.clearFiltersText}>Ampliar a 50 km</Text>
              </TouchableOpacity>
            )}
            {filterMode === 'location' && (selectedProvince || selectedLocality) && !openNowFilter && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={handleClearFilters}>
                <Text style={styles.clearFiltersText}>{autoDetectedLocation ? 'Restaurar filtros' : 'Limpiar filtros'}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <FullScreenFlyerModal
        visible={modalVisible}
        advertisement={selectedAd}
        onClose={() => { setModalVisible(false); setSelectedAd(null); }}
      />

      {/* Modal de Filtros */}
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📍 Filtrar por localidad</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modeInfoBox}>
                <Ionicons name="information-circle" size={20} color="#2196F3" />
                <Text style={styles.modeInfoText}>
                  En este modo verás todos los lugares de la localidad seleccionada, sin límite de distancia.
                </Text>
              </View>

              <Text style={styles.modalLabel}>Provincia</Text>
              <View style={styles.provincesGrid}>
                <TouchableOpacity
                  style={[styles.provinceChip, !tempProvince && styles.provinceChipActive]}
                  onPress={() => { setTempProvince(null); setTempLocality(null); setLocalityQuery(''); }}
                >
                  <Text style={[styles.provinceChipText, !tempProvince && styles.provinceChipTextActive]}>Todas</Text>
                </TouchableOpacity>
                {ARGENTINA_PROVINCES.map((prov) => (
                  <TouchableOpacity
                    key={prov.id}
                    style={[styles.provinceChip, tempProvince === prov.name && styles.provinceChipActive]}
                    onPress={() => { setTempProvince(prov.name); setTempLocality(null); setLocalityQuery(''); }}
                  >
                    <Text style={[styles.provinceChipText, tempProvince === prov.name && styles.provinceChipTextActive]}>
                      {prov.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {tempProvince && (
                <>
                  <Text style={styles.modalLabel}>Localidad (opcional)</Text>
                  <View style={styles.localityInputContainer}>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Buscar localidad..."
                      placeholderTextColor={COLORS.gray}
                      value={localityQuery}
                      onChangeText={setLocalityQuery}
                    />
                    {loadingLocalities && <ActivityIndicator size="small" color={COLORS.primary} style={styles.inputLoader} />}
                  </View>

                  {localitySuggestions.length > 0 && (
                    <View style={styles.localitySuggestionsModal}>
                      <ScrollView 
                        style={{ maxHeight: 150 }}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                      >
                        {localitySuggestions.map((item, index) => (
                          <TouchableOpacity
                            key={`${item}-${index}`}
                            style={styles.localitySuggestionItem}
                            onPress={() => { 
                              setTempLocality(item); 
                              setLocalityQuery(item); 
                              setLocalitySuggestions([]); 
                            }}
                          >
                            <Ionicons name="location" size={16} color={COLORS.primary} />
                            <Text style={styles.localitySuggestionText}>{item}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {tempLocality && (
                    <View style={styles.selectedLocalityChip}>
                      <Ionicons name="location" size={16} color={COLORS.primary} />
                      <Text style={styles.selectedLocalityText}>{tempLocality}</Text>
                      <TouchableOpacity onPress={() => { setTempLocality(null); setLocalityQuery(''); }}>
                        <Ionicons name="close-circle" size={20} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                <Text style={styles.clearButtonText}>{autoDetectedLocation ? 'Restaurar' : 'Limpiar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                <Text style={styles.applyButtonText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
      </Modal>

      {/* Modal revisión publicaciones */}
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

export default HomeScreen;