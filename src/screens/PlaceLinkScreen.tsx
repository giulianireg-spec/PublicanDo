// src/screens/PlaceLinkScreen.tsx
// Destino de los links compartidos de un lugar (/l/<id>): busca el lugar y abre su ficha.
// Sin conexión usa la copia guardada de lugares cercanos, si el lugar está ahí.

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { getAdvertisementById } from '../services/api';
import { getOfflineSnapshot } from '../services/offlineCache';

const PlaceLinkScreen = ({ navigation, route }: any) => {
  const { colors: COLORS } = useTheme();
  const { advertisementId } = route.params;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let advertisement = await getAdvertisementById(advertisementId).catch(async () => {
          const snapshot = await getOfflineSnapshot();
          return snapshot?.ads.find((a) => a._id === advertisementId) || null;
        });
        if (cancelled) return;
        if (!advertisement || advertisement.status !== 'approved' || !advertisement.isActive) {
          throw new Error('not found');
        }
        navigation.replace('Detail', { advertisement });
      } catch {
        if (cancelled) return;
        Toast.show({ type: 'error', text1: 'Lugar no disponible', text2: 'Puede que se haya eliminado o que no tengas conexión', position: 'bottom' });
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.replace('Home');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [advertisementId]);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ActivityIndicator size="large" color={COLORS.primaryText} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default PlaceLinkScreen;
