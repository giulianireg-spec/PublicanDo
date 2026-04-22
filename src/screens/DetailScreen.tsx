// src/screens/DetailScreen.tsx
// CORREGIDO: 
// - Usa nuevo sistema de sesiones para estadísticas
// - 1 vista por sesión
// - Máximo 1 interesado por sesión (cualquier click de contacto)
// - Sin VirtualizedLists warning (FlatList → ScrollView horizontal)

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
  Share,
  StatusBar,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../context/ThemeContext';
import { Advertisement } from '../types';
import { useAuth } from '../context/AuthContext';
import { incrementViews, createReport } from '../services/api';
import { recordView, recordContactClick, endViewSession } from '../services/statsApi';
import RichTextViewer from '../components/RichTextViewer';
import { ReportModal } from '../components/ReportModal';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 1.0;
const HEADER_HEIGHT = 60;

const VISITOR_LOCATION_KEY = '@guiando_last_location';

interface DetailScreenProps {
  route: {
    params: {
      advertisement: Advertisement;
    };
  };
  navigation: any;
}

const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    height: HEADER_HEIGHT,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  logoInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  rightSection: {
    flexDirection: 'row',
    gap: 8,
  },
  topBarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  carouselContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  videoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  videoBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  mediaCounterIcon: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  mediaCounterText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  licenseBadgeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  licenseBadgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  licenseBadgeNumber: {
    fontSize: 12,
    color: '#558B2F',
    marginTop: 2,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  contactGroup: {
    marginBottom: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  linkText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialMediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  locationText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  openMapButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

  const { advertisement } = route.params;
  const { user } = useAuth();
  const hasIncrementedView = useRef(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  
  const [visitorLocation, setVisitorLocation] = useState<{
    province?: string;
    locality?: string;
  } | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    loadVisitorLocation();
    registerViewOnMount();
    
    return () => {
      endViewSession(advertisement._id);
    };
  }, [navigation, advertisement._id]);

  const loadVisitorLocation = async () => {
    try {
      const saved = await AsyncStorage.getItem(VISITOR_LOCATION_KEY);
      if (saved) setVisitorLocation(JSON.parse(saved));
    } catch (error) {
      console.error('Error cargando ubicación:', error);
    }
  };

  const registerViewOnMount = async () => {
    if (!hasIncrementedView.current) {
      try {
        await incrementViews(advertisement._id);
        const location = await AsyncStorage.getItem(VISITOR_LOCATION_KEY);
        const parsedLocation = location ? JSON.parse(location) : undefined;
        await recordView(advertisement._id, parsedLocation);
        hasIncrementedView.current = true;
        console.log('👁️ Vista registrada para:', advertisement._id);
      } catch (error) {
        console.error('Error registrando vista:', error);
      }
    }
  };

  const trackContactClick = async (eventType: 'click_phone' | 'click_whatsapp' | 'click_email' | 'click_location' | 'click_instagram' | 'click_facebook' | 'click_twitter' | 'click_website') => {
    try {
      await recordContactClick(advertisement._id, eventType, visitorLocation || undefined);
    } catch (error) {
      console.error('Error registrando evento:', error);
    }
  };

  const allMedia: Array<{type: string; uri: string}> = [];
  allMedia.push({ type: 'image', uri: advertisement.imageUrl });
  if (advertisement.images?.length) {
    advertisement.images.forEach(imgUrl => allMedia.push({ type: 'image', uri: imgUrl }));
  }
  if (advertisement.videoUrl) {
    allMedia.push({ type: 'video', uri: advertisement.videoUrl });
  }

  const handleCall = (phoneNumber: string) => {
    trackContactClick('click_phone');
    Linking.openURL(`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    trackContactClick('click_whatsapp');
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    Linking.canOpenURL(`whatsapp://send?phone=54${cleanNumber}`).then(supported => {
      if (supported) Linking.openURL(`whatsapp://send?phone=54${cleanNumber}`);
      else Alert.alert('Error', 'WhatsApp no está instalado');
    });
  };

  const handleEmail = (email: string) => {
    trackContactClick('click_email');
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website: string) => {
    trackContactClick('click_website');
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    Linking.openURL(url);
  };

  const handleSocialMedia = (platform: 'instagram' | 'facebook' | 'twitter', username: string) => {
    trackContactClick(`click_${platform}` as any);
    let url = username.startsWith('http') ? username : '';
    if (!url) {
      const clean = username.replace('@', '');
      if (platform === 'instagram') url = `https://instagram.com/${clean}`;
      else if (platform === 'facebook') url = `https://facebook.com/${clean}`;
      else url = `https://x.com/${clean}`;
    }
    Linking.openURL(url);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mirá esta publicidad en GuianDo!\n\n${advertisement.title}\n${advertisement.category}\n\nUbicación: ${advertisement.location.city}, ${advertisement.location.province}`,
        title: advertisement.title,
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  const handleReport = () => {
    if (!user) {
      Alert.alert('Debes iniciar sesión', 'Para reportar necesitas tener una cuenta', [{ text: 'Entendido' }]);
      return;
    }
    setReportModalVisible(true);
  };

  const handleConfirmReport = async (reason: string, description: string) => {
    try {
      await createReport(advertisement._id, reason, description);
      setReportModalVisible(false);
      Toast.show({ type: 'success', text1: '✅ Reporte enviado', text2: 'Será revisado por un moderador', position: 'bottom' });
    } catch (error: any) {
      setReportModalVisible(false);
      if (error.response?.data?.code === 'USER_BANNED') {
        Alert.alert('❌ Acción no permitida', 'No puedes reportar mientras tu cuenta esté suspendida.', [{ text: 'Entendido' }]);
      } else if (error.message.includes('reportado esta publicidad anteriormente')) {
        Toast.show({ type: 'info', text1: '⚠️ Ya reportaste esta publicidad', position: 'bottom' });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'bottom' });
      }
    }
  };

  const handleOpenMap = () => {
    if (!advertisement.location.coordinates) {
      Alert.alert('Error', 'No hay coordenadas GPS disponibles');
      return;
    }
    trackContactClick('click_location');
    const [longitude, latitude] = advertisement.location.coordinates;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
  };

  const formatContactPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    if (cleaned.length === 11) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    return phone;
  };

  // ✅ CORREGIDO: Renderizar item de media sin FlatList
  // Componente para renderizar video con expo-video
  const VideoPlayerItem = ({ uri }: { uri: string }) => {
    const player = useVideoPlayer(uri, player => {
      player.loop = true;
    });
    return (
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    );
  };

  const renderMediaItem = (item: { type: string; uri: string }, index: number) => {
    if (item.type === 'video') {
      return (
        <View key={`media-${index}`} style={styles.mediaContainer}>
          <VideoPlayerItem uri={item.uri} />
          <View style={styles.videoOverlay}>
            <View style={styles.videoBadge}>
              <Ionicons name="play-circle" size={24} color={COLORS.white} />
              <Text style={styles.videoBadgeText}>Video</Text>
            </View>
          </View>
        </View>
      );
    }
    return (
      <View key={`media-${index}`} style={styles.mediaContainer}>
        <Image source={{ uri: item.uri }} style={styles.carouselImage} resizeMode="cover" />
      </View>
    );
  };

  // ✅ CORREGIDO: Handler de scroll para ScrollView horizontal
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (newIndex !== currentMediaIndex) {
      setCurrentMediaIndex(newIndex);
    }
  };

  const isOwner = user?._id === (typeof advertisement.advertiser === 'string' ? advertisement.advertiser : advertisement.advertiser?._id);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <View style={styles.logoInner}>
              <Text style={styles.logoText}>DO</Text>
            </View>
          </View>
        </View>
        <View style={styles.rightSection}>
          {isOwner && (
            <TouchableOpacity style={styles.topBarButton} onPress={() => navigation.navigate('EditAdvertisement', { advertisement })}>
              <Ionicons name="create" size={22} color={COLORS.white} />
            </TouchableOpacity>
          )}
          {!isOwner && user && (
            <TouchableOpacity style={styles.topBarButton} onPress={handleReport}>
              <Ionicons name="flag" size={22} color={COLORS.white} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.topBarButton} onPress={handleShare}>
            <Ionicons name="share-social" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ✅ CORREGIDO: Galería de Medios usando ScrollView horizontal */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
          >
            {allMedia.map((item, index) => renderMediaItem(item, index))}
          </ScrollView>
          
          {allMedia.length > 1 && (
            <>
              <View style={styles.mediaCounterIcon}>
                <Ionicons name="images" size={14} color={COLORS.white} />
                <Text style={styles.mediaCounterText}>{currentMediaIndex + 1}/{allMedia.length}</Text>
              </View>
              <View style={styles.paginationDots}>
                {allMedia.map((_, i) => (
                  <View key={i} style={[styles.paginationDot, i === currentMediaIndex && styles.paginationDotActive]} />
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{advertisement.title}</Text>
            <Text style={styles.category}>{advertisement.category}</Text>
          </View>

          {advertisement.hasProfessionalLicense && (
            <View style={styles.licenseBadgeTop}>
              <Ionicons name="shield-checkmark" size={20} color="#2E7D32" />
              <View style={{ flex: 1 }}>
                <Text style={styles.licenseBadgeTitle}>Profesional Matriculado</Text>
                <Text style={styles.licenseBadgeNumber}>Matrícula N° {advertisement.professionalLicenseNumber}</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            {(!advertisement.richDescription?.trim()) && (
              <Text style={styles.description}>{advertisement.description}</Text>
            )}
            {advertisement.richDescription?.trim() && (
              <RichTextViewer html={advertisement.richDescription} />
            )}
          </View>

          {advertisement.contactInfo && Object.keys(advertisement.contactInfo).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información de Contacto</Text>
              
              {advertisement.contactInfo?.phone && (
                <View style={styles.contactGroup}>
                  <View style={styles.contactHeader}>
                    <Ionicons name="call" size={20} color={COLORS.primary} />
                    <Text style={styles.contactGroupTitle}>Teléfono</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Text style={styles.contactText}>{formatContactPhone(advertisement.contactInfo.phone)}</Text>
                    <TouchableOpacity style={styles.contactButton} onPress={() => handleCall(advertisement.contactInfo!.phone!)}>
                      <Ionicons name="call" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {advertisement.contactInfo?.whatsapp && (
                <View style={styles.contactGroup}>
                  <View style={styles.contactHeader}>
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                    <Text style={styles.contactGroupTitle}>WhatsApp</Text>
                  </View>
                  <TouchableOpacity style={styles.contactItem} onPress={() => handleWhatsApp(advertisement.contactInfo!.whatsapp!)}>
                    <Text style={styles.contactText}>{formatContactPhone(advertisement.contactInfo.whatsapp)}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#25D366" />
                  </TouchableOpacity>
                </View>
              )}

              {advertisement.contactInfo?.email && (
                <View style={styles.contactGroup}>
                  <View style={styles.contactHeader}>
                    <Ionicons name="mail" size={20} color={COLORS.primary} />
                    <Text style={styles.contactGroupTitle}>Email</Text>
                  </View>
                  <TouchableOpacity style={styles.contactItem} onPress={() => handleEmail(advertisement.contactInfo!.email!)}>
                    <Text style={[styles.contactText, styles.linkText]}>{advertisement.contactInfo.email}</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}

              {(advertisement.contactInfo?.instagram || advertisement.contactInfo?.facebook || advertisement.contactInfo?.twitter) && (
                <View style={styles.contactGroup}>
                  <View style={styles.contactHeader}>
                    <Ionicons name="share-social" size={20} color={COLORS.primary} />
                    <Text style={styles.contactGroupTitle}>Redes Sociales</Text>
                  </View>
                  <View style={styles.socialMediaContainer}>
                    {advertisement.contactInfo.facebook && (
                      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2' }]} onPress={() => handleSocialMedia('facebook', advertisement.contactInfo!.facebook!)}>
                        <Ionicons name="logo-facebook" size={24} color={COLORS.white} />
                      </TouchableOpacity>
                    )}
                    {advertisement.contactInfo.instagram && (
                      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#E4405F' }]} onPress={() => handleSocialMedia('instagram', advertisement.contactInfo!.instagram!)}>
                        <Ionicons name="logo-instagram" size={24} color={COLORS.white} />
                      </TouchableOpacity>
                    )}
                    {advertisement.contactInfo.twitter && (
                      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#000' }]} onPress={() => handleSocialMedia('twitter', advertisement.contactInfo!.twitter!)}>
                        <Text style={styles.xLogo}>𝕏</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <View style={{ flex: 1 }}>
                {advertisement.location.address && (
                  <Text style={styles.locationText}>{advertisement.location.address}</Text>
                )}
                <Text style={styles.locationText}>
                  {advertisement.location.city}, {advertisement.location.province}
                </Text>
              </View>
            </View>

            {advertisement.location.coordinates && (
              <TouchableOpacity style={styles.openMapButton} onPress={handleOpenMap}>
                <Ionicons name="navigate" size={20} color={COLORS.white} />
                <Text style={styles.openMapButtonText}>Abrir en Google Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <ReportModal
        visible={reportModalVisible}
        advertisementTitle={advertisement.title}
        onConfirm={handleConfirmReport}
        onCancel={() => setReportModalVisible(false)}
      />
    </View>
  );
};

export default DetailScreen;