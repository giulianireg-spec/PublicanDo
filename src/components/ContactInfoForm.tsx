// src/components/ContactInfoForm.tsx
// ACTUALIZADO: Twitter → X con logo 𝕏 y fondo negro

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ContactInfo {
  phone?: string;
  email?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

interface ContactInfoFormProps {
  contactInfo: ContactInfo;
  onContactInfoChange: (contactInfo: ContactInfo) => void;
}

export const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  contactInfo,
  onContactInfoChange,
}) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  section: {
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  contactFormContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  formGroup: {
    marginBottom: 12,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  socialTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 12,
    marginBottom: 8,
  },
  // ✅ NUEVO: Estilos para logo X
  xLogoContainer: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLogoSmall: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 16,
  },
});

  const [showContactForm, setShowContactForm] = useState(
    !!(
      contactInfo.phone ||
      contactInfo.email ||
      contactInfo.whatsapp ||
      contactInfo.instagram ||
      contactInfo.facebook ||
      contactInfo.twitter
    )
  );

  useEffect(() => {
    console.log('🔄 ContactInfoForm: props.contactInfo cambió a:', contactInfo);
  }, [contactInfo]);

  const handleToggleContactForm = (value: boolean) => {
    setShowContactForm(value);
    if (!value) {
      onContactInfoChange({});
    }
  };

  const handleFieldChange = (field: keyof ContactInfo, value: string) => {
    const newContactInfo = {
      ...contactInfo,
      [field]: value || undefined,
    };
    onContactInfoChange(newContactInfo);
  };

  return (
    <View style={styles.section}>
      {/* Toggle para mostrar formulario de contacto */}
      <View style={styles.toggleContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Agregar datos de contacto</Text>
          <Text style={styles.helperText}>
            Opcional: Comparte tu información de contacto
          </Text>
        </View>
        <Switch
          value={showContactForm}
          onValueChange={handleToggleContactForm}
          trackColor={{ false: COLORS.grayLight, true: COLORS.secondary }}
          thumbColor={showContactForm ? COLORS.primary : COLORS.gray}
        />
      </View>

      {/* Formulario de contacto */}
      {showContactForm && (
        <View style={styles.contactFormContainer}>
          {/* Teléfono */}
          <View style={styles.formGroup}>
            <View style={styles.fieldHeader}>
              <Ionicons name="call" size={18} color={COLORS.primary} />
              <Text style={styles.fieldLabel}>Teléfono</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: +54 9 351 555 5555"
              placeholderTextColor={COLORS.gray}
              value={contactInfo.phone || ''}
              onChangeText={(value) => handleFieldChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* WhatsApp */}
          <View style={styles.formGroup}>
            <View style={styles.fieldHeader}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text style={styles.fieldLabel}>WhatsApp</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: +54 9 351 555 5555"
              placeholderTextColor={COLORS.gray}
              value={contactInfo.whatsapp || ''}
              onChangeText={(value) => handleFieldChange('whatsapp', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <View style={styles.fieldHeader}>
              <Ionicons name="mail" size={18} color={COLORS.primary} />
              <Text style={styles.fieldLabel}>Email</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: contacto@empresa.com"
              placeholderTextColor={COLORS.gray}
              value={contactInfo.email || ''}
              onChangeText={(value) => handleFieldChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Redes Sociales */}
          <Text style={styles.socialTitle}>Redes Sociales (opcional)</Text>

          {/* Instagram */}
          <View style={styles.formGroup}>
            <View style={styles.fieldHeader}>
              <Ionicons name="logo-instagram" size={18} color="#E4405F" />
              <Text style={styles.fieldLabel}>Instagram</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: @miempresa o https://instagram.com/miempresa"
              placeholderTextColor={COLORS.gray}
              value={contactInfo.instagram || ''}
              onChangeText={(value) => handleFieldChange('instagram', value)}
              autoCapitalize="none"
            />
          </View>

          {/* Facebook */}
          <View style={styles.formGroup}>
            <View style={styles.fieldHeader}>
              <Ionicons name="logo-facebook" size={18} color="#1877F2" />
              <Text style={styles.fieldLabel}>Facebook</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: Mi Empresa o URL del perfil"
              placeholderTextColor={COLORS.gray}
              value={contactInfo.facebook || ''}
              onChangeText={(value) => handleFieldChange('facebook', value)}
              autoCapitalize="none"
            />
          </View>

          {/* ✅ ACTUALIZADO: X (antes Twitter) */}
          <View style={styles.formGroup}>
            <View style={styles.fieldHeader}>
              <View style={styles.xLogoContainer}>
                <Text style={styles.xLogoSmall}>𝕏</Text>
              </View>
              <Text style={styles.fieldLabel}>X (Twitter)</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: @miempresa o URL del perfil"
              placeholderTextColor={COLORS.gray}
              value={contactInfo.twitter || ''}
              onChangeText={(value) => handleFieldChange('twitter', value)}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color="#2196F3" />
            <Text style={styles.infoText}>
              Los datos de contacto aparecerán en la parte inferior del flyer publicitario
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

