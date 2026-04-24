// src/screens/EditAdvertisementScreen.tsx
// CORREGIDO: 
// - Picker con color de texto negro
// - Interstitial excluye seeders
// - Sin VirtualizedLists warning (FlatList → ScrollView con map)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  updateAdvertisement,
  uploadImage,
  uploadMultipleImages,
  uploadVideo,
  searchLocalities,
  convertVideoToBase64,
} from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Advertisement, ContactInfo } from '../types';
import { convertImageToBase64 } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';
import { ARGENTINA_PROVINCES } from '../constants/argentinaLocations';
import { ContactInfoForm } from '../components/ContactInfoForm';
import MediaPicker from '../components/MediaPicker';
import RichTextEditor from '../components/RichTextEditor';
import ScheduleForm from '../components/ScheduleForm';
import ClientSelector from '../components/ClientSelector';
import TagSelector from '../components/TagSelector';

// ✅ Hook para Interstitial Ads
import { useInterstitialAd } from '../hooks/useInterstitialAd';

const CATEGORIES = [
  '🍽️ Bares y Restaurantes',
  '🎵 Bailables y Discotecas',
  '🏖️ Turismo y Eventos',
  '💇 Estética y Bienestar',
  '🔧 Plomería',
  '⚡ Electricidad',
  '🧱 Albañilería y Construcción',
  '❄️ Climatización',
  '🎓 Educación y Capacitación',
  '🛠️ Otros Servicios',
];

const PROFESSIONAL_CATEGORIES = [
  '🔧 Plomería',
  '⚡ Electricidad',
  '❄️ Climatización',
  '🧱 Albañilería y Construcción',
];

interface Schedule {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  isExisting?: boolean;
}

interface EditAdvertisementScreenProps {
  route: { params: { advertisement: Advertisement } };
  navigation: any;
}

const EditAdvertisementScreen: React.FC<EditAdvertisementScreenProps> = ({ route, navigation }) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 40,
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
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  picker: {
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  businessTitle: {
    color: '#6C5CE7',
    marginBottom: 0,
  },
  businessField: {
    marginTop: 12,
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
  bottomPadding: {
    height: 20,
  },
});

  const { advertisement } = route.params;
  const { user } = useAuth();

  // ✅ Interstitial Ad (solo para usuarios Free que no sean seeder)
  const { isLoaded: adLoaded, show: showAd } = useInterstitialAd();

  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Medios
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [videoItem, setVideoItem] = useState<MediaItem | null>(null);

  // Campos básicos
  const [title, setTitle] = useState(advertisement.title || '');
  const [category, setCategory] = useState(advertisement.category || CATEGORIES[0]);
  const [premiumDescription, setPremiumDescription] = useState(advertisement.premiumDescription || '');

  // Ubicación
  const [province, setProvince] = useState(advertisement.location?.province || 'Córdoba');
  const [locality, setLocality] = useState(advertisement.location?.city || '');
  const [localityQuery, setLocalityQuery] = useState(advertisement.location?.city || '');
  const [localitySuggestions, setLocalitySuggestions] = useState<string[]>([]);
  const [showLocalitySuggestions, setShowLocalitySuggestions] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [hasSpecificAddress, setHasSpecificAddress] = useState(!!advertisement.location?.address);
  const [address, setAddress] = useState(advertisement.location?.address || '');

  // ContactInfo
  const [contactInfo, setContactInfo] = useState<ContactInfo>(advertisement.contactInfo || {});

  // Matrícula profesional
  const [hasProfessionalLicense, setHasProfessionalLicense] = useState(advertisement.hasProfessionalLicense || false);
  const [professionalLicenseNumber, setProfessionalLicenseNumber] = useState(advertisement.professionalLicenseNumber || '');

  // Período temporal
  // Horarios
  const [hasSchedule, setHasSchedule] = useState<boolean>(!!advertisement.schedule && Object.keys(advertisement.schedule).length > 0);
  const [schedule, setSchedule] = useState<Schedule>(advertisement.schedule || {});
  const [hasTemporalPeriod, setHasTemporalPeriod] = useState(!!(advertisement.startDate || advertisement.endDate));
  const [startDate, setStartDate] = useState<Date>(
    advertisement.startDate ? new Date(advertisement.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    advertisement.endDate ? new Date(advertisement.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Estados Business
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    (advertisement as any).clientId?._id || (advertisement as any).clientId || null
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    ((advertisement as any).tags || []).map((t: any) => t._id || t)
  );

  // Helpers
  const isPremium = true;
  const isUserPremium = true;
  const isBusinessUser = true;
  const isSeeder = user?.role === 'seeder';

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadExistingMedia();
  }, []);

  useEffect(() => {
    if (!PROFESSIONAL_CATEGORIES.includes(category)) {
      setHasProfessionalLicense(false);
      setProfessionalLicenseNumber('');
    }
  }, [category]);

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

  const loadExistingMedia = () => {
    const existingMedia: MediaItem[] = [];

    existingMedia.push({ uri: advertisement.imageUrl, type: 'image', isExisting: true });

    if (advertisement.images?.length > 0) {
      advertisement.images.forEach(imgUrl => {
        existingMedia.push({ uri: imgUrl, type: 'image', isExisting: true });
      });
    }

    setMediaItems(existingMedia);

    if (advertisement.videoUrl) {
      setVideoItem({ uri: advertisement.videoUrl, type: 'video', isExisting: true });
    }
  };

  // ==================== HANDLERS ====================

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
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // ==================== VALIDATION ====================

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'El título es obligatorio', position: 'bottom' });
      return false;
    }

    if (mediaItems.length === 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Debes tener al menos 1 imagen', position: 'bottom' });
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

    if (professionalLicenseNumber.trim() && !/^\d{4,20}$/.test(professionalLicenseNumber.trim())) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'La matrícula debe contener solo números (4-20 dígitos)', position: 'bottom' });
      return false;
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

    // ✅ CORREGIDO: Mostrar ad intersticial para usuarios Free (NO seeders, NO premium) ANTES de guardar
    if (!isUserPremium && !isSeeder && adLoaded) {
      console.log('📢 Mostrando ad intersticial antes de guardar...');
      await showAd();
    }

    setLoading(true);
    setUploadingMedia(true);

    try {
      const existingImages = mediaItems.filter(item => item.isExisting).map(item => item.uri);
      const newImages = mediaItems.filter(item => !item.isExisting);

      let imageUrl = '';
      let additionalImages: string[] = [];

      if (newImages.length > 0) {
        const imageBase64Array = await Promise.all(newImages.map(item => convertImageToBase64(item.uri)));

        if (imageBase64Array.length === 1) {
          const uploadedUrl = await uploadImage(imageBase64Array[0]);
          if (existingImages.length === 0) {
            imageUrl = uploadedUrl;
          } else {
            additionalImages = [...existingImages.slice(1), uploadedUrl];
            imageUrl = existingImages[0];
          }
        } else {
          const uploadedUrls = await uploadMultipleImages(imageBase64Array);
          const allImages = [...existingImages, ...uploadedUrls];
          imageUrl = allImages[0];
          additionalImages = allImages.slice(1);
        }
      } else {
        imageUrl = existingImages[0];
        additionalImages = existingImages.slice(1);
      }

      let videoUrl: string | undefined;
      if (videoItem) {
        if (videoItem.isExisting) {
          videoUrl = videoItem.uri;
        } else {
          const videoBase64 = await convertVideoToBase64(videoItem.uri);
          const videoResult = await uploadVideo(videoBase64);
          videoUrl = videoResult.url;
        }
      }

      setUploadingMedia(false);

      const locationData: any = { province: province.trim(), city: locality.trim() };
      if (hasSpecificAddress && address.trim()) locationData.address = address.trim();

      const data: any = {
        title: title.trim(),
        description: title.trim(),
        category,
        imageUrl,
        location: locationData,
        images: additionalImages.length > 0 ? additionalImages : [],
        videoUrl: videoUrl || null,
        premiumDescription: isPremium && premiumDescription.trim() ? premiumDescription.trim() : null,
        contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
        hasProfessionalLicense: hasProfessionalLicense && professionalLicenseNumber.trim() ? true : false,
        professionalLicenseNumber: hasProfessionalLicense ? professionalLicenseNumber.trim() : null,
        startDate: hasTemporalPeriod ? startDate.toISOString() : null,
        endDate: hasTemporalPeriod ? endDate.toISOString() : null,
        schedule: hasSchedule && Object.keys(schedule).length > 0 ? schedule : null,
      };

      // Agregar cliente y etiquetas (solo Business)
      if (isBusinessUser) {
        data.clientId = selectedClientId || null;
        data.tags = selectedTagIds.length > 0 ? selectedTagIds : [];
      }

      console.log('📤 Actualizando publicidad:', {
        ...data,
        imagesCount: additionalImages.length + 1,
        hasVideo: !!videoUrl,
        hasSchedule: !!data.schedule,
        clientId: data.clientId,
        tagsCount: data.tags?.length || 0,
      });

      await updateAdvertisement(advertisement._id, data);

      Toast.show({
        type: 'success',
        text1: '✅ Publicidad actualizada',
        text2: 'Los cambios se han guardado correctamente',
        position: 'bottom',
      });

      setTimeout(() => navigation.goBack(), 500);
    } catch (error: any) {
      console.error('❌ Error actualizando:', error);
      handleSubmitError(error);
    } finally {
      setLoading(false);
      setUploadingMedia(false);
    }
  };

  const handleSubmitError = (error: any) => {
    const code = error.response?.data?.code;
    const message = error.response?.data?.message;

    const errorMessages: Record<string, { title: string; type: 'error' | 'warning' }> = {
      IMAGE_LIMIT_EXCEEDED: { title: '❌ Demasiadas imágenes', type: 'error' },
      PREMIUM_REQUIRED: { title: '⭐ Premium requerido', type: 'info' },
      PREMIUM_DESCRIPTION_TOO_LONG: { title: '❌ Descripción muy larga', type: 'error' },
      BUSINESS_REQUIRED: { title: '💼 Business requerido', type: 'info' },
      INVALID_CLIENT: { title: '❌ Cliente inválido', type: 'error' },
      INVALID_TAGS: { title: '❌ Etiquetas inválidas', type: 'error' },
    };

    const errorInfo = errorMessages[code];
    Toast.show({
      type: errorInfo?.type || 'error',
      text1: errorInfo?.title || 'Error',
      text2: message || 'No se pudo actualizar la publicidad',
      position: 'bottom',
      visibilityTime: 5000,
    });
  };

  // ==================== RENDER ====================

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Publicidad</Text>
        </View>

        {/* ✅ Aviso de ad para usuarios Free (NO seeders, NO premium) */}
        {!isUserPremium && !isSeeder && (
          <View style={styles.adNotice}>
            <Ionicons name="information-circle" size={20} color="#FF9800" />
            <Text style={styles.adNoticeText}>
              Se mostrará un anuncio breve al guardar. ¡Hazte Premium para eliminarlo!
            </Text>
          </View>
        )}

        {/* Media Picker */}
        <MediaPicker
          isPremium={isPremium}
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
            placeholder="Título del flyer *"
            placeholderTextColor={COLORS.gray}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* ✅ CORREGIDO: Picker con color de texto negro */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={category} 
                onValueChange={setCategory} 
                style={styles.picker}
                dropdownIconColor={COLORS.text}
              >
                {CATEGORIES.map((cat) => (
                  <Picker.Item 
                    key={cat} 
                    label={cat} 
                    value={cat} 
                    color={COLORS.text}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Rich Text Editor (Premium) */}
        {isPremium && (
          <View style={styles.section}>
            <RichTextEditor
              value={premiumDescription}
              onChange={setPremiumDescription}
              placeholder="Describe tu negocio o servicio con detalles y formato..."
              maxLength={5000}
            />
          </View>
        )}

        {/* Horarios de atención */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleContent}>
              <Text style={styles.sectionTitle}>🕐 Horarios de atención</Text>
              <Text style={styles.helperText}>Indica cuándo está abierto tu lugar</Text>
            </View>
            <Switch
              value={hasSchedule}
              onValueChange={(value) => {
                setHasSchedule(value);
                if (!value) setSchedule({});
              }}
              trackColor={{ false: COLORS.grayLight, true: COLORS.secondary }}
              thumbColor={hasSchedule ? COLORS.primary : COLORS.gray}
            />
          </View>
          {hasSchedule && (
            <ScheduleForm
              schedule={schedule}
              onScheduleChange={setSchedule}
            />
          )}
        </View>

        {/* Sección Business */}
        {isBusinessUser && (
          <View style={styles.section}>
            <View style={styles.businessHeader}>
              <Ionicons name="briefcase" size={20} color="#6C5CE7" />
              <Text style={[styles.sectionTitle, styles.businessTitle]}>Organización Business</Text>
            </View>
            <Text style={styles.helperText}>
              Asigna esta publicidad a un cliente y agrega etiquetas
            </Text>

            <View style={styles.businessField}>
              <Text style={styles.label}>Cliente</Text>
              <ClientSelector
                selectedClientId={selectedClientId}
                onSelectClient={(client) => setSelectedClientId(client?._id || null)}
              />
            </View>

            <View style={styles.businessField}>
              <Text style={styles.label}>Etiquetas</Text>
              <TagSelector
                selectedTagIds={selectedTagIds}
                onSelectTags={setSelectedTagIds}
                maxTags={5}
              />
            </View>
          </View>
        )}

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Ubicación *</Text>
          <Text style={styles.helperText}>Provincia y localidad son obligatorios</Text>

          {/* ✅ CORREGIDO: Picker de Provincia con color de texto negro */}
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
                dropdownIconColor={COLORS.text}
              >
                {ARGENTINA_PROVINCES.map((prov) => (
                  <Picker.Item 
                    key={prov.id} 
                    label={prov.name} 
                    value={prov.name} 
                    color={COLORS.text}
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

            {/* ✅ CORREGIDO: Usar ScrollView con map en lugar de FlatList para evitar warning */}
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
            <TextInput
              style={styles.input}
              placeholder="Ej: Av. Colón 1234"
              placeholderTextColor={COLORS.gray}
              value={address}
              onChangeText={setAddress}
            />
          )}
        </View>

        {/* Período Temporal */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleContent}>
              <Text style={styles.sectionTitle}>📅 Período de Publicación</Text>
              <Text style={styles.helperText}>Define cuándo estará activa</Text>
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
                <Text style={styles.infoBoxText}>La publicidad se desactivará automáticamente al vencer</Text>
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
                <Text style={styles.helperText}>Informa que cuentas con matrícula</Text>
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
                  <Text style={styles.infoBoxText}>Aparecerá un badge indicando matrícula profesional</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Información de Contacto */}
        <ContactInfoForm contactInfo={contactInfo} onContactInfoChange={setContactInfo} />

        {/* Uploading Indicator */}
        {uploadingMedia && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.uploadingText}>Subiendo imágenes y video...</Text>
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
              <Text style={styles.submitButtonText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditAdvertisementScreen;