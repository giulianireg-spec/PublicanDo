// App.tsx
// CORREGIDO: Manejo seguro de notificaciones para evitar crashes

import './src/utils/logger';
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { navigateFromNotificationData } from './src/utils/notificationNavigation';
import { listenForShareLinks } from './src/utils/shareLinks';

// ✅ Importar notificaciones de forma segura
let Notifications: any = null;
let notificationService: any = null;

try {
  Notifications = require('expo-notifications');
  notificationService = require('./src/services/notificationService');
  
  // Configurar comportamiento de notificaciones cuando la app está en primer plano
  if (Notifications?.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (error) {
  console.warn('⚠️ Sistema de notificaciones no disponible:', error);
}

// Evita repetir la navegación de arranque si el efecto se vuelve a ejecutar
let handledColdStartId: string | undefined;

export default function App() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Links compartidos de lugares y guías (/l/<id>, /g/<id>)
  useEffect(() => listenForShareLinks(), []);

  // AdMob: contenido acorde a la clasificación de la app (Adolescentes) y SDK inicializado al arrancar
  useEffect(() => {
    try {
      const ads = require('react-native-google-mobile-ads');
      const mobileAds = ads.default;
      mobileAds()
        .setRequestConfiguration({ maxAdContentRating: ads.MaxAdContentRating.T })
        .then(() => mobileAds().initialize())
        .catch((error: unknown) => console.warn('⚠️ No se pudo inicializar AdMob:', error));
    } catch (error) {
      console.warn('⚠️ AdMob no disponible:', error);
    }
  }, []);

  useEffect(() => {
    // ✅ Solo inicializar notificaciones si el módulo está disponible
    if (!notificationService || !Notifications) {
      console.log('⚠️ Notificaciones deshabilitadas - módulo no disponible');
      return;
    }

    const setupNotifications = async () => {
      try {
        // Registrar para notificaciones push
        if (typeof notificationService.registerForPushNotificationsAsync === 'function') {
          const token = await notificationService.registerForPushNotificationsAsync();
          if (token) {
            console.log('📱 Push Token registrado:', token);
          }
        }
      } catch (error) {
        console.warn('⚠️ Error registrando notificaciones:', error);
      }

      try {
        // Listener cuando llega una notificación mientras la app está abierta
        if (typeof notificationService.addNotificationReceivedListener === 'function') {
          notificationListener.current = notificationService.addNotificationReceivedListener(
            (notification: any) => {
              try {
                console.log('🔔 Notificación recibida:', notification);
                
                // ✅ Verificar que notification.request existe
                if (notification?.request?.content) {
                  const { title, body } = notification.request.content;
                  
                  Toast.show({
                    type: 'info',
                    text1: title || 'Notificación',
                    text2: body || '',
                    position: 'top',
                    visibilityTime: 4000,
                  });
                }
              } catch (err) {
                console.warn('⚠️ Error procesando notificación:', err);
              }
            }
          );
        }
      } catch (error) {
        console.warn('⚠️ Error configurando listener de notificaciones:', error);
      }

      try {
        // Listener cuando el usuario toca una notificación
        if (typeof notificationService.addNotificationResponseReceivedListener === 'function') {
          responseListener.current = notificationService.addNotificationResponseReceivedListener(
            (response: any) => {
              try {
                console.log('👆 Notificación tocada:', response);
                
                // ✅ Verificar que response.notification existe
                navigateFromNotificationData(response?.notification?.request?.content?.data);
              } catch (err) {
                console.warn('⚠️ Error procesando respuesta de notificación:', err);
              }
            }
          );
        }
      } catch (error) {
        console.warn('⚠️ Error configurando listener de respuestas:', error);
      }

      try {
        // Si la app se abrió desde cerrada tocando una notificación
        if (typeof Notifications.getLastNotificationResponseAsync === 'function') {
          const lastResponse = await Notifications.getLastNotificationResponseAsync();
          const lastId = lastResponse?.notification?.request?.identifier;
          if (lastResponse && lastId !== handledColdStartId) {
            handledColdStartId = lastId;
            navigateFromNotificationData(lastResponse.notification?.request?.content?.data);
          }
        }
      } catch (error) {
        console.warn('⚠️ Error leyendo la última notificación tocada:', error);
      }
    };

    setupNotifications();

    // ✅ Cleanup seguro
    return () => {
      try {
        // Verificar que el método existe antes de llamarlo
        if (notificationListener.current && typeof notificationListener.current.remove === 'function') {
          notificationListener.current.remove();
        }
      } catch (error) {
        console.warn('⚠️ Error limpiando notification listener:', error);
      }

      try {
        if (responseListener.current && typeof responseListener.current.remove === 'function') {
          responseListener.current.remove();
        }
      } catch (error) {
        console.warn('⚠️ Error limpiando response listener:', error);
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        {/* Íconos oscuros: la parte superior de las pantallas es lima en ambos modos */}
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}