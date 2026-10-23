// src/services/reviewPrompt.ts
// Pide una reseña en Google Play (diálogo nativo, sin salir de la app) en un momento positivo:
// después de recolectar sellos. Se pide como mucho una vez cada 120 días; además Google
// limita por su cuenta cuántas veces se muestra el diálogo.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const STORAGE_KEY = 'review_prompt_v1';
const STAMPS_BEFORE_ASKING = 2;
const MIN_DAYS_BETWEEN_ASKS = 120;

interface PromptState {
  stampsSinceAsk: number;
  lastAskedAt: number | null;
}

const readState = async (): Promise<PromptState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { stampsSinceAsk: 0, lastAskedAt: null };
  } catch {
    return { stampsSinceAsk: 0, lastAskedAt: null };
  }
};

/** Llamar cada vez que el usuario recolecta un sello nuevo. Nunca lanza errores. */
export const onStampCollected = async (): Promise<void> => {
  try {
    const state = await readState();
    state.stampsSinceAsk += 1;
    const daysSinceAsk = state.lastAskedAt ? (Date.now() - state.lastAskedAt) / 86400000 : Infinity;

    if (state.stampsSinceAsk >= STAMPS_BEFORE_ASKING && daysSinceAsk >= MIN_DAYS_BETWEEN_ASKS && (await StoreReview.hasAction())) {
      state.stampsSinceAsk = 0;
      state.lastAskedAt = Date.now();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Dejar que se vea primero el aviso de "¡Sello recolectado!"
      setTimeout(() => {
        StoreReview.requestReview().catch(() => {});
      }, 2500);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.log('No se pudo evaluar el pedido de reseña:', error);
  }
};
