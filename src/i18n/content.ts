// src/i18n/content.ts
// Contenido traducido que viene del servidor: las fichas y guías cargadas por GuianDo traen
// `translations.en/pt`. Si no hay traducción para el idioma actual se muestra el español.

import { currentLanguage } from './index';
import type { Advertisement } from '../types';

type AdText = Pick<Advertisement, 'description' | 'richDescription' | 'translations'>;
type GuideText = {
  title: string;
  description?: string;
  translations?: Record<string, { title?: string; description?: string; notes?: Record<string, string> }>;
};

const tr = <T>(translations?: Record<string, T>) => {
  const lang = currentLanguage();
  return lang === 'es' ? undefined : translations?.[lang];
};

/** Ficha con descripción en el idioma de la app (el nombre propio queda igual). */
export const localizedAd = <T extends AdText>(ad: T): T => {
  const t = tr(ad.translations);
  if (!t) return ad;
  return { ...ad, description: t.description || ad.description, richDescription: t.richDescription || ad.richDescription };
};

export const guideTitle = (guide: GuideText) => tr(guide.translations)?.title || guide.title;
export const guideDescription = (guide: GuideText) => tr(guide.translations)?.description || guide.description || '';
/** Nota de una parada según su número de orden. */
export const guideNote = (guide: GuideText, order: number, fallback?: string) =>
  tr(guide.translations)?.notes?.[String(order)] || fallback || '';
