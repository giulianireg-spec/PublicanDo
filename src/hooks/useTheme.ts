// src/hooks/useTheme.ts
// Hook para modo nocturno automático (20:00 - 06:00)

import { useState, useEffect, useCallback } from 'react';
import { LIGHT_THEME, DARK_THEME, ThemeColors } from '../constants/colors';

interface UseThemeReturn {
  theme: ThemeColors;
  isDarkMode: boolean;
  toggleTheme: () => void; // Para override manual si se necesita
}

export const useTheme = (): UseThemeReturn => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const currentHour = new Date().getHours();
    return currentHour >= 20 || currentHour < 6;
  });
  
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  // Verificar la hora cada minuto
  useEffect(() => {
    const checkTime = () => {
      if (manualOverride !== null) return; // Si hay override manual, no cambiar
      
      const currentHour = new Date().getHours();
      const shouldBeDark = currentHour >= 20 || currentHour < 6;
      
      if (shouldBeDark !== isDarkMode) {
        setIsDarkMode(shouldBeDark);
      }
    };

    // Verificar cada minuto
    const interval = setInterval(checkTime, 60000);
    
    // Verificar inmediatamente
    checkTime();

    return () => clearInterval(interval);
  }, [isDarkMode, manualOverride]);

  // Toggle manual (para futuro si se quiere dar control al usuario)
  const toggleTheme = useCallback(() => {
    setManualOverride(prev => {
      if (prev === null) {
        // Primera vez: toggle desde el estado actual
        return !isDarkMode;
      }
      // Ya hay override: toggle
      return !prev;
    });
    setIsDarkMode(prev => !prev);
  }, [isDarkMode]);

  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return {
    theme,
    isDarkMode,
    toggleTheme,
  };
};

// Hook simplificado que solo devuelve los colores actuales
export const useColors = (): ThemeColors => {
  const { theme } = useTheme();
  return theme;
};

export default useTheme;