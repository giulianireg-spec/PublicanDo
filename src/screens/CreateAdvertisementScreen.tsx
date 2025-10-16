// src/screens/CreateAdvertisementScreen.tsx
// REEMPLAZAR TODO EL CONTENIDO CON ESTE CÓDIGO

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { createAdvertisement, uploadImage } from '../services/api';
import { COLORS } from '../constants/colors';
import { CreateAdvertisementData } from '../types';
import { convertImageToBase64 } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';

const categories = [
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

const actionTypes = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
  { value: 'maps', label: 'Ver Ubicación', icon: 'location' },
  { value: 'website', label: 'Sitio Web', icon: 'globe' },
  { value: 'social', label: 'Redes Sociales', icon: 'share-social' },
];

const CreateAdvertisementScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electrónica');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [actionType, setActionType] = useState<'none' | 'whatsapp' | 'maps' | 'website' | 'social'>('none');
  const [actionValue, setActionValue] = useState('');
  const [actionLabel, setActionLabel] = useState('');

  useEffect(() => {
    if (!user) {
      Alert.alert(
        'Acceso denegado',
        'Debes iniciar sesión para crear publicidades',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      requestPermissions();
    }
  }, [user]);

  const requestPermissions = async () => {
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }

      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const pickImage = async () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        {
          text: 'Cámara',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Galería',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const getPlaceholderForActionType = () => {
    switch (actionType) {
      case 'whatsapp':
        return '5493515555555';
      case 'website':
        return 'https://miempresa.com';
      case 'social':
        return 'https://instagram.com/miempresa';
      default:
        return '';
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return false;
    }
    if (!imageUri) {
      Alert.alert('Error', 'Debes seleccionar una imagen para el flyer');
      return false;
    }
    if (actionType === 'maps' && !address.trim()) {
      Alert.alert('Error', 'Debes ingresar una dirección para el botón de ubicación');
      return false;
    }
    if (actionType === 'maps' && !userLocation) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
      return false;
    }
    if (actionType !== 'none' && actionType !== 'maps' && !actionValue.trim()) {
      Alert.alert('Error', 'Debes completar el valor de contacto');
      return false;
    }
    if (actionType !== 'none' && !actionLabel.trim()) {
      Alert.alert('Error', 'Debes completar la etiqueta del botón');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = '';
      
      if (imageUri) {
        try {
          console.log('📸 Iniciando conversión de imagen a base64...');
          const base64Image = await convertImageToBase64(imageUri);
          console.log('✅ Imagen convertida a base64, tamaño:', base64Image.length, 'caracteres');
          console.log('📤 Subiendo imagen a Cloudinary...');
          imageUrl = await uploadImage(base64Image);
          console.log('✅ IMAGEN SUBIDA A CLOUDINARY EXITOSAMENTE!');
          console.log('🌐 URL de Cloudinary:', imageUrl);
        } catch (uploadError: any) {
          console.error('❌ Error subiendo imagen:', uploadError);
          Alert.alert(
            'Error al subir imagen',
            'No se pudo subir la imagen a Cloudinary. ¿Deseas continuar con una imagen de ejemplo?',
            [
              { 
                text: 'Cancelar', 
                style: 'cancel', 
                onPress: () => {
                  setLoading(false);
                  return;
                }
              },
              {
                text: 'Continuar',
                onPress: () => {
                  imageUrl = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800';
                  console.log('⚠️ Usando imagen de ejemplo');
                },
              },
            ]
          );
          return;
        }
      }

      let finalAddress = 'Córdoba, Argentina';
      let finalCoordinates: [number, number] = [-64.1888, -31.4201];

      if (actionType === 'maps' && userLocation && address.trim()) {
        finalAddress = address.trim();
        finalCoordinates = [userLocation.longitude, userLocation.latitude];
      }

      const data: CreateAdvertisementData = {
        title: title.trim(),
        description: title.trim(),
        category,
        imageUrl,
        location: {
          coordinates: finalCoordinates,
          address: finalAddress,
        },
        isPremium: false,
        actionButton: actionType !== 'none' ? {
          type: actionType,
          value: actionValue.trim() || '',
          label: actionLabel.trim(),
        } : undefined,
        price: price ? parseFloat(price) : undefined,
      };

      console.log('📝 Creando publicidad con datos:', {
        title: data.title,
        category: data.category,
        imageUrl: data.imageUrl.substring(0, 50) + '...',
      });

      await createAdvertisement(data);
      
      Alert.alert(
        '¡Éxito!',
        'Tu publicidad ha sido creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error creando publicidad:', error);
      Alert.alert('Error', error.message || 'No se pudo crear la publicidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Publicidad</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imagen del flyer *</Text>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={48} color={COLORS.gray} />
                <Text style={styles.imagePlaceholderText}>Toca para seleccionar</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

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

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Categoría</Text>
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Precio (opcional)"
            placeholderTextColor={COLORS.gray}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Botón de acción (opcional)</Text>
          <Text style={styles.helperText}>
            Elige qué acción quieres que realicen los usuarios al ver tu flyer.
          </Text>

          <View style={styles.actionTypeContainer}>
            <TouchableOpacity
              key="none"
              style={[
                styles.actionTypeButton,
                actionType === 'none' && styles.actionTypeButtonActive,
              ]}
              onPress={() => setActionType('none')}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={actionType === 'none' ? COLORS.white : COLORS.gray}
              />
              <Text
                style={[
                  styles.actionTypeText,
                  actionType === 'none' && styles.actionTypeTextActive,
                ]}
              >
                Sin acción
              </Text>
            </TouchableOpacity>
            
            {actionTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.actionTypeButton,
                  actionType === type.value && styles.actionTypeButtonActive,
                ]}
                onPress={() => setActionType(type.value as any)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={actionType === type.value ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.actionTypeText,
                    actionType === type.value && styles.actionTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {actionType === 'maps' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <TextInput
              style={styles.input}
              placeholder="Dirección (Ej: Av. Colón 123, Córdoba) *"
              placeholderTextColor={COLORS.gray}
              value={address}
              onChangeText={setAddress}
            />
            <Text style={styles.helperText}>
              📍 Tu ubicación actual será usada como referencia
            </Text>
          </View>
        )}

        {actionType !== 'none' && actionType !== 'maps' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de contacto</Text>
            <Text style={styles.helperText}>
              {actionType === 'whatsapp' && '📱 Ingresa tu número de WhatsApp (con código de país, ej: 5493515555555)'}
              {actionType === 'website' && '🌐 Ingresa la URL de tu sitio web'}
              {actionType === 'social' && '📱 Ingresa el enlace a tu red social'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={getPlaceholderForActionType()}
              placeholderTextColor={COLORS.gray}
              value={actionValue}
              onChangeText={setActionValue}
            />
          </View>
        )}

        {actionType !== 'none' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Etiqueta del botón</Text>
            <TextInput
              style={styles.input}
              placeholder="Texto del botón (Ej: 'Contactar', 'Ver ubicación')"
              placeholderTextColor={COLORS.gray}
              value={actionLabel}
              onChangeText={setActionLabel}
              maxLength={30}
            />
          </View>
        )}

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
              <Text style={styles.submitButtonText}>Crear Publicidad</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.inputBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: COLORS.gray,
    fontSize: 14,
  },
  helperText: {
    marginTop: 8,
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
  picker: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
  },
  actionTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  actionTypeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  actionTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  actionTypeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionTypeTextActive: {
    color: COLORS.white,
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

export default CreateAdvertisementScreen;