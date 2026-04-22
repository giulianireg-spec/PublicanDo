// src/services/profileApi.ts
// GUIANDO: Sin campos de suscripción

import api from './api';

// Tipos
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
  facebook: string;
  twitter: string;
  interests: string[];
  avatar?: string;
  trusted: boolean;
  // Estadísticas de guías (para futuro)
  guidesCount?: number;
  guidesRating?: number;
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  interests?: string[];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Obtener perfil del usuario
export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/profile');
  return response.data;
};

// Actualizar perfil
export const updateProfile = async (data: UpdateProfileData): Promise<{ message: string; user: UserProfile }> => {
  const response = await api.patch('/profile', data);
  return response.data;
};

// Cambiar contraseña
export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  const response = await api.patch('/profile/change-password', data);
  return response.data;
};

// Subir avatar
export const uploadAvatar = async (base64Image: string): Promise<{ avatarUrl: string }> => {
  const response = await api.post('/profile/avatar', { image: base64Image });
  return response.data;
};