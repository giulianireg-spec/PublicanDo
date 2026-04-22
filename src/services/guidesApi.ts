// src/services/guidesApi.ts
// Servicios de API para el sistema de guías de GuianDo

import api from './api';
import { 
  Guide, 
  GuideSummary, 
  GuidesListResponse, 
  CreateGuideData,
  GuideFilters,
} from '../types/guide.types';

// ==================== CREAR GUÍA ====================
export const createGuide = async (data: CreateGuideData): Promise<{ message: string; guide: Guide }> => {
  const response = await api.post('/guides', data);
  return response.data;
};

// ==================== LISTAR GUÍAS ====================
export const getGuides = async (
  filters: GuideFilters = {},
  limit = 20,
  skip = 0
): Promise<GuidesListResponse> => {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.province) params.append('province', filters.province);
  if (filters.city) params.append('city', filters.city);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
  params.append('limit', limit.toString());
  params.append('skip', skip.toString());

  const response = await api.get(`/guides?${params.toString()}`);
  return response.data;
};

// ==================== OBTENER GUÍA POR ID ====================
export const getGuideById = async (id: string): Promise<Guide> => {
  const response = await api.get(`/guides/${id}`);
  return response.data;
};

// ==================== MIS GUÍAS ====================
export const getSavedGuides = async (): Promise<GuideSummary[]> => {
  const response = await api.get('/guides/user/saved');
  return response.data.data;
};

export const getMyGuides = async (): Promise<GuideSummary[]> => {
  const response = await api.get('/guides/user/mine');
  return response.data;
};

// ==================== GUÍAS DESTACADAS ====================
export const getFeaturedGuides = async (province?: string, limit = 5): Promise<GuideSummary[]> => {
  const params = new URLSearchParams();
  if (province) params.append('province', province);
  params.append('limit', limit.toString());
  
  const response = await api.get(`/guides/featured/list?${params.toString()}`);
  return response.data;
};

// ==================== VALORAR GUÍA ====================
export const rateGuide = async (
  guideId: string, 
  rating: number, 
  comment?: string
): Promise<{ message: string; averageRating: number; ratingCount: number }> => {
  const response = await api.post(`/guides/${guideId}/rate`, { rating, comment });
  return response.data;
};

// ==================== GUARDAR/DESGUARDAR GUÍA ====================
export const toggleSaveGuide = async (
  guideId: string
): Promise<{ message: string; saved: boolean; saveCount: number }> => {
  const response = await api.post(`/guides/${guideId}/save`);
  return response.data;
};

// ==================== ELIMINAR GUÍA ====================
// ==================== ACTUALIZAR GUÍA ====================
export const updateGuide = async (
  guideId: string,
  data: any
): Promise<{ message: string; guide: any }> => {
  const response = await api.put(`/guides/${guideId}`, data);
  return response.data;
};

export const deleteGuide = async (guideId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/guides/${guideId}`);
  return response.data;
};

// ==================== MODERAR GUÍA (admin) ====================
export const moderateGuide = async (
  guideId: string,
  action: 'approve' | 'reject',
  reason?: string
): Promise<{ message: string; guide: Guide }> => {
  const response = await api.post(`/guides/${guideId}/moderate`, { action, reason });
  return response.data;
};

// ==================== BUSCAR LUGARES PARA AGREGAR A GUÍA ====================
export const searchPlacesForGuide = async (
  query: string,
  province?: string,
  city?: string,
  limit = 10
): Promise<any[]> => {
  const params = new URLSearchParams();
  params.append('search', query);
  if (province) params.append('province', province);
  if (city) params.append('city', city);
  params.append('limit', limit.toString());
  
  // Usa el endpoint existente de advertisements con status approved
  const response = await api.get(`/advertisements?${params.toString()}`);
  return response.data.data || [];
};