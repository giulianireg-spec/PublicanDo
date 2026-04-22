// src/types/index.ts
// GUIANDO: Sin suscripciones, roles simplificados

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'advertiser' | 'admin' | 'moderator' | 'viewer' | 'seeder';
  avatar?: string;
  trusted?: boolean;
  // Campos de perfil
  phone?: string;
  whatsapp?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  interests?: string[];
  // Estadísticas de guías (para futuro)
  guidesCount?: number;
  guidesRating?: number;
  createdAt: string;
}

export interface AuthContextType {
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

export interface Advertisement {
  _id: string;
  title: string;
  description: string;
  richDescription?: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  location: {
    type?: 'Point';
    coordinates?: [number, number];
    address?: string;
    city: string;
    province: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  schedule?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  priceRange?: 'low' | 'medium' | 'high' | 'premium';
  views: number;
  clicks: number;
  advertiser: string | User;
  isActive: boolean;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  // Campos seeder
  isSeeded?: boolean;
  seederType?: 'content' | null;
  claimedBy?: string;
  claimedAt?: string;
  claimVerified?: boolean;
}

export interface CreateAdvertisementData {
  title: string;
  description: string;
  richDescription?: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  location: {
    province: string;
    city: string;
    address?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  schedule?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  priceRange?: 'low' | 'medium' | 'high' | 'premium';
  startDate?: string;
  endDate?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

export interface Report {
  _id: string;
  advertisement: Advertisement;
  reporter: User;
  reason: 'incorrect_info' | 'wrong_category' | 'code_violation' | 'offensive' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewNote?: string;
  actionTaken?: 'disabled' | 'deleted' | 'sent_to_correction' | 'no_action';
  createdAt: string;
  updatedAt: string;
}

export interface BannedUser {
  _id: string;
  name: string;
  email: string;
  banInfo: {
    isBanned: boolean;
    reason: string;
    bannedAt: string;
    expiresAt?: string;
    isPermanent: boolean;
  };
}

export interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  base64?: string;
  cloudinaryUrl?: string;
}

export interface UploadProgress {
  current: number;
  total: number;
  percentage: number;
}

// ==================== TIPOS PARA GUÍAS (FUTURO) ====================

export interface GuidePointOfInterest {
  _id?: string;
  name: string;
  description: string; // máx 100 caracteres
  advertisementId?: string; // link opcional a publicación existente
  order: number;
}

export interface Guide {
  _id: string;
  title: string;
  description: string; // máx 200 caracteres
  category: string;
  coverImage?: string;
  pointsOfInterest: GuidePointOfInterest[]; // máx 10
  author: string | User;
  rating: number;
  ratingCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuideData {
  title: string;
  description: string;
  category: string;
  coverImage?: string;
  pointsOfInterest: Omit<GuidePointOfInterest, '_id'>[];
}