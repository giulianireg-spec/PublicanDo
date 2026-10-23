// src/services/telemetry.ts
// Medición de uso (Firebase Analytics) y reporte de errores (Firebase Crashlytics).
// Crashlytics captura solo los cierres inesperados; Analytics registra pantallas y algunos
// eventos clave (sellos, compartir). No se envían nombres, emails ni ubicaciones.
// Todas las funciones son seguras: si Firebase no está disponible, no hacen nada.

let analyticsModule: any = null;
let crashlyticsModule: any = null;
try {
  analyticsModule = require('@react-native-firebase/analytics');
  crashlyticsModule = require('@react-native-firebase/crashlytics');
} catch {
  // Firebase no está compilado en esta versión (por ejemplo, en Expo Go)
}

const analytics = () => analyticsModule?.getAnalytics();
const crashlytics = () => crashlyticsModule?.getCrashlytics();

export const logScreen = (screenName: string) => {
  try {
    const a = analytics();
    if (a) analyticsModule.logScreenView(a, { screen_name: screenName, screen_class: screenName });
  } catch {}
};

type EventParams = Record<string, string | number | boolean | undefined>;

export const logAppEvent = (name: string, params?: EventParams) => {
  try {
    const a = analytics();
    if (a) analyticsModule.logEvent(a, name, params);
  } catch {}
};

/** Errores capturados que conviene ver en Crashlytics aunque la app no se haya cerrado. */
export const reportError = (error: unknown, context?: string) => {
  try {
    const c = crashlytics();
    if (!c) return;
    if (context) crashlyticsModule.log(c, context);
    crashlyticsModule.recordError(c, error instanceof Error ? error : new Error(String(error)));
  } catch {}
};
