// src/config/adsConfig.ts
// Configuración centralizada de Google AdMob

import { Platform } from 'react-native';

// ==================== CONFIGURACIÓN ====================
// Usa ads de prueba en desarrollo, producción en release
const USE_TEST_ADS = __DEV__;

// ==================== IDs DE PRODUCCIÓN ====================
const PRODUCTION_IDS = {
  android: {
    appId: 'ca-app-pub-8688791084507015~6469064442',
    nativeAdUnit: 'ca-app-pub-8688791084507015/5600609400',
    interstitialAdUnit: 'ca-app-pub-8688791084507015/2974446069',
  },
  ios: {
    appId: 'ca-app-pub-8688791084507015~XXXXXXXXXX',
    nativeAdUnit: 'ca-app-pub-8688791084507015/XXXXXXXXXX',
    interstitialAdUnit: 'ca-app-pub-8688791084507015/XXXXXXXXXX',
  },
};

// ==================== IDs DE PRUEBA (Google) ====================
const TEST_IDS = {
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713',
    nativeAdUnit: 'ca-app-pub-3940256099942544/2247696110',
    interstitialAdUnit: 'ca-app-pub-3940256099942544/1033173712',
  },
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458002511',
    nativeAdUnit: 'ca-app-pub-3940256099942544/3986624511',
    interstitialAdUnit: 'ca-app-pub-3940256099942544/4411468910',
  },
};

// ==================== EXPORTS ====================
const currentIds = USE_TEST_ADS ? TEST_IDS : PRODUCTION_IDS;
const platformIds = Platform.OS === 'ios' ? currentIds.ios : currentIds.android;

export const ADS_CONFIG = {
  APP_ID: platformIds.appId,
  NATIVE_AD_UNIT_ID: platformIds.nativeAdUnit,
  INTERSTITIAL_AD_UNIT_ID: platformIds.interstitialAdUnit,
  ADS_EVERY_N_ITEMS: 20,
  USE_TEST_ADS,
  IS_DEV: __DEV__,
};

export default ADS_CONFIG;