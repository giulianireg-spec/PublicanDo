// src/components/NativeAdCard.tsx
// Anuncio nativo de AdMob con forma de tarjeta, del mismo tamaño que las tarjetas de lugares
// del feed. En desarrollo usa la unidad de prueba de Google; en producción, la unidad nativa real
// (ver src/config/adsConfig.ts). Si no hay anuncio para mostrar, no ocupa lugar.

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
} from 'react-native-google-mobile-ads';
import { useTheme } from '../context/ThemeContext';
import { ADS_CONFIG } from '../config/adsConfig';

interface NativeAdCardProps {
  style?: StyleProp<ViewStyle>;
  onAdLoaded?: () => void;
  onAdFailed?: (error?: Error) => void;
}

const NativeAdCard: React.FC<NativeAdCardProps> = ({ style, onAdLoaded, onAdFailed }) => {
  const { colors: COLORS } = useTheme();
  const { t } = useTranslation();
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    let loaded: NativeAd | null = null;
    let cancelled = false;
    NativeAd.createForAdRequest(ADS_CONFIG.NATIVE_AD_UNIT_ID)
      .then((ad) => {
        if (cancelled) {
          ad.destroy();
          return;
        }
        loaded = ad;
        setNativeAd(ad);
        onAdLoaded?.();
      })
      .catch((error) => {
        console.log('Anuncio nativo no disponible:', error?.message || error);
        onAdFailed?.(error);
      });
    return () => {
      cancelled = true;
      loaded?.destroy();
    };
  }, []);

  if (!nativeAd) return null;

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: COLORS.white,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    media: { width: '100%', height: 120, backgroundColor: COLORS.grayLight },
    badge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    content: { padding: 10, gap: 4 },
    headline: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    body: { fontSize: 12, color: COLORS.gray },
    advertiser: { fontSize: 11, color: COLORS.gray },
    cta: {
      marginTop: 6,
      backgroundColor: COLORS.primary,
      color: COLORS.onPrimary,
      fontWeight: '700',
      fontSize: 12,
      textAlign: 'center',
      paddingVertical: 8,
      borderRadius: 16,
      overflow: 'hidden',
    },
  });

  return (
    <NativeAdView nativeAd={nativeAd} style={[styles.card, style]}>
      <View>
        <NativeMediaView style={styles.media} resizeMode="cover" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('ads.badge')}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <NativeAsset assetType={NativeAssetType.HEADLINE}>
          <Text style={styles.headline} numberOfLines={2}>{nativeAd.headline}</Text>
        </NativeAsset>
        {!!nativeAd.body && (
          <NativeAsset assetType={NativeAssetType.BODY}>
            <Text style={styles.body} numberOfLines={2}>{nativeAd.body}</Text>
          </NativeAsset>
        )}
        {!!nativeAd.advertiser && (
          <NativeAsset assetType={NativeAssetType.ADVERTISER}>
            <Text style={styles.advertiser} numberOfLines={1}>{nativeAd.advertiser}</Text>
          </NativeAsset>
        )}
        {!!nativeAd.callToAction && (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Text style={styles.cta}>{nativeAd.callToAction}</Text>
          </NativeAsset>
        )}
      </View>
    </NativeAdView>
  );
};

export default NativeAdCard;
