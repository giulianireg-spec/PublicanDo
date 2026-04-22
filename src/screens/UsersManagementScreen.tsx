// src/screens/UsersManagementScreen.tsx
// ACTUALIZADO: Agregado buscador de usuarios por nombre o email

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  getAllUsers,
  trustUser,
  promoteToModerator,
  demoteToAdvertiser,
  banUser,
  unbanUser,
  getBannedUsers,
} from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { BanModal } from '../components/BanModal';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'viewer' | 'advertiser' | 'moderator' | 'admin';
  trusted: boolean;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  banExpiresAt?: string;
  isPermanent?: boolean;
  createdAt: string;
  advertisementsCount?: number;
}

const UsersManagementScreen = ({ navigation }: any) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  // ✅ NUEVO: Estilos del buscador
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  // ✅ NUEVO: Estilos del contador de resultados
  resultsInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 8,
  },
  youBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trustedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trustedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  bannedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  bannedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  banInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  banInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 4,
  },
  banReason: {
    fontSize: 12,
    color: COLORS.error,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  statsText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 'auto',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    gap: 6,
  },
  actionButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionTextActive: {
    color: '#4CAF50',
  },
  demoteButton: {
    backgroundColor: '#FFEBEE',
  },
  demoteText: {
    color: COLORS.error,
  },
  banButton: {
    backgroundColor: '#FFEBEE',
  },
  banText: {
    color: COLORS.error,
  },
  unbanButton: {
    backgroundColor: '#E8F5E9',
  },
  unbanText: {
    color: '#4CAF50',
  },
  currentUserInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentUserText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // ✅ NUEVO: Botón limpiar búsqueda en empty state
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  clearSearchText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'all' | 'advertiser' | 'moderator' | 'banned'>('all');
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [userToBan, setUserToBan] = useState<User | null>(null);
  
  // ✅ NUEVO: Estado para el buscador
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (user?.role !== 'admin' && user?.role !== 'moderator') {
        Toast.show({
          type: 'error',
          text1: 'Acceso denegado',
          text2: 'Solo administradores y moderadores pueden gestionar usuarios',
          position: 'bottom',
        });
        navigation.goBack();
        return;
      }
      loadUsers();
    }, [selectedRole])
  );

  // ✅ NUEVO: Filtrar usuarios según búsqueda
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return users.filter(u => 
      u.name.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      let data: User[];
      
      if (selectedRole === 'banned') {
        data = await getBannedUsers();
      } else {
        data = await getAllUsers(selectedRole !== 'all' ? selectedRole : undefined);
      }
      
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los usuarios',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleToggleTrust = async (userId: string, currentTrusted: boolean) => {
    const userToUpdate = users.find(u => u._id === userId);
    if (!userToUpdate) return;

    try {
      await trustUser(userId);
      Toast.show({
        type: 'success',
        text1: currentTrusted ? '✓ Confianza removida' : '✓ Usuario confiable',
        text2: currentTrusted 
          ? 'Sus publicidades irán a revisión'
          : 'Sus publicidades se aprobarán automáticamente',
        position: 'bottom',
        visibilityTime: 4000,
      });
      await loadUsers();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        position: 'bottom',
      });
    }
  };

  const handlePromoteToModerator = async (userId: string) => {
    const userToPromote = users.find(u => u._id === userId);
    if (!userToPromote) return;

    try {
      await promoteToModerator(userId);
      Toast.show({
        type: 'success',
        text1: '⬆️ Usuario promovido',
        text2: `${userToPromote.name} ahora es moderador`,
        position: 'bottom',
        visibilityTime: 3000,
      });
      await loadUsers();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        position: 'bottom',
      });
    }
  };

  const handleDemoteToAdvertiser = async (userId: string) => {
    const userToDemote = users.find(u => u._id === userId);
    if (!userToDemote) return;

    try {
      await demoteToAdvertiser(userId);
      Toast.show({
        type: 'info',
        text1: '⬇️ Usuario degradado',
        text2: `${userToDemote.name} ahora es anunciante`,
        position: 'bottom',
        visibilityTime: 3000,
      });
      await loadUsers();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        position: 'bottom',
      });
    }
  };

  const handleBanUser = (user: User) => {
    setUserToBan(user);
    setBanModalVisible(true);
  };

  const handleConfirmBan = async (duration: string, reason: string) => {
    if (!userToBan) return;

    try {
      await banUser(userToBan._id, duration, reason);
      
      const durationLabel = duration === 'permanent' ? 'permanentemente' : `por ${duration}`;
      
      Toast.show({
        type: 'error',
        text1: '🚫 Usuario baneado',
        text2: `${userToBan.name} fue baneado ${durationLabel}`,
        position: 'bottom',
        visibilityTime: 4000,
      });
      
      setBanModalVisible(false);
      setUserToBan(null);
      await loadUsers();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        position: 'bottom',
      });
    }
  };

  const handleUnbanUser = (user: User) => {
    Alert.alert(
      'Desbanear usuario',
      `¿Estás seguro que deseas desbanear a ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desbanear',
          onPress: async () => {
            try {
              await unbanUser(user._id);
              Toast.show({
                type: 'success',
                text1: '✅ Usuario desbaneado',
                text2: `${user.name} puede volver a usar la plataforma`,
                position: 'bottom',
                visibilityTime: 3000,
              });
              await loadUsers();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message,
                position: 'bottom',
              });
            }
          },
        },
      ]
    );
  };

  // ✅ NUEVO: Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return { bg: '#E3F2FD', text: '#1976D2' };
      case 'moderator': return { bg: '#FFF3E0', text: '#F57C00' };
      case 'advertiser': return { bg: '#E8F5E9', text: '#2E7D32' };
      default: return { bg: COLORS.grayLight, text: COLORS.gray };
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '👑 Admin';
      case 'moderator': return '🛡️ Moderador';
      case 'advertiser': return '📢 Anunciante';
      default: return '👤 Viewer';
    }
  };

  const formatBanExpiry = (expiresAt?: string) => {
    if (!expiresAt) return 'Permanente';
    const date = new Date(expiresAt);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderUserCard = ({ item }: { item: User }) => {
    const roleBadge = getRoleBadgeColor(item.role);
    const isCurrentUser = item._id === user?._id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userIcon}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.name}</Text>
              {isCurrentUser && (
                <View style={styles.youBadge}>
                  <Text style={styles.youText}>Tú</Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail}>{item.email}</Text>
            
            <View style={styles.badgesRow}>
              <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
                <Text style={[styles.roleText, { color: roleBadge.text }]}>
                  {getRoleLabel(item.role)}
                </Text>
              </View>

              {item.trusted && (
                <View style={styles.trustedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#4CAF50" />
                  <Text style={styles.trustedText}>Trusted</Text>
                </View>
              )}

              {item.isBanned && (
                <View style={styles.bannedBadge}>
                  <Ionicons name="ban" size={12} color={COLORS.white} />
                  <Text style={styles.bannedText}>Baneado</Text>
                </View>
              )}
            </View>

            {item.isBanned && (
              <View style={styles.banInfo}>
                <Text style={styles.banInfoLabel}>
                  Hasta: {formatBanExpiry(item.banExpiresAt)}
                </Text>
                <Text style={styles.banReason} numberOfLines={2}>
                  {item.banReason}
                </Text>
              </View>
            )}

            <View style={styles.statsRow}>
              <Ionicons name="newspaper" size={14} color={COLORS.gray} />
              <Text style={styles.statsText}>
                {item.advertisementsCount || 0} publicidades
              </Text>
              <Text style={styles.dateText}>
                Desde {new Date(item.createdAt).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        {!isCurrentUser && item.role !== 'admin' && (
          <View style={styles.actionsRow}>
            {!item.isBanned ? (
              <>
                {item.role === 'advertiser' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, item.trusted && styles.actionButtonActive]}
                      onPress={() => handleToggleTrust(item._id, item.trusted)}
                    >
                      <Ionicons
                        name={item.trusted ? 'shield-checkmark' : 'shield-checkmark-outline'}
                        size={18}
                        color={item.trusted ? '#4CAF50' : COLORS.gray}
                      />
                      <Text style={[styles.actionText, item.trusted && styles.actionTextActive]}>
                        {item.trusted ? 'Quitar Confianza' : 'Marcar Confiable'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handlePromoteToModerator(item._id)}
                    >
                      <Ionicons name="arrow-up-circle" size={18} color={COLORS.secondary} />
                      <Text style={styles.actionText}>Promover a Mod</Text>
                    </TouchableOpacity>
                  </>
                )}

                {item.role === 'moderator' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.demoteButton]}
                    onPress={() => handleDemoteToAdvertiser(item._id)}
                  >
                    <Ionicons name="arrow-down-circle" size={18} color={COLORS.error} />
                    <Text style={[styles.actionText, styles.demoteText]}>Degradar a Anunciante</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.banButton]}
                  onPress={() => handleBanUser(item)}
                >
                  <Ionicons name="ban" size={18} color={COLORS.error} />
                  <Text style={[styles.actionText, styles.banText]}>Banear</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.unbanButton]}
                onPress={() => handleUnbanUser(item)}
              >
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={[styles.actionText, styles.unbanText]}>Desbanear</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isCurrentUser && (
          <View style={styles.currentUserInfo}>
            <Text style={styles.currentUserText}>
              No puedes modificar tu propio usuario
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <View style={styles.placeholder} />
      </View>

      {/* ✅ NUEVO: Buscador de usuarios */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o email..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        {(['all', 'advertiser', 'moderator', 'banned'] as const).map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.filterButton, selectedRole === role && styles.filterButtonActive]}
            onPress={() => setSelectedRole(role)}
          >
            <Text style={[styles.filterText, selectedRole === role && styles.filterTextActive]}>
              {role === 'all' && 'Todos'}
              {role === 'advertiser' && 'Anunciantes'}
              {role === 'moderator' && 'Mods'}
              {role === 'banned' && '🚫 Ban'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ✅ NUEVO: Contador de resultados */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {searchQuery 
            ? `${filteredUsers.length} resultado${filteredUsers.length !== 1 ? 's' : ''} para "${searchQuery}"`
            : `${users.length} usuario${users.length !== 1 ? 's' : ''}`
          }
        </Text>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={searchQuery ? "search" : "people-outline"} 
              size={64} 
              color={COLORS.grayLight} 
            />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? `No se encontraron usuarios con "${searchQuery}"`
                : 'No hay usuarios'
              }
            </Text>
            {searchQuery && (
              <TouchableOpacity style={styles.clearSearchButton} onPress={handleClearSearch}>
                <Text style={styles.clearSearchText}>Limpiar búsqueda</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <BanModal
        visible={banModalVisible}
        userName={userToBan?.name || ''}
        onConfirm={handleConfirmBan}
        onCancel={() => {
          setBanModalVisible(false);
          setUserToBan(null);
        }}
      />
    </SafeAreaView>
  );
};

export default UsersManagementScreen;