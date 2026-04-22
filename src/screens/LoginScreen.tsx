// src/screens/LoginScreen.tsx
// GUIANDO: Textos actualizados

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onRegisterPress: () => void;
  onForgotPasswordPress?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onRegisterPress, onForgotPasswordPress }: LoginScreenProps) {
  const { colors: COLORS } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleSignIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Campos incompletos',
        text2: 'Por favor completa todos los campos',
        position: 'top',
        topOffset: 20,
        visibilityTime: 3000,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Email inválido',
        text2: 'Por favor ingresa un email válido',
        position: 'top',
        topOffset: 20,
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      await login(email.toLowerCase().trim(), password);
      Toast.show({
        type: 'success',
        text1: '¡Bienvenido! 👋',
        text2: 'Has iniciado sesión correctamente',
        position: 'top',
        topOffset: 20,
        visibilityTime: 3000,
      });
      setTimeout(() => onLoginSuccess(), 500);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al iniciar sesión',
        text2: error.message || 'Credenciales incorrectas',
        position: 'top',
        topOffset: 20,
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await googleSignIn();
      Toast.show({
        type: 'success',
        text1: '¡Bienvenido! 👋',
        text2: 'Has iniciado sesión con Google',
        position: 'top',
        topOffset: 20,
        visibilityTime: 3000,
      });
      setTimeout(() => onLoginSuccess(), 500);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error con Google',
        text2: error.message || 'Error al iniciar sesión con Google',
        position: 'top',
        topOffset: 20,
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { flexGrow: 1 },
    content: { flex: 1, padding: 24 },
    header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
    title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginTop: 16 },
    subtitle: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginTop: 8 },
    form: { flex: 1 },
    inputContainer: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
      borderRadius: 12, paddingHorizontal: 16, marginBottom: 16,
      borderWidth: 1, borderColor: COLORS.grayLight,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, paddingVertical: 14, fontSize: 16, color: COLORS.text },
    eyeButton: { padding: 4 },
    loginButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, marginTop: 8, gap: 8,
    },
    loginButtonDisabled: { opacity: 0.6 },
    loginButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.grayLight },
    dividerText: { marginHorizontal: 16, fontSize: 14, color: COLORS.gray },
    googleButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: COLORS.white, borderRadius: 12, paddingVertical: 14,
      borderWidth: 1, borderColor: COLORS.grayLight, gap: 8,
    },
    googleButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    registerText: { fontSize: 14, color: COLORS.gray },
    registerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
    forgotPasswordLink: { alignItems: 'center', marginTop: 16 },
    forgotPasswordText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="compass" size={64} color={COLORS.primary} />
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>Descubrí lugares increíbles en tu ciudad</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color={COLORS.white} />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </>
              )}
            </TouchableOpacity>

            {onForgotPasswordPress && (
              <TouchableOpacity style={styles.forgotPasswordLink} onPress={onForgotPasswordPress}>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O continúa con</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={loading}>
              <Ionicons name="logo-google" size={20} color={COLORS.text} />
              <Text style={styles.googleButtonText}>Google</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={onRegisterPress}>
                <Text style={styles.registerLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
}
