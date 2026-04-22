// src/services/api.ts
// ACTUALIZADO: Register con campos opcionales

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Advertisement, CreateAdvertisementData } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.67:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
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
  async (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401 && error.response?.data?.message?.includes('Token')) {
      console.log('🔄 Token expirado, limpiando sesión...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTENTICACIÓN ====================

// ✅ ACTUALIZADO: Acepta optionalData para campos de contacto
export const register = async (
  name: string, 
  email: string, 
  password: string,
  optionalData?: {
    phone?: string;
    whatsapp?: string;
    address?: string;
    instagram?: string;
    facebook?: string;
  }
) => {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role: 'advertiser',
      ...optionalData, // ✅ Spread de datos opcionales
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

// ==================== RECUPERACIÓN DE CONTRASEÑA ====================

export const forgotPassword = async (email: string): Promise<{
  success: boolean;
  message: string;
  devCode?: string;
}> => {
  try {
    console.log('📧 Solicitando código de recuperación para:', email);
    const response = await api.post('/auth/forgot-password', { email });
    console.log('✅ Código enviado');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error en forgot-password:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error enviando código');
  }
};

export const verifyResetCode = async (email: string, code: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    console.log('🔐 Verificando código de recuperación');
    const response = await api.post('/auth/verify-reset-code', { email, code });
    console.log('✅ Código válido');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error verificando código:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Código inválido');
  }
};

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string,
  confirmPassword: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    console.log('🔑 Reseteando contraseña');
    const response = await api.post('/auth/reset-password', {
      email,
      code,
      newPassword,
      confirmPassword,
    });
    console.log('✅ Contraseña actualizada');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error reseteando contraseña:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error cambiando contraseña');
  }
};

// ==================== NOTIFICACIONES ====================

export const savePushToken = async (pushToken: string): Promise<void> => {
  try {
    await api.post('/auth/save-push-token', { pushToken });
    console.log('✅ Push token guardado en el servidor');
  } catch (error: any) {
    console.error('Error guardando push token:', error);
    throw new Error(error.response?.data?.message || 'Error guardando push token');
  }
};

// ==================== PAGOS Y SUSCRIPCIÓN ====================

export const createSubscription = async (planId: string): Promise<{
  initPoint: string;
  preapprovalId: string;
}> => {
  try {
    console.log('💳 Creando suscripción:', planId);
    
    const response = await api.post('/payments/subscription/create', { planId });
    
    console.log('✅ Suscripción creada:', response.data.data);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error creando suscripción:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al crear suscripción');
  }
};

export const getMySubscription = async (): Promise<{
  subscription: any;
  plan: any;
  daysRemaining: number;
  isActive: boolean;
} | null> => {
  try {
    console.log('📋 Obteniendo mi suscripción');
    
    const response = await api.get('/payments/subscription/me');
    
    if (response.data.data) {
      console.log('✅ Suscripción encontrada:', {
        tier: response.data.data.plan?.tier,
        status: response.data.data.subscription?.status,
        daysRemaining: response.data.data.daysRemaining,
      });
      return response.data.data;
    }
    
    console.log('ℹ️ No hay suscripción activa');
    return null;
  } catch (error: any) {
    console.error('❌ Error obteniendo suscripción:', error.response?.data || error.message);
    
    // Si es 404, no hay suscripción (es válido)
    if (error.response?.status === 404) {
      return null;
    }
    
    throw new Error(error.response?.data?.message || 'Error al obtener suscripción');
  }
};

export const cancelSubscription = async (): Promise<void> => {
  try {
    console.log('❌ Cancelando suscripción');
    
    await api.post('/payments/subscription/cancel');
    
    console.log('✅ Suscripción cancelada');
  } catch (error: any) {
    console.error('❌ Error cancelando suscripción:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al cancelar suscripción');
  }
};

export const toggleAutoRenewal = async (enable: boolean): Promise<void> => {
  try {
    console.log(`🔄 ${enable ? 'Activando' : 'Desactivando'} renovación automática`);
    
    await api.post('/payments/subscription/toggle-renewal', { enable });
    
    console.log('✅ Renovación automática actualizada');
  } catch (error: any) {
    console.error('❌ Error actualizando renovación:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al actualizar renovación automática');
  }
};

export const cancelSubscriptionImmediately = async (): Promise<void> => {
  try {
    console.log('🚨 Cancelando suscripción inmediatamente');
    
    await api.post('/payments/subscription/cancel-immediately');
    
    console.log('✅ Suscripción cancelada inmediatamente');
  } catch (error: any) {
    console.error('❌ Error cancelando suscripción:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al cancelar suscripción');
  }
};


// ==================== PUBLICIDADES ====================

export const getAdvertisements = async (
  category?: string,
  latitude?: number,
  longitude?: number,
  limit: number = 20,
  skip: number = 0,
  search?: string,
  province?: string,
  locality?: string,
  subcategory?: string
): Promise<{
  data: Advertisement[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
  };
}> => {
  try {
    const params: any = {
      limit,
      skip,
    };
    
    if (category) params.category = category;
    if (latitude) params.latitude = latitude;
    if (longitude) params.longitude = longitude;
    if (search) params.search = search;
    if (province) params.province = province;
    if (locality) params.locality = locality;
    if (subcategory) params.subcategory = subcategory;

    console.log('📡 Solicitando publicidades con filtros:', params);

    const response = await api.get('/advertisements', { params });
    
    if (Array.isArray(response.data)) {
      console.warn('⚠️ Backend usando formato antiguo (sin paginación), adaptando...');
      return {
        data: response.data,
        pagination: {
          total: response.data.length,
          limit: response.data.length,
          skip: 0,
          hasMore: false,
          page: 1,
          totalPages: 1,
        },
      };
    }
    
    if (!response.data.data || !response.data.pagination) {
      console.error('❌ Estructura de respuesta incorrecta:', response.data);
      throw new Error('Formato de respuesta inválido del servidor');
    }
    
    console.log('✅ Respuesta recibida:', {
      total: response.data.pagination.total,
      recibidos: response.data.data.length,
      hasMore: response.data.pagination.hasMore,
      filtros: { province, locality },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error en getAdvertisements:', error);
    throw new Error(error.response?.data?.message || error.message || 'Error obteniendo publicidades');
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

// ==================== UPLOAD DE IMÁGENES ====================

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

export const uploadMultipleImages = async (base64Images: string[]): Promise<string[]> => {
  try {
    console.log(`📸 Subiendo ${base64Images.length} imágenes...`);
    
    const response = await api.post('/upload/images', {
      images: base64Images,
    });
    
    if (response.data.success && response.data.data.urls) {
      console.log(`✅ ${response.data.data.urls.length} imágenes subidas`);
      return response.data.data.urls;
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error: any) {
    console.error('Error subiendo múltiples imágenes:', error);
    throw new Error(error.response?.data?.message || 'Error al subir las imágenes');
  }
};

export const uploadVideo = async (base64Video: string): Promise<{
  url: string;
  duration: number;
  format: string;
}> => {
  try {
    console.log('🎥 Subiendo video...');
    
    const response = await api.post('/upload/video', {
      video: base64Video,
    });
    
    if (response.data.success && response.data.data.url) {
      console.log('✅ Video subido:', response.data.data.url);
      return {
        url: response.data.data.url,
        duration: response.data.data.duration || 0,
        format: response.data.data.format || 'mp4',
      };
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error: any) {
    console.error('Error subiendo video:', error);
    
    if (error.response?.status === 400 && error.response?.data?.message?.includes('demasiado grande')) {
      throw new Error('El video es demasiado grande. Máximo 50MB permitido.');
    }
    
    throw new Error(error.response?.data?.message || 'Error al subir el video');
  }
};

export const convertVideoToBase64 = async (videoUri: string): Promise<string> => {
  try {
    console.log('🔄 Convirtiendo video a base64...');
    
    // Usar expo-file-system en lugar de FileReader (no disponible en React Native)
    
    // Si es una URI de contenido (content://), copiar a cache primero
    let fileUri = videoUri;
    if (videoUri.startsWith('content://')) {
      const fileName = `temp_video_${Date.now()}.mp4`;
      const destUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: videoUri, to: destUri });
      fileUri = destUri;
    }
    
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });
    
    // Obtener el tamaño del archivo
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    console.log(`✅ Video convertido, tamaño: ${fileInfo.size || 'desconocido'} bytes`);
    
    // Retornar con el prefijo data URI
    return `data:video/mp4;base64,${base64}`;
  } catch (error) {
    console.error('Error convirtiendo video:', error);
    throw new Error('Error al procesar el video');
  }
};

// ==================== ADMINISTRACIÓN ====================

export const getAdminAdvertisements = async (
  status?: 'pending' | 'approved' | 'rejected' | 'all',
  limit: number = 50,
  skip: number = 0
): Promise<{
  data: Advertisement[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}> => {
  try {
    const params: any = { limit, skip };
    if (status) params.status = status;

    const response = await api.get('/admin/advertisements', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error obteniendo publicidades admin');
  }
};

export const getAdminStats = async (): Promise<{
  advertisements: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  users: {
    total: number;
    trusted: number;
  };
  engagement: {
    totalViews: number;
    totalClicks: number;
  };
}> => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas');
  }
};

export const approveAdvertisement = async (id: string): Promise<void> => {
  try {
    await api.patch(`/admin/advertisements/${id}/approve`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error aprobando publicidad');
  }
};

export const rejectAdvertisement = async (id: string, reason: string): Promise<void> => {
  try {
    await api.patch(`/admin/advertisements/${id}/reject`, { reason });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error rechazando publicidad');
  }
};


// ==================== GUÍAS ADMIN ====================

export const getAdminGuides = async (
  status?: string
): Promise<any> => {
  try {
    const params: any = {};
    if (status && status !== "all") params.status = status;
    const response = await api.get("/admin/guides", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error obteniendo guías");
  }
};

export const approveGuide = async (id: string): Promise<void> => {
  try {
    await api.post(`/guides/${id}/moderate`, { action: "approve" });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error aprobando guía");
  }
};

export const rejectGuide = async (id: string, reason: string): Promise<void> => {
  try {
    await api.post(`/guides/${id}/moderate`, { action: "reject", reason });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error rechazando guía");
  }
};

export const toggleFeatureAdmin = async (id: string): Promise<void> => {
  try {
    await api.patch(`/admin/advertisements/${id}/feature`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error cambiando destaque');
  }
};

export const getAllUsers = async (role?: 'advertiser' | 'moderator'): Promise<any[]> => {
  try {
    const params: any = {};
    if (role) params.role = role;

    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error obteniendo usuarios');
  }
};

export const trustUser = async (userId: string): Promise<void> => {
  try {
    await api.patch(`/admin/users/${userId}/trust`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error cambiando estado trusted');
  }
};

export const promoteToModerator = async (userId: string): Promise<void> => {
  try {
    await api.patch(`/admin/users/${userId}/promote-moderator`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error promoviendo usuario');
  }
};

export const demoteToAdvertiser = async (userId: string): Promise<void> => {
  try {
    await api.patch(`/admin/users/${userId}/demote-advertiser`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error degradando usuario');
  }
};


export const createGuideReport = async (guideId: string, reason: string, description: string) => {
  try {
    const response = await api.post('/reports', { guideId, reason, description });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al crear el reporte');
  }
};

export const createReport = async (
  advertisementId: string,
  reason: 'incorrect_info' | 'wrong_category' | 'code_violation' | 'offensive' | 'other',
  description: string
): Promise<void> => {
  try {
    console.log('📢 Creando reporte:', { advertisementId, reason, description: description.substring(0, 30) });
    
    await api.post('/reports', {
      advertisementId,
      reason,
      description: description.trim(),
    });
    
    console.log('✅ Reporte creado exitosamente');
  } catch (error: any) {
    console.error('❌ Error creando reporte:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al crear el reporte');
  }
};

export const getReports = async (
  status?: 'pending' | 'reviewed' | 'dismissed' | 'all',
  limit: number = 50,
  skip: number = 0
): Promise<{
  data: any[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}> => {
  try {
    const params: any = { limit, skip };
    if (status && status !== 'all') {
      params.status = status;
    }

    console.log('📥 Obteniendo reportes:', params);

    const response = await api.get('/reports/admin/list', { params });
    
    console.log('✅ Reportes obtenidos:', {
      total: response.data.pagination.total,
      recibidos: response.data.data.length,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo reportes:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo reportes');
  }
};

export const reviewReport = async (
  reportId: string,
  action: 'disabled' | 'deleted' | 'sent_to_correction' | 'no_action',
  reviewNote?: string
): Promise<void> => {
  try {
    console.log('📝 Revisando reporte:', { reportId, action, reviewNote });

    await api.patch(`/reports/admin/${reportId}/review`, {
      action,
      reviewNote: reviewNote?.trim(),
    });

    console.log('✅ Reporte revisado exitosamente');
  } catch (error: any) {
    console.error('❌ Error revisando reporte:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error revisando reporte');
  }
};

export const dismissReport = async (reportId: string): Promise<void> => {
  try {
    console.log('❌ Descartando reporte:', reportId);

    await api.patch(`/reports/admin/${reportId}/dismiss`);

    console.log('✅ Reporte descartado exitosamente');
  } catch (error: any) {
    console.error('❌ Error descartando reporte:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error descartando reporte');
  }
};

export const getReportStats = async (): Promise<{
  total: number;
  pending: number;
  reviewed: number;
  dismissed: number;
  byReason: Array<{ _id: string; count: number }>;
}> => {
  try {
    console.log('📊 Obteniendo estadísticas de reportes');

    const response = await api.get('/reports/admin/stats');

    console.log('✅ Estadísticas obtenidas:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo stats de reportes:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas');
  }
};

export const banUser = async (
  userId: string,
  duration: string,
  reason: string
): Promise<void> => {
  try {
    console.log('🚫 Baneando usuario:', { userId, duration, reason: reason.substring(0, 30) });

    await api.post(`/admin/users/${userId}/ban`, {
      duration,
      reason: reason.trim(),
    });

    console.log('✅ Usuario baneado exitosamente');
  } catch (error: any) {
    console.error('❌ Error baneando usuario:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al banear usuario');
  }
};

export const unbanUser = async (userId: string): Promise<void> => {
  try {
    console.log('✅ Desbaneando usuario:', userId);

    await api.post(`/admin/users/${userId}/unban`);

    console.log('✅ Usuario desbaneado exitosamente');
  } catch (error: any) {
    console.error('❌ Error desbaneando usuario:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al desbanear usuario');
  }
};

export const getBannedUsers = async (): Promise<any[]> => {
  try {
    console.log('📥 Obteniendo usuarios baneados');

    const response = await api.get('/admin/users/banned');

    console.log('✅ Usuarios baneados obtenidos:', response.data.total);

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo usuarios baneados:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo usuarios baneados');
  }
};

// ==================== GEOLOCALIZACIÓN ====================

export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{
  province: string;
  locality: string;
  fullAddress: string;
}> => {
  try {
    console.log('📍 Reverse geocoding:', { latitude, longitude });

    const response = await api.get('/geo/reverse', {
      params: { lat: latitude, lng: longitude },
    });

    console.log('✅ Reverse geocoding exitoso:', response.data.data);

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error en reverse geocoding:', error);
    
    return {
      province: 'Córdoba',
      locality: 'Córdoba',
      fullAddress: 'Córdoba, Argentina',
    };
  }
};

export const searchLocalities = async (
  query: string,
  province: string
): Promise<string[]> => {
  try {
    if (!query.trim() || query.trim().length < 2) {
      return [];
    }

    console.log('🔍 Buscando localidades:', { query, province });

    const response = await api.get('/geo/autocomplete', {
      params: { query: query.trim(), province },
    });

    const localities = response.data.data.localities || [];

    console.log(`✅ Encontradas ${localities.length} localidades`);

    return localities;
  } catch (error: any) {
    console.error('❌ Error buscando localidades:', error);
    return [];
  }
};

export const getProvinces = async (): Promise<Array<{ id: string; name: string }>> => {
  try {
    console.log('📋 Obteniendo provincias...');

    const response = await api.get('/geo/provinces');

    console.log(`✅ Provincias obtenidas: ${response.data.data.length}`);

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo provincias:', error);
    throw new Error(error.response?.data?.message || 'Error obteniendo provincias');
  }
};

export const getLocalitiesByProvince = async (province: string): Promise<string[]> => {
  try {
    console.log('📍 Obteniendo localidades de:', province);

    const response = await api.get(`/geo/localities/${encodeURIComponent(province)}`);

    const localities = response.data.data.localities || [];

    console.log(`✅ Localidades obtenidas: ${localities.length}`);

    return localities;
  } catch (error: any) {
    console.error('❌ Error obteniendo localidades:', error);
    return [];
  }
};

// ==================== CLIENTES (BUSINESS) ====================

export interface Client {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  color: string;
  owner: string;
  advertisementCount: number;
  totalViews: number;
  totalClicks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientStats {
  totalAds: number;
  totalViews: number;
  totalClicks: number;
  approvedAds: number;
  pendingAds: number;
}

export const getClients = async (): Promise<Client[]> => {
  try {
    console.log('📋 Obteniendo clientes...');
    
    const response = await api.get('/clients');
    
    console.log(`✅ Clientes obtenidos: ${response.data.data.length}`);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo clientes:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo clientes');
  }
};

export const getClientById = async (id: string): Promise<Client & { stats: ClientStats }> => {
  try {
    console.log('📋 Obteniendo cliente:', id);
    
    const response = await api.get(`/clients/${id}`);
    
    console.log('✅ Cliente obtenido:', response.data.data.name);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo cliente:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo cliente');
  }
};

export const createClient = async (data: {
  name: string;
  description?: string;
  logo?: string;
  color?: string;
}): Promise<Client> => {
  try {
    console.log('➕ Creando cliente:', data.name);
    
    const response = await api.post('/clients', data);
    
    console.log('✅ Cliente creado:', response.data.data.name);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error creando cliente:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error creando cliente');
  }
};

export const updateClient = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    logo?: string;
    color?: string;
  }
): Promise<Client> => {
  try {
    console.log('✏️ Actualizando cliente:', id);
    
    const response = await api.put(`/clients/${id}`, data);
    
    console.log('✅ Cliente actualizado:', response.data.data.name);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error actualizando cliente:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error actualizando cliente');
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Eliminando cliente:', id);
    
    await api.delete(`/clients/${id}`);
    
    console.log('✅ Cliente eliminado');
  } catch (error: any) {
    console.error('❌ Error eliminando cliente:', error.response?.data || error.message);
    
    if (error.response?.data?.code === 'CLIENT_HAS_ADVERTISEMENTS') {
      throw new Error('No se puede eliminar el cliente porque tiene publicidades asociadas. Elimine primero las publicidades.');
    }
    
    throw new Error(error.response?.data?.message || 'Error eliminando cliente');
  }
};

export const getClientAdvertisements = async (
  clientId: string,
  status?: 'pending' | 'approved' | 'rejected',
  limit: number = 50,
  skip: number = 0
): Promise<{
  data: Advertisement[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}> => {
  try {
    console.log('📋 Obteniendo publicidades del cliente:', clientId);
    
    const params: any = { limit, skip };
    if (status) params.status = status;
    
    const response = await api.get(`/clients/${clientId}/advertisements`, { params });
    
    console.log(`✅ Publicidades obtenidas: ${response.data.data.length}`);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo publicidades del cliente:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo publicidades');
  }
};

export const getClientsSummary = async (): Promise<{
  clients: Array<Client & {
    totalAds: number;
    activeAds: number;
    totalViews: number;
    totalClicks: number;
  }>;
  totals: {
    totalClients: number;
    totalAds: number;
    totalViews: number;
    totalClicks: number;
  };
}> => {
  try {
    console.log('📊 Obteniendo resumen de clientes...');
    
    const response = await api.get('/clients/stats/summary');
    
    console.log('✅ Resumen obtenido:', {
      clientes: response.data.data.totals.totalClients,
      publicidades: response.data.data.totals.totalAds,
    });
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo resumen:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo resumen');
  }
};

// ==================== ETIQUETAS (BUSINESS) ====================

export interface Tag {
  _id: string;
  name: string;
  color: string;
  owner: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getTags = async (): Promise<{
  tags: Tag[];
  availableColors: string[];
}> => {
  try {
    console.log('🏷️ Obteniendo etiquetas...');
    
    const response = await api.get('/tags');
    
    console.log(`✅ Etiquetas obtenidas: ${response.data.data.length}`);
    
    return {
      tags: response.data.data,
      availableColors: response.data.availableColors,
    };
  } catch (error: any) {
    console.error('❌ Error obteniendo etiquetas:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo etiquetas');
  }
};

export const getTagById = async (id: string): Promise<Tag & { usageCount: number }> => {
  try {
    console.log('🏷️ Obteniendo etiqueta:', id);
    
    const response = await api.get(`/tags/${id}`);
    
    console.log('✅ Etiqueta obtenida:', response.data.data.name);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo etiqueta:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo etiqueta');
  }
};

export const createTag = async (data: {
  name: string;
  color?: string;
}): Promise<Tag> => {
  try {
    console.log('➕ Creando etiqueta:', data.name);
    
    const response = await api.post('/tags', data);
    
    console.log('✅ Etiqueta creada:', response.data.data.name);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error creando etiqueta:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error creando etiqueta');
  }
};

export const updateTag = async (
  id: string,
  data: {
    name?: string;
    color?: string;
  }
): Promise<Tag> => {
  try {
    console.log('✏️ Actualizando etiqueta:', id);
    
    const response = await api.put(`/tags/${id}`, data);
    
    console.log('✅ Etiqueta actualizada:', response.data.data.name);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error actualizando etiqueta:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error actualizando etiqueta');
  }
};

export const deleteTag = async (id: string, removeFromAds: boolean = true): Promise<void> => {
  try {
    console.log('🗑️ Eliminando etiqueta:', id, { removeFromAds });
    
    await api.delete(`/tags/${id}`, { params: { removeFromAds } });
    
    console.log('✅ Etiqueta eliminada');
  } catch (error: any) {
    console.error('❌ Error eliminando etiqueta:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error eliminando etiqueta');
  }
};

export const getAvailableTagColors = async (): Promise<string[]> => {
  try {
    console.log('🎨 Obteniendo colores disponibles...');
    
    const response = await api.get('/tags/colors');
    
    console.log(`✅ Colores obtenidos: ${response.data.data.length}`);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo colores:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo colores');
  }
};

export const bulkAssignTags = async (
  advertisementIds: string[],
  tagIds: string[],
  action: 'add' | 'remove' | 'set' = 'add'
): Promise<{
  modifiedCount: number;
  advertisementIds: string[];
}> => {
  try {
    console.log('🏷️ Asignando etiquetas en lote:', {
      publicidades: advertisementIds.length,
      etiquetas: tagIds.length,
      accion: action,
    });
    
    const response = await api.post('/tags/bulk-assign', {
      advertisementIds,
      tagIds,
      action,
    });
    
    console.log('✅ Etiquetas asignadas:', response.data.data.modifiedCount);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error asignando etiquetas:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error asignando etiquetas');
  }
};

export const getTagAdvertisements = async (
  tagId: string,
  limit: number = 50,
  skip: number = 0
): Promise<{
  data: Advertisement[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}> => {
  try {
    console.log('📋 Obteniendo publicidades con etiqueta:', tagId);
    
    const response = await api.get(`/tags/${tagId}/advertisements`, {
      params: { limit, skip },
    });
    
    console.log(`✅ Publicidades obtenidas: ${response.data.data.length}`);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo publicidades:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error obteniendo publicidades');
  }
};

export default api;
// ==================== NOTIFICACIONES ====================
export const getNotifications = async (limit = 20, skip = 0) => {
  try {
    const response = await api.get(`/notifications?limit=${limit}&skip=${skip}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error obteniendo notificaciones');
  }
};

export const markNotificationRead = async (id: string) => {
  try {
    await api.patch(`/notifications/${id}/read`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error');
  }
};

export const markAllNotificationsRead = async () => {
  try {
    await api.patch('/notifications/read-all');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error');
  }
};
