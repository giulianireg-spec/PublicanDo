// src/utils/dateUtils.ts
// NUEVO: Utilidades para cálculo de días restantes y formato de fechas

/**
 * Calcula los días restantes hasta una fecha de fin
 * @param endDate - Fecha de fin en formato ISO string
 * @returns Número de días restantes (puede ser negativo si ya venció)
 */
export const calculateDaysRemaining = (endDate: string | undefined): number | null => {
  if (!endDate) return null;
  
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Formatea el tiempo restante en texto legible
 * @param endDate - Fecha de fin en formato ISO string
 * @returns Texto formateado (ej: "Finaliza en 5 días", "Vencida hace 2 días")
 */
export const formatTimeRemaining = (endDate: string | undefined): string | null => {
  if (!endDate) return null;
  
  const daysRemaining = calculateDaysRemaining(endDate);
  if (daysRemaining === null) return null;
  
  if (daysRemaining > 0) {
    if (daysRemaining === 1) {
      return 'Finaliza mañana';
    } else if (daysRemaining < 7) {
      return `Finaliza en ${daysRemaining} días`;
    } else {
      const weeks = Math.floor(daysRemaining / 7);
      if (weeks === 1) {
        return 'Finaliza en 1 semana';
      } else {
        return `Finaliza en ${weeks} semanas`;
      }
    }
  } else if (daysRemaining === 0) {
    return 'Finaliza hoy';
  } else {
    const daysAgo = Math.abs(daysRemaining);
    if (daysAgo === 1) {
      return 'Venció ayer';
    } else {
      return `Venció hace ${daysAgo} días`;
    }
  }
};

/**
 * Devuelve el color del badge según días restantes
 * @param endDate - Fecha de fin en formato ISO string
 * @returns Color en formato hex
 */
export const getBadgeColor = (endDate: string | undefined): string => {
  if (!endDate) return '#9E9E9E'; // Gris por defecto
  
  const daysRemaining = calculateDaysRemaining(endDate);
  if (daysRemaining === null) return '#9E9E9E';
  
  if (daysRemaining < 0) {
    return '#D32F2F'; // Rojo - vencida
  } else if (daysRemaining <= 3) {
    return '#F57C00'; // Naranja - urgente
  } else if (daysRemaining <= 7) {
    return '#FFC107'; // Amarillo - atención
  } else {
    return '#388E3C'; // Verde - tiempo suficiente
  }
};

/**
 * Formatea una fecha ISO a formato legible
 * @param isoDate - Fecha en formato ISO string
 * @returns Fecha formateada (ej: "23/11/2025")
 */
export const formatDate = (isoDate: string | undefined): string => {
  if (!isoDate) return '-';
  
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Verifica si una publicidad está actualmente vigente
 * @param startDate - Fecha de inicio (opcional)
 * @param endDate - Fecha de fin (opcional)
 * @returns true si la publicidad está vigente ahora
 */
export const isCurrentlyActive = (
  startDate: string | undefined,
  endDate: string | undefined
): boolean => {
  const now = new Date();
  
  if (startDate) {
    const start = new Date(startDate);
    if (now < start) return false; // Aún no comenzó
  }
  
  if (endDate) {
    const end = new Date(endDate);
    if (now > end) return false; // Ya finalizó
  }
  
  return true;
};