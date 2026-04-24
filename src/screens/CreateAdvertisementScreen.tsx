// src/screens/CreateAdvertisementScreen.tsx
// GUIANDO: Con subcategorías y horarios

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  createAdvertisement, 
  uploadImage, 
  uploadMultipleImages,
  uploadVideo,
  convertVideoToBase64,
  reverseGeocode, 
  searchLocalities,
} from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { CreateAdvertisementData, ContactInfo } from '../types';
import { convertImageToBase64 } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';
import { ARGENTINA_PROVINCES } from '../constants/argentinaLocations';
import { ContactInfoForm } from '../components/ContactInfoForm';
import MediaPicker from '../components/MediaPicker';
import RichTextEditor from '../components/RichTextEditor';
import ScheduleForm from '../components/ScheduleForm';
import LocationPicker from '../components/LocationPicker';
import { 
  CATEGORIES, 
  PROFESSIONAL_CATEGORIES,
  getCategoryConfig,
  getSubcategories,
  hasSubcategories,
} from '../constants/categories';

// Hook para Interstitial Ads
import { useInterstitialAd } from '../hooks/useInterstitialAd';

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

// Tipo para horarios
interface Schedule {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

const CreateAdvertisementScreen = ({ navigation, route }: any) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  adNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  adNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#E65100',
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  helperText: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    color: '#333333',
    height: 50,
  },
  pickerItem: {
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  subcategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  subcategoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subcategoryChipText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  subcategoryChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  scheduleContainer: {
    marginTop: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 16,
    top: 40,
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  datePickersContainer: {
    marginTop: 16,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerColumn: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },
  licenseInputContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  licenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  licenseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  uploadingContainer: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  uploadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.gray,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressInput: {
    flex: 1,
    marginBottom: 0,
  },
  locationPickerButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  coordinatesText: {
    fontSize: 13,
    color: COLORS.success,
  },
  bottomPadding: {
    height: 20,
  },
});

  const { user } = useAuth();
  
  // Interstitial Ad (solo para usuarios normales, no seeders)
  const { isLoaded: adLoaded, show: showAd } = useInterstitialAd();
  
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Medios
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [videoItem, setVideoItem] = useState<MediaItem | null>(null);

  // Campos básicos
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [richDescription, setRichDescription] = useState('');

  // ✅ NUEVO: Horarios
  const [hasSchedule, setHasSchedule] = useState(false);
  const [schedule, setSchedule] = useState<Schedule>({});

  // Ubicación
  const [province, setProvince] = useState('Córdoba');
  const [locality, setLocality] = useState('');
  const [localityQuery, setLocalityQuery] = useState('');
  const [localitySuggestions, setLocalitySuggestions] = useState<string[]>([]);
  const [showLocalitySuggestions, setShowLocalitySuggestions] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [hasSpecificAddress, setHasSpecificAddress] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const [autofillingLocation, setAutofillingLocation] = useState(false);

  // ContactInfo
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});

  // Matrícula profesional
  const [hasProfessionalLicense, setHasProfessionalLicense] = useState(false);
  const [professionalLicenseNumber, setProfessionalLicenseNumber] = useState('');

  // Período temporal
  const [hasTemporalPeriod, setHasTemporalPeriod] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Helpers
  const isSeeder = ['seeder', 'admin', 'moderator'].includes(user?.role || '');
  const categoryConfig = getCategoryConfig(category);
  const availableSubcategories = getSubcategories(category);
  const categoryHasSubcategories = hasSubcategories(category);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Acceso denegado',
        text2: 'Debes iniciar sesión para publicar',
      });
      navigation.goBack();
      return;
    }
    requestPermissions();
    autoFillLocationFromGPS();
  }, [user]);

  // Limpiar subcategoría cuando cambia la categoría
  useEffect(() => {
    setSubcategory(null);
    
    if (!PROFESSIONAL_CATEGORIES.includes(category)) {
      setHasProfessionalLicense(false);
      setProfessionalLicenseNumber('');
    }
  }, [category]);

  // Debounce para búsqueda de localidades
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localityQuery.trim().length >= 2) {
        handleSearchLocalities(localityQuery);
      } else {
        setLocalitySuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localityQuery, province]);

  // ==================== HANDLERS ====================

  const requestPermissions = async () => {
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch (error) {
      console.log('ℹ️ No se pudieron solicitar permisos de ubicación');
    }
  };

  const autoFillLocationFromGPS = async () => {
    try {
      setAutofillingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('ℹ️ Permisos de ubicación no otorgados');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      const result = await reverseGeocode(latitude, longitude);

      setProvince(result.province);
      setLocality(result.locality);
      setLocalityQuery(result.locality);

      Toast.show({
        type: 'success',
        text1: '📍 Ubicación detectada',
        text2: `${result.locality}, ${result.province}`,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch (error: any) {
      console.log('ℹ️ No se pudo obtener ubicación GPS:', error.message || 'Error desconocido');
    } finally {
      setAutofillingLocation(false);
    }
  };

  const handleSearchLocalities = async (query: string) => {
    try {
      setLoadingLocalities(true);
      const results = await searchLocalities(query, province);
      setLocalitySuggestions(results);
    } catch (error) {
      setLocalitySuggestions([]);
    } finally {
      setLoadingLocalities(false);
    }
  };

  const handleSelectLocality = useCallback((selectedLocality: string) => {
    setLocality(selectedLocality);
    setLocalityQuery(selectedLocality);
    setShowLocalitySuggestions(false);
    setLocalitySuggestions([]);
  }, []);

  const onStartDateChange = (_: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      if (endDate <= selectedDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setDate(newEndDate.getDate() + 30);
        setEndDate(newEndDate);
      }
    }
  };

  const onEndDateChange = (_: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // ==================== VALIDATION ====================

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'El título es obligatorio', position: 'bottom' });
      return false;
    }

    if (mediaItems.length === 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Debes agregar al menos 1 imagen', position: 'bottom' });
      return false;
    }

    if (!province.trim() || !locality.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Provincia y Localidad son obligatorios', position: 'bottom' });
      return false;
    }

    if (hasSpecificAddress && !address.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Si activas dirección específica, debes ingresarla', position: 'bottom' });
      return false;
    }

    if (hasProfessionalLicense && !professionalLicenseNumber.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Debes ingresar el número de matrícula', position: 'bottom' });
      return false;
    }

    if (professionalLicenseNumber.trim()) {
      const licenseRegex = /^\d{4,20}$/;
      if (!licenseRegex.test(professionalLicenseNumber.trim())) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'La matrícula debe contener solo números (4-20 dígitos)', position: 'bottom' });
        return false;
      }
    }

    if (hasTemporalPeriod && endDate <= startDate) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'La fecha de fin debe ser posterior a la de inicio', position: 'bottom' });
      return false;
    }

    return true;
  };

  // ==================== SUBMIT ====================

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Mostrar ad intersticial para usuarios normales (NO seeders)
    if (!isSeeder && adLoaded) {
      console.log('📢 Mostrando ad intersticial antes de crear...');
      await showAd();
    }

    setLoading(true);
    setUploadingMedia(true);

    try {
      // Subir imágenes
      const imageBase64Array = await Promise.all(
        mediaItems.map(item => convertImageToBase64(item.uri))
      );

      let imageUrl = '';
      let additionalImages: string[] = [];

      if (imageBase64Array.length === 1) {
        imageUrl = await uploadImage(imageBase64Array[0]);
      } else {
        const uploadedUrls = await uploadMultipleImages(imageBase64Array);
        imageUrl = uploadedUrls[0];
        additionalImages = uploadedUrls.slice(1);
      }

      setUploadingMedia(false);

      // Preparar datos de ubicación
      const locationData: any = {
        province: province.trim(),
        city: locality.trim(),
      };
      if (hasSpecificAddress && address.trim()) {
        locationData.address = address.trim();
      }
      
      // Agregar coordenadas si fueron seleccionadas desde el mapa
      if (selectedCoordinates) {
        locationData.coordinates = selectedCoordinates;
      }

      // Preparar datos de la publicación
      const data: any = {
        title: title.trim(),
        description: title.trim(),
        category,
        imageUrl,
        location: locationData,
      };

      // Subcategoría (si aplica)
      if (subcategory) {
        data.subcategory = subcategory;
      }

      // ✅ NUEVO: Horarios
      if (hasSchedule && Object.keys(schedule).length > 0) {
        data.schedule = schedule;
      }

      // Descripción enriquecida (disponible para todos)
      if (richDescription.trim()) {
        data.richDescription = richDescription.trim();
      }

      // Imágenes adicionales
      if (additionalImages.length > 0) {
        data.images = additionalImages;
      }

      // Video (si hay)
      if (videoItem) {
        try {
          console.log('🎥 Procesando video...');
          const videoBase64 = await convertVideoToBase64(videoItem.uri);
          const videoResult = await uploadVideo(videoBase64);
          data.videoUrl = videoResult.url;
          console.log('✅ Video subido:', videoResult.url);
        } catch (videoError) {
          console.error('Error subiendo video:', videoError);
          Toast.show({
            type: 'error',
            text1: 'Error con el video',
            text2: 'La publicación se creará sin video',
            position: 'bottom',
          });
        }
      }

      // Contacto
      if (Object.keys(contactInfo).length > 0) {
        data.contactInfo = contactInfo;
      }

      // Matrícula profesional
      if (hasProfessionalLicense && professionalLicenseNumber.trim()) {
        data.hasProfessionalLicense = true;
        data.professionalLicenseNumber = professionalLicenseNumber.trim();
      }

      // Período temporal
      if (hasTemporalPeriod) {
        data.startDate = startDate.toISOString();
        data.endDate = endDate.toISOString();
      }

      console.log('📤 Creando publicación:', { 
        ...data, 
        imagesCount: additionalImages.length + 1,
        hasSchedule: !!data.schedule,
      });
      
      await createAdvertisement(data);
      
      Toast.show({
        type: 'success',
        text1: '✅ Publicación creada',
        text2: user?.trusted ? 'Ya está visible en el inicio' : 'Será revisada por un moderador',
        position: 'bottom',
        visibilityTime: 4000,
      });
      
      setTimeout(() => navigation.goBack(), 500);
    } catch (error: any) {
      console.error('❌ Error creando publicación:', error);
      handleSubmitError(error);
    } finally {
      setLoading(false);
      setUploadingMedia(false);
    }
  };

  const handleSubmitError = (error: any) => {
    const errorCode = error.response?.data?.code;

    switch (errorCode) {
      case 'USER_BANNED':
        const banInfo = error.response.data.banInfo;
        Alert.alert(
          '❌ Cuenta suspendida',
          banInfo.isPermanent
            ? `Tu cuenta ha sido suspendida permanentemente.\n\nRazón: ${banInfo.reason}`
            : `Tu cuenta ha sido suspendida hasta el ${banInfo.expiresAt}.\n\nRazón: ${banInfo.reason}`,
          [{ text: 'Entendido', onPress: () => navigation.goBack() }]
        );
        break;
      default:
        Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'No se pudo crear la publicación', position: 'bottom' });
    }
  };

  // ==================== RENDER ====================

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo lugar</Text>
        </View>

        {/* Aviso de ad para usuarios normales (NO seeders) */}
        {!isSeeder && (
          <View style={styles.adNotice}>
            <Ionicons name="information-circle" size={20} color="#FF9800" />
            <Text style={styles.adNoticeText}>
              Se mostrará un anuncio breve al publicar
            </Text>
          </View>
        )}

        {/* Media Picker - Todos tienen acceso completo */}
        <MediaPicker
          isPremium={true}
          images={mediaItems}
          video={videoItem}
          onImagesChange={setMediaItems}
          onVideoChange={setVideoItem}
        />

        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información básica</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del lugar *"
            placeholderTextColor={COLORS.gray}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Selector de Categoría */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={styles.picker}
                dropdownIconColor="#333333"
                mode="dropdown"
              >
                {CATEGORIES.map((cat) => {
                  const config = getCategoryConfig(cat);
                  return (
                    <Picker.Item 
                      key={cat} 
                      label={`${config?.icon || ''} ${cat}`}
                      value={cat} 
                      color="#333333"
                      style={styles.pickerItem}
                    />
                  );
                })}
              </Picker>
            </View>
          </View>

          {/* Selector de Subcategoría (si la categoría tiene subcategorías) */}
          {categoryHasSubcategories && (
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Subcategoría</Text>
              <View style={styles.subcategoriesGrid}>
                {availableSubcategories.map((sub) => (
                  <TouchableOpacity
                    key={sub}
                    style={[
                      styles.subcategoryChip,
                      subcategory === sub && styles.subcategoryChipActive,
                    ]}
                    onPress={() => setSubcategory(subcategory === sub ? null : sub)}
                  >
                    <Text
                      style={[
                        styles.subcategoryChipText,
                        subcategory === sub && styles.subcategoryChipTextActive,
                      ]}
                    >
                      {sub}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helperText}>
                Opcional: selecciona una subcategoría para mayor precisión
              </Text>
            </View>
          )}
        </View>

        {/* Rich Text Editor - Disponible para todos */}
        <View style={styles.section}>
          <RichTextEditor
            value={richDescription}
            onChange={setRichDescription}
            placeholder="Describe este lugar con detalles: servicios, especialidades..."
            maxLength={5000}
          />
        </View>

        {/* ✅ NUEVO: Horarios */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleContent}>
              <Text style={styles.sectionTitle}>🕐 Horarios de atención</Text>
              <Text style={styles.helperText}>
                Permite filtrar tu lugar por "Abierto ahora"
              </Text>
            </View>
            <Switch
              value={hasSchedule}
              onValueChange={setHasSchedule}
              trackColor={{ false: COLORS.grayLight, true: COLORS.secondary }}
              thumbColor={hasSchedule ? COLORS.primary : COLORS.gray}
            />
          </View>

          {hasSchedule && (
            <View style={styles.scheduleContainer}>
              <ScheduleForm
                schedule={schedule}
                onScheduleChange={setSchedule}
              />
            </View>
          )}
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <View style={styles.locationHeader}>
            <Text style={styles.sectionTitle}>📍 Ubicación *</Text>
            {autofillingLocation ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <TouchableOpacity onPress={autoFillLocationFromGPS} style={styles.refreshButton}>
                <Ionicons name="refresh" size={20} color={COLORS.primary} />
                <Text style={styles.refreshText}>Detectar</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.helperText}>
            Provincia y localidad son obligatorios para que los usuarios te encuentren
          </Text>

          {/* Picker de Provincia */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Provincia *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={province}
                onValueChange={(value) => {
                  setProvince(value);
                  setLocality('');
                  setLocalityQuery('');
                }}
                style={styles.picker}
                dropdownIconColor="#333333"
                mode="dropdown"
              >
                {ARGENTINA_PROVINCES.map((prov) => (
                  <Picker.Item 
                    key={prov.id} 
                    label={prov.name} 
                    value={prov.name} 
                    color="#333333"
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.autocompleteContainer}>
            <Text style={styles.label}>Localidad *</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu localidad..."
              placeholderTextColor={COLORS.gray}
              value={localityQuery}
              onChangeText={(text) => {
                setLocalityQuery(text);
                setShowLocalitySuggestions(true);
              }}
              onFocus={() => setShowLocalitySuggestions(true)}
            />
            {loadingLocalities && (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loadingIndicator} />
            )}
            
            {showLocalitySuggestions && localitySuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <ScrollView 
                  style={styles.suggestionsList}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {localitySuggestions.map((item, index) => (
                    <TouchableOpacity 
                      key={`${item}-${index}`}
                      style={styles.suggestionItem} 
                      onPress={() => handleSelectLocality(item)}
                    >
                      <Ionicons name="location" size={16} color={COLORS.primary} />
                      <Text style={styles.suggestionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.toggleContainer}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleLabel}>Agregar dirección específica</Text>
              <Text style={styles.helperText}>Opcional: Calle y altura</Text>
            </View>
            <Switch
              value={hasSpecificAddress}
              onValueChange={setHasSpecificAddress}
              trackColor={{ false: COLORS.grayLight, true: COLORS.secondary }}
              thumbColor={hasSpecificAddress ? COLORS.primary : COLORS.gray}
            />
          </View>

          {hasSpecificAddress && (
            <View>
              <View style={styles.addressInputContainer}>
                <TextInput
                  style={[styles.input, styles.addressInput]}
                  placeholder="Ej: Av. Colón 1234"
                  placeholderTextColor={COLORS.gray}
                  value={address}
                  onChangeText={setAddress}
                />
                <TouchableOpacity
                  style={styles.locationPickerButton}
                  onPress={() => setShowLocationPicker(true)}
                >
                  <Ionicons name="map" size={22} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              {selectedCoordinates && (
                <View style={styles.coordinatesInfo}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.coordinatesText}>Ubicación precisa guardada</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Período Temporal */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleContent}>
              <Text style={styles.sectionTitle}>📅 Período de Publicación</Text>
              <Text style={styles.helperText}>Ideal para eventos o promociones temporales</Text>
            </View>
            <Switch
              value={hasTemporalPeriod}
              onValueChange={setHasTemporalPeriod}
              trackColor={{ false: COLORS.grayLight, true: COLORS.secondary }}
              thumbColor={hasTemporalPeriod ? COLORS.primary : COLORS.gray}
            />
          </View>

          {hasTemporalPeriod && (
            <View style={styles.datePickersContainer}>
              <View style={styles.datePickerRow}>
                <View style={styles.datePickerColumn}>
                  <Text style={styles.label}>Fecha de inicio</Text>
                  <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                    <Ionicons name="calendar" size={20} color={COLORS.primary} />
                    <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.datePickerColumn}>
                  <Text style={styles.label}>Fecha de fin</Text>
                  <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                    <Ionicons name="calendar" size={20} color={COLORS.primary} />
                    <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onStartDateChange}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onEndDateChange}
                />
              )}

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={16} color="#2196F3" />
                <Text style={styles.infoBoxText}>La publicación se desactivará automáticamente al vencer</Text>
              </View>
            </View>
          )}
        </View>

        {/* Matrícula Profesional */}
        {PROFESSIONAL_CATEGORIES.includes(category) && (
          <View style={styles.section}>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleContent}>
                <Text style={styles.sectionTitle}>Profesional Matriculado 📋</Text>
                <Text style={styles.helperText}>Informa que cuentas con matrícula habilitante</Text>
              </View>
              <Switch
                value={hasProfessionalLicense}
                onValueChange={setHasProfessionalLicense}
                trackColor={{ false: COLORS.grayLight, true: COLORS.secondary }}
                thumbColor={hasProfessionalLicense ? COLORS.primary : COLORS.gray}
              />
            </View>

            {hasProfessionalLicense && (
              <View style={styles.licenseInputContainer}>
                <View style={styles.licenseHeader}>
                  <Ionicons name="document-text" size={20} color={COLORS.primary} />
                  <Text style={styles.licenseLabel}>Número de Matrícula *</Text>
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 12345678 (solo números, 4-20 dígitos)"
                  placeholderTextColor={COLORS.gray}
                  value={professionalLicenseNumber}
                  onChangeText={setProfessionalLicenseNumber}
                  keyboardType="numeric"
                  maxLength={20}
                />
                
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={16} color="#2196F3" />
                  <Text style={styles.infoBoxText}>Aparecerá un badge indicando que informas matrícula profesional</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Información de Contacto */}
        <ContactInfoForm 
          contactInfo={contactInfo}
          onContactInfoChange={setContactInfo}
        />

        {/* Uploading Indicator */}
        {uploadingMedia && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.uploadingText}>Subiendo imágenes...</Text>
            <Text style={styles.uploadingSubtext}>Esto puede tardar unos segundos</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.submitButtonText}>Publicar lugar</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Location Picker Modal */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(location) => {
          setAddress(location.address);
          setProvince(location.province);
          setLocality(location.city);
          setSelectedCoordinates(location.coordinates);
        }}
        initialProvince={province}
        initialCity={locality}
      />
    </KeyboardAvoidingView>
  );
};

export default CreateAdvertisementScreen;