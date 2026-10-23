// src/i18n/labels.ts
// Traducción de valores que vienen en español desde el servidor: categorías, subcategorías
// y títulos de coleccionista. Las categorías se guardan como "🌳 Naturaleza" en la base.

import i18n from './index';
import { CATEGORIES_CONFIG } from '../constants/categories';
import type { CollectorTitle } from '../services/stamps';

const byFullName = new Map(CATEGORIES_CONFIG.map((c) => [c.fullName, c]));

/** "🌳 Naturaleza" → "🌳 Nature" según el idioma actual. */
export const categoryLabel = (fullName?: string, withEmoji = true): string => {
  if (!fullName) return '';
  const config = byFullName.get(fullName);
  if (!config) return fullName;
  const name = i18n.t(`categories.${config.id}`, { defaultValue: config.name });
  return withEmoji ? `${config.emoji} ${name}` : name;
};

/** Nombre de subcategoría ("Museos") traducido. */
export const subcategoryLabel = (category: string | undefined, sub?: string | null): string => {
  if (!sub) return '';
  const config = category ? byFullName.get(category) : undefined;
  const found = config?.subcategories.find((s) => s.name === sub) ?? CATEGORIES_CONFIG.flatMap((c) => c.subcategories).find((s) => s.name === sub);
  return found ? i18n.t(`subcategories.${found.id}`, { defaultValue: sub }) : sub;
};

/** Título de coleccionista en el idioma actual ("Paisajista experto de Córdoba"). */
export const collectorTitleText = (t: Pick<CollectorTitle, 'scope' | 'category' | 'place' | 'level'>): string => {
  const config = t.category ? byFullName.get(t.category) : undefined;
  const nounKey = t.scope === 'locality' ? 'locality' : t.scope === 'province' ? 'province' : config?.id ?? 'province';
  const noun = i18n.t(`titles.nouns.${nounKey}`);
  if (t.level === 'maestro') return i18n.t('titles.masterFormat', { noun, nounLower: noun.toLowerCase(), place: t.place });
  return i18n.t('titles.format', { noun, nounLower: noun.toLowerCase(), level: i18n.t(`titles.levelsInline.${t.level}`), place: t.place });
};

// Categorías de guías: se guardan en español ("Gastronómica"); la clave es el nombre sin tildes
const guideKey = (category: string) => category.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** "Gastronómica" → "Food" según el idioma actual. */
export const guideCategoryLabel = (category?: string): string =>
  category ? i18n.t(`guideCategories.${guideKey(category)}`, { defaultValue: category }) : '';

/** Dificultad de una guía (easy/moderate/challenging). */
export const difficultyLabel = (difficulty?: string): string =>
  difficulty ? i18n.t(`guideDifficulties.${difficulty}`, { defaultValue: difficulty }) : '';
