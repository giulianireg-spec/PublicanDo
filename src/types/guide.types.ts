// src/types/guide.types.ts
// Tipos para el sistema de guías de GuianDo

import { GuideCategory, GuideDifficulty } from '../constants/guides';

// Punto de interés en una guía
export interface GuidePoint {
  order: number;
  type: 'place' | 'custom';
  placeId?: string;
  
  // Para puntos personalizados
  customName?: string;
  customDescription?: string;
  customImageUrl?: string;
  
  // Ubicación
  location: {
    address?: string;
    city: string;
    province: string;
    coordinates?: [number, number];
  };
  
  // Datos del lugar vinculado (poblado desde backend)
  place?: {
    _id: string;
    title: string;
    imageUrl: string;
    category: string;
    location: {
      address?: string;
      city: string;
      province: string;
    };
    contactInfo?: any;
  };
  
  notes?: string;
  estimatedTime?: number;
}

// Valoración
export interface GuideRating {
  _id: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
    profileImage?: string;
  };
}

// Guía completa
export interface Guide {
  _id: string;
  
  title: string;
  description: string;
  coverImageUrl: string;
  category: GuideCategory;
  tags: string[];
  
  createdBy: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  
  points: GuidePoint[];
  
  estimatedDuration: number;
  difficulty: GuideDifficulty;
  
  mainLocation: {
    city: string;
    province: string;
  };
  
  // Estadísticas
  viewCount: number;
  saveCount: number;
  completionCount: number;
  
  // Valoraciones
  ratings: GuideRating[];
  averageRating: number;
  ratingCount: number;
  
  // Estado
  status: 'pending' | 'approved' | 'rejected';
  requiresModeration: boolean;
  rejectionReason?: string;
  
  featured: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// Guía resumida (para listados)
export interface GuideSummary {
  _id: string;
  title: string;
  coverImageUrl: string;
  category: GuideCategory;
  tags: string[];
  createdBy: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  mainLocation: {
    city: string;
    province: string;
  };
  estimatedDuration: number;
  difficulty: GuideDifficulty;
  averageRating: number;
  ratingCount: number;
  viewCount: number;
  pointsCount: number;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  createdAt: string;
}

// Datos para crear una guía
export interface CreateGuideData {
  title: string;
  tags?: string[];
  description: string;
  coverImageBase64: string;
  category: GuideCategory;
  difficulty?: GuideDifficulty;
  points: CreateGuidePointData[];
}

// Datos para crear un punto de interés
export interface CreateGuidePointData {
  type: 'place' | 'custom';
  placeId?: string;
  customName?: string;
  customDescription?: string;
  customImageBase64?: string;
  location: {
    address?: string;
    city: string;
    province: string;
    coordinates?: [number, number];
  };
  notes?: string;
  estimatedTime?: number;
}

// Respuesta de listado de guías
export interface GuidesListResponse {
  data: GuideSummary[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

// Filtros para buscar guías
export interface GuideFilters {
  category?: GuideCategory;
  tags?: string[];
  province?: string;
  city?: string;
  sort?: 'recent' | 'popular' | 'rating';
}