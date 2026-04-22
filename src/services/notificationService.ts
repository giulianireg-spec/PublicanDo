// src/services/notificationService.ts
// VERSIÓN FINAL: Manejo robusto de errores temporales de FCM

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Obtener projectId de forma robusta
const getProjectId = (): string | undefined => {
  const projectId = 
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId ||
    '2cc89c4f-8f5b-46f4-8e43-a468dd11bfaa';
  
  return projectId;
};

/**
 * Registrar el dispositivo para recibir notificaciones push
 * y obtener el Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  // Solo funciona en dispositivos físicos
  if (!Device.isDevice) {
    console.log('ℹ️ Push notifications: Solo disponible en dispositivos físicos');
    return undefined;
  }

  try {
    // Solicitar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('ℹ️ Push notifications: Permiso denegado por el usuario');
      return undefined;
    }

    // Obtener projectId
    const projectId = getProjectId();
    
    if (!projectId) {
      console.log('ℹ️ Push notifications: ProjectId no disponible');
      return undefined;
    }

    // Obtener el token de Expo Push
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenData.data;
    console.log('✅ Push Token obtenido:', token);

    // Configurar canal de notificaciones para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'GuianDo',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C5CE7',
      });
    }

    return token;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    
    // Errores temporales de FCM - son normales y se resuelven solos
    const isTemporaryError = 
      errorMessage.includes('SERVICE_NOT_AVAILABLE') ||
      errorMessage.includes('TIMEOUT') ||
      errorMessage.includes('UNAVAILABLE') ||
      errorMessage.includes('network') ||
      errorMessage.includes('IOException');
    
    if (isTemporaryError) {
      // ✅ Log discreto - NO es un error crítico
      console.log('ℹ️ Push notifications: Servicio temporalmente no disponible (se reintentará en próximo inicio)');
    } else {
      // Solo loggear como warning errores inesperados
      console.warn('⚠️ Push notifications error:', errorMessage);
    }
    
    return undefined;
  }
}

/**
 * Listener para cuando se recibe una notificación mientras la app está abierta
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Listener para cuando el usuario interactúa con una notificación
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Enviar una notificación local (no desde el servidor)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: null,
  });
}