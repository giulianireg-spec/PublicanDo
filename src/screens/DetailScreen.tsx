// src/screens/DetailScreen.tsx
// REEMPLAZAR TODO EL CONTENIDO DEL ARCHIVO CON ESTE CÓDIGO

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const DetailScreen = ({ route, navigation }: any) => {
  // Validar que existan los parámetros
  if (!route?.params?.advertisement) {
    Alert.alert('Error', 'No se pudo cargar la publicidad');
    navigation.goBack();
    return null;
  }

  const { advertisement } = route.params;

  const handleContact = async (type: string, value: string) => {
    let url = '';
    
    try {
      switch (type) {
        case 'phone':
          url = `tel:${value}`;
          break;
        case 'whatsapp':
          url = `whatsapp://send?phone=${value}`;
          break;
        case 'email':
          url = `mailto:${value}`;
          break;
        case 'website':
          url = value.startsWith('http') ? value : `https://${value}`;
          break;
        case 'facebook':
        case 'instagram':
        case 'twitter':
          url = value.startsWith('http') ? value : `https://${value}`;
          break;
        case 'maps':
          const [lng, lat] = advertisement.location.coordinates;
          url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          break;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir el enlace');
      }
    } catch (error) {
      console.error('Error abriendo enlace:', error);
      Alert.alert('Error', 'No se pudo realizar la acción');
    }
  };

  const formatDistance = (distance: number | null | undefined) => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Imagen principal */}
      <Image source={{ uri: advertisement.imageUrl }} style={styles.image} />

      {/* Badge Premium */}
      <View style={styles.premiumBadge}>
        <Ionicons name="star" size={16} color={COLORS.white} />
        <Text style={styles.premiumText}>Premium</Text>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Título y categoría */}
        <Text style={styles.title}>{advertisement.title}</Text>
        <Text style={styles.category}>{advertisement.category}</Text>

        {/* Precio */}
        {advertisement.price && (
          <Text style={styles.price}>
            ${advertisement.price.toLocaleString('es-AR')}
          </Text>
        )}

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{advertisement.description}</Text>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.address}>{advertisement.location.address}</Text>
          </View>
          {advertisement.distance && (
            <Text style={styles.distance}>
              📍 A {formatDistance(advertisement.distance)} de ti
            </Text>
          )}
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => handleContact('maps', '')}
          >
            <Ionicons name="map" size={20} color={COLORS.white} />
            <Text style={styles.mapButtonText}>Ver en mapa</Text>
          </TouchableOpacity>
        </View>

        {/* Contacto - Solo para Premium */}
        {advertisement.contact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contacto</Text>

            {advertisement.contact.phone && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('phone', advertisement.contact.phone)}
              >
                <Ionicons name="call" size={20} color={COLORS.primary} />
                <Text style={styles.contactButtonText}>
                  {advertisement.contact.phone}
                </Text>
              </TouchableOpacity>
            )}

            {advertisement.contact.phone && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('whatsapp', advertisement.contact.phone)}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={styles.contactButtonText}>WhatsApp</Text>
              </TouchableOpacity>
            )}

            {advertisement.contact.email && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('email', advertisement.contact.email)}
              >
                <Ionicons name="mail" size={20} color={COLORS.primary} />
                <Text style={styles.contactButtonText}>
                  {advertisement.contact.email}
                </Text>
              </TouchableOpacity>
            )}

            {advertisement.contact.website && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('website', advertisement.contact.website)}
              >
                <Ionicons name="globe" size={20} color={COLORS.primary} />
                <Text style={styles.contactButtonText}>
                  {advertisement.contact.website}
                </Text>
              </TouchableOpacity>
            )}

            {/* Redes sociales */}
            {advertisement.contact.social && (
              <View style={styles.socialContainer}>
                {advertisement.contact.social.instagram && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() =>
                      handleContact('instagram', advertisement.contact.social.instagram)
                    }
                  >
                    <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                  </TouchableOpacity>
                )}

                {advertisement.contact.social.facebook && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() =>
                      handleContact('facebook', advertisement.contact.social.facebook)
                    }
                  >
                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  </TouchableOpacity>
                )}

                {advertisement.contact.social.twitter && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() =>
                      handleContact('twitter', advertisement.contact.social.twitter)
                    }
                  >
                    <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="eye" size={20} color={COLORS.gray} />
            <Text style={styles.statText}>{advertisement.views} vistas</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="hand-left" size={20} color={COLORS.gray} />
            <Text style={styles.statText}>{advertisement.clicks} clicks</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.grayLight,
  },
  premiumBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  premiumText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  distance: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  mapButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    gap: 12,
  },
  contactButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default DetailScreen;