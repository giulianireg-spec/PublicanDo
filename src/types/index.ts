// src/types/index.ts
// REEMPLAZAR TODO EL CONTENIDO DEL ARCHIVO CON ESTE CÓDIGO

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'viewer' | 'advertiser' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface ActionButton {
  type: 'whatsapp' | 'maps' | 'website' | 'social';
  value: string;
  label: string;
}

export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface Advertisement {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  location: Location;
  isPremium: boolean;
  actionButton?: ActionButton; // Solo para standard
  contact?: Contact; // Solo para premium
  price?: number;
  views: number;
  clicks: number;
  advertiser: string | User;
  isActive: boolean;
  featured: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  distance?: number; // Calculado en el cliente
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
}

export interface CreateAdvertisementData {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  isPremium: boolean;
  actionButton?: ActionButton;
  contact?: Contact;
  price?: number;
}