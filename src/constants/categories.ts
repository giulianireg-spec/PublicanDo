// src/constants/categories.ts
// Categorías y subcategorías para GuianDo

export interface SubCategory {
  id: string;
  name: string;
  emoji?: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  emoji: string;
  fullName: string; // emoji + nombre
  subcategories: SubCategory[];
}

// Configuración completa de categorías
export const CATEGORIES_CONFIG: CategoryConfig[] = [
  {
    id: 'gastronomia',
    name: 'Gastronomía',
    emoji: '🍽️',
    fullName: '🍽️ Gastronomía',
    subcategories: [
      { id: 'restaurantes', name: 'Restaurantes' },
      { id: 'cafes', name: 'Cafés' },
      { id: 'bares', name: 'Bares' },
      { id: 'takeaway', name: 'Take Away' },
      { id: 'heladerias', name: 'Heladerías' },
      { id: 'panaderias', name: 'Panaderías' },
    ],
  },
  {
    id: 'alojamiento',
    name: 'Alojamiento',
    emoji: '🏨',
    fullName: '🏨 Alojamiento',
    subcategories: [
      { id: 'hoteles', name: 'Hoteles' },
      { id: 'hostels', name: 'Hostels' },
      { id: 'cabanas', name: 'Cabañas' },
      { id: 'aparthotel', name: 'Apart Hotel' },
      { id: 'camping', name: 'Camping' },
    ],
  },
  {
    id: 'cultura',
    name: 'Cultura',
    emoji: '🎭',
    fullName: '🎭 Cultura',
    subcategories: [
      { id: 'museos', name: 'Museos' },
      { id: 'teatros', name: 'Teatros' },
      { id: 'edificios_historicos', name: 'Edificios Históricos' },
    ],
  },
  {
    id: 'eventos',
    name: 'Eventos',
    emoji: '🎉',
    fullName: '🎉 Eventos',
    subcategories: [
      { id: 'festivales', name: 'Festivales' },
      { id: 'ferias', name: 'Ferias' },
    ],
  },
  {
    id: 'naturaleza',
    name: 'Naturaleza',
    emoji: '🌳',
    fullName: '🌳 Naturaleza',
    subcategories: [],
  },
  {
    id: 'experiencias',
    name: 'Experiencias',
    emoji: '🎯',
    fullName: '🎯 Experiencias',
    subcategories: [],
  },
  {
    id: 'compras',
    name: 'Compras',
    emoji: '🛍️',
    fullName: '🛍️ Compras',
    subcategories: [],
  },
  {
    id: 'vida_nocturna',
    name: 'Vida Nocturna',
    emoji: '🌙',
    fullName: '🌙 Vida Nocturna',
    subcategories: [],
  },
];

// Array simple de categorías (para selectores y validaciones)
export const CATEGORIES = CATEGORIES_CONFIG.map(c => c.fullName);

// Categorías que requieren matrícula profesional (array vacío por ahora, ninguna la requiere)
export const PROFESSIONAL_CATEGORIES: string[] = [];

// Obtener configuración de categoría por nombre completo
export const getCategoryConfig = (fullName: string): CategoryConfig | undefined => {
  return CATEGORIES_CONFIG.find(c => c.fullName === fullName);
};

// Obtener configuración de categoría por ID
export const getCategoryById = (id: string): CategoryConfig | undefined => {
  return CATEGORIES_CONFIG.find(c => c.id === id);
};

// Obtener subcategorías de una categoría (devuelve array de strings con los nombres)
export const getSubcategories = (categoryFullName: string): string[] => {
  const config = getCategoryConfig(categoryFullName);
  return config?.subcategories.map(sub => sub.name) || [];
};

// Obtener subcategorías completas (con id y name)
export const getSubcategoriesConfig = (categoryFullName: string): SubCategory[] => {
  const config = getCategoryConfig(categoryFullName);
  return config?.subcategories || [];
};

// Verificar si una categoría tiene subcategorías
export const hasSubcategories = (categoryFullName: string): boolean => {
  const config = getCategoryConfig(categoryFullName);
  return (config?.subcategories.length || 0) > 0;
};

// Helper para obtener solo el nombre sin emoji
export const getCategoryName = (category: string): string => {
  return category.replace(/^[^\s]+\s/, '');
};

// Helper para obtener solo el emoji
export const getCategoryEmoji = (category: string): string => {
  const match = category.match(/^[^\s]+/);
  return match ? match[0] : '📌';
};

// Tipo para categorías
export type Category = typeof CATEGORIES[number];

// Categorías que pueden tener eventos con fechas específicas
export const EVENT_CATEGORIES = [
  '🎉 Eventos',
];

// Todas las subcategorías en un array plano (útil para filtros)
export const ALL_SUBCATEGORIES = CATEGORIES_CONFIG.flatMap(c => 
  c.subcategories.map(sub => ({
    ...sub,
    categoryId: c.id,
    categoryName: c.fullName,
  }))
);