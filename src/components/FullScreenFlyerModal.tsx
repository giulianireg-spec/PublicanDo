// src/components/FullScreenFlyerModal.tsx
// CORREGIDO: Pasa coordenadas al ContactInfoOverlay para abrir mapas correctamente

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Advertisement } from '../types';
import { useTheme } from '../context/ThemeContext';
import { incrementClicks, createReport } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ReportModal } from './ReportModal';
import { ContactInfoOverlay } from './ContactInfoOverlay';
import MediaCarousel from './MediaCarousel';

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
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtons: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  reportButton: {
    zIndex: 10,
  },
  reportButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
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
  imageContainer: {
    width: width * 0.95,
    height: height * 0.85,
    position: 'relative',
    overflow: 'hidden',
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

  const { user } = useAuth();
  const [reportModalVisible, setReportModalVisible] = useState(false);

  if (!advertisement) return null;

  const handleActionButton = async () => {
    if (!advertisement.actionButton) return;

    const { type, value } = advertisement.actionButton;

    try {
      await incrementClicks(advertisement._id);

      let url = '';
      switch (type) {
        case 'whatsapp':
          url = `whatsapp://send?phone=${value}`;
          break;
        case 'maps':
          const address = advertisement.location.address;
          if (address && address !== 'Córdoba, Argentina') {
            url = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
          } else if (advertisement.location.coordinates) {
            const [lng, lat] = advertisement.location.coordinates;
            url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          } else {
            // Fallback a localidad/provincia
            const query = `${advertisement.location.city}, ${advertisement.location.province}, Argentina`;
            url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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
      Alert.alert('Error', 'No se pudo realizar la acción');
    }
  };

  const handleReport = () => {
    if (!user) {
      onClose();
      setTimeout(() => {
        Toast.show({
          type: 'error',
          text1: 'Debes iniciar sesión',
          text2: 'Para reportar debes tener una cuenta',
          position: 'bottom',
          visibilityTime: 4000,
        });
      }, 300);
      return;
    }
    setReportModalVisible(true);
  };

  const handleConfirmReport = async (reason: string, description: string) => {
    try {
      await createReport(advertisement._id, reason, description);
      setReportModalVisible(false);
      onClose();
      
      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: '✅ Reporte enviado',
          text2: 'Será revisado por un moderador',
          position: 'bottom',
          visibilityTime: 4000,
        });
      }, 300);
    } catch (error: any) {
      if (error.response?.data?.code === 'USER_BANNED') {
        setReportModalVisible(false);
        onClose();
        const banInfo = error.response.data.banInfo;
        setTimeout(() => {
          Alert.alert(
            '❌ Acción no permitida',
            `No puedes reportar publicidades mientras tu cuenta esté suspendida.\n\nRazón: ${banInfo.reason}`,
            [{ text: 'Entendido' }]
          );
        }, 300);
      } else if (error.message.includes('reportado esta publicidad anteriormente')) {
        setReportModalVisible(false);
        onClose();
        setTimeout(() => {
          Toast.show({
            type: 'info',
            text1: '⚠️ Ya reportaste esta publicidad',
            text2: 'No puedes reportar la misma publicidad dos veces',
            position: 'bottom',
            visibilityTime: 4000,
          });
        }, 300);
      } else {
        setReportModalVisible(false);
        setTimeout(() => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message || 'No se pudo enviar el reporte',
            position: 'bottom',
            visibilityTime: 4000,
          });
        }, 300);
      }
    }
  };

  const getButtonIcon = () => {
    const type = advertisement.actionButton?.type;
    switch (type) {
      case 'whatsapp': return 'logo-whatsapp';
      case 'maps': return 'location';
      case 'website': return 'globe';
      case 'social': return 'share-social';
      default: return 'arrow-forward';
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Botones superiores */}
          <View style={styles.topButtons}>
            <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
              <View style={styles.reportButtonCircle}>
                <Ionicons name="flag" size={24} color={COLORS.white} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeButtonCircle}>
                <Ionicons name="close" size={28} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>

          {/* MediaCarousel */}
          <View style={styles.imageContainer}>
            <MediaCarousel
              imageUrl={advertisement.imageUrl}
              images={advertisement.images}
              videoUrl={advertisement.videoUrl}
              height={width * 0.95 * 1.4}
            />

            {/* ✅ CORREGIDO: Pasar coordenadas al ContactInfoOverlay */}
            <ContactInfoOverlay
              contactInfo={advertisement.contactInfo}
              address={advertisement.location?.address}
              locality={advertisement.location?.city}
              province={advertisement.location?.province}
              coordinates={advertisement.location?.coordinates as [number, number] | undefined}
              hasProfessionalLicense={advertisement.hasProfessionalLicense}
              professionalLicenseNumber={advertisement.professionalLicenseNumber}
            />
          </View>

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

      <ReportModal
        visible={reportModalVisible}
        advertisementTitle={advertisement.title}
        onConfirm={handleConfirmReport}
        onCancel={() => setReportModalVisible(false)}
      />
    </>
  );
};

