// src/services/offlineCache.ts
// Guarda en el teléfono los lugares más cercanos (con su foto principal) para poder
// explorar sin wifi ni datos, por ejemplo en zonas serranas sin señal.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Advertisement } from '../types';
import { getNearbyAdvertisements } from './api';

const STORAGE_KEY = 'offline_nearby_ads_v1';
const IMAGE_DIR = `${FileSystem.documentDirectory}offline-images/`;
const MAX_ADS = 40;
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // se renueva cada 12 h...
const MIN_MOVE_KM = 5; // ...o cuando el usuario se movió más de 5 km

export interface OfflineSnapshot {
  savedAt: number;
  latitude: number;
  longitude: number;
  ads: Advertisement[];
}

export const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Cloudinary: guardamos una versión más liviana de la foto (unos 100 KB).
const lightImageUrl = (url: string) =>
  url.includes('/image/upload/') ? url.replace('/image/upload/', '/image/upload/w_720,q_auto,f_jpg/') : url;

// Nombre de archivo estable por lugar y por foto: si la foto cambia, se descarga de nuevo.
const imageFileName = (ad: Advertisement) => {
  let hash = 0;
  for (let i = 0; i < ad.imageUrl.length; i++) hash = (hash * 31 + ad.imageUrl.charCodeAt(i)) | 0;
  return `${ad._id}-${(hash >>> 0).toString(36)}.jpg`;
};

const readSnapshot = async (): Promise<OfflineSnapshot | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

let refreshing = false;

/** Actualiza la copia sin conexión si está vieja o si el usuario se movió. Nunca lanza errores. */
export const refreshOfflineCache = async (latitude: number, longitude: number): Promise<void> => {
  if (refreshing) return;
  refreshing = true;
  try {
    const current = await readSnapshot();
    if (
      current &&
      Date.now() - current.savedAt < MAX_AGE_MS &&
      distanceKm(current.latitude, current.longitude, latitude, longitude) < MIN_MOVE_KM
    ) {
      return;
    }

    const ads = await getNearbyAdvertisements(latitude, longitude, MAX_ADS);
    await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true }).catch(() => {});

    const keep = new Set<string>();
    const stored: Advertisement[] = [];
    for (const ad of ads) {
      let imageUrl = ad.imageUrl;
      if (ad.imageUrl) {
        const fileName = imageFileName(ad);
        const fileUri = IMAGE_DIR + fileName;
        try {
          const info = await FileSystem.getInfoAsync(fileUri);
          if (!info.exists) {
            const result = await FileSystem.downloadAsync(lightImageUrl(ad.imageUrl), fileUri);
            if (result.status !== 200) throw new Error(`HTTP ${result.status}`);
          }
          keep.add(fileName);
          imageUrl = fileUri;
        } catch {
          await FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
        }
      }
      // Sin conexión solo se muestra la foto principal guardada.
      stored.push({ ...ad, imageUrl, images: [], videoUrl: undefined });
    }

    const files = await FileSystem.readDirectoryAsync(IMAGE_DIR).catch(() => [] as string[]);
    await Promise.all(
      files.filter((f) => !keep.has(f)).map((f) => FileSystem.deleteAsync(IMAGE_DIR + f, { idempotent: true }))
    );

    const snapshot: OfflineSnapshot = { savedAt: Date.now(), latitude, longitude, ads: stored };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    console.log(`📦 Copia sin conexión actualizada: ${stored.length} lugares`);
  } catch (error) {
    console.log('No se pudo actualizar la copia sin conexión:', error);
  } finally {
    refreshing = false;
  }
};

/** Devuelve los lugares guardados, o null si todavía no hay copia. */
export const getOfflineSnapshot = readSnapshot;
