// src/components/LocationPicker.tsx
// Componente para seleccionar ubicación con autocomplete y GPS

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { reverseGeocode } from '../services/geoService';
import axios from 'axios';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

interface LocationResult {
  placeId?: string;
  displayName: string;
  address: string;
  city: string;
  province: string;
  lat: number;
  lon: number;
}

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: {
    address: string;
    city: string;
    province: string;
    coordinates: [number, number]; // [lng, lat] formato MongoDB
  }) => void;
  initialProvince?: string;
  initialCity?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  visible,
  onClose,
  onSelect,
  initialProvince = 'Córdoba',
  initialCity = '',
}) => {
  const { colors: COLORS } = useTheme();
  const insets = useSafeAreaInsets();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16 + insets.top,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 36,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 10,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryText,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grayLight,
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultAddress: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
  },
  resultCity: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
  },
});

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Limpiar al cerrar
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setResults([]);
    }
  }, [visible]);

  // Búsqueda con debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.length < 5) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchAddress(query);
    }, 500);

    setSearchTimeout(timeout);
  }, [searchTimeout]);

  // Token de sesión de Places: agrupa autocompletado + detalle en una sola sesión facturable
  const newSessionToken = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  const sessionTokenRef = useRef<string>(newSessionToken());

  // Buscar direcciones con Google Places (solo autocompletado; el detalle se pide al seleccionar)
  const searchAddress = async (query: string) => {
    setLoading(true);
    try {
      const locationBias = initialCity
        ? `${initialCity}, ${initialProvince}, Argentina`
        : initialProvince
        ? `${initialProvince}, Argentina`
        : 'Argentina';

      // Places API (New)
      const autocompleteResponse = await axios.post(
        'https://places.googleapis.com/v1/places:autocomplete',
        {
          input: `${query}, ${locationBias}`,
          includedRegionCodes: ['ar'],
          languageCode: 'es',
          sessionToken: sessionTokenRef.current,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': PLACES_API_KEY,
          },
        }
      );

      const suggestions = autocompleteResponse.data.suggestions || [];

      const locations: LocationResult[] = suggestions
        .filter((suggestion: any) => suggestion.placePrediction)
        .slice(0, 6)
        .map((suggestion: any) => {
          const prediction = suggestion.placePrediction;
          return {
            placeId: prediction.place,
            displayName: prediction.structuredFormat?.mainText?.text || prediction.text?.text || '',
            address: prediction.structuredFormat?.mainText?.text || prediction.text?.text || '',
            city: prediction.structuredFormat?.secondaryText?.text || '',
            province: '',
            lat: 0,
            lon: 0,
          };
        });
      setResults(locations);
    } catch (error) {
      console.error('Error buscando direcciones:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener coordenadas y componentes de la dirección elegida (cierra la sesión de Places)
  const fetchPlaceDetails = async (result: LocationResult): Promise<LocationResult | null> => {
    try {
      const detailsResponse = await axios.get(
        `https://places.googleapis.com/v1/${result.placeId}`,
        {
          params: { sessionToken: sessionTokenRef.current, languageCode: 'es' },
          headers: {
            'X-Goog-Api-Key': PLACES_API_KEY,
            'X-Goog-FieldMask': 'location,addressComponents,formattedAddress',
          },
        }
      );
      const details = detailsResponse.data;
      const components = details.addressComponents || [];
      const getComponent = (type: string) =>
        components.find((c: any) => c.types?.includes(type))?.longText || '';
      const streetNumber = getComponent('street_number');
      const route = getComponent('route');
      const locality = getComponent('locality') || getComponent('sublocality') || getComponent('administrative_area_level_2');
      const province = getComponent('administrative_area_level_1');
      if (!details.location) return null;
      return {
        displayName: details.formattedAddress || result.displayName,
        address: [route, streetNumber].filter(Boolean).join(' ') || result.address,
        city: locality || initialCity || '',
        province: province || initialProvince || '',
        lat: details.location.latitude,
        lon: details.location.longitude,
      };
    } catch (error) {
      console.error('Error obteniendo detalle de dirección:', error);
      return null;
    } finally {
      sessionTokenRef.current = newSessionToken();
    }
  };

  // Usar ubicación actual
  const useCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      // Pedir permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a tu ubicación para usar esta función'
        );
        return;
      }

      // Obtener ubicación
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocoding
      const geoResult = await reverseGeocode(latitude, longitude);

      // También obtener dirección más detallada
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            format: 'json',
            lat: latitude,
            lon: longitude,
            addressdetails: 1,
            'accept-language': 'es',
          },
          headers: {
            'User-Agent': 'GuianDo/1.0',
          },
        }
      );

      const addr = response.data.address || {};
      const streetAddress = [addr.road, addr.house_number].filter(Boolean).join(' ') || 
                           addr.suburb || addr.neighbourhood || '';

      onSelect({
        address: streetAddress,
        city: geoResult.locality,
        province: geoResult.province,
        coordinates: [longitude, latitude], // MongoDB format [lng, lat]
      });

      onClose();
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación. Intentá de nuevo.');
    } finally {
      setGettingLocation(false);
    }
  };

  // Seleccionar resultado
  const handleSelectResult = async (selected: LocationResult) => {
    let result = selected;
    if (selected.placeId) {
      setLoading(true);
      const details = await fetchPlaceDetails(selected);
      setLoading(false);
      if (!details) {
        Alert.alert('Error', 'No pudimos obtener la ubicación de esa dirección. Probá con otra.');
        return;
      }
      result = details;
    }
    onSelect({
      address: result.address,
      city: result.city,
      province: result.province,
      coordinates: [result.lon, result.lat], // MongoDB format [lng, lat]
    });
    onClose();
  };

  const renderResultItem = ({ item }: { item: LocationResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectResult(item)}
    >
      <Ionicons name="location" size={20} color={COLORS.primaryText} style={styles.resultIcon} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultAddress} numberOfLines={2}>
          {item.displayName}
        </Text>
        {item.city && (
          <Text style={styles.resultCity}>
            {item.city}{item.province ? `, ${item.province}` : ''}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seleccionar ubicación</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Botón usar ubicación actual */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={useCurrentLocation}
          disabled={gettingLocation}
        >
          {gettingLocation ? (
            <ActivityIndicator size="small" color={COLORS.primaryText} />
          ) : (
            <Ionicons name="navigate" size={22} color={COLORS.primaryText} />
          )}
          <Text style={styles.currentLocationText}>
            {gettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
          </Text>
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>o buscar dirección</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Campo de búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ej: Av. Colón 500, Córdoba"
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Resultados */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryText} />
            <Text style={styles.loadingText}>Buscando...</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
            renderItem={renderResultItem}
            ListEmptyComponent={
              searchQuery.length >= 5 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={48} color={COLORS.grayLight} />
                  <Text style={styles.emptyText}>No se encontraron resultados</Text>
                  <Text style={styles.emptyHint}>
                    Probá con otra dirección o usá tu ubicación actual
                  </Text>
                </View>
              ) : searchQuery.length > 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyHint}>Escribí al menos 3 caracteres para buscar</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="map-outline" size={48} color={COLORS.grayLight} />
                  <Text style={styles.emptyText}>Buscá una dirección</Text>
                  <Text style={styles.emptyHint}>
                    Escribí la dirección completa para obtener coordenadas precisas
                  </Text>
                </View>
              )
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Modal>
  );
};

export default LocationPicker;
