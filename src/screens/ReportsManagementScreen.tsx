// src/screens/ReportsManagementScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getReports, reviewReport, dismissReport } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type TabType = 'pending' | 'reviewed' | 'dismissed' | 'all';

const REASON_LABELS: Record<string, string> = {
  incorrect_info: '❌ Información incorrecta',
  wrong_category: '📂 Categoría incorrecta',
  code_violation: '⚠️ Infracción de normas',
  offensive: '🚫 Contenido ofensivo',
  other: '💬 Otro motivo',
};

const ReportsManagementScreen = ({ navigation }: any) => {
  const { colors: COLORS } = useTheme();
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('pending');
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    loadingText: { marginTop: 16, fontSize: 16, color: COLORS.gray },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    errorTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
    errorText: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginBottom: 24 },
    retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, gap: 8, marginBottom: 16 },
    retryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
    infoButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
    placeholder: { width: 40 },
    tabsContainer: { flexDirection: 'row', padding: 16, gap: 8 },
    tab: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 20, backgroundColor: COLORS.white, alignItems: 'center' },
    tabActive: { backgroundColor: COLORS.primary },
    tabText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
    tabTextActive: { color: COLORS.white },
    listContainer: { padding: 16 },
    card: { backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardHeader: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
    cardImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: COLORS.grayLight },
    cardInfo: { flex: 1, marginLeft: 12 },
    cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    cardCategory: { fontSize: 12, color: COLORS.gray, marginBottom: 8 },
    reasonBadge: { alignSelf: 'flex-start', backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 4 },
    reasonText: { fontSize: 11, fontWeight: '600', color: '#F57C00' },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusPending: { backgroundColor: '#FFF3E0' },
    statusReviewed: { backgroundColor: '#E8F5E9' },
    statusDismissed: { backgroundColor: '#FFEBEE' },
    statusText: { fontSize: 11, fontWeight: '600' },
    statusTextPending: { color: '#F57C00' },
    statusTextReviewed: { color: '#2E7D32' },
    statusTextDismissed: { color: '#C62828' },
    cardContent: { padding: 12 },
    descriptionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
    description: { fontSize: 14, color: COLORS.text, marginBottom: 12, lineHeight: 20 },
    reporterInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    reporterText: { fontSize: 12, color: COLORS.gray },
    dateText: { fontSize: 11, color: COLORS.gray, fontStyle: 'italic' },
    actionTaken: { marginTop: 12, padding: 10, backgroundColor: COLORS.background, borderRadius: 8 },
    actionTakenLabel: { fontSize: 11, fontWeight: '600', color: COLORS.gray, marginBottom: 4 },
    actionTakenText: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
    reviewNoteText: { fontSize: 11, color: COLORS.gray, marginTop: 4, fontStyle: 'italic' },
    actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: COLORS.grayLight },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
    // Botones con colores fijos para que funcionen en modo oscuro y claro
    actionDisabled: { backgroundColor: '#FF9800' },
    actionCorrection: { backgroundColor: '#2196F3' },
    actionDelete: { backgroundColor: '#F44336' },
    actionDismiss: { backgroundColor: '#757575' },
    actionButtonText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600', color: COLORS.gray },
    emptySubtext: { marginTop: 8, fontSize: 14, color: COLORS.gray, textAlign: 'center', paddingHorizontal: 32 },
  });

  useFocusEffect(
    useCallback(() => {
      if (user?.role !== 'admin' && user?.role !== 'moderator') {
        Toast.show({ type: 'error', text1: 'Acceso denegado', text2: 'No tienes permisos', position: 'bottom' });
        navigation.goBack();
        return;
      }
      loadReports();
    }, [selectedTab])
  );

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReports(selectedTab);
      setReports(data.data);
    } catch (error: any) {
      setError(error.message || 'No se pudieron cargar los reportes');
      Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleAction = (reportId: string, action: string, reportTitle: string) => {
    const labels: Record<string, { title: string; msg: string }> = {
      disabled:         { title: 'Desactivar publicidad',      msg: 'Se ocultará de la app pero el usuario podrá reactivarla' },
      deleted:          { title: 'Eliminar permanentemente',    msg: 'Esta acción NO se puede deshacer.' },
      sent_to_correction: { title: 'Enviar a corrección',      msg: 'Se marcará como rechazada y el usuario podrá editarla' },
      no_action:        { title: 'Sin acción',                  msg: 'El reporte se marcará como revisado' },
    };
    const { title, msg } = labels[action] || { title: action, msg: '' };

    Alert.alert(title, `${msg}\n\n"${reportTitle}"`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', style: action === 'deleted' ? 'destructive' : 'default', onPress: () => confirmAction(reportId, action) },
    ]);
  };

  const confirmAction = async (reportId: string, action: string) => {
    try {
      await reviewReport(reportId, action as any);
      Toast.show({ type: 'success', text1: '✅ Acción aplicada', position: 'bottom' });
      await loadReports();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'bottom' });
    }
  };

  const handleDismiss = (reportId: string, reportTitle: string) => {
    Alert.alert('Descartar reporte', `¿Descartar el reporte de "${reportTitle}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Descartar',
        onPress: async () => {
          try {
            await dismissReport(reportId);
            Toast.show({ type: 'success', text1: '✅ Reporte descartado', position: 'bottom' });
            await loadReports();
          } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'bottom' });
          }
        },
      },
    ]);
  };

  const renderReportCard = ({ item }: { item: any }) => {
    const advertisement = item.advertisement;
    const guide = item.guide;
    const reporter = item.reporter;
    const isGuide = item.targetType === 'guide';
    const target = isGuide ? guide : advertisement;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: target?.imageUrl || target?.coverImageUrl }} style={styles.cardImage} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {isGuide ? '🗺️ ' : ''}{target?.title || (isGuide ? 'Guía eliminada' : 'Publicidad eliminada')}
            </Text>
            <Text style={styles.cardCategory}>{target?.category}</Text>
            <View style={styles.reasonBadge}>
              <Text style={styles.reasonText}>{REASON_LABELS[item.reason] || item.reason}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === 'pending' && styles.statusPending, item.status === 'reviewed' && styles.statusReviewed, item.status === 'dismissed' && styles.statusDismissed]}>
              <Text style={[styles.statusText, item.status === 'pending' && styles.statusTextPending, item.status === 'reviewed' && styles.statusTextReviewed, item.status === 'dismissed' && styles.statusTextDismissed]}>
                {item.status === 'pending' && '⏳ Pendiente'}
                {item.status === 'reviewed' && '✓ Revisado'}
                {item.status === 'dismissed' && '✕ Descartado'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.descriptionLabel}>Descripción del reporte:</Text>
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.reporterInfo}>
            <Ionicons name="person" size={14} color={COLORS.gray} />
            <Text style={styles.reporterText}>Reportado por: {reporter?.name || 'Usuario eliminado'}</Text>
          </View>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString('es-AR')}</Text>
          {item.status === 'reviewed' && item.action && (
            <View style={styles.actionTaken}>
              <Text style={styles.actionTakenLabel}>Acción tomada:</Text>
              <Text style={styles.actionTakenText}>
                {item.action === 'disabled' && '🚫 Desactivado'}
                {item.action === 'deleted' && '🗑️ Eliminado'}
                {item.action === 'sent_to_correction' && '📝 Enviado a corrección'}
                {item.action === 'no_action' && '✓ Sin acción'}
              </Text>
              {item.reviewNote && <Text style={styles.reviewNoteText}>Nota: {item.reviewNote}</Text>}
            </View>
          )}
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.actionDisabled]} onPress={() => handleAction(item._id, 'disabled', target?.title)}>
              <Ionicons name="eye-off" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Desactivar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionCorrection]} onPress={() => handleAction(item._id, 'sent_to_correction', target?.title)}>
              <Ionicons name="create" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Corrección</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionDelete]} onPress={() => handleAction(item._id, 'deleted', target?.title)}>
              <Ionicons name="trash" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionDismiss]} onPress={() => handleDismiss(item._id, target?.title)}>
              <Ionicons name="close-circle" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Descartar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (error && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión de Reportes</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Error al cargar reportes</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReports}>
            <Ionicons name="refresh" size={20} color={COLORS.white} />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Reportes</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabsContainer}>
        {(['pending', 'reviewed', 'dismissed', 'all'] as TabType[]).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, selectedTab === tab && styles.tabActive]} onPress={() => setSelectedTab(tab)}>
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
              {tab === 'pending' && 'Pendientes'}
              {tab === 'reviewed' && 'Revisados'}
              {tab === 'dismissed' && 'Descartados'}
              {tab === 'all' && 'Todos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={reports}
        renderItem={renderReportCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>No hay reportes {selectedTab === 'pending' ? 'pendientes' : selectedTab === 'reviewed' ? 'revisados' : selectedTab === 'dismissed' ? 'descartados' : ''}</Text>
            <Text style={styles.emptySubtext}>Los reportes aparecerán aquí cuando los usuarios denuncien contenido</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ReportsManagementScreen;