// src/components/NativeAdCard.tsx
// VERSIÓN ESTABLE: Usa BannerAd en lugar de NativeAd (más estable)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Importar BannerAd que es más estable que NativeAd
import { 
  BannerAd, 
  BannerAdSize, 
  TestIds,
} from 'react-native-google-mobile-ads';

// IDs de unidades de anuncios
const AD_UNIT_IDS = {
  // Producción - Banner (necesitás crear una unidad Banner en AdMob)
  BANNER_ANDROID: 'ca-app-pub-8688791084507015/XXXX', // Reemplazar con tu ID de Banner
  BANNER_IOS: 'ca-app-pub-8688791084507015/XXXX',
  
  // Test IDs de Google (siempre funcionan)
  TEST_BANNER: TestIds.BANNER,
};

// ✅ Usar test ads en desarrollo
const USE_TEST_ADS = true; // Cambiar a false cuando tengas Banner ID real

const getBannerAdUnitId = (): string => {
  if (USE_TEST_ADS) {
    return TestIds.BANNER;
  }
  return Platform.OS === 'ios' ? AD_UNIT_IDS.BANNER_IOS : AD_UNIT_IDS.BANNER_ANDROID;
};

interface NativeAdCardProps {
  onAdLoaded?: () => void;
  onAdFailed?: (error?: Error) => void;
}

const NativeAdCard: React.FC<NativeAdCardProps> = ({ onAdLoaded, onAdFailed }) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8E0FF',
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E0FF',
    minHeight: 200,
  },
  adBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(138, 43, 226, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  adWrapper: {
    marginTop: 30, // Espacio para el badge
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.grayLight,
  },
});


  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const adUnitId = getBannerAdUnitId();

  const handleAdLoaded = () => {
    console.log('✅ Banner Ad cargado exitosamente');
    setIsLoaded(true);
    setHasError(false);
    onAdLoaded?.();
  };

  const handleAdFailedToLoad = (error: any) => {
    console.log('❌ Banner Ad falló:', error?.message || error);
    setHasError(true);
    setIsLoaded(false);
    onAdFailed?.(error);
  };

  // Si hay error, mostrar placeholder discreto
  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.adBadge}>
          <Ionicons name="megaphone" size={10} color={COLORS.white} />
          <Text style={styles.adBadgeText}>Publicidad</Text>
        </View>
        <View style={styles.placeholderContent}>
          <Ionicons name="megaphone-outline" size={24} color={COLORS.grayLight} />
          <Text style={styles.placeholderText}>Espacio publicitario</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Badge de publicidad */}
      <View style={styles.adBadge}>
        <Ionicons name="megaphone" size={10} color={COLORS.white} />
        <Text style={styles.adBadgeText}>Publicidad</Text>
      </View>

      {/* Banner Ad */}
      <View style={styles.adWrapper}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.MEDIUM_RECTANGLE} // 300x250 - buen tamaño para feed
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailedToLoad}
        />
      </View>
    </View>
  );
};

export default NativeAdCard;