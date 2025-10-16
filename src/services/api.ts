// src/services/api.ts
// REEMPLAZAR TODO EL CONTENIDO DEL ARCHIVO CON ESTE CÓDIGO

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Advertisement, CreateAdvertisementData } from '../types';

// ⚠️ IMPORTANTE: Cambia esta IP por la de tu PC si es necesaria
const API_URL = 'http://192.168.100.58:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ========== AUTENTICACIÓN ==========

export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role: 'advertiser', // Por defecto todos son anunciantes
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error en el registro');
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error en el login');
  }
};

export const googleAuth = async (idToken: string) => {
  try {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error en autenticación con Google');
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error obteniendo usuario');
  }
};

// ========== PUBLICIDADES ==========

export const getAdvertisements = async (
  category?: string,
  latitude?: number,
  longitude?: number
): Promise<Advertisement[]> => {
  try {
    const params: any = {};
    if (category) params.category = category;
    if (latitude) params.latitude = latitude;
    if (longitude) params.longitude = longitude;

    const response = await api.get('/advertisements', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error obteniendo publicidades');
  }
};

export const getAdvertisementById = async (id: string): Promise<Advertisement> => {
  try {
    const response = await api.get(`/advertisements/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error obteniendo publicidad');
  }
};

export const createAdvertisement = async (data: CreateAdvertisementData): Promise<Advertisement> => {
  try {
    const response = await api.post('/advertisements', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error creando publicidad');
  }
};

export const updateAdvertisement = async (
  id: string,
  data: Partial<CreateAdvertisementData>
): Promise<Advertisement> => {
  try {
    const response = await api.put(`/advertisements/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error actualizando publicidad');
  }
};

export const deleteAdvertisement = async (id: string): Promise<void> => {
  try {
    await api.delete(`/advertisements/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar publicidad');
  }
};

export const deletePermanently = async (id: string): Promise<void> => {
  try {
    await api.delete(`/advertisements/${id}/permanent`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar permanentemente');
  }
};

export const reactivateAdvertisement = async (id: string): Promise<void> => {
  try {
    await api.patch(`/advertisements/${id}/reactivate`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al reactivar publicidad');
  }
};

export const getMyAdvertisements = async (): Promise<Advertisement[]> => {
  try {
    const response = await api.get('/advertisements/my/list');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error obteniendo mis publicidades');
  }
};

export const incrementViews = async (id: string): Promise<void> => {
  try {
    await api.post(`/advertisements/${id}/view`);
  } catch (error: any) {
    console.error('Error incrementando vistas:', error);
  }
};

export const incrementClicks = async (id: string): Promise<void> => {
  try {
    await api.post(`/advertisements/${id}/click`);
  } catch (error: any) {
    console.error('Error incrementando clicks:', error);
  }
};

// ========== UPLOAD DE IMÁGENES ==========

export const uploadImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await api.post('/upload/image', {
      image: base64Image,
    });
    
    if (response.data.success && response.data.data.url) {
      return response.data.data.url;
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error: any) {
    console.error('Error subiendo imagen:', error);
    throw new Error(error.response?.data?.message || 'Error al subir la imagen');
  }
};

export default api;