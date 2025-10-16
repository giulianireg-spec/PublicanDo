// src/context/AuthContext.tsx
// REEMPLAZAR TODO EL CONTENIDO DEL ARCHIVO CON ESTE CÓDIGO

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import { User, AuthContextType } from '../types';
import { login as apiLogin, register as apiRegister, googleAuth, getMe } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Configuración de Google Sign-In
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: 'TU_WEB_CLIENT_ID', // Reemplaza con tu Web Client ID
    androidClientId: 'TU_ANDROID_CLIENT_ID', // Reemplaza con tu Android Client ID
  });

  // Verificar sesión al iniciar
  useEffect(() => {
    checkAuth();
  }, []);

  // Manejar respuesta de Google
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken) {
        handleGoogleAuth(authentication.idToken);
      }
    }
  }, [response]);

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verificar que el token aún sea válido
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (error) {
          // Token inválido, limpiar
          await logout();
        }
      }
    } catch (error) {
      console.error('Error verificando auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      
      // LOG PARA DEBUG
      console.log('📡 Respuesta completa del login:', JSON.stringify(response, null, 2));
      
      // Manejar diferentes formatos de respuesta
      let token = response.token || response.data?.token;
      let userData = response.user || response.data?.user;
      
      if (token && userData) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
      } else {
        console.error('❌ Respuesta sin token o user:', response);
        throw new Error('Respuesta del servidor inválida. Verifica que el backend esté corriendo.');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiRegister(name, email, password);
      
      if (response.token && response.user) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
    } catch (error: any) {
      console.error('Error en register:', error);
      throw error;
    }
  };

  const handleGoogleAuth = async (idToken: string) => {
    try {
      const response = await googleAuth(idToken);
      
      if (response.token && response.user) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
    } catch (error: any) {
      console.error('Error en Google auth:', error);
      throw error;
    }
  };

  const googleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      console.error('Error en Google Sign-In:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};