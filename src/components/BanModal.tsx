// src/components/BanModal.tsx
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

interface BanModalProps {
  visible: boolean;
  userName: string;
  onConfirm: (duration: string, reason: string) => void;
  onCancel: () => void;
}

const BAN_DURATIONS = [
  { value: '1d', label: '1 día', icon: 'time' },
  { value: '3d', label: '3 días', icon: 'calendar' },
  { value: '7d', label: '7 días', icon: 'calendar-outline' },
  { value: '30d', label: '30 días', icon: 'calendar-number' },
  { value: 'permanent', label: 'Permanente', icon: 'ban' },
];

export const BanModal: React.FC<BanModalProps> = ({
  visible,
  userName,
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
  userName: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  durationsContainer: {
    marginBottom: 16,
  },
  durationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationButtonActive: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },
  durationTextActive: {
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#F57C00',
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

  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!selectedDuration) {
      setError('Debes seleccionar una duración');
      return;
    }
    if (!reason.trim()) {
      setError('Debes proporcionar una razón');
      return;
    }
    if (reason.trim().length < 10) {
      setError('La razón debe tener al menos 10 caracteres');
      return;
    }
    if (reason.trim().length > 200) {
      setError('La razón no puede exceder 200 caracteres');
      return;
    }

    onConfirm(selectedDuration, reason.trim());
    
    // Resetear
    setSelectedDuration('');
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setSelectedDuration('');
    setReason('');
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Ionicons name="ban" size={32} color={COLORS.error} />
              <Text style={styles.title}>Banear Usuario</Text>
            </View>

            <Text style={styles.userName} numberOfLines={1}>
              {userName}
            </Text>

            <Text style={styles.sectionTitle}>Duración del ban:</Text>

            <View style={styles.durationsContainer}>
              {BAN_DURATIONS.map((duration) => (
                <TouchableOpacity
                  key={duration.value}
                  style={[
                    styles.durationButton,
                    selectedDuration === duration.value && styles.durationButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedDuration(duration.value);
                    setError('');
                  }}
                >
                  <Ionicons
                    name={duration.icon as any}
                    size={20}
                    color={
                      selectedDuration === duration.value ? COLORS.white : COLORS.text
                    }
                  />
                  <Text
                    style={[
                      styles.durationText,
                      selectedDuration === duration.value && styles.durationTextActive,
                    ]}
                  >
                    {duration.label}
                  </Text>
                  {selectedDuration === duration.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.white}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>
              Razón del ban (10-200 caracteres):
            </Text>

            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Describe la razón del ban..."
              placeholderTextColor={COLORS.gray}
              value={reason}
              onChangeText={(text) => {
                setReason(text);
                setError('');
              }}
              maxLength={200}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.charCount}>
              {reason.length}/200 caracteres
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.warningBox}>
              <Ionicons name="warning" size={16} color="#F57C00" />
              <Text style={styles.warningText}>
                El usuario no podrá crear ni editar publicidades hasta que se levante
                el ban.
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
                  (!selectedDuration || !reason.trim()) && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!selectedDuration || !reason.trim()}
              >
                <Ionicons name="ban" size={20} color={COLORS.white} />
                <Text style={styles.confirmButtonText}>Confirmar Ban</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

