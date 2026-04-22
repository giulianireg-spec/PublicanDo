// src/screens/NotificationsScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  approval:  { icon: 'checkmark-circle', color: '#4CAF50' },
  rejection: { icon: 'alert-circle',     color: '#FF9800' },
  deletion:  { icon: 'trash',            color: '#F44336' },
  report:    { icon: 'flag',             color: '#2196F3' },
  general:   { icon: 'notifications',    color: '#9C27B0' },
};

const NotificationsScreen = ({ navigation }: any) => {
  const { colors: COLORS } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
    readAllButton: { padding: 8 },
    readAllText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingVertical: 8 },
    item: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight, gap: 12 },
    itemUnread: { backgroundColor: COLORS.primary + '10' },
    iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    itemContent: { flex: 1 },
    itemTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    itemBody: { fontSize: 13, color: COLORS.gray, lineHeight: 18 },
    itemDate: { fontSize: 11, color: COLORS.gray, marginTop: 4 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 6 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600', color: COLORS.gray },
    emptySubtext: { marginTop: 8, fontSize: 14, color: COLORS.gray, textAlign: 'center', paddingHorizontal: 32 },
  });

  useFocusEffect(
    useCallback(() => { loadNotifications(); }, [])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `hace ${mins}min`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days}d`;
  };

  const renderItem = ({ item }: { item: any }) => {
    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.general;
    return (
      <TouchableOpacity
        style={[styles.item, !item.read && styles.itemUnread]}
        onPress={() => handleMarkRead(item._id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={22} color={config.color} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemBody}>{item.body}</Text>
          <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔔 Notificaciones</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔔 Notificaciones</Text>
        <TouchableOpacity style={styles.readAllButton} onPress={handleMarkAllRead}>
          <Text style={styles.readAllText}>Leer todo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>Sin notificaciones</Text>
            <Text style={styles.emptySubtext}>Acá verás cuando tus publicaciones o guías sean aprobadas o necesiten cambios</Text>
          </View>
        }
      />
    </View>
  );
};

export default NotificationsScreen;
