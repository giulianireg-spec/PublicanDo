// src/components/TagSelector.tsx
// CORREGIDO: Sin warning de VirtualizedLists anidados

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
import { getTags, Tag } from '../services/api';

interface TagSelectorProps {
  selectedTagIds?: string[];
  onSelectTags: (tagIds: string[]) => void;
  disabled?: boolean;
  maxTags?: number;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds = [],
  onSelectTags,
  disabled = false,
  maxTags = 10,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Obtener tags seleccionados para mostrar
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t._id));

  const loadTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTags();
      setTags(data.tags);
      setFilteredTags(data.tags);
    } catch (err: any) {
      console.error('Error cargando etiquetas:', err);
      setError(err.message || 'Error cargando etiquetas');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    if (disabled) return;
    setModalVisible(true);
    setSearchQuery('');
    setTempSelectedIds([...selectedTagIds]);
    loadTags();
  };

  const closeModal = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTags(tags);
    } else {
      const filtered = tags.filter((tag) =>
        tag.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTags(filtered);
    }
  };

  const toggleTag = (tagId: string) => {
    if (tempSelectedIds.includes(tagId)) {
      setTempSelectedIds(tempSelectedIds.filter((id) => id !== tagId));
    } else {
      if (tempSelectedIds.length < maxTags) {
        setTempSelectedIds([...tempSelectedIds, tagId]);
      }
    }
  };

  const handleConfirm = () => {
    onSelectTags(tempSelectedIds);
    closeModal();
  };

  const removeTag = (tagId: string) => {
    const newIds = selectedTagIds.filter((id) => id !== tagId);
    onSelectTags(newIds);
  };

  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // ✅ CORREGIDO: Renderizar item de tag sin FlatList
  const renderTagItem = (item: Tag) => {
    const isSelected = tempSelectedIds.includes(item._id);
    const isDisabled = !isSelected && tempSelectedIds.length >= maxTags;

    return (
      <TouchableOpacity
        key={item._id}
        style={[
          styles.tagItem,
          isSelected && styles.tagItemSelected,
          isDisabled && styles.tagItemDisabled,
        ]}
        onPress={() => !isDisabled && toggleTag(item._id)}
        disabled={isDisabled}
      >
        <View
          style={[
            styles.tagBadge,
            { backgroundColor: item.color },
            isDisabled && styles.tagBadgeDisabled,
          ]}
        >
          <Text
            style={[
              styles.tagBadgeText,
              { color: getContrastColor(item.color) },
            ]}
          >
            {item.name}
          </Text>
        </View>
        <View style={styles.tagInfo}>
          <Text style={[styles.tagUsage, isDisabled && styles.tagUsageDisabled]}>
            {item.usageCount} publicidad{item.usageCount !== 1 ? 'es' : ''}
          </Text>
        </View>
        {isSelected ? (
          <Ionicons name="checkmark-circle" size={24} color="#00B894" />
        ) : (
          <View style={[styles.checkbox, isDisabled && styles.checkboxDisabled]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectedTagsContainer}
          contentContainerStyle={styles.selectedTagsContent}
        >
          {selectedTags.map((tag) => (
            <View
              key={tag._id}
              style={[styles.selectedTag, { backgroundColor: tag.color }]}
            >
              <Text
                style={[styles.selectedTagText, { color: getContrastColor(tag.color) }]}
              >
                {tag.name}
              </Text>
              {!disabled && (
                <TouchableOpacity
                  style={styles.removeTagBtn}
                  onPress={() => removeTag(tag._id)}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={getContrastColor(tag.color)}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Selector Button */}
      <TouchableOpacity
        style={[styles.selector, disabled && styles.selectorDisabled]}
        onPress={openModal}
        disabled={disabled}
      >
        <Ionicons name="pricetags-outline" size={20} color={disabled ? '#CCC' : '#666'} />
        <Text style={[styles.selectorText, disabled && styles.selectorTextDisabled]}>
          {selectedTagIds.length > 0
            ? `${selectedTagIds.length} etiqueta${selectedTagIds.length > 1 ? 's' : ''} seleccionada${selectedTagIds.length > 1 ? 's' : ''}`
            : 'Agregar etiquetas (opcional)'}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? '#CCC' : '#666'}
        />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Etiquetas</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Counter */}
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                {tempSelectedIds.length} de {maxTags} etiquetas seleccionadas
              </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar etiqueta..."
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
                <ActivityIndicator size="large" color="#00B894" />
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#E74C3C" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadTags}>
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : filteredTags.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="pricetags-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'No se encontraron etiquetas'
                    : 'No tienes etiquetas creadas'}
                </Text>
              </View>
            ) : (
              // ✅ CORREGIDO: Usar ScrollView en lugar de FlatList para evitar warning
              <ScrollView 
                style={styles.tagList}
                contentContainerStyle={styles.tagListContent}
                showsVerticalScrollIndicator={true}
              >
                {filteredTags.map(renderTagItem)}
              </ScrollView>
            )}

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearAllButton} onPress={() => setTempSelectedIds([])}>
                <Text style={styles.clearAllText}>Limpiar todo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>
                  Confirmar ({tempSelectedIds.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectedTagsContainer: {
    marginBottom: 10,
  },
  selectedTagsContent: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  selectedTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  removeTagBtn: {
    marginLeft: 2,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 10,
  },
  selectorDisabled: {
    opacity: 0.6,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectorTextDisabled: {
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
    maxHeight: '85%',
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
  counterContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  counterText: {
    fontSize: 13,
    color: '#666',
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
    backgroundColor: '#00B894',
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
  tagList: {
    flex: 1,
  },
  tagListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  tagItemSelected: {
    borderColor: '#00B894',
    backgroundColor: '#E8F8F5',
  },
  tagItemDisabled: {
    opacity: 0.5,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagBadgeDisabled: {
    opacity: 0.5,
  },
  tagBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tagUsage: {
    fontSize: 13,
    color: '#999',
  },
  tagUsageDisabled: {
    color: '#CCC',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
  },
  checkboxDisabled: {
    borderColor: '#EEE',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  clearAllButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#00B894',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default TagSelector;