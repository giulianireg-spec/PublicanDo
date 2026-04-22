// src/components/ReportModal.tsx
// CREAR ESTE ARCHIVO NUEVO

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ReportModalProps {
  visible: boolean;
  advertisementTitle: string;
  onConfirm: (reason: string, description: string) => void;
  onCancel: () => void;
}

const REPORT_REASONS = [
  { value: 'incorrect_info', label: '❌ Información incorrecta', icon: 'alert-circle' },
  { value: 'wrong_category', label: '📂 Categoría incorrecta', icon: 'folder' },
  { value: 'code_violation', label: '⚠️ Infracción de normas', icon: 'warning' },
  { value: 'offensive', label: '🚫 Contenido ofensivo', icon: 'ban' },
  { value: 'other', label: '💬 Otro motivo', icon: 'chatbubbles' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  advertisementTitle,
  onConfirm,
  onCancel,
}) => {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 450,
      maxHeight: '90%',
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 24,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.text,
      marginTop: 8,
    },
    adTitle: {
      fontSize: 14,
      color: COLORS.gray,
      textAlign: 'center',
      marginBottom: 20,
      fontStyle: 'italic',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 12,
      marginTop: 8,
    },
    reasonButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      padding: 14,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    reasonButtonActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    reasonText: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.text,
      marginLeft: 10,
      flex: 1,
    },
    reasonTextActive: {
      color: COLORS.white,
    },
    checkIcon: {
      marginLeft: 'auto',
    },
    input: {
      backgroundColor: COLORS.inputBackground,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: COLORS.text,
      minHeight: 100,
      borderWidth: 1,
      borderColor: COLORS.grayLight,
    },
    inputError: {
      borderColor: COLORS.error,
    },
    charCount: {
      fontSize: 12,
      color: COLORS.gray,
      textAlign: 'right',
      marginTop: 4,
      marginBottom: 8,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 4,
    },
    errorText: {
      fontSize: 12,
      color: COLORS.error,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#E3F2FD',
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
      gap: 8,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: COLORS.primary,
      lineHeight: 18,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 20,
      gap: 12,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      gap: 6,
    },
    cancelButton: {
      backgroundColor: COLORS.inputBackground,
      borderWidth: 1,
      borderColor: COLORS.grayLight,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
    },
    confirmButton: {
      backgroundColor: COLORS.error,
    },
    confirmButtonDisabled: {
      opacity: 0.5,
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.white,
    },
  });

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!selectedReason) {
      setError('Debes seleccionar un motivo');
      return;
    }
    if (!description.trim()) {
      setError('Debes proporcionar una descripción');
      return;
    }
    if (description.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }
    if (description.trim().length > 200) {
      setError('La descripción no puede exceder 200 caracteres');
      return;
    }

    onConfirm(selectedReason, description.trim());
    
    // Resetear
    setSelectedReason('');
    setDescription('');
    setError('');
  };

  const handleCancel = () => {
    setSelectedReason('');
    setDescription('');
    setError('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Ionicons name="flag" size={32} color={COLORS.error} />
              <Text style={styles.title}>Reportar publicidad</Text>
            </View>

            <Text style={styles.adTitle} numberOfLines={2}>
              "{advertisementTitle}"
            </Text>

            <Text style={styles.sectionTitle}>Motivo del reporte:</Text>

            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={[
                  styles.reasonButton,
                  selectedReason === reason.value && styles.reasonButtonActive,
                ]}
                onPress={() => {
                  setSelectedReason(reason.value);
                  setError('');
                }}
              >
                <Ionicons
                  name={reason.icon as any}
                  size={20}
                  color={
                    selectedReason === reason.value ? COLORS.white : COLORS.text
                  }
                />
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason.value && styles.reasonTextActive,
                  ]}
                >
                  {reason.label}
                </Text>
                {selectedReason === reason.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.white}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>
              Descripción detallada (10-200 caracteres):
            </Text>

            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Describe el problema con detalle..."
              placeholderTextColor={COLORS.gray}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setError('');
              }}
              maxLength={200}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.charCount}>
              {description.length}/200 caracteres
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Tu reporte será revisado por un moderador. El anunciante no verá tu
                identidad.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  (!selectedReason || !description.trim()) &&
                    styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!selectedReason || !description.trim()}
              >
                <Ionicons name="flag" size={20} color={COLORS.white} />
                <Text style={styles.confirmButtonText}>Enviar reporte</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

