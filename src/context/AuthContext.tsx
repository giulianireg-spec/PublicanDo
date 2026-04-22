// src/context/AuthContext.tsx
// GUIANDO: Sin referencias a suscripciones

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import { User } from '../types';
import { login as apiLogin, register as apiRegister, googleAuth, getMe, savePushToken } from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notificationService';

// Configurar Google Sign-In al cargar el módulo
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  offlineAccess: true,
  scopes: ['profile', 'email'],
});

// Tipo completo del contexto
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, optionalData?: any) => Promise<void>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔐 Google Sign-In configurado con Web Client ID');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        try {
          const userData = await getMe();
          setUser(userData);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          
          await registerAndSavePushToken();
        } catch (error) {
          await logout();
        }
      }
    } catch (error) {
      console.error('Error verificando auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerAndSavePushToken = async () => {
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        console.log('📱 Guardando push token en servidor...');
        await savePushToken(pushToken);
        console.log('✅ Push token guardado exitosamente');
      }
    } catch (error) {
      console.error('Error registrando push token:', error);
    }
  };

  // Función para refrescar datos del usuario desde el backend
  const refreshUser = async () => {
    try {
      console.log('🔄 Refrescando datos del usuario...');
      
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        console.warn('⚠️ No hay token para refrescar usuario');
        return;
      }

      const userData = await getMe();
      
      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Usuario refrescado:', {
          email: userData.email,
          role: userData.role,
          trusted: userData.trusted,
        });
      }
    } catch (error) {
      console.error('❌ Error refrescando usuario:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      
      const tokenValue = response.token;
      const userData = response._id ? response : response.user;
      
      if (tokenValue && userData) {
        await AsyncStorage.setItem('token', tokenValue);
        setToken(tokenValue);
        
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        try {
          const fullProfile = await getMe();
          if (fullProfile) {
            await AsyncStorage.setItem('user', JSON.stringify(fullProfile));
            setUser(fullProfile);
            console.log('✅ Perfil completo cargado:', { 
              email: fullProfile.email, 
              avatar: fullProfile.avatar ? '✅' : '❌' 
            });
          }
        } catch (profileError) {
          console.warn('⚠️ No se pudo cargar perfil completo:', profileError);
        }
        
        await registerAndSavePushToken();
        
        console.log('✅ Usuario autenticado:', { email: userData.email, role: userData.role });
      } else {
        console.error('❌ Respuesta sin token o user:', response);
        throw new Error('Respuesta del servidor inválida.');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, optionalData?: any) => {
    try {
      const response = await apiRegister(name, email, password, optionalData);
      
      const tokenValue = response.token;
      const userData = response._id ? response : response.user;
      
      if (tokenValue && userData) {
        await AsyncStorage.setItem('token', tokenValue);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
        
        await registerAndSavePushToken();
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
    } catch (error: any) {
      console.error('Error en register:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) {
        console.warn('⚠️ No hay usuario para actualizar');
        return;
      }

      const updatedUser = { ...user, ...userData } as User;
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      console.log('✅ Usuario actualizado en contexto:', {
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar ? '✅ Con avatar' : '❌ Sin avatar',
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  };

  const googleSignIn = async () => {
    try {
      console.log('🚀 Iniciando Google Sign-In nativo...');
      
      // Verificar si Google Play Services está disponible
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Iniciar sesión con Google
      const userInfo = await GoogleSignin.signIn();
      
      console.log('✅ Google Sign-In exitoso:', {
        email: userInfo.data?.user.email,
        name: userInfo.data?.user.name,
      });

      // Obtener el ID token
      const idToken = userInfo.data?.idToken;
      
      if (!idToken) {
        throw new Error('No se recibió ID token de Google');
      }

      console.log('🔑 ID Token recibido, enviando al backend...');
      
      // Enviar al backend
      const response = await googleAuth(idToken);
      
      const tokenValue = response.token;
      const userData = response._id ? response : response.user;
      const isNewUser = response.isNewUser;
      
      if (tokenValue && userData) {
        await AsyncStorage.setItem('token', tokenValue);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
        
        await registerAndSavePushToken();
        
        if (isNewUser) {
          console.log('✅ Nuevo usuario Google registrado:', { email: userData.email });
          Toast.show({
            type: 'success',
            text1: '✅ Cuenta creada',
            text2: `Bienvenido a GuianDo, ${userData.name}!`,
            position: 'bottom',
            visibilityTime: 3000,
          });
        } else {
          console.log('✅ Usuario Google existente logueado:', { email: userData.email });
          Toast.show({
            type: 'success',
            text1: '👋 Bienvenido de vuelta',
            text2: `Hola de nuevo, ${userData.name}!`,
            position: 'bottom',
            visibilityTime: 3000,
          });
        }
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
      
    } catch (error: any) {
      console.error('❌ Error en Google Sign-In:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('🚪 Usuario canceló el inicio de sesión');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('⏳ Inicio de sesión en progreso');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('❌ Google Play Services no disponible');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Google Play Services no está disponible',
          position: 'bottom',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'No se pudo iniciar sesión con Google',
          position: 'bottom',
        });
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      // Cerrar sesión de Google también
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
        // Ignorar error si no estaba logueado con Google
      }
      
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
    updateUser,
    refreshUser,
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