// src/screens/CreateGuideScreen.tsx
// Pantalla para crear guías en GuianDo

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import LocationPicker from '../components/LocationPicker';
import { useAuth } from '../context/AuthContext';
import { createGuide, searchPlacesForGuide } from '../services/guidesApi';
import { CreateGuideData, CreateGuidePointData } from '../types/guide.types';
import { useTheme } from '../context/ThemeContext';
import {
  GUIDE_CATEGORIES,
  GuideCategory,
  getGuideCategoryConfig,
  GUIDE_DIFFICULTIES,
  GuideDifficulty,
  GUIDE_LIMITS,
  formatDuration,
} from '../constants/guides';
import { PROVINCES } from '../constants/categories';

interface PointForm {
  type: 'place' | 'custom';
  placeId?: string;
  placeData?: any;
  customName: string;
  customDescription: string;
  customImageUri?: string;
  customImageBase64?: string;
  location: {
    address: string;
    city: string;
    province: string;
    coordinates?: [number, number];
  };
  notes: string;
  estimatedTime: number;
}

const emptyPoint: PointForm = {
  type: 'custom',
  customName: '',
  customDescription: '',
  location: {
    address: '',
    city: '',
    province: 'Córdoba',
  },
  notes: '',
  estimatedTime: 30,
};

const CreateGuideScreen = ({ navigation }: any) => {
  const { colors: COLORS } = useTheme();
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
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  // Cover image
  coverPicker: {
    height: 200,
    backgroundColor: COLORS.grayLight,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    marginTop: 8,
    color: COLORS.gray,
  },
  coverEditBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Sections
  section: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  totalDuration: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Inputs
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: COLORS.gray,
    marginTop: -8,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  // Category selector
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categorySelectorText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  // Difficulty
  difficultyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    gap: 6,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  // Points
  pointCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  pointTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  pointActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pointTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  pointTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  pointTypeActive: {
    backgroundColor: COLORS.primary,
  },
  pointTypeText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
  },
  pointTypeTextActive: {
    color: COLORS.white,
  },
  // Place preview
  placePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 8,
  },
  placePreviewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placePreviewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  placePreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  placePreviewLocation: {
    fontSize: 12,
    color: COLORS.gray,
  },
  // Custom point form
  customPointForm: {
    marginBottom: 12,
  },
  imagePickerSmall: {
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imagePickerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.gray,
  },
  pointImagePreview: {
    width: '100%',
    height: '100%',
  },
  locationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  locationField: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    padding: 12,
  },
  // Point extras
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressInputFlex: {
    flex: 1,
    marginBottom: 0,
  },
  mapPickerButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coordinatesConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  coordinatesConfirmText: {
    fontSize: 12,
    color: '#06D6A0',
  },
  pointExtras: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  notesInput: {
    backgroundColor: COLORS.white,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 60,
    textAlign: 'center',
  },
  // Add point
  addPointButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  addPointText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryNameSelected: {
    color: COLORS.primary,
  },
  categoryDescription: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  // Search modal
  searchModal: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 50,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptySearchText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  emptySearchHint: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.grayLight,
    textAlign: 'center',
  },
  placeResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  placeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeCategory: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  placeLocation: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
});

  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  
  // Estado del formulario
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GuideCategory>('Cultural');
  const [difficulty, setDifficulty] = useState<GuideDifficulty>('easy');
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [coverImageBase64, setCoverImageBase64] = useState<string | null>(null);
  const [points, setPoints] = useState<PointForm[]>([{ ...emptyPoint }, { ...emptyPoint }]);
  
  // Estado UI
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPointIndex, setEditingPointIndex] = useState<number | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationPickerPointIndex, setLocationPickerPointIndex] = useState<number | null>(null);

  // Seleccionar imagen de portada
  const pickCoverImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImageUri(result.assets[0].uri);
      setCoverImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // Seleccionar imagen para punto personalizado
  const pickPointImage = async (index: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      updatePoint(index, {
        customImageUri: result.assets[0].uri,
        customImageBase64: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  // Actualizar un punto
  const updatePoint = (index: number, updates: Partial<PointForm>) => {
    setPoints(prev => {
      const newPoints = [...prev];
      newPoints[index] = { ...newPoints[index], ...updates };
      return newPoints;
    });
  };

  // Agregar punto
  const addPoint = () => {
    if (points.length >= GUIDE_LIMITS.MAX_POINTS) {
      Toast.show({
        type: 'info',
        text1: 'Límite alcanzado',
        text2: `Máximo ${GUIDE_LIMITS.MAX_POINTS} puntos por guía`,
        position: 'bottom',
      });
      return;
    }
    setPoints(prev => [...prev, { ...emptyPoint }]);
  };

  // Eliminar punto
  const removePoint = (index: number) => {
    if (points.length <= GUIDE_LIMITS.MIN_POINTS) {
      Toast.show({
        type: 'info',
        text1: 'Mínimo requerido',
        text2: `Una guía debe tener al menos ${GUIDE_LIMITS.MIN_POINTS} puntos`,
        position: 'bottom',
      });
      return;
    }
    setPoints(prev => prev.filter((_, i) => i !== index));
  };

  // Mover punto arriba/abajo
  const movePoint = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= points.length) return;
    
    setPoints(prev => {
      const newPoints = [...prev];
      [newPoints[index], newPoints[newIndex]] = [newPoints[newIndex], newPoints[index]];
      return newPoints;
    });
  };

  // Buscar lugares de la app
  const searchPlaces = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchingPlaces(true);
    try {
      const results = await searchPlacesForGuide(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error buscando lugares:', error);
    } finally {
      setSearchingPlaces(false);
    }
  };

  // Seleccionar lugar de la app
  const selectPlace = (place: any) => {
    if (editingPointIndex === null) return;

    updatePoint(editingPointIndex, {
      type: 'place',
      placeId: place._id,
      placeData: place,
      customName: '',
      customDescription: '',
      customImageUri: undefined,
      customImageBase64: undefined,
      location: {
        address: place.location?.address || '',
        city: place.location?.city || '',
        province: place.location?.province || '',
        coordinates: place.location?.coordinates,
      },
    });

    setShowPlaceSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setEditingPointIndex(null);
  };

  // Calcular duración total
  const totalDuration = points.reduce((sum, p) => sum + (p.estimatedTime || 30), 0);

  // Validar formulario
  const validateForm = (): string | null => {
    if (!title.trim()) return 'Ingresa un título para la guía';
    if (title.length > GUIDE_LIMITS.TITLE_MAX_LENGTH) return 'El título es muy largo';
    if (!description.trim()) return 'Ingresa una descripción';
    if (description.length > GUIDE_LIMITS.DESCRIPTION_MAX_LENGTH) return 'La descripción es muy larga';
    if (!coverImageBase64) return 'Selecciona una imagen de portada';
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (point.type === 'place' && !point.placeId) {
        return `El punto ${i + 1} no tiene un lugar seleccionado`;
      }
      if (point.type === 'custom') {
        if (!point.customName.trim()) {
          return `El punto ${i + 1} necesita un nombre`;
        }
        if (!point.location.city || !point.location.province) {
          return `El punto ${i + 1} necesita ciudad y provincia`;
        }
      }
    }

    return null;
  };

  // Enviar formulario
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        position: 'bottom',
      });
      return;
    }

    setSubmitting(true);

    try {
      const guideData: CreateGuideData = {
        title: title.trim(),
        description: description.trim(),
        coverImageBase64: coverImageBase64!,
        category,
        difficulty,
        tags,
        points: points.map((p): CreateGuidePointData => ({
          type: p.type,
          placeId: p.type === 'place' ? p.placeId : undefined,
          customName: p.type === 'custom' ? p.customName.trim() : undefined,
          customDescription: p.type === 'custom' ? p.customDescription.trim() : undefined,
          customImageBase64: p.type === 'custom' ? p.customImageBase64 : undefined,
          location: {
            address: p.location.address,
            city: p.location.city,
            province: p.location.province,
            coordinates: p.location.coordinates,
          },
          notes: p.notes.trim() || undefined,
          estimatedTime: p.estimatedTime,
        })),
      };

      const result = await createGuide(guideData);

      Toast.show({
        type: 'success',
        text1: '🗺️ ¡Guía creada!',
        text2: result.message,
        position: 'bottom',
      });

      navigation.replace('GuideDetail', { guideId: result.guide._id });
    } catch (error: any) {
      console.error('Error creando guía:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'No se pudo crear la guía',
        position: 'bottom',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Renderizar selector de categoría
  const renderCategoryPicker = () => (
    <Modal visible={showCategoryPicker} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecciona una categoría</Text>
            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={GUIDE_CATEGORIES}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingBottom: 52 }}
            renderItem={({ item }) => {
              const config = getGuideCategoryConfig(item);
              const isSelected = item === category;
              return (
                <TouchableOpacity
                  style={[styles.categoryOption, isSelected && styles.categoryOptionSelected]}
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.categoryIcon}>{config.icon}</Text>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
                      {item}
                    </Text>
                    <Text style={styles.categoryDescription}>{config.description}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );

  // Renderizar búsqueda de lugares
  const renderPlaceSearch = () => (
    <Modal visible={showPlaceSearch} animationType="slide">
      <View style={styles.searchModal}>
        <View style={styles.searchHeader}>
          <TouchableOpacity onPress={() => {
            setShowPlaceSearch(false);
            setSearchQuery('');
            setSearchResults([]);
          }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lugar publicado..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchPlaces(text);
            }}
            autoFocus
          />
        </View>

        {searchingPlaces ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={
              searchQuery.length >= 2 ? (
                <View style={styles.emptySearch}>
                  <Ionicons name="search" size={48} color={COLORS.grayLight} />
                  <Text style={styles.emptySearchText}>No se encontraron lugares</Text>
                  <Text style={styles.emptySearchHint}>
                    Puedes agregar un punto personalizado si el lugar no está en la app
                  </Text>
                </View>
              ) : (
                <View style={styles.emptySearch}>
                  <Ionicons name="storefront-outline" size={48} color={COLORS.grayLight} />
                  <Text style={styles.emptySearchText}>
                    Busca lugares publicados en GuianDo
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.placeResult} onPress={() => selectPlace(item)}>
                <Image source={{ uri: item.imageUrl }} style={styles.placeImage} />
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.placeCategory}>{item.category}</Text>
                  <Text style={styles.placeLocation}>
                    {item.location?.city}, {item.location?.province}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );

  // Renderizar punto de interés
  const renderPoint = (point: PointForm, index: number) => {
    const isPlace = point.type === 'place' && point.placeData;

    return (
      <View key={index} style={styles.pointCard}>
        <View style={styles.pointHeader}>
          <View style={styles.pointNumber}>
            <Text style={styles.pointNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.pointTitle}>
            {isPlace ? point.placeData.title : point.customName || 'Punto personalizado'}
          </Text>
          <View style={styles.pointActions}>
            {index > 0 && (
              <TouchableOpacity onPress={() => movePoint(index, 'up')}>
                <Ionicons name="arrow-up" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
            {index < points.length - 1 && (
              <TouchableOpacity onPress={() => movePoint(index, 'down')}>
                <Ionicons name="arrow-down" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => removePoint(index)}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tipo de punto */}
        <View style={styles.pointTypeRow}>
          <TouchableOpacity
            style={[styles.pointTypeButton, point.type === 'place' && styles.pointTypeActive]}
            onPress={() => {
              setEditingPointIndex(index);
              setShowPlaceSearch(true);
            }}
          >
            <Ionicons name="storefront" size={16} color={point.type === 'place' ? COLORS.white : COLORS.primary} />
            <Text style={[styles.pointTypeText, point.type === 'place' && styles.pointTypeTextActive]}>
              Lugar de la app
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pointTypeButton, point.type === 'custom' && styles.pointTypeActive]}
            onPress={() => updatePoint(index, { 
              type: 'custom', 
              placeId: undefined, 
              placeData: undefined 
            })}
          >
            <Ionicons name="create" size={16} color={point.type === 'custom' ? COLORS.white : COLORS.primary} />
            <Text style={[styles.pointTypeText, point.type === 'custom' && styles.pointTypeTextActive]}>
              Personalizado
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido según tipo */}
        {isPlace ? (
          <View style={styles.placePreview}>
            <Image source={{ uri: point.placeData.imageUrl }} style={styles.placePreviewImage} />
            <View style={styles.placePreviewInfo}>
              <Text style={styles.placePreviewName}>{point.placeData.title}</Text>
              <Text style={styles.placePreviewLocation}>
                {point.placeData.location?.city}, {point.placeData.location?.province}
              </Text>
            </View>
            <TouchableOpacity onPress={() => {
              setEditingPointIndex(index);
              setShowPlaceSearch(true);
            }}>
              <Ionicons name="swap-horizontal" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.customPointForm}>
            {/* Nombre */}
            <TextInput
              style={styles.input}
              placeholder="Nombre del lugar *"
              placeholderTextColor={COLORS.gray}
              value={point.customName}
              onChangeText={(text) => updatePoint(index, { customName: text })}
              maxLength={100}
            />

            {/* Descripción */}
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción (opcional)"
              placeholderTextColor={COLORS.gray}
              value={point.customDescription}
              onChangeText={(text) => updatePoint(index, { customDescription: text })}
              multiline
              maxLength={500}
            />

            {/* Imagen */}
            <TouchableOpacity 
              style={styles.imagePickerSmall}
              onPress={() => pickPointImage(index)}
            >
              {point.customImageUri ? (
                <Image source={{ uri: point.customImageUri }} style={styles.pointImagePreview} />
              ) : (
                <View style={styles.imagePickerContent}>
                  <Ionicons name="camera" size={24} color={COLORS.gray} />
                  <Text style={styles.imagePickerText}>Foto (opcional)</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Ubicación */}
            <View style={styles.locationRow}>
              <View style={styles.locationField}>
                <Text style={styles.fieldLabel}>Provincia *</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity style={styles.picker}>
                    <Text>{point.location.province || 'Seleccionar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.locationField}>
                <Text style={styles.fieldLabel}>Ciudad *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ciudad"
                  placeholderTextColor={COLORS.gray}
                  value={point.location.city}
                  onChangeText={(text) => updatePoint(index, {
                    location: { ...point.location, city: text }
                  })}
                />
              </View>
            </View>

            <View style={styles.addressRow}>
              <TextInput
                style={[styles.input, styles.addressInputFlex]}
                placeholder="Dirección (opcional)"
                placeholderTextColor={COLORS.gray}
                value={point.location.address}
                onChangeText={(text) => updatePoint(index, {
                  location: { ...point.location, address: text }
                })}
              />
              <TouchableOpacity
                style={styles.mapPickerButton}
                onPress={() => {
                  setLocationPickerPointIndex(index);
                  setShowLocationPicker(true);
                }}
              >
                <Ionicons name="map" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            {point.location.coordinates && (
              <View style={styles.coordinatesConfirm}>
                <Ionicons name="checkmark-circle" size={14} color="#06D6A0" />
                <Text style={styles.coordinatesConfirmText}>Ubicación precisa</Text>
              </View>
            )}
          </View>
        )}

        {/* Notas y tiempo (común a ambos) */}
        <View style={styles.pointExtras}>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="💡 Tip o recomendación para este punto..."
            placeholderTextColor={COLORS.gray}
            value={point.notes}
            onChangeText={(text) => updatePoint(index, { notes: text })}
            maxLength={GUIDE_LIMITS.POINT_NOTES_MAX_LENGTH}
          />
          
          <View style={styles.timeRow}>
            <Text style={styles.fieldLabel}>Tiempo estimado:</Text>
            <View style={styles.timeButtons}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => updatePoint(index, { 
                  estimatedTime: Math.max(5, point.estimatedTime - 15) 
                })}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.timeValue}>{formatDuration(point.estimatedTime)}</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => updatePoint(index, { 
                  estimatedTime: Math.min(480, point.estimatedTime + 15) 
                })}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva guía</Text>
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Publicar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Imagen de portada */}
        <TouchableOpacity style={styles.coverPicker} onPress={pickCoverImage}>
          {coverImageUri ? (
            <Image source={{ uri: coverImageUri }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="image" size={48} color={COLORS.gray} />
              <Text style={styles.coverPlaceholderText}>Agregar imagen de portada</Text>
            </View>
          )}
          <View style={styles.coverEditBadge}>
            <Ionicons name="camera" size={20} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información básica</Text>
          
          <TextInput
            style={styles.titleInput}
            placeholder="Título de la guía *"
            placeholderTextColor={COLORS.gray}
            value={title}
            onChangeText={setTitle}
            maxLength={GUIDE_LIMITS.TITLE_MAX_LENGTH}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descripción * (mín. 20 caracteres)"
            placeholderTextColor={COLORS.gray}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={GUIDE_LIMITS.DESCRIPTION_MAX_LENGTH}
          />
          <Text style={styles.charCount}>
            {description.length}/{GUIDE_LIMITS.DESCRIPTION_MAX_LENGTH}
          </Text>


          {/* Tags */}
          <Text style={styles.fieldLabel}>Tags (máx. 5)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Agregar tag..."
              placeholderTextColor={COLORS.gray}
              value={tagInput}
              onChangeText={setTagInput}
              maxLength={20}
              onSubmitEditing={() => {
                const t = tagInput.trim().toLowerCase();
                if (t && tags.length < 5 && !tags.includes(t)) {
                  setTags([...tags, t]);
                  setTagInput('');
                }
              }}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 }}
              onPress={() => {
                const t = tagInput.trim().toLowerCase();
                if (t && tags.length < 5 && !tags.includes(t)) {
                  setTags([...tags, t]);
                  setTagInput('');
                }
              }}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {tags.map((tag, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '20', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4 }}
                  onPress={() => setTags(tags.filter((_, i) => i !== idx))}
                >
                  <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '600' }}>#{tag}</Text>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {/* Categoría */}
          <Text style={styles.fieldLabel}>Categoría</Text>
          <TouchableOpacity 
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={styles.categoryIcon}>{getGuideCategoryConfig(category).icon}</Text>
            <Text style={styles.categorySelectorText}>{category}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Dificultad */}
          <Text style={styles.fieldLabel}>Dificultad</Text>
          <View style={styles.difficultyRow}>
            {(Object.keys(GUIDE_DIFFICULTIES) as GuideDifficulty[]).map((key) => {
              const config = GUIDE_DIFFICULTIES[key];
              const isSelected = difficulty === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.difficultyOption,
                    isSelected && { backgroundColor: config.color + '20', borderColor: config.color }
                  ]}
                  onPress={() => setDifficulty(key)}
                >
                  <Text>{config.icon}</Text>
                  <Text style={[styles.difficultyText, isSelected && { color: config.color }]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Puntos de interés */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Puntos de interés ({points.length}/{GUIDE_LIMITS.MAX_POINTS})
            </Text>
            <Text style={styles.totalDuration}>
              Total: {formatDuration(totalDuration)}
            </Text>
          </View>

          {points.map((point, index) => renderPoint(point, index))}

          {points.length < GUIDE_LIMITS.MAX_POINTS && (
            <TouchableOpacity style={styles.addPointButton} onPress={addPoint}>
              <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              <Text style={styles.addPointText}>Agregar punto</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {renderCategoryPicker()}
      {renderPlaceSearch()}
      
      {/* Location Picker para puntos personalizados */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => {
          setShowLocationPicker(false);
          setLocationPickerPointIndex(null);
        }}
        onSelect={(location) => {
          if (locationPickerPointIndex !== null) {
            updatePoint(locationPickerPointIndex, {
              location: {
                address: location.address,
                city: location.city,
                province: location.province,
                coordinates: location.coordinates,
              },
            });
          }
        }}
        initialProvince="Córdoba"
        initialCity=""
      />
    </KeyboardAvoidingView>
  );
};

export default CreateGuideScreen;