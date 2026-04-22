// src/components/ContactInfoOverlay.tsx
// CORREGIDO: Muestra ubicación aunque no haya dirección específica (usa locality/province)
// ACTUALIZADO: Incluye matrícula profesional y Twitter → X

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ContactInfo {
  phone?: string;
  email?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

interface ContactInfoOverlayProps {
  contactInfo?: ContactInfo;
  address?: string;
  locality?: string;
  province?: string;
  // Props para matrícula profesional
  hasProfessionalLicense?: boolean;
  professionalLicenseNumber?: string;
  // ✅ NUEVO: Coordenadas para abrir mapas directamente
  coordinates?: [number, number]; // [longitude, latitude]
}

export const ContactInfoOverlay: React.FC<ContactInfoOverlayProps> = ({
  contactInfo,
  address,
  locality,
  province,
  hasProfessionalLicense,
  professionalLicenseNumber,
  coordinates,
}) => {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      paddingHorizontal: 12,
      paddingVertical: 12,
      zIndex: 5,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    fullWidthItem: {
      width: '100%',
    },
    gridItem: {
      width: '48%',
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      gap: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    contactLabel: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
    },
    // ✅ NUEVO: Icono de "abrir" para ubicación
    openIcon: {
      opacity: 0.7,
    },
    // Estilos para matrícula profesional
    licenseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      gap: 10,
      borderWidth: 1,
      borderColor: 'rgba(76, 175, 80, 0.5)',
    },
    licenseContent: {
      flex: 1,
    },
    licenseLabel: {
      color: '#81C784',
      fontSize: 10,
      fontWeight: '600',
    },
    licenseNumber: {
      color: COLORS.white,
      fontSize: 13,
      fontWeight: '700',
    },
    // Estilos para logo X
    xLogoContainer: {
      width: 18,
      height: 18,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    xLogo: {
      fontSize: 12,
      fontWeight: '900',
      color: '#000000',
    },
  });

  const hasContactData = contactInfo && (
    contactInfo.phone ||
    contactInfo.email ||
    contactInfo.whatsapp ||
    contactInfo.instagram ||
    contactInfo.facebook ||
    contactInfo.twitter
  );

  const hasLicense = hasProfessionalLicense && professionalLicenseNumber;
  
  // ✅ CORREGIDO: Hay ubicación si hay address, locality o province
  const hasLocation = address || locality || province;

  // No mostrar si no hay datos
  if (!hasContactData && !hasLocation && !hasLicense) {
    return null;
  }

  const handlePhonePress = async (phone?: string) => {
    if (!phone) return;
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la aplicación de teléfono');
    }
  };

  const handleWhatsAppPress = async (whatsapp?: string) => {
    if (!whatsapp) return;
    try {
      const cleanNumber = whatsapp.replace(/\D/g, '');
      await Linking.openURL(`https://wa.me/${cleanNumber}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir WhatsApp');
    }
  };

  const handleEmailPress = async (email?: string) => {
    if (!email) return;
    try {
      await Linking.openURL(`mailto:${email}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el cliente de email');
    }
  };

  const handleSocialPress = async (url?: string) => {
    if (!url) return;
    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      await Linking.openURL(fullUrl);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    }
  };

  // ✅ CORREGIDO: Abrir mapas con coordenadas, dirección, o localidad/provincia
  const handleMapsPress = async () => {
    try {
      let url: string;

      // Prioridad 1: Si hay coordenadas, usarlas directamente
      if (coordinates && coordinates.length === 2) {
        const [longitude, latitude] = coordinates;
        url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      } else {
        // Prioridad 2: Construir query con dirección/localidad/provincia
        const parts: string[] = [];
        
        if (address) {
          parts.push(address);
        }
        if (locality) {
          parts.push(locality);
        }
        if (province) {
          parts.push(province);
        }
        parts.push('Argentina');

        const query = parts.join(', ');
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      }

      // ✅ CORREGIDO: No usar canOpenURL (falla en Android para URLs https)
      // Simplemente intentar abrir directamente
      console.log('🗺️ Abriendo mapas con URL:', url);
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error abriendo mapas:', error);
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
    }
  };

  // ✅ NUEVO: Obtener texto a mostrar para la ubicación
  const getLocationDisplayText = (): string => {
    if (address) {
      return address;
    }
    const parts: string[] = [];
    if (locality) parts.push(locality);
    if (province) parts.push(province);
    return parts.join(', ') || 'Ver ubicación';
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.gridContainer}>
        
        {/* Matrícula profesional (primera fila, ancho completo) */}
        {hasLicense && (
          <View style={styles.fullWidthItem}>
            <View style={styles.licenseItem}>
              <Ionicons name="shield-checkmark" size={18} color="#4CAF50" />
              <View style={styles.licenseContent}>
                <Text style={styles.licenseLabel}>Profesional Matriculado</Text>
                <Text style={styles.licenseNumber}>N° {professionalLicenseNumber}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ✅ CORREGIDO: Ubicación - mostrar si hay cualquier dato de ubicación */}
        {hasLocation && (
          <View style={styles.fullWidthItem}>
            <TouchableOpacity style={styles.contactItem} onPress={handleMapsPress}>
              <Ionicons name="location" size={18} color={COLORS.secondary} />
              <Text style={styles.contactLabel} numberOfLines={1}>
                {getLocationDisplayText()}
              </Text>
              <Ionicons name="open-outline" size={14} color={COLORS.white} style={styles.openIcon} />
            </TouchableOpacity>
          </View>
        )}

        {/* Teléfono */}
        {contactInfo?.phone && (
          <View style={styles.gridItem}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handlePhonePress(contactInfo.phone)}
            >
              <Ionicons name="call" size={18} color={COLORS.secondary} />
              <Text style={styles.contactLabel} numberOfLines={1}>{contactInfo.phone}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* WhatsApp */}
        {contactInfo?.whatsapp && (
          <View style={styles.gridItem}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleWhatsAppPress(contactInfo.whatsapp)}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text style={styles.contactLabel} numberOfLines={1}>{contactInfo.whatsapp}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Email */}
        {contactInfo?.email && (
          <View style={styles.gridItem}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleEmailPress(contactInfo.email)}
            >
              <Ionicons name="mail" size={18} color={COLORS.secondary} />
              <Text style={styles.contactLabel} numberOfLines={1}>{contactInfo.email}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instagram */}
        {contactInfo?.instagram && (
          <View style={styles.gridItem}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleSocialPress(contactInfo.instagram)}
            >
              <Ionicons name="logo-instagram" size={18} color="#E4405F" />
              <Text style={styles.contactLabel} numberOfLines={1}>{contactInfo.instagram}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Facebook */}
        {contactInfo?.facebook && (
          <View style={styles.gridItem}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleSocialPress(contactInfo.facebook)}
            >
              <Ionicons name="logo-facebook" size={18} color="#1877F2" />
              <Text style={styles.contactLabel} numberOfLines={1}>{contactInfo.facebook}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* X (antes Twitter) */}
        {contactInfo?.twitter && (
          <View style={styles.gridItem}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleSocialPress(
                contactInfo.twitter?.startsWith('http') 
                  ? contactInfo.twitter 
                  : `https://x.com/${contactInfo.twitter?.replace('@', '')}`
              )}
            >
              <View style={styles.xLogoContainer}>
                <Text style={styles.xLogo}>𝕏</Text>
              </View>
              <Text style={styles.contactLabel} numberOfLines={1}>{contactInfo.twitter}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

