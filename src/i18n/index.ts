// src/i18n/index.ts
// Idiomas de la app: español (base), inglés y portugués. Se usa el idioma elegido en el perfil
// o, si no hay elección, el del teléfono (pt → portugués, en → inglés, el resto → español).

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from './locales/es';
import en from './locales/en';
import pt from './locales/pt';

export type AppLanguage = 'es' | 'en' | 'pt';
export const LANGUAGES: { code: AppLanguage; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
];

const STORAGE_KEY = 'app_language_v1';

const deviceLanguage = (): AppLanguage => {
  const code = Localization.getLocales()[0]?.languageCode ?? 'es';
  return code === 'pt' ? 'pt' : code === 'en' ? 'en' : 'es';
};

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en }, pt: { translation: pt } },
  lng: deviceLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  returnNull: false,
});

// Aplicar la elección guardada (si el usuario eligió un idioma en el perfil)
AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    if (saved === 'es' || saved === 'en' || saved === 'pt') i18n.changeLanguage(saved);
  })
  .catch(() => {});

export const setAppLanguage = async (lang: AppLanguage) => {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {}
};

export const currentLanguage = (): AppLanguage => (i18n.language as AppLanguage) || 'es';

/** Locale para fechas y números según el idioma de la app. */
export const dateLocale = () => ({ es: 'es-AR', en: 'en-US', pt: 'pt-BR' })[currentLanguage()];

export default i18n;
