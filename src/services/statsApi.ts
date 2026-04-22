// src/services/statsApi.ts
// CORREGIDO: 
// - Bug #2/#3: Máximo 1 interesado por vista (sesión)
// - Visitante por provincia: 1 vez por usuario único por publicación
// - Usuarios FREE también generan stats

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.58:3000/api';

// Tipos
export type EventType = 
  | 'view'
  | 'click_phone'
  | 'click_whatsapp'
  | 'click_email'
  | 'click_location'
  | 'click_instagram'
  | 'click_facebook'
  | 'click_twitter'
  | 'click_website';

export interface VisitorLocation {
  province?: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
}

export interface StatsSummary {
  totalViews: number;
  totalInterested: number;
  conversionRate: number;
  byEventType: Record<EventType, number>;
  byDayOfWeek: Record<number, number>;
  byHour: Record<number, number>;
  byProvince: Record<string, number>;
}

export interface DailyTrend {
  date: string;
  views: number;
  interested: number;
}

export interface AdvertisementStats {
  advertisementId: string;
  advertisementTitle: string;
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  summary: StatsSummary;
  dailyTrend: DailyTrend[];
}

export interface UserStatsSummary {
  totalAds: number;
  totalViews: number;
  totalInterested: number;
  averageConversionRate: number;
  advertisements: Array<{
    _id: string;
    title: string;
    views: number;
    interested: number;
    conversionRate: number;
  }>;
}

// ==================== NUEVO SISTEMA DE CACHE ====================

// Cache para controlar eventos por SESIÓN de visualización
// Key: `${visitorId}-${advertisementId}-${sessionId}`
// Cada vez que el usuario ABRE una publicación, se genera un nuevo sessionId
// Dentro de esa sesión: máximo 1 view + máximo 1 interested (cualquier click de contacto)

interface SessionCache {
  sessionId: string;
  hasView: boolean;
  hasInterested: boolean;
  timestamp: number;
}

const sessionCacheMap = new Map<string, SessionCache>();

// Cache para visitantes únicos por provincia (1 vez por usuario por publicación)
// Key: `province-${visitorId}-${advertisementId}`
const provinceVisitorCache = new Map<string, number>();

// TTL para limpiar cache (30 minutos)
const SESSION_TTL = 30 * 60 * 1000;
const PROVINCE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

// Generar ID único para el visitante (persistente por dispositivo)
let visitorId: string | null = null;

const getVisitorId = async (): Promise<string> => {
  if (visitorId) return visitorId;
  
  try {
    let storedId = await AsyncStorage.getItem('@guiando_visitor_id');
    if (!storedId) {
      storedId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem('@guiando_visitor_id', storedId);
    }
    visitorId = storedId;
    return storedId;
  } catch (error) {
    // Fallback si AsyncStorage falla
    return `temp_${Date.now()}`;
  }
};

// Generar session ID (nuevo cada vez que se abre una publicación)
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

// Variable global para la sesión actual por publicación
const currentSessions = new Map<string, string>(); // advertisementId -> sessionId

/**
 * Iniciar nueva sesión de visualización para una publicación
 * Llamar esto cuando el usuario ABRE el detalle de una publicación
 */
export const startViewSession = (advertisementId: string): string => {
  const sessionId = generateSessionId();
  currentSessions.set(advertisementId, sessionId);
  console.log(`📊 Nueva sesión iniciada para ${advertisementId}: ${sessionId}`);
  return sessionId;
};

/**
 * Finalizar sesión de visualización
 * Llamar esto cuando el usuario CIERRA el detalle
 */
export const endViewSession = (advertisementId: string): void => {
  currentSessions.delete(advertisementId);
  console.log(`📊 Sesión finalizada para ${advertisementId}`);
};

/**
 * Obtener o crear sesión actual para una publicación
 */
const getOrCreateSession = (advertisementId: string): string => {
  let sessionId = currentSessions.get(advertisementId);
  if (!sessionId) {
    sessionId = generateSessionId();
    currentSessions.set(advertisementId, sessionId);
  }
  return sessionId;
};

/**
 * Verificar si se puede registrar un evento en la sesión actual
 */
const canRecordEventInSession = async (
  advertisementId: string,
  eventType: EventType
): Promise<{ canRecord: boolean; sessionId: string; isNewProvinceVisitor: boolean }> => {
  const visitorIdValue = await getVisitorId();
  const sessionId = getOrCreateSession(advertisementId);
  const cacheKey = `${visitorIdValue}-${advertisementId}-${sessionId}`;
  
  // Limpiar cache viejo
  cleanOldCache();
  
  let session = sessionCacheMap.get(cacheKey);
  
  if (!session) {
    // Nueva sesión
    session = {
      sessionId,
      hasView: false,
      hasInterested: false,
      timestamp: Date.now(),
    };
    sessionCacheMap.set(cacheKey, session);
  }
  
  // Verificar si la sesión expiró (30 min)
  if (Date.now() - session.timestamp > SESSION_TTL) {
    // Sesión expirada, crear nueva
    session = {
      sessionId: generateSessionId(),
      hasView: false,
      hasInterested: false,
      timestamp: Date.now(),
    };
    sessionCacheMap.set(cacheKey, session);
    currentSessions.set(advertisementId, session.sessionId);
  }
  
  let canRecord = false;
  
  if (eventType === 'view') {
    // Solo permitir 1 view por sesión
    if (!session.hasView) {
      session.hasView = true;
      canRecord = true;
    }
  } else {
    // Cualquier click de contacto = 1 "interesado" máximo por sesión
    if (!session.hasInterested) {
      session.hasInterested = true;
      canRecord = true;
    }
  }
  
  // Verificar si es nuevo visitante por provincia
  const provinceKey = `province-${visitorIdValue}-${advertisementId}`;
  const isNewProvinceVisitor = !provinceVisitorCache.has(provinceKey);
  
  if (isNewProvinceVisitor && canRecord) {
    provinceVisitorCache.set(provinceKey, Date.now());
  }
  
  sessionCacheMap.set(cacheKey, session);
  
  return { canRecord, sessionId: session.sessionId, isNewProvinceVisitor };
};

/**
 * Limpiar entradas de cache viejas
 */
const cleanOldCache = (): void => {
  const now = Date.now();
  
  // Limpiar sesiones viejas
  for (const [key, session] of sessionCacheMap.entries()) {
    if (now - session.timestamp > SESSION_TTL) {
      sessionCacheMap.delete(key);
    }
  }
  
  // Limpiar cache de provincia
  for (const [key, timestamp] of provinceVisitorCache.entries()) {
    if (now - timestamp > PROVINCE_CACHE_TTL) {
      provinceVisitorCache.delete(key);
    }
  }
};

// ==================== API FUNCTIONS ====================

/**
 * Registrar un evento de estadística
 * CORREGIDO: Máximo 1 view + 1 interesado por sesión
 */
export const recordStatEvent = async (
  advertisementId: string,
  eventType: EventType,
  visitorLocation?: VisitorLocation
): Promise<boolean> => {
  try {
    // ✅ Verificar si se puede registrar en esta sesión
    const { canRecord, sessionId, isNewProvinceVisitor } = await canRecordEventInSession(
      advertisementId,
      eventType
    );
    
    if (!canRecord) {
      if (eventType === 'view') {
        console.log(`📊 Vista ya registrada en esta sesión (${advertisementId})`);
      } else {
        console.log(`📊 Ya se registró un interesado en esta sesión (${advertisementId})`);
      }
      return false;
    }

    const response = await fetch(`${API_URL}/stats/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        advertisementId,
        eventType,
        visitorLocation: isNewProvinceVisitor ? visitorLocation : undefined, // Solo enviar provincia si es visitante nuevo
        sessionId, // Enviar sessionId para tracking en backend
      }),
    });

    const data = await response.json();

    if (data.success && data.recorded) {
      console.log(`📊 Evento registrado: ${eventType} para ${advertisementId} (sesión: ${sessionId.slice(-8)})`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error registrando evento de estadística:', error);
    return false;
  }
};

/**
 * Registrar vista al entrar a una publicación
 * Usar esta función en lugar de recordStatEvent('view', ...)
 */
export const recordView = async (
  advertisementId: string,
  visitorLocation?: VisitorLocation
): Promise<boolean> => {
  // Iniciar nueva sesión
  startViewSession(advertisementId);
  // Registrar vista
  return recordStatEvent(advertisementId, 'view', visitorLocation);
};

/**
 * Registrar click de contacto (interesado)
 * Máximo 1 por sesión de visualización
 */
export const recordContactClick = async (
  advertisementId: string,
  eventType: Exclude<EventType, 'view'>,
  visitorLocation?: VisitorLocation
): Promise<boolean> => {
  return recordStatEvent(advertisementId, eventType, visitorLocation);
};

/**
 * Obtener estadísticas de una publicación
 */
export const getAdvertisementStats = async (
  advertisementId: string,
  startDate?: Date,
  endDate?: Date
): Promise<AdvertisementStats | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No autenticado');
    }

    let url = `${API_URL}/stats/${advertisementId}`;
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error obteniendo estadísticas');
    }

    return data.data;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

/**
 * Obtener resumen de estadísticas del usuario
 */
export const getUserStatsSummary = async (): Promise<UserStatsSummary | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No autenticado');
    }

    const response = await fetch(`${API_URL}/stats/user/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error obteniendo estadísticas');
    }

    return data.data;
  } catch (error) {
    console.error('Error obteniendo resumen de estadísticas:', error);
    throw error;
  }
};

// ==================== HELPERS ====================

export const getDayName = (dayNumber: number): string => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[dayNumber] || '';
};

export const getDayFullName = (dayNumber: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayNumber] || '';
};

export const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

export const getEventTypeLabel = (eventType: EventType): string => {
  const labels: Record<EventType, string> = {
    view: 'Vistas',
    click_phone: 'Teléfono',
    click_whatsapp: 'WhatsApp',
    click_email: 'Email',
    click_location: 'Ubicación',
    click_instagram: 'Instagram',
    click_facebook: 'Facebook',
    click_twitter: 'X',
    click_website: 'Sitio web',
  };
  return labels[eventType] || eventType;
};

export const getEventTypeIcon = (eventType: EventType): string => {
  const icons: Record<EventType, string> = {
    view: 'eye',
    click_phone: 'call',
    click_whatsapp: 'logo-whatsapp',
    click_email: 'mail',
    click_location: 'location',
    click_instagram: 'logo-instagram',
    click_facebook: 'logo-facebook',
    click_twitter: 'logo-twitter',
    click_website: 'globe',
  };
  return icons[eventType] || 'analytics';
};