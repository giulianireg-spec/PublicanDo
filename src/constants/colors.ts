// src/constants/colors.ts
// Paleta de Colores GuianDo - Verde lima sobre blanco (claro) y sobre negro (nocturno)
//
// Reglas de uso:
// - primary / secondary: rellenos (botones, encabezados, chips activos). Siempre con texto `onPrimary` encima.
// - primaryText: texto e íconos de marca sobre el fondo de la pantalla (en claro, un lima más oscuro para que se lea).
// - onPrimary: texto e íconos encima de un relleno lima. Negro en ambos modos: el blanco no se lee sobre lima.

// Colores compartidos entre modos
const BASE_COLORS = {
  accent: '#FACC15',         // Amarillo (estrellas, destacados)

  // Estados
  success: '#16A34A',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#0EA5E9',

  // Texto sobre lima
  onPrimary: '#0A0A0A',

  // Transparencias
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Tema claro: lima y blanco
export const LIGHT_THEME = {
  ...BASE_COLORS,
  primary: '#84CC16',        // Verde lima
  primaryText: '#4D7C0F',    // Lima oscuro para texto/íconos sobre blanco
  primaryLight: '#D9F99D',
  primaryDark: '#4D7C0F',
  secondary: '#84CC16',
  secondaryLight: '#BEF264',
  secondaryDark: '#65A30D',

  background: '#FFFFFF',
  text: '#0A0A0A',
  textSecondary: '#525252',

  // Grises y neutros
  gray: '#737373',
  grayLight: '#E5E5E5',
  grayDark: '#404040',

  // Fondos
  white: '#FFFFFF',
  cardBackground: '#FFFFFF',
  inputBackground: '#F5F5F5',

  // Sombras
  shadow: 'rgba(77, 124, 15, 0.18)',
};

// Tema oscuro: lima y negro
export const DARK_THEME = {
  ...BASE_COLORS,
  primary: '#A3E635',        // Verde lima brillante
  primaryText: '#A3E635',
  primaryLight: '#BEF264',
  primaryDark: '#65A30D',
  secondary: '#A3E635',
  secondaryLight: '#D9F99D',
  secondaryDark: '#84CC16',

  background: '#0A0A0A',
  text: '#F5F5F5',
  textSecondary: '#A3A3A3',

  // Grises y neutros
  gray: '#8A8A8A',
  grayLight: '#2A2A2A',
  grayDark: '#D4D4D4',

  // Fondos
  white: '#161616',
  cardBackground: '#161616',
  inputBackground: '#1F1F1F',

  // Sombras
  shadow: 'rgba(0, 0, 0, 0.5)',
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

// Export por defecto (para compatibilidad con código existente): valores del tema claro.
// Las pantallas usan useTheme() para obtener los del modo activo.
export const COLORS = { ...LIGHT_THEME };

// Tipo para los colores
export type ThemeColors = typeof LIGHT_THEME;
