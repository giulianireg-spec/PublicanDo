// src/services/stamps.ts
// Sellos de "lugares visitados". Si no hay conexión, el sello queda pendiente con la
// ubicación y la hora de la visita, y se valida en el servidor cuando vuelve la señal.

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { Advertisement } from '../types';

// Mismos valores que el backend (src/constants/stamps.ts)
export const STAMP_RADIUS_METERS: Record<string, number> = {
  '🌳 Naturaleza': 200,
  '🎉 Eventos': 150,
  '🎯 Experiencias': 100,
  '🛍️ Compras': 60,
  '🎭 Cultura': 40,
  '🍽️ Gastronomía': 25,
  '🏨 Alojamiento': 25,
  '🌙 Vida Nocturna': 25,
};
export const GPS_TOLERANCE_METERS = 15;
export const MAX_GPS_ACCURACY_METERS = 50;

export const stampRadiusFor = (category: string) => STAMP_RADIUS_METERS[category] ?? 40;

export interface Stamp {
  _id: string;
  advertisement: string;
  edition: string;
  title: string;
  category: string;
  subcategory?: string;
  city?: string;
  imageUrl?: string;
  visitedAt: string;
  pending?: boolean; // recolectado sin conexión, falta validarlo
}

export interface CollectPayload {
  advertisementId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  visitedAt: string;
  mocked?: boolean;
}

interface PendingStamp {
  payload: CollectPayload;
  ad: Pick<Advertisement, 'title' | 'category' | 'subcategory' | 'imageUrl'> & { city?: string };
  edition: string;
}

const MY_STAMPS_KEY = 'my_stamps_v1';
const MY_TITLES_KEY = 'my_titles_v1';
const PENDING_KEY = 'pending_stamps_v1';

const readJson = async <T,>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const distanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Edición del sello disponible ahora ('' = lugar común), o null si hoy no se puede recolectar. */
export const currentStampEdition = (ad: Advertisement, at: Date = new Date()): string | null => {
  if (ad.stampWindows?.length) {
    const w = ad.stampWindows.find((x) => at >= new Date(x.start) && at <= new Date(x.end));
    return w ? w.label : null;
  }
  if (ad.category === '🎉 Eventos' && ad.subcategory === 'Festivales') return null;
  return '';
};

/** Próximo período en que se podrá recolectar el sello (para festivales y ferias con fecha). */
export const nextStampWindow = (ad: Advertisement, at: Date = new Date()) =>
  (ad.stampWindows || [])
    .filter((w) => new Date(w.end) >= at)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

/** Sellos del usuario: del servidor si hay conexión (y se guardan), si no la última copia. Incluye los pendientes. */
export const getMyStamps = async (): Promise<Stamp[]> => {
  let stamps: Stamp[];
  try {
    const response = await api.get('/stamps/me', { timeout: 20000 });
    stamps = response.data.data;
    await AsyncStorage.setItem(MY_STAMPS_KEY, JSON.stringify(stamps));
  } catch {
    stamps = await readJson<Stamp[]>(MY_STAMPS_KEY, []);
  }
  const pending = await readJson<PendingStamp[]>(PENDING_KEY, []);
  const pendingStamps: Stamp[] = pending.map((p) => ({
    _id: `pending-${p.payload.advertisementId}-${p.edition}`,
    advertisement: p.payload.advertisementId,
    edition: p.edition,
    title: p.ad.title,
    category: p.ad.category,
    subcategory: p.ad.subcategory,
    city: p.ad.city,
    imageUrl: p.ad.imageUrl,
    visitedAt: p.payload.visitedAt,
    pending: true,
  }));
  return [...pendingStamps, ...stamps];
};

export type CollectResult =
  | { status: 'collected' | 'already'; stamp?: Stamp }
  | { status: 'queued' }
  | { status: 'rejected'; message: string };

const isNetworkError = (error: any) => !error?.response;

/** Envía el sello al servidor; si no hay conexión lo deja pendiente. */
export const collectStamp = async (ad: Advertisement, payload: CollectPayload, edition: string): Promise<CollectResult> => {
  try {
    const response = await api.post('/stamps', payload, { timeout: 20000 });
    const stamp = response.data.stamp as Stamp | undefined;
    if (stamp) {
      const cached = await readJson<Stamp[]>(MY_STAMPS_KEY, []);
      await AsyncStorage.setItem(MY_STAMPS_KEY, JSON.stringify([stamp, ...cached.filter((s) => s._id !== stamp._id)]));
    }
    return { status: response.data.alreadyCollected ? 'already' : 'collected', stamp };
  } catch (error: any) {
    if (isNetworkError(error)) {
      const pending = await readJson<PendingStamp[]>(PENDING_KEY, []);
      const exists = pending.some((p) => p.payload.advertisementId === payload.advertisementId && p.edition === edition);
      if (!exists) {
        pending.push({
          payload,
          edition,
          ad: { title: ad.title, category: ad.category, subcategory: ad.subcategory, imageUrl: ad.imageUrl, city: ad.location?.city },
        });
        await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
      }
      return { status: 'queued' };
    }
    return { status: 'rejected', message: error.response?.data?.message || 'No se pudo recolectar el sello' };
  }
};

let syncing = false;

/** Intenta validar los sellos pendientes. Devuelve cuántos se validaron y cuántos rechazó el servidor. */
export const syncPendingStamps = async (): Promise<{ synced: number; rejected: string[] }> => {
  const result = { synced: 0, rejected: [] as string[] };
  if (syncing) return result;
  syncing = true;
  try {
    const pending = await readJson<PendingStamp[]>(PENDING_KEY, []);
    if (!pending.length) return result;
    const stillPending: PendingStamp[] = [];
    for (const p of pending) {
      try {
        await api.post('/stamps', p.payload, { timeout: 20000 });
        result.synced++;
      } catch (error: any) {
        if (isNetworkError(error)) stillPending.push(p);
        else result.rejected.push(`${p.ad.title}: ${error.response?.data?.message || 'no se pudo validar'}`);
      }
    }
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(stillPending));
    if (result.synced) await getMyStamps(); // refresca la copia local
    return result;
  } finally {
    syncing = false;
  }
};

// ==================== TÍTULOS ====================

export type TitleLevel = 'novato' | 'avezado' | 'experto' | 'supremo' | 'maestro';

export interface CollectorTitle {
  scope: 'locality' | 'province' | 'category';
  category?: string;
  place: string;
  title: string; // "Paisajista experto de Córdoba"
  level: TitleLevel;
  percent: number;
  visited: number;
  total: number;
  nextLevel: TitleLevel | null;
  missingForNext: number;
}

export const TITLE_LEVEL_LABELS: Record<TitleLevel, string> = {
  novato: 'Novato',
  avezado: 'Avezado',
  experto: 'Experto',
  supremo: 'Supremo',
  maestro: 'Maestro',
};

/** Títulos del usuario (del servidor si hay conexión; si no, la última copia guardada). */
export const getMyTitles = async (): Promise<CollectorTitle[]> => {
  try {
    const response = await api.get('/stamps/titles', { timeout: 20000 });
    const titles: CollectorTitle[] = response.data.data;
    await AsyncStorage.setItem(MY_TITLES_KEY, JSON.stringify(titles));
    return titles;
  } catch {
    return readJson<CollectorTitle[]>(MY_TITLES_KEY, []);
  }
};
