// App.tsx
// CORREGIDO: Manejo seguro de notificaciones para evitar crashes

import './src/utils/logger';
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

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

export default function App() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

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
                if (response?.notification?.request?.content?.data) {
                  const data = response.notification.request.content.data;
                  
                  if (data?.type === 'approved' || data?.type === 'rejected') {
                    console.log('→ Navegar a Mis Publicidades');
                  } else if (data?.type === 'new_pending') {
                    console.log('→ Navegar a AdminDashboard');
                  }
                }
              } catch (err) {
                console.warn('⚠️ Error procesando respuesta de notificación:', err);
              }
            }
          );
        }
      } catch (error) {
        console.warn('⚠️ Error configurando listener de respuestas:', error);
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
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}