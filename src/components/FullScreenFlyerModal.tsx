// src/components/FullScreenFlyerModal.tsx
// REEMPLAZAR TODO EL CONTENIDO DEL ARCHIVO CON ESTE CÓDIGO

import React from 'react';
import {
  Modal,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Advertisement } from '../types';
import { COLORS } from '../constants/colors';
import { incrementClicks } from '../services/api';

interface Props {
  visible: boolean;
  advertisement: Advertisement | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const FullScreenFlyerModal: React.FC<Props> = ({
  visible,
  advertisement,
  onClose,
}) => {
  if (!advertisement) return null;

  const handleActionButton = async () => {
    if (!advertisement.actionButton) return;

    const { type, value, label } = advertisement.actionButton;

    try {
      // Incrementar clicks
      await incrementClicks(advertisement._id);

      let url = '';
      switch (type) {
        case 'whatsapp':
          url = `whatsapp://send?phone=${value}`;
          break;
        case 'maps':
          // Usar la dirección ingresada, no las coordenadas
          const address = advertisement.location.address;
          if (address && address !== 'Córdoba, Argentina') {
            // Si tiene una dirección específica, usarla
            url = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
          } else {
            // Si no, usar coordenadas como fallback
            const [lng, lat] = advertisement.location.coordinates;
            url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          }
          break;
        case 'website':
          url = value.startsWith('http') ? value : `https://${value}`;
          break;
        case 'social':
          url = value.startsWith('http') ? value : `https://${value}`;
          break;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir el enlace');
      }
    } catch (error) {
      console.error('Error al abrir enlace:', error);
      Alert.alert('Error', 'No se pudo realizar la acción');
    }
  };

  const getButtonIcon = () => {
    const type = advertisement.actionButton?.type;
    switch (type) {
      case 'whatsapp':
        return 'logo-whatsapp';
      case 'maps':
        return 'location';
      case 'website':
        return 'globe';
      case 'social':
        return 'share-social';
      default:
        return 'arrow-forward';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Botón de cerrar X */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <View style={styles.closeButtonCircle}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {/* Imagen del flyer */}
        <Image
          source={{ uri: advertisement.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Botón de acción */}
        {advertisement.actionButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleActionButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name={getButtonIcon()}
              size={24}
              color={COLORS.white}
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonText}>
              {advertisement.actionButton.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  image: {
    width: width * 0.95,
    height: height * 0.85,
  },
  actionButton: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonIcon: {
    marginRight: 10,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
});