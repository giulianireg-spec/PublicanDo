// src/components/ScheduleForm.tsx
// Componente para editar horarios de un lugar
// ACTUALIZADO: Incluye opción de horario personalizado

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Schedule {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

interface ScheduleFormProps {
  schedule: Schedule;
  onScheduleChange: (schedule: Schedule) => void;
}

const DAYS = [
  { key: 'monday', label: 'Lunes', short: 'Lun' },
  { key: 'tuesday', label: 'Martes', short: 'Mar' },
  { key: 'wednesday', label: 'Miércoles', short: 'Mié' },
  { key: 'thursday', label: 'Jueves', short: 'Jue' },
  { key: 'friday', label: 'Viernes', short: 'Vie' },
  { key: 'saturday', label: 'Sábado', short: 'Sáb' },
  { key: 'sunday', label: 'Domingo', short: 'Dom' },
] as const;

const PRESET_SCHEDULES = [
  { label: '08:00 - 12:00', value: '08:00 - 12:00' },
  { label: '08:00 - 13:00', value: '08:00 - 13:00' },
  { label: '09:00 - 13:00', value: '09:00 - 13:00' },
  { label: '09:00 - 18:00', value: '09:00 - 18:00' },
  { label: '08:00 - 20:00', value: '08:00 - 20:00' },
  { label: '10:00 - 14:00 / 17:00 - 21:00', value: '10:00 - 14:00 / 17:00 - 21:00' },
  { label: '10:00 - 22:00', value: '10:00 - 22:00' },
  { label: '12:00 - 00:00', value: '12:00 - 00:00' },
  { label: '18:00 - 02:00', value: '18:00 - 02:00' },
  { label: '19:00 - 03:00', value: '19:00 - 03:00' },
  { label: '20:00 - 04:00', value: '20:00 - 04:00' },
  { label: '24 horas', value: '24 horas' },
  { label: 'Cerrado', value: 'Cerrado' },
];

// Horas disponibles para selección
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { label: `${hour}:00`, value: `${hour}:00` };
});

const ScheduleForm: React.FC<ScheduleFormProps> = ({ schedule, onScheduleChange }) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    padding: 14,
    borderRadius: 10,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    fontSize: 15,
    color: COLORS.gray,
  },
  summaryTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },
  previewContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  previewDay: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  previewTime: {
    fontSize: 12,
    color: COLORS.text,
  },
  previewTimeClosed: {
    color: COLORS.error,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    padding: 16,
  },
  quickActions: {
    marginBottom: 20,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  quickButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 16,
    marginRight: 8,
  },
  quickButtonWeekdays: {
    backgroundColor: COLORS.secondary + '15',
  },
  quickButtonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Custom picker
  customPickerContainer: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  customPickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customTimeSection: {
    flex: 1,
    alignItems: 'center',
  },
  customTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
  },
  hourPicker: {
    maxHeight: 150,
    width: '100%',
  },
  hourOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  hourOptionActive: {
    backgroundColor: COLORS.primary,
  },
  hourOptionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  hourOptionTextActive: {
    color: COLORS.white,
  },
  customTimeSeparator: {
    paddingHorizontal: 12,
    paddingTop: 30,
  },
  customPreview: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: 12,
  },
  customActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  customActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  customActionButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  customActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  customActionTextPrimary: {
    color: COLORS.white,
  },
  closeCustomButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  closeCustomText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  // Days
  dayContainer: {
    marginBottom: 8,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    padding: 14,
    borderRadius: 10,
  },
  dayRowActive: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayValueText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  dayValueClosed: {
    color: COLORS.error,
  },
  dayValueEmpty: {
    fontSize: 14,
    color: COLORS.gray,
  },
  clearButton: {
    padding: 2,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  timeOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  timeOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeOptionClosed: {
    borderColor: COLORS.error,
  },
  timeOptionCustom: {
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeOptionText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  timeOptionTextActive: {
    color: COLORS.white,
  },
  timeOptionTextCustom: {
    color: COLORS.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 52,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

  const [showModal, setShowModal] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [tempSchedule, setTempSchedule] = useState<Schedule>(schedule);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customOpenTime, setCustomOpenTime] = useState('09:00');
  const [customCloseTime, setCustomCloseTime] = useState('18:00');
  const [customDayKey, setCustomDayKey] = useState<string | null>(null);

  const handleOpenModal = () => {
    setTempSchedule(schedule);
    setShowModal(true);
  };

  const handleSave = () => {
    onScheduleChange(tempSchedule);
    setShowModal(false);
  };

  const handleDayPress = (dayKey: string) => {
    setEditingDay(editingDay === dayKey ? null : dayKey);
    setShowCustomPicker(false);
  };

  const handleSelectTime = (dayKey: string, time: string) => {
    setTempSchedule(prev => ({
      ...prev,
      [dayKey]: time,
    }));
    setEditingDay(null);
  };

  const handleClearDay = (dayKey: string) => {
    setTempSchedule(prev => {
      const newSchedule = { ...prev };
      delete newSchedule[dayKey as keyof Schedule];
      return newSchedule;
    });
  };

  const handleApplyToWeekdays = (time: string) => {
    setTempSchedule(prev => ({
      ...prev,
      monday: time,
      tuesday: time,
      wednesday: time,
      thursday: time,
      friday: time,
    }));
  };

  const handleApplyToAll = (time: string) => {
    setTempSchedule({
      monday: time,
      tuesday: time,
      wednesday: time,
      thursday: time,
      friday: time,
      saturday: time,
      sunday: time,
    });
  };

  const handleOpenCustomPicker = (dayKey: string) => {
    setCustomDayKey(dayKey);
    // Intentar parsear horario existente
    const existingTime = tempSchedule[dayKey as keyof Schedule];
    if (existingTime && existingTime.includes(' - ') && existingTime !== '24 horas' && existingTime !== 'Cerrado') {
      const parts = existingTime.split(' - ');
      if (parts.length === 2) {
        setCustomOpenTime(parts[0].trim());
        setCustomCloseTime(parts[1].trim());
      }
    } else {
      setCustomOpenTime('09:00');
      setCustomCloseTime('18:00');
    }
    setShowCustomPicker(true);
  };

  const handleSaveCustomTime = () => {
    if (customDayKey) {
      const customTime = `${customOpenTime} - ${customCloseTime}`;
      setTempSchedule(prev => ({
        ...prev,
        [customDayKey]: customTime,
      }));
      setShowCustomPicker(false);
      setEditingDay(null);
      setCustomDayKey(null);
    }
  };

  const handleApplyCustomToAll = () => {
    const customTime = `${customOpenTime} - ${customCloseTime}`;
    handleApplyToAll(customTime);
    setShowCustomPicker(false);
    setEditingDay(null);
    setCustomDayKey(null);
  };

  const handleApplyCustomToWeekdays = () => {
    const customTime = `${customOpenTime} - ${customCloseTime}`;
    handleApplyToWeekdays(customTime);
    setShowCustomPicker(false);
    setEditingDay(null);
    setCustomDayKey(null);
  };

  const getScheduleSummary = (): string => {
    const filled = DAYS.filter(d => schedule[d.key as keyof Schedule]);
    if (filled.length === 0) return 'Sin horarios definidos';
    if (filled.length === 7) {
      const allSame = filled.every(d => schedule[d.key as keyof Schedule] === schedule.monday);
      if (allSame) return `Todos los días: ${schedule.monday}`;
    }
    return `${filled.length} días configurados`;
  };

  const hasSchedule = Object.values(schedule).some(v => v);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="time-outline" size={20} color={COLORS.primary} />
          <Text style={styles.title}>Horarios de atención</Text>
        </View>
        <Text style={styles.helperText}>Opcional: indica cuándo está abierto tu lugar</Text>
      </View>

      <TouchableOpacity style={styles.summaryButton} onPress={handleOpenModal}>
        <View style={styles.summaryContent}>
          <Ionicons 
            name={hasSchedule ? "checkmark-circle" : "add-circle-outline"} 
            size={24} 
            color={hasSchedule ? COLORS.success : COLORS.primary} 
          />
          <Text style={[styles.summaryText, hasSchedule && styles.summaryTextActive]}>
            {getScheduleSummary()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </TouchableOpacity>

      {/* Preview de horarios si hay */}
      {hasSchedule && (
        <View style={styles.previewContainer}>
          {DAYS.map(day => {
            const value = schedule[day.key as keyof Schedule];
            if (!value) return null;
            return (
              <View key={day.key} style={styles.previewRow}>
                <Text style={styles.previewDay}>{day.short}</Text>
                <Text style={[
                  styles.previewTime,
                  value === 'Cerrado' && styles.previewTimeClosed
                ]}>
                  {value}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Modal de edición */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⏰ Configurar horarios</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Accesos rápidos */}
              <View style={styles.quickActions}>
                <Text style={styles.quickLabel}>Aplicar a todos:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => handleApplyToAll('09:00 - 18:00')}
                  >
                    <Text style={styles.quickButtonText}>9 a 18</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => handleApplyToAll('08:00 - 20:00')}
                  >
                    <Text style={styles.quickButtonText}>8 a 20</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => handleApplyToAll('10:00 - 22:00')}
                  >
                    <Text style={styles.quickButtonText}>10 a 22</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => handleApplyToAll('24 horas')}
                  >
                    <Text style={styles.quickButtonText}>24hs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.quickButton, styles.quickButtonWeekdays]}
                    onPress={() => handleApplyToWeekdays('09:00 - 18:00')}
                  >
                    <Text style={styles.quickButtonText}>Lun-Vie 9-18</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Custom time picker */}
              {showCustomPicker && (
                <View style={styles.customPickerContainer}>
                  <Text style={styles.customPickerTitle}>
                    Horario personalizado {customDayKey ? `para ${DAYS.find(d => d.key === customDayKey)?.label}` : ''}
                  </Text>
                  
                  <View style={styles.customTimeRow}>
                    <View style={styles.customTimeSection}>
                      <Text style={styles.customTimeLabel}>Apertura</Text>
                      <ScrollView style={styles.hourPicker} nestedScrollEnabled>
                        {HOURS.map(hour => (
                          <TouchableOpacity
                            key={`open-${hour.value}`}
                            style={[
                              styles.hourOption,
                              customOpenTime === hour.value && styles.hourOptionActive
                            ]}
                            onPress={() => setCustomOpenTime(hour.value)}
                          >
                            <Text style={[
                              styles.hourOptionText,
                              customOpenTime === hour.value && styles.hourOptionTextActive
                            ]}>
                              {hour.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.customTimeSeparator}>
                      <Ionicons name="arrow-forward" size={24} color={COLORS.gray} />
                    </View>

                    <View style={styles.customTimeSection}>
                      <Text style={styles.customTimeLabel}>Cierre</Text>
                      <ScrollView style={styles.hourPicker} nestedScrollEnabled>
                        {HOURS.map(hour => (
                          <TouchableOpacity
                            key={`close-${hour.value}`}
                            style={[
                              styles.hourOption,
                              customCloseTime === hour.value && styles.hourOptionActive
                            ]}
                            onPress={() => setCustomCloseTime(hour.value)}
                          >
                            <Text style={[
                              styles.hourOptionText,
                              customCloseTime === hour.value && styles.hourOptionTextActive
                            ]}>
                              {hour.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>

                  <Text style={styles.customPreview}>
                    {customOpenTime} - {customCloseTime}
                  </Text>

                  <View style={styles.customActions}>
                    <TouchableOpacity
                      style={styles.customActionButton}
                      onPress={handleSaveCustomTime}
                    >
                      <Text style={styles.customActionText}>Aplicar a este día</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.customActionButton}
                      onPress={handleApplyCustomToWeekdays}
                    >
                      <Text style={styles.customActionText}>Lun-Vie</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.customActionButton, styles.customActionButtonPrimary]}
                      onPress={handleApplyCustomToAll}
                    >
                      <Text style={[styles.customActionText, styles.customActionTextPrimary]}>Todos</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.closeCustomButton}
                    onPress={() => setShowCustomPicker(false)}
                  >
                    <Text style={styles.closeCustomText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Lista de días */}
              {DAYS.map(day => {
                const value = tempSchedule[day.key as keyof Schedule];
                const isEditing = editingDay === day.key;

                return (
                  <View key={day.key} style={styles.dayContainer}>
                    <TouchableOpacity
                      style={[styles.dayRow, isEditing && styles.dayRowActive]}
                      onPress={() => handleDayPress(day.key)}
                    >
                      <Text style={styles.dayLabel}>{day.label}</Text>
                      <View style={styles.dayValue}>
                        {value ? (
                          <>
                            <Text style={[
                              styles.dayValueText,
                              value === 'Cerrado' && styles.dayValueClosed
                            ]}>
                              {value}
                            </Text>
                            <TouchableOpacity
                              style={styles.clearButton}
                              onPress={() => handleClearDay(day.key)}
                            >
                              <Ionicons name="close-circle" size={20} color={COLORS.error} />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <Text style={styles.dayValueEmpty}>Sin definir</Text>
                        )}
                        <Ionicons
                          name={isEditing ? "chevron-up" : "chevron-down"}
                          size={20}
                          color={COLORS.gray}
                        />
                      </View>
                    </TouchableOpacity>

                    {isEditing && (
                      <View style={styles.timeOptions}>
                        {/* Botón de horario personalizado */}
                        <TouchableOpacity
                          style={[styles.timeOption, styles.timeOptionCustom]}
                          onPress={() => handleOpenCustomPicker(day.key)}
                        >
                          <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                          <Text style={[styles.timeOptionText, styles.timeOptionTextCustom]}>
                            Personalizado
                          </Text>
                        </TouchableOpacity>

                        {PRESET_SCHEDULES.map(preset => (
                          <TouchableOpacity
                            key={preset.value}
                            style={[
                              styles.timeOption,
                              value === preset.value && styles.timeOptionActive,
                              preset.value === 'Cerrado' && styles.timeOptionClosed,
                            ]}
                            onPress={() => handleSelectTime(day.key, preset.value)}
                          >
                            <Text style={[
                              styles.timeOptionText,
                              value === preset.value && styles.timeOptionTextActive,
                            ]}>
                              {preset.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScheduleForm;
