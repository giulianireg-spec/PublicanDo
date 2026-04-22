// src/constants/guides.ts
// Constantes para el sistema de guías de GuianDo

// Categorías temáticas de guías
export const GUIDE_CATEGORIES = [
  'Gastronómica',
  'Cultural',
  'Naturaleza',
  'Aventura',
  'Romántica',
  'Familiar',
  'Nocturna',
  'Compras',
  'Histórica',
  'Fotogénica',
] as const;

export type GuideCategory = typeof GUIDE_CATEGORIES[number];

// Configuración de cada categoría con icono y color
export const GUIDE_CATEGORY_CONFIG: Record<GuideCategory, { icon: string; color: string; description: string }> = {
  'Gastronómica': {
    icon: '🍽️',
    color: '#FF6B35',
    description: 'Recorridos culinarios y experiencias gastronómicas',
  },
  'Cultural': {
    icon: '🎭',
    color: '#9C27B0',
    description: 'Museos, teatros y patrimonio cultural',
  },
  'Naturaleza': {
    icon: '🌳',
    color: '#4CAF50',
    description: 'Parques, reservas y paisajes naturales',
  },
  'Aventura': {
    icon: '🏔️',
    color: '#FF5722',
    description: 'Actividades al aire libre y deportes',
  },
  'Romántica': {
    icon: '💕',
    color: '#E91E63',
    description: 'Paseos ideales para parejas',
  },
  'Familiar': {
    icon: '👨‍👩‍👧‍👦',
    color: '#2196F3',
    description: 'Actividades para toda la familia',
  },
  'Nocturna': {
    icon: '🌙',
    color: '#673AB7',
    description: 'Vida nocturna y entretenimiento',
  },
  'Compras': {
    icon: '🛍️',
    color: '#00BCD4',
    description: 'Shopping y mercados',
  },
  'Histórica': {
    icon: '🏛️',
    color: '#795548',
    description: 'Patrimonio histórico y arquitectónico',
  },
  'Fotogénica': {
    icon: '📸',
    color: '#607D8B',
    description: 'Los mejores spots para fotos',
  },
};

// Niveles de dificultad
export const GUIDE_DIFFICULTIES = {
  easy: {
    label: 'Fácil',
    icon: '🚶',
    color: '#4CAF50',
    description: 'Recorrido corto, sin exigencia física',
  },
  moderate: {
    label: 'Moderado',
    icon: '🚴',
    color: '#FF9800',
    description: 'Requiere algo de caminata',
  },
  challenging: {
    label: 'Desafiante',
    icon: '🧗',
    color: '#F44336',
    description: 'Recorrido largo o exigente',
  },
} as const;

export type GuideDifficulty = keyof typeof GUIDE_DIFFICULTIES;

// Límites
export const GUIDE_LIMITS = {
  MIN_POINTS: 2,
  MAX_POINTS: 10,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  POINT_NOTES_MAX_LENGTH: 300,
  MIN_ESTIMATED_TIME: 5,      // minutos por punto
  MAX_ESTIMATED_TIME: 480,    // 8 horas por punto
};

// Helper para obtener configuración de categoría
export const getGuideCategoryConfig = (category: string) => {
  return GUIDE_CATEGORY_CONFIG[category as GuideCategory] || {
    icon: '📍',
    color: '#7B2CBF',
    description: '',
  };
};

// Helper para formatear duración
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
};