// src/components/StampButton.tsx
// Botón "Recolectar sello" de la ficha de un lugar. Solo se puede recolectar estando en el lugar
// (radio según la categoría) y, en festivales y ferias con fecha, durante los días del evento.

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Advertisement } from '../types';
import {
  collectStamp,
  currentStampEdition,
  distanceMeters,
  getMyStamps,
  GPS_TOLERANCE_METERS,
  MAX_GPS_ACCURACY_METERS,
  nextStampWindow,
  stampRadiusFor,
  Stamp,
} from '../services/stamps';

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

export const StampButton = ({ advertisement }: { advertisement: Advertisement }) => {
  const { colors: COLORS } = useTheme();
  const { user } = useAuth();
  const [stamp, setStamp] = useState<Stamp | null>(null);
  const [working, setWorking] = useState(false);

  const coords = advertisement.location?.coordinates;
  const edition = currentStampEdition(advertisement);
  const radius = stampRadiusFor(advertisement.category);

  const loadStatus = useCallback(async () => {
    if (!user) return;
    const mine = await getMyStamps();
    const current = mine.find((s) => s.advertisement === advertisement._id && s.edition === (edition ?? ''));
    setStamp(current || null);
  }, [user, advertisement._id, edition]);

  useFocusEffect(useCallback(() => { loadStatus(); }, [loadStatus]));
  useEffect(() => { loadStatus(); }, [loadStatus]);

  if (!coords || coords.length !== 2 || (coords[0] === 0 && coords[1] === 0)) return null;

  const handleCollect = async () => {
    if (!user) {
      Toast.show({ type: 'info', text1: 'Iniciá sesión', text2: 'Debes iniciar sesión para recolectar sellos', position: 'bottom' });
      return;
    }
    if (edition === null) return;
    setWorking(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: '📍 Necesitamos tu ubicación', text2: 'Activá el permiso de ubicación para recolectar sellos', position: 'bottom' });
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude, longitude, accuracy } = position.coords;

      if ((position as any).mocked) {
        Toast.show({ type: 'error', text1: 'Ubicación simulada', text2: 'Desactivá la ubicación simulada para recolectar sellos', position: 'bottom' });
        return;
      }
      if (!accuracy || accuracy > MAX_GPS_ACCURACY_METERS) {
        Toast.show({ type: 'error', text1: '📡 Señal GPS imprecisa', text2: 'Probá al aire libre y volvé a intentar en unos segundos', position: 'bottom' });
        return;
      }
      const distance = distanceMeters(latitude, longitude, coords[1], coords[0]);
      if (distance > radius + Math.min(accuracy, GPS_TOLERANCE_METERS)) {
        const away = distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`;
        Toast.show({ type: 'info', text1: '📍 Todavía no llegaste', text2: `Estás a ${away}. Acercate a menos de ${radius} m del lugar.`, position: 'bottom' });
        return;
      }

      const result = await collectStamp(
        advertisement,
        { advertisementId: advertisement._id, latitude, longitude, accuracy, visitedAt: new Date(position.timestamp).toISOString(), mocked: (position as any).mocked === true },
        edition
      );
      if (result.status === 'collected' || result.status === 'already') {
        Toast.show({ type: 'success', text1: '🏅 ¡Sello recolectado!', text2: `${advertisement.title} ya está en tus lugares visitados`, position: 'bottom' });
      } else if (result.status === 'queued') {
        Toast.show({ type: 'info', text1: '📴 Sello guardado', text2: 'Se validará cuando vuelvas a tener conexión', position: 'bottom' });
      } else {
        Toast.show({ type: 'error', text1: 'No se pudo recolectar', text2: 'message' in result ? result.message : '', position: 'bottom' });
      }
      await loadStatus();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'No pudimos obtener tu ubicación', text2: 'Revisá que el GPS esté activado', position: 'bottom' });
    } finally {
      setWorking(false);
    }
  };

  const styles = StyleSheet.create({
    box: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 16, gap: 12, borderWidth: 1 },
    textBox: { flex: 1 },
    title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
    button: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, minWidth: 96, alignItems: 'center' },
    buttonText: { color: COLORS.onPrimary, fontWeight: '700', fontSize: 13 },
  });

  if (stamp) {
    return (
      <View style={[styles.box, { backgroundColor: COLORS.success + '15', borderColor: COLORS.success + '55' }]}>
        <Ionicons name="ribbon" size={32} color={COLORS.success} />
        <View style={styles.textBox}>
          <Text style={styles.title}>{stamp.pending ? 'Sello pendiente de validar' : '¡Sello recolectado!'}</Text>
          <Text style={styles.subtitle}>
            {stamp.pending ? 'Se validará cuando tengas conexión' : `Visitado el ${formatDate(stamp.visitedAt)}`}
            {stamp.edition ? ` · Edición ${stamp.edition}` : ''}
          </Text>
        </View>
      </View>
    );
  }

  if (edition === null) {
    const next = nextStampWindow(advertisement);
    return (
      <View style={[styles.box, { backgroundColor: COLORS.white, borderColor: COLORS.grayLight }]}>
        <Ionicons name="ribbon-outline" size={32} color={COLORS.gray} />
        <View style={styles.textBox}>
          <Text style={styles.title}>Sello disponible durante el evento</Text>
          <Text style={styles.subtitle}>
            {next
              ? `Próxima edición: del ${formatDate(next.start)} al ${formatDate(next.end)}`
              : 'Las fechas de la próxima edición todavía no están publicadas'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.box, { backgroundColor: COLORS.white, borderColor: COLORS.primary }]}>
      <Ionicons name="ribbon-outline" size={32} color={COLORS.primaryText} />
      <View style={styles.textBox}>
        <Text style={styles.title}>Sello de este lugar</Text>
        <Text style={styles.subtitle}>
          {user ? `Recolectalo cuando estés a menos de ${radius} m` : 'Iniciá sesión para coleccionar los lugares que visitás'}
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleCollect} disabled={working}>
        {working ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.buttonText}>{user ? 'Recolectar' : 'Ingresar'}</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default StampButton;
