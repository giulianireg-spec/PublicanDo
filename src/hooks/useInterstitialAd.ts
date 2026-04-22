// src/hooks/useInterstitialAd.ts
// ACTUALIZADO: Con manejo de errores para evitar crash

import { useState, useEffect, useCallback } from 'react';
import { ADS_CONFIG } from '../config/adsConfig';

// Intentar importar el módulo, si falla, usar mock
let InterstitialAd: any = null;
let AdEventType: any = null;

try {
  const adsModule = require('react-native-google-mobile-ads');
  InterstitialAd = adsModule.InterstitialAd;
  AdEventType = adsModule.AdEventType;
} catch (error) {
  console.warn('⚠️ Google Mobile Ads no disponible:', error);
}

interface UseInterstitialAdReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  show: () => Promise<void>;
  load: () => void;
}

export const useInterstitialAd = (): UseInterstitialAdReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [interstitial, setInterstitial] = useState<any>(null);

  const adUnitId = ADS_CONFIG.INTERSTITIAL_AD_UNIT_ID;

  useEffect(() => {
    // Si el módulo no está disponible, no hacer nada
    if (!InterstitialAd || !AdEventType) {
      console.warn('⚠️ Interstitial Ads no disponible - módulo no cargado');
      return;
    }

    try {
      const ad = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        console.log('✅ Interstitial ad cargado');
        setIsLoaded(true);
        setIsLoading(false);
      });

      const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (err: Error) => {
        console.error('❌ Error cargando interstitial:', err);
        setError(err);
        setIsLoading(false);
        setIsLoaded(false);
      });

      const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('📢 Interstitial cerrado, precargando siguiente...');
        setIsLoaded(false);
        setTimeout(() => {
          try {
            ad.load();
          } catch (e) {
            console.warn('⚠️ Error precargando ad:', e);
          }
        }, 1000);
      });

      setInterstitial(ad);
      setIsLoading(true);
      ad.load();

      return () => {
        unsubscribeLoaded();
        unsubscribeError();
        unsubscribeClosed();
      };
    } catch (err) {
      console.warn('⚠️ Error inicializando Interstitial Ad:', err);
      setError(err as Error);
    }
  }, [adUnitId]);

  const load = useCallback(() => {
    if (!interstitial) return;
    try {
      setIsLoading(true);
      setError(null);
      interstitial.load();
    } catch (err) {
      console.warn('⚠️ Error cargando interstitial:', err);
      setIsLoading(false);
    }
  }, [interstitial]);

  const show = useCallback(async (): Promise<void> => {
    if (!interstitial || !isLoaded) {
      console.warn('⚠️ Interstitial no disponible o no cargado');
      return;
    }
    try {
      await interstitial.show();
    } catch (err) {
      console.warn('⚠️ Error mostrando interstitial:', err);
      setError(err as Error);
    }
  }, [interstitial, isLoaded]);

  return { isLoaded, isLoading, error, show, load };
};