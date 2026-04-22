// src/constants/colors.ts
// Paleta de Colores GuianDo - Con modo nocturno automático (20:00hs)

// Colores base (compartidos entre modos)
const BASE_COLORS = {
  // Colores principales
  primary: '#7B2CBF',        // Violeta intenso
  secondary: '#FF6B35',      // Naranja Coral
  accent: '#FFD166',         // Amarillo brillante

  // Variantes de violeta
  primaryLight: '#9D4EDD',
  primaryDark: '#5A189A',

  // Variantes de naranja
  secondaryLight: '#FF8C61',
  secondaryDark: '#E85A2A',

  // Estados
  success: '#06D6A0',
  error: '#EF476F',
  warning: '#FFD166',
  info: '#118AB2',

  // Transparencias
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Tema claro (antes de las 20:00)
export const LIGHT_THEME = {
  ...BASE_COLORS,
  background: '#F9F9F9',     // Blanco humo
  text: '#1E1E1E',           // Gris carbón
  textSecondary: '#6C757D',  // Gris medio
  
  // Grises y neutros
  gray: '#6C757D',
  grayLight: '#E0E0E0',
  grayDark: '#495057',

  // Fondos
  white: '#FFFFFF',
  cardBackground: '#FFFFFF',
  inputBackground: '#F3F4F6',

  // Sombras
  shadow: 'rgba(123, 44, 191, 0.2)',
};

// Tema oscuro (a partir de las 20:00)
export const DARK_THEME = {
  ...BASE_COLORS,
  background: '#0D0D0D',     // Negro profundo
  text: '#F5F5F5',           // Blanco suave
  textSecondary: '#A0A0A0',  // Gris claro
  
  // Grises y neutros
  gray: '#888888',
  grayLight: '#333333',
  grayDark: '#CCCCCC',

  // Fondos
  white: '#1A1A1A',
  cardBackground: '#1A1A1A',
  inputBackground: '#252525',

  // Sombras
  shadow: 'rgba(0, 0, 0, 0.4)',
};

// Función para determinar si es modo nocturno
export const isNightMode = (): boolean => {
  const currentHour = new Date().getHours();
  return currentHour >= 20 || currentHour < 6; // 20:00 a 06:00
};

// Obtener el tema actual basado en la hora
export const getTheme = () => {
  return isNightMode() ? DARK_THEME : LIGHT_THEME;
};

// Export por defecto (para compatibilidad con código existente)
// Se actualizará dinámicamente según la hora
export const COLORS = {
  // Colores principales (siempre iguales)
  primary: '#7B2CBF',
  secondary: '#FF6B35',
  accent: '#FFD166',
  primaryLight: '#9D4EDD',
  primaryDark: '#5A189A',
  secondaryLight: '#FF8C61',
  secondaryDark: '#E85A2A',
  
  // Estados (siempre iguales)
  success: '#06D6A0',
  error: '#EF476F',
  warning: '#FFD166',
  info: '#118AB2',
  
  // Colores dinámicos - usar getTheme() para obtener los correctos
  // Estos son los valores por defecto (tema claro)
  background: '#F9F9F9',
  text: '#1E1E1E',
  textSecondary: '#6C757D',
  gray: '#6C757D',
  grayLight: '#E0E0E0',
  grayDark: '#495057',
  white: '#FFFFFF',
  cardBackground: '#FFFFFF',
  inputBackground: '#F3F4F6',
  shadow: 'rgba(123, 44, 191, 0.2)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Tipo para los colores
export type ThemeColors = typeof LIGHT_THEME;