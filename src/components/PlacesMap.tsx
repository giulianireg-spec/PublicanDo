// src/components/PlacesMap.tsx
// Mapa de los lugares que muestra el inicio (mismos filtros que la lista).
// Tocar el globo de un marcador abre la ficha del lugar.

import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import { Advertisement } from '../types';

interface PlacesMapProps {
  ads: Advertisement[];
  userLocation: { latitude: number; longitude: number } | null;
  onSelect: (ad: Advertisement) => void;
}

const hasCoords = (ad: Advertisement) => {
  const c = ad.location?.coordinates;
  return !!c && c.length === 2 && !(c[0] === 0 && c[1] === 0);
};

const PlacesMap: React.FC<PlacesMapProps> = ({ ads, userLocation, onSelect }) => {
  const { colors: COLORS } = useTheme();
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const withCoords = useMemo(() => ads.filter(hasCoords), [ads]);

  // Encuadrar todos los lugares (y al usuario, si hay ubicación)
  const fit = () => {
    const points = withCoords.map((a) => ({ latitude: a.location.coordinates![1], longitude: a.location.coordinates![0] }));
    if (userLocation) points.push(userLocation);
    if (points.length === 0) return;
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
      animated: true,
    });
  };

  useEffect(() => {
    fit();
  }, [withCoords.length]);

  const styles = StyleSheet.create({
    container: { flex: 1 },
    callout: { maxWidth: 220, padding: 4 },
    calloutTitle: { fontWeight: '700', fontSize: 14, color: '#0A0A0A' },
    calloutSub: { fontSize: 12, color: '#4B5563', marginTop: 2 },
    calloutLink: { fontSize: 12, color: '#4D7C0F', fontWeight: '700', marginTop: 4 },
    empty: { position: 'absolute', top: 16, alignSelf: 'center', backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
    emptyText: { color: COLORS.text, fontSize: 13 },
  });

  const initial = withCoords[0]
    ? { latitude: withCoords[0].location.coordinates![1], longitude: withCoords[0].location.coordinates![0] }
    : userLocation ?? { latitude: -31.42, longitude: -64.18 };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{ ...initial, latitudeDelta: 1.5, longitudeDelta: 1.5 }}
        showsUserLocation={!!userLocation}
        showsMyLocationButton
        onMapReady={fit}
      >
        {withCoords.map((ad) => (
          <Marker
            key={ad._id}
            coordinate={{ latitude: ad.location.coordinates![1], longitude: ad.location.coordinates![0] }}
            pinColor="#84CC16"
          >
            <Callout onPress={() => onSelect(ad)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle} numberOfLines={2}>{ad.title}</Text>
                <Text style={styles.calloutSub} numberOfLines={1}>{ad.category} · {ad.location.city}</Text>
                <Text style={styles.calloutLink}>{t('map.seePlace')}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {withCoords.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('map.empty')}</Text>
        </View>
      )}
    </View>
  );
};

export default PlacesMap;
