// src/utils/scheduleUtils.ts
// Utilidades para manejar horarios de lugares

interface Schedule {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

const DAY_KEYS: (keyof Schedule)[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

/**
 * Parsea un string de horario como "09:00 - 18:00" y devuelve hora de apertura y cierre
 */
const parseTimeRange = (timeStr: string): { open: number; close: number } | null => {
  if (!timeStr || timeStr === 'Cerrado') return null;
  if (timeStr === '24 horas') return { open: 0, close: 24 * 60 };

  // Formato esperado: "HH:MM - HH:MM"
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const openHour = parseInt(match[1], 10);
  const openMin = parseInt(match[2], 10);
  const closeHour = parseInt(match[3], 10);
  const closeMin = parseInt(match[4], 10);

  const openMinutes = openHour * 60 + openMin;
  let closeMinutes = closeHour * 60 + closeMin;

  // Si cierra después de medianoche (ej: 19:00 - 03:00)
  if (closeMinutes < openMinutes) {
    closeMinutes += 24 * 60; // Agregar 24 horas
  }

  return { open: openMinutes, close: closeMinutes };
};

/**
 * Verifica si un lugar está abierto en este momento
 */
export const isOpenNow = (schedule: Schedule | undefined): boolean => {
  if (!schedule) return false;

  const now = new Date();
  const dayIndex = now.getDay(); // 0 = domingo, 1 = lunes, etc.
  const currentDay = DAY_KEYS[dayIndex];
  const todaySchedule = schedule[currentDay];

  if (!todaySchedule || todaySchedule === 'Cerrado') {
    // Verificar si ayer tenía horario que cruza medianoche
    const yesterdayIndex = (dayIndex + 6) % 7;
    const yesterdayKey = DAY_KEYS[yesterdayIndex];
    const yesterdaySchedule = schedule[yesterdayKey];
    
    if (yesterdaySchedule && yesterdaySchedule !== 'Cerrado') {
      const parsed = parseTimeRange(yesterdaySchedule);
      if (parsed && parsed.close > 24 * 60) {
        // El horario de ayer cruza medianoche
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const closeAfterMidnight = parsed.close - 24 * 60;
        return currentMinutes < closeAfterMidnight;
      }
    }
    return false;
  }

  const parsed = parseTimeRange(todaySchedule);
  if (!parsed) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Verificar si está dentro del rango
  if (parsed.close <= 24 * 60) {
    // Horario normal (no cruza medianoche)
    return currentMinutes >= parsed.open && currentMinutes < parsed.close;
  } else {
    // Horario que cruza medianoche
    return currentMinutes >= parsed.open || currentMinutes < (parsed.close - 24 * 60);
  }
};

/**
 * Obtiene el estado de apertura con texto descriptivo
 */
export const getOpenStatus = (schedule: Schedule | undefined): {
  isOpen: boolean;
  text: string;
  color: string;
} => {
  if (!schedule || Object.keys(schedule).length === 0) {
    return {
      isOpen: false,
      text: 'Sin horarios',
      color: '#9E9E9E', // gray
    };
  }

  const now = new Date();
  const dayIndex = now.getDay();
  const currentDay = DAY_KEYS[dayIndex];
  const todaySchedule = schedule[currentDay];

  if (isOpenNow(schedule)) {
    // Está abierto - calcular cuándo cierra
    const parsed = parseTimeRange(todaySchedule || '');
    if (parsed) {
      let closeMinutes = parsed.close;
      if (closeMinutes > 24 * 60) closeMinutes -= 24 * 60;
      const closeHour = Math.floor(closeMinutes / 60);
      const closeMin = closeMinutes % 60;
      const closeStr = `${closeHour.toString().padStart(2, '0')}:${closeMin.toString().padStart(2, '0')}`;
      
      return {
        isOpen: true,
        text: `Abierto · Cierra ${closeStr}`,
        color: '#4CAF50', // green
      };
    }
    return {
      isOpen: true,
      text: 'Abierto',
      color: '#4CAF50',
    };
  }

  // Está cerrado
  if (!todaySchedule || todaySchedule === 'Cerrado') {
    // Buscar próximo día que abre
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (dayIndex + i) % 7;
      const nextDayKey = DAY_KEYS[nextDayIndex];
      const nextSchedule = schedule[nextDayKey];
      if (nextSchedule && nextSchedule !== 'Cerrado') {
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return {
          isOpen: false,
          text: `Cerrado · Abre ${dayNames[nextDayIndex]}`,
          color: '#F44336', // red
        };
      }
    }
    return {
      isOpen: false,
      text: 'Cerrado',
      color: '#F44336',
    };
  }

  // Está cerrado pero abre hoy
  const parsed = parseTimeRange(todaySchedule);
  if (parsed) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (currentMinutes < parsed.open) {
      const openHour = Math.floor(parsed.open / 60);
      const openMin = parsed.open % 60;
      const openStr = `${openHour.toString().padStart(2, '0')}:${openMin.toString().padStart(2, '0')}`;
      return {
        isOpen: false,
        text: `Cerrado · Abre ${openStr}`,
        color: '#FF9800', // orange
      };
    }
  }

  return {
    isOpen: false,
    text: 'Cerrado',
    color: '#F44336',
  };
};

/**
 * Formatea el horario de un día para mostrar
 */
export const formatDaySchedule = (timeStr: string | undefined): string => {
  if (!timeStr) return 'No definido';
  return timeStr;
};

/**
 * Verifica si un lugar tiene horarios definidos
 */
export const hasSchedule = (schedule: Schedule | undefined): boolean => {
  if (!schedule) return false;
  return Object.values(schedule).some(v => v && v !== '');
};