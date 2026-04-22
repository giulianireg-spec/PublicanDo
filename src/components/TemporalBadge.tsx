// src/components/TemporalBadge.tsx
// NUEVO: Badge que muestra el tiempo restante de una publicidad temporal

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  formatTimeRemaining, 
  getBadgeColor, 
  calculateDaysRemaining 
} from '../utils/dateUtils';

interface TemporalBadgeProps {
  endDate?: string;
  size?: 'small' | 'medium' | 'large';
}

const TemporalBadge: React.FC<TemporalBadgeProps> = ({ 
  endDate, 
  size = 'medium' 
}) => {
  if (!endDate) return null;

  const timeText = formatTimeRemaining(endDate);
  const badgeColor = getBadgeColor(endDate);
  const daysRemaining = calculateDaysRemaining(endDate);

  if (!timeText || daysRemaining === null) return null;

  // Determinar ícono según estado
  let iconName: 'time-outline' | 'alert-circle' | 'checkmark-circle' = 'time-outline';
  if (daysRemaining < 0) {
    iconName = 'alert-circle'; // Vencida
  } else if (daysRemaining <= 3) {
    iconName = 'alert-circle'; // Urgente
  }

  // Estilos dinámicos según tamaño
  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
      icon: 14,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
      icon: 16,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
      icon: 18,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View 
      style={[
        styles.container, 
        currentSize.container,
        { backgroundColor: `${badgeColor}15`, borderColor: badgeColor }
      ]}
    >
      <Ionicons 
        name={iconName} 
        size={currentSize.icon} 
        color={badgeColor} 
      />
      <Text style={[currentSize.text, { color: badgeColor }]}>
        {timeText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  containerMedium: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  containerLarge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  textSmall: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  textMedium: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  textLarge: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default TemporalBadge;