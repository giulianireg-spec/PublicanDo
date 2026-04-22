// src/context/ThemeContext.tsx
// Sistema de temas GuianDo - Claro / Oscuro / Automático (por hora)

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { LIGHT_THEME, DARK_THEME, ThemeColors } from '../constants/colors';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeContextType {
  colors: ThemeColors;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = '@guiando_theme_mode';
const NIGHT_START = 20; // 20:00
const NIGHT_END = 6;    // 06:00

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isNightHour = (): boolean => {
  const hour = new Date().getHours();
  return hour >= NIGHT_START || hour < NIGHT_END;
};

const resolveIsDark = (mode: ThemeMode): boolean => {
  switch (mode) {
    case 'dark':  return true;
    case 'light': return false;
    case 'auto':  return isNightHour();
  }
};

// ─── Contexto ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isDark, setIsDark] = useState<boolean>(resolveIsDark('auto'));

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'auto' || stored === 'light' || stored === 'dark') {
          setThemeModeState(stored);
          setIsDark(resolveIsDark(stored));
        }
      } catch (error) {
        console.warn('Error cargando preferencia de tema:', error);
      }
    };
    loadStoredTheme();
  }, []);

  // En modo "auto": actualizar automáticamente cuando cambia la hora
  useEffect(() => {
    if (themeMode !== 'auto') return;

    // Calcular cuántos ms faltan para la próxima hora
    const now = new Date();
    const msUntilNextHour =
      (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;

    const timeout = setTimeout(() => {
      setIsDark(resolveIsDark('auto'));
    }, msUntilNextHour);

    return () => clearTimeout(timeout);
  }, [themeMode, isDark]);

  // Cambiar tema y persistir
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
      setIsDark(resolveIsDark(mode));
    } catch (error) {
      console.warn('Error guardando preferencia de tema:', error);
    }
  }, []);

  const colors: ThemeColors = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ colors, themeMode, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};
