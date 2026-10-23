// src/screens/ForgotPasswordScreen.tsx
// CORREGIDO: Mejor UX sin comprometer seguridad
// - Mensaje claro de que el código se envía SI el email está registrado
// - No revela si el email existe o no (seguridad)

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { forgotPassword, verifyResetCode, resetPassword } from '../services/api';

interface ForgotPasswordScreenProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

type Step = 'email' | 'code' | 'password';

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onSuccess,
  onBackToLogin,
}) => {
  const { colors: COLORS } = useTheme();
  const { t } = useTranslation();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.grayLight,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.grayLight,
  },
  form: {
    marginBottom: 24,
  },
  emailReminder: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  emailHighlight: {
    color: COLORS.primaryText,
    fontWeight: '600',
  },
  // ✅ NUEVO: Estilos para el infoBox
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  eyeButton: {
    padding: 8,
  },
  passwordHint: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 16,
    marginTop: -8,
    marginLeft: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.onPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendButtonText: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  backButtonText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  loginLinkText: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
});

  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  
  // Datos del formulario
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibilidad de contraseñas
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Paso 1: Solicitar código
  const handleRequestCode = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: t('forgot.enterEmail'),
        position: 'bottom',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: t('forgot.validEmail'),
        position: 'bottom',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword(email.trim().toLowerCase());
      
      // ✅ CORREGIDO: Mensaje más claro sin revelar si el email existe
      Toast.show({
        type: 'success',
        text1: t('forgot.processed'),
        text2: t('forgot.willReceive'),
        position: 'bottom',
        visibilityTime: 4000,
      });

      // En desarrollo, mostrar el código si viene
      if (response.devCode) {
        console.log('🔐 [DEV] Código de recuperación:', response.devCode);
        Toast.show({
          type: 'info',
          text1: '🔐 Código (DEV)',
          text2: response.devCode,
          position: 'top',
          visibilityTime: 10000,
        });
      }

      setStep('code');
    } catch (error: any) {
      // ✅ CORREGIDO: Incluso si hay error, mostramos mensaje genérico
      // para no revelar si el email existe o no
      Toast.show({
        type: 'success',
        text1: t('forgot.processed'),
        text2: t('forgot.willReceive'),
        position: 'bottom',
        visibilityTime: 4000,
      });
      setStep('code');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar código
  const handleVerifyCode = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: t('forgot.enterCode'),
        position: 'bottom',
      });
      return;
    }

    try {
      setLoading(true);
      await verifyResetCode(email.trim().toLowerCase(), code.trim());
      
      Toast.show({
        type: 'success',
        text1: t('forgot.codeOk'),
        text2: t('forgot.nowPassword'),
        position: 'bottom',
      });

      setStep('password');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('forgot.codeBad'),
        text2: t('forgot.codeBadBody'),
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Cambiar contraseña
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: t('forgot.bothFields'),
        position: 'bottom',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: t('forgot.pwdShort'),
        position: 'bottom',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: t('forgot.pwdMismatch'),
        position: 'bottom',
      });
      return;
    }

    try {
      setLoading(true);
      await resetPassword(
        email.trim().toLowerCase(),
        code.trim(),
        newPassword,
        confirmPassword
      );
      
      Toast.show({
        type: 'success',
        text1: t('forgot.done'),
        text2: t('forgot.updated'),
        position: 'bottom',
        visibilityTime: 3000,
      });

      // Volver al login
      setTimeout(() => {
        onSuccess?.();
        onBackToLogin?.();
      }, 1500);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || t('forgot.changeError'),
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    try {
      setLoading(true);
      const response = await forgotPassword(email.trim().toLowerCase());
      
      Toast.show({
        type: 'success',
        text1: t('forgot.resent'),
        text2: t('forgot.willReceiveNew'),
        position: 'bottom',
      });

      if (response.devCode) {
        console.log('🔐 [DEV] Nuevo código:', response.devCode);
        Toast.show({
          type: 'info',
          text1: '🔐 Código (DEV)',
          text2: response.devCode,
          position: 'top',
          visibilityTime: 10000,
        });
      }
    } catch (error: any) {
      // Silenciar error para no revelar info
      Toast.show({
        type: 'success',
        text1: t('forgot.resent'),
        text2: t('forgot.willReceiveNew'),
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, step === 'email' && styles.stepDotActive]} />
      <View style={styles.stepLine} />
      <View style={[styles.stepDot, step === 'code' && styles.stepDotActive]} />
      <View style={styles.stepLine} />
      <View style={[styles.stepDot, step === 'password' && styles.stepDotActive]} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="key" size={48} color={COLORS.primaryText} />
          </View>
          <Text style={styles.title}>{t('forgot.title')}</Text>
          <Text style={styles.subtitle}>
            {step === 'email' && t('forgot.stepEmail')}
            {step === 'code' && t('forgot.enterCode')}
            {step === 'password' && t('forgot.stepPassword')}
          </Text>
          {renderStepIndicator()}
        </View>

        {/* Paso 1: Email */}
        {step === 'email' && (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* ✅ NUEVO: Mensaje informativo */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={16} color="#1976D2" />
              <Text style={styles.infoBoxText}>
                {t('forgot.emailNote')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleRequestCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.onPrimary} />
              ) : (
                <>
                  <Ionicons name="send" size={20} color={COLORS.onPrimary} />
                  <Text style={styles.primaryButtonText}>{t('forgot.send')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Paso 2: Código */}
        {step === 'code' && (
          <View style={styles.form}>
            <Text style={styles.emailReminder}>
              Código enviado a: <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            {/* ✅ NUEVO: Mensaje informativo */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={16} color="#1976D2" />
              <Text style={styles.infoBoxText}>
                {t('forgot.checkInbox')}
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="keypad" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="000000"
                placeholderTextColor={COLORS.gray}
                value={code}
                onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.onPrimary} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.onPrimary} />
                  <Text style={styles.primaryButtonText}>{t('forgot.verify')}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>{t('forgot.resend')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep('email')}
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={16} color={COLORS.gray} />
              <Text style={styles.backButtonText}>{t('forgot.changeEmail')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Paso 3: Nueva contraseña */}
        {step === 'password' && (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('forgot.newPwd')}
                placeholderTextColor={COLORS.gray}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('forgot.confirmPwd')}
                placeholderTextColor={COLORS.gray}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.passwordHint}>
              {t('forgot.min6')}
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.onPrimary} />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={20} color={COLORS.onPrimary} />
                  <Text style={styles.primaryButtonText}>{t('forgot.change')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Volver al login */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={onBackToLogin}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={16} color={COLORS.primaryText} />
          <Text style={styles.loginLinkText}>{t('forgot.backLogin')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;