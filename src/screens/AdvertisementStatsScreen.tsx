// src/screens/AdvertisementStatsScreen.tsx
// Pantalla de estadísticas de una publicación (Premium/Business)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import {
  getAdvertisementStats,
  AdvertisementStats,
  EventType,
  getDayName,
  formatHour,
  getEventTypeLabel,
  getEventTypeIcon,
} from '../services/statsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AdvertisementStatsScreenProps {
  route: {
    params: {
      advertisementId: string;
      advertisementTitle: string;
    };
  };
  navigation: any;
}

// Períodos de filtro
type FilterPeriod = '7d' | '30d' | '90d' | 'all';

const AdvertisementStatsScreen: React.FC<AdvertisementStatsScreenProps> = ({
  route,
  navigation,
}) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryCardPrimary: {
    backgroundColor: COLORS.primary,
  },
  summaryCardSecondary: {
    backgroundColor: COLORS.secondary,
  },
  summaryCardAccent: {
    backgroundColor: '#4CAF50',
  },
  summaryCardFull: {
    flex: undefined,
    width: '100%',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  conversionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  conversionText: {
    flex: 1,
  },
  conversionNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
  },
  conversionLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  conversionHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  barItem: {
    marginBottom: 12,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  barLabelText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 20,
  },
  barProvince: {
    backgroundColor: COLORS.secondary,
  },
  barValue: {
    position: 'absolute',
    right: 8,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  dayChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  dayBarContainer: {
    width: 30,
    height: 100,
    backgroundColor: COLORS.grayLight,
    borderRadius: 15,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  dayBar: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
  },
  dayLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  hourSlots: {
    gap: 12,
  },
  hourSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hourSlotLabel: {
    width: 80,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  hourSlotBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: COLORS.grayLight,
    borderRadius: 10,
    overflow: 'hidden',
  },
  hourSlotBar: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    minWidth: 10,
  },
  hourSlotValue: {
    width: 40,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.gray,
  },
});

  const { advertisementId, advertisementTitle } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdvertisementStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('30d');

  useEffect(() => {
    loadStats();
  }, [advertisementId, selectedPeriod]);

  const getDateRange = (period: FilterPeriod): { start?: Date; end?: Date } => {
    const end = new Date();
    let start: Date | undefined;

    switch (period) {
      case '7d':
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start = new Date();
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start = new Date();
        start.setDate(start.getDate() - 90);
        break;
      case 'all':
        start = undefined;
        break;
    }

    return { start, end: period === 'all' ? undefined : end };
  };

  const loadStats = async () => {
    try {
      setError(null);
      const { start, end } = getDateRange(selectedPeriod);
      const data = await getAdvertisementStats(advertisementId, start, end);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando estadísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['7d', '30d', '90d', 'all'] as FilterPeriod[]).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive,
            ]}
          >
            {period === '7d' && '7 días'}
            {period === '30d' && '30 días'}
            {period === '90d' && '90 días'}
            {period === 'all' && 'Todo'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSummaryCards = () => {
    if (!stats) return null;

    const { summary } = stats;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
            <Ionicons name="eye" size={28} color={COLORS.white} />
            <Text style={styles.summaryNumber}>{summary.totalViews}</Text>
            <Text style={styles.summaryLabel}>Vistas</Text>
          </View>
          
          <View style={[styles.summaryCard, styles.summaryCardSecondary]}>
            <Ionicons name="heart" size={28} color={COLORS.white} />
            <Text style={styles.summaryNumber}>{summary.totalInterested}</Text>
            <Text style={styles.summaryLabel}>Interesados</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardAccent, styles.summaryCardFull]}>
          <View style={styles.conversionContent}>
            <Ionicons name="trending-up" size={32} color={COLORS.white} />
            <View style={styles.conversionText}>
              <Text style={styles.conversionNumber}>{summary.conversionRate}%</Text>
              <Text style={styles.conversionLabel}>Tasa de Conversión</Text>
            </View>
          </View>
          <Text style={styles.conversionHint}>
            (Interesados / Vistas)
          </Text>
        </View>
      </View>
    );
  };

  const renderContactBreakdown = () => {
    if (!stats) return null;

    const { byEventType } = stats.summary;
    
    // Filtrar solo eventos de contacto (no 'view')
    const contactEvents = Object.entries(byEventType)
      .filter(([type]) => type !== 'view')
      .sort((a, b) => b[1] - a[1]);

    if (contactEvents.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Clicks por Canal</Text>
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={48} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>Aún no hay clicks de contacto</Text>
          </View>
        </View>
      );
    }

    const maxValue = Math.max(...contactEvents.map(([, count]) => count));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Clicks por Canal</Text>
        {contactEvents.map(([eventType, count]) => (
          <View key={eventType} style={styles.barItem}>
            <View style={styles.barLabel}>
              <Ionicons 
                name={getEventTypeIcon(eventType as EventType) as any} 
                size={20} 
                color={COLORS.primary} 
              />
              <Text style={styles.barLabelText}>
                {getEventTypeLabel(eventType as EventType)}
              </Text>
            </View>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { width: `${(count / maxValue) * 100}%` }
                ]} 
              />
              <Text style={styles.barValue}>{count}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderDayOfWeekChart = () => {
    if (!stats) return null;

    const { byDayOfWeek } = stats.summary;
    const days = [0, 1, 2, 3, 4, 5, 6];
    const maxValue = Math.max(...Object.values(byDayOfWeek), 1);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Actividad por Día</Text>
        <View style={styles.dayChart}>
          {days.map((day) => {
            const count = byDayOfWeek[day] || 0;
            const height = maxValue > 0 ? (count / maxValue) * 100 : 0;
            
            return (
              <View key={day} style={styles.dayColumn}>
                <Text style={styles.dayValue}>{count}</Text>
                <View style={styles.dayBarContainer}>
                  <View 
                    style={[
                      styles.dayBar, 
                      { height: `${Math.max(height, 5)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.dayLabel}>{getDayName(day)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderHourChart = () => {
    if (!stats) return null;

    const { byHour } = stats.summary;
    
    // Agrupar por franjas horarias
    const timeSlots = [
      { label: 'Madrugada', hours: [0, 1, 2, 3, 4, 5], icon: 'moon' },
      { label: 'Mañana', hours: [6, 7, 8, 9, 10, 11], icon: 'sunny' },
      { label: 'Tarde', hours: [12, 13, 14, 15, 16, 17], icon: 'partly-sunny' },
      { label: 'Noche', hours: [18, 19, 20, 21, 22, 23], icon: 'moon-outline' },
    ];

    const slotCounts = timeSlots.map(slot => ({
      ...slot,
      count: slot.hours.reduce((sum, h) => sum + (byHour[h] || 0), 0),
    }));

    const maxValue = Math.max(...slotCounts.map(s => s.count), 1);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕐 Actividad por Horario</Text>
        <View style={styles.hourSlots}>
          {slotCounts.map((slot) => (
            <View key={slot.label} style={styles.hourSlot}>
              <Ionicons name={slot.icon as any} size={24} color={COLORS.primary} />
              <Text style={styles.hourSlotLabel}>{slot.label}</Text>
              <View style={styles.hourSlotBarContainer}>
                <View 
                  style={[
                    styles.hourSlotBar,
                    { width: `${(slot.count / maxValue) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.hourSlotValue}>{slot.count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderProvinceBreakdown = () => {
    if (!stats) return null;

    const { byProvince } = stats.summary;
    const provinces = Object.entries(byProvince).slice(0, 5);

    if (provinces.length === 0) {
      return null; // No mostrar si no hay datos de provincia
    }

    const maxValue = Math.max(...provinces.map(([, count]) => count));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗺️ Visitantes por Provincia</Text>
        {provinces.map(([province, count]) => (
          <View key={province} style={styles.barItem}>
            <View style={styles.barLabel}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <Text style={styles.barLabelText}>{province}</Text>
            </View>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  styles.barProvince,
                  { width: `${(count / maxValue) * 100}%` }
                ]} 
              />
              <Text style={styles.barValue}>{count}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{advertisementTitle}</Text>
        <Text style={styles.subtitle}>Estadísticas de rendimiento</Text>
      </View>

      {/* Selector de período */}
      {renderPeriodSelector()}

      {/* Resumen */}
      {renderSummaryCards()}

      {/* Desglose por canal de contacto */}
      {renderContactBreakdown()}

      {/* Gráfico por día de la semana */}
      {renderDayOfWeekChart()}

      {/* Gráfico por horario */}
      {renderHourChart()}

      {/* Desglose por provincia */}
      {renderProvinceBreakdown()}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={16} color={COLORS.gray} />
        <Text style={styles.disclaimerText}>
          Las estadísticas se actualizan en tiempo real
        </Text>
      </View>
    </ScrollView>
  );
};

export default AdvertisementStatsScreen;