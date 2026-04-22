// src/components/ClientSelector.tsx
// CORREGIDO: Sin warning de VirtualizedLists anidados (FlatList → ScrollView con map)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getClients, Client } from '../services/api';

interface ClientSelectorProps {
  selectedClientId?: string | null;
  onSelectClient: (client: Client | null) => void;
  disabled?: boolean;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedClientId,
  onSelectClient,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar cliente seleccionado si existe
  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      const client = clients.find((c) => c._id === selectedClientId);
      if (client) {
        setSelectedClient(client);
      }
    } else if (!selectedClientId) {
      setSelectedClient(null);
    }
  }, [selectedClientId, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClients();
      setClients(data);
      setFilteredClients(data);
    } catch (err: any) {
      console.error('Error cargando clientes:', err);
      setError(err.message || 'Error cargando clientes');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    if (disabled) return;
    setModalVisible(true);
    setSearchQuery('');
    loadClients();
  };

  const closeModal = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  };

  const handleSelectClient = (client: Client | null) => {
    setSelectedClient(client);
    onSelectClient(client);
    closeModal();
  };

  // ✅ CORREGIDO: Renderizar item de cliente sin FlatList
  const renderClientItem = (item: Client) => (
    <TouchableOpacity
      key={item._id}
      style={[
        styles.clientItem,
        selectedClient?._id === item._id && styles.clientItemSelected,
      ]}
      onPress={() => handleSelectClient(item)}
    >
      <View style={[styles.clientColor, { backgroundColor: item.color }]} />
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.clientDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
      {selectedClient?._id === item._id && (
        <Ionicons name="checkmark-circle" size={24} color="#6C5CE7" />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.selector, disabled && styles.selectorDisabled]}
        onPress={openModal}
        disabled={disabled}
      >
        {selectedClient ? (
          <View style={styles.selectedContainer}>
            <View style={[styles.selectedColor, { backgroundColor: selectedClient.color }]} />
            <Text style={styles.selectedText} numberOfLines={1}>
              {selectedClient.name}
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Seleccionar cliente (opcional)</Text>
        )}
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? '#CCC' : '#666'}
        />
      </TouchableOpacity>

      {selectedClient && !disabled && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => handleSelectClient(null)}
        >
          <Ionicons name="close-circle" size={18} color="#999" />
          <Text style={styles.clearButtonText}>Quitar cliente</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar cliente..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C5CE7" />
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#E74C3C" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadClients}>
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ✅ CORREGIDO: Usar ScrollView en lugar de FlatList
              <ScrollView 
                style={styles.clientList}
                contentContainerStyle={styles.clientListContent}
                showsVerticalScrollIndicator={true}
              >
                {/* Option: Sin cliente */}
                <TouchableOpacity
                  style={[
                    styles.clientItem,
                    styles.noClientItem,
                    !selectedClient && styles.clientItemSelected,
                  ]}
                  onPress={() => handleSelectClient(null)}
                >
                  <View style={[styles.clientColor, { backgroundColor: '#E0E0E0' }]} />
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>Sin cliente asignado</Text>
                    <Text style={styles.clientDescription}>
                      La publicidad no estará asociada a ningún cliente
                    </Text>
                  </View>
                  {!selectedClient && (
                    <Ionicons name="checkmark-circle" size={24} color="#6C5CE7" />
                  )}
                </TouchableOpacity>

                {filteredClients.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={48} color="#CCC" />
                    <Text style={styles.emptyText}>
                      {searchQuery
                        ? 'No se encontraron clientes'
                        : 'No tienes clientes creados'}
                    </Text>
                  </View>
                ) : (
                  // ✅ CORREGIDO: Usar map en lugar de FlatList
                  filteredClients.map(renderClientItem)
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectorDisabled: {
    opacity: 0.6,
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  selectedColor: {
    width: 8,
    height: 24,
    borderRadius: 4,
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  clearButtonText: {
    fontSize: 13,
    color: '#999',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  clientList: {
    flex: 1,
  },
  clientListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  noClientItem: {
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
  },
  clientItemSelected: {
    borderColor: '#6C5CE7',
    backgroundColor: '#F8F5FF',
  },
  clientColor: {
    width: 6,
    height: 36,
    borderRadius: 3,
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  clientDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
});

export default ClientSelector;