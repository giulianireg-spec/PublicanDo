// src/components/PremiumExpiredBadge.tsx
// NUEVO: Badge para mostrar cuando una publicidad premium fue deshabilitada

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface PremiumExpiredBadgeProps {
  onRenewPress?: () => void;
}

export const PremiumExpiredBadge: React.FC<PremiumExpiredBadgeProps> = ({ onRenewPress }) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F57C00',
  },
  message: {
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
    marginBottom: 12,
  },
  renewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  renewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  info: {
    fontSize: 11,
    color: '#F57C00',
    fontStyle: 'italic',
  },
});


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="alert-circle" size={20} color="#F57C00" />
        <Text style={styles.title}>Premium Expirado</Text>
      </View>
      
      <Text style={styles.message}>
        Tu suscripción premium ha vencido. Esta publicidad ha sido deshabilitada automáticamente.
      </Text>

      {onRenewPress && (
        <TouchableOpacity style={styles.renewButton} onPress={onRenewPress}>
          <Ionicons name="star" size={16} color={COLORS.white} />
          <Text style={styles.renewButtonText}>Renovar Premium</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.info}>
        💡 Renueva tu suscripción para reactivar esta y otras publicidades premium
      </Text>
    </View>
  );
};

