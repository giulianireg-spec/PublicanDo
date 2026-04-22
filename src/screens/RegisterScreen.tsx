// src/screens/RegisterScreen.tsx
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
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LegalScreen from './LegalScreen';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onLoginPress: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onLoginPress }: RegisterScreenProps) {
  const { colors: COLORS } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);

  const { register, googleSignIn } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Campos incompletos', text2: 'Por favor completa los campos obligatorios', position: 'top', topOffset: 20, visibilityTime: 3000 });
      return;
    }
    if (name.length < 3) {
      Toast.show({ type: 'error', text1: 'Nombre muy corto', text2: 'El nombre debe tener al menos 3 caracteres', position: 'top', topOffset: 20, visibilityTime: 3000 });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({ type: 'error', text1: 'Email inválido', text2: 'Por favor ingresa un email válido', position: 'top', topOffset: 20, visibilityTime: 3000 });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Contraseña débil', text2: 'La contraseña debe tener al menos 6 caracteres', position: 'top', topOffset: 20, visibilityTime: 3000 });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Contraseñas no coinciden', text2: 'Por favor verifica las contraseñas', position: 'top', topOffset: 20, visibilityTime: 3000 });
      return;
    }
    if (!acceptedTerms) {
      Toast.show({ type: 'error', text1: 'Términos no aceptados', text2: 'Debés aceptar los términos y condiciones', position: 'top', topOffset: 20, visibilityTime: 3000 });
      return;
    }
    try {
      setLoading(true);
      const optionalData: any = {};
      if (phone.trim()) optionalData.phone = phone.trim();
      if (whatsapp.trim()) optionalData.whatsapp = whatsapp.trim();
      if (address.trim()) optionalData.address = address.trim();
      if (instagram.trim()) optionalData.instagram = instagram.trim().replace(/^@/, '');
      if (facebook.trim()) optionalData.facebook = facebook.trim();
      await register(name.trim(), email.toLowerCase().trim(), password, optionalData);
      Toast.show({ type: 'success', text1: '✅ ¡Cuenta creada!', text2: 'Bienvenido a GuianDo', position: 'top', topOffset: 20, visibilityTime: 4000 });
      setTimeout(() => onRegisterSuccess(), 500);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error al crear cuenta', text2: error.message || 'El email ya está registrado', position: 'top', topOffset: 20, visibilityTime: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!acceptedTerms) {
      Toast.show({ type: 'error', text1: 'Términos no aceptados', text2: 'Debés aceptar los términos y condiciones', position: 'top', topOffset: 20, visibilityTime: 3000 });
      return;
    }
    try {
      setLoading(true);
      await googleSignIn();
      Toast.show({ type: 'success', text1: '✅ ¡Cuenta creada!', text2: 'Bienvenido a GuianDo', position: 'top', topOffset: 20, visibilityTime: 3000 });
      setTimeout(() => onRegisterSuccess(), 500);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error con Google', text2: error.message || 'Error al registrarse con Google', position: 'top', topOffset: 20, visibilityTime: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const copyPhoneToWhatsapp = () => {
    if (phone.trim()) setWhatsapp(phone.trim());
  };

  const mockNavigation = {
    goBack: () => setShowLegalModal(false),
    navigate: () => {},
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { flexGrow: 1 },
    content: { flex: 1, padding: 24 },
    header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
    title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginTop: 16 },
    subtitle: { fontSize: 15, color: COLORS.gray, textAlign: 'center', marginTop: 8 },
    form: { flex: 1 },
    requiredNote: { fontSize: 12, color: COLORS.gray, marginBottom: 16, fontStyle: 'italic' },
    inputContainer: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
      borderRadius: 12, paddingHorizontal: 16, marginBottom: 12,
      borderWidth: 1, borderColor: COLORS.grayLight,
    },
    inputContainerWithAction: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    inputContainerFlex: { flex: 1, marginBottom: 0 },
    inputIcon: { marginRight: 12 },
    atSymbol: { fontSize: 16, color: COLORS.gray, fontWeight: '600' },
    input: { flex: 1, paddingVertical: 14, fontSize: 16, color: COLORS.text },
    eyeButton: { padding: 4 },
    copyButton: { padding: 12, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.grayLight },
    termsContainer: { marginTop: 8, marginBottom: 16 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start' },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.grayLight, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
    checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    termsText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
    termsLink: { color: COLORS.primary, fontWeight: '600', textDecorationLine: 'underline' },
    termsHint: { fontSize: 12, color: COLORS.gray, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
    registerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary, borderRadius: 12, paddingVertical: 16, marginTop: 8, gap: 8 },
    registerButtonDisabled: { opacity: 0.6 },
    registerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.grayLight },
    dividerText: { marginHorizontal: 16, fontSize: 14, color: COLORS.gray },
    googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.grayLight, gap: 8 },
    googleButtonDisabled: { opacity: 0.6 },
    googleButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
    googleButtonTextDisabled: { color: COLORS.gray },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 20 },
    loginText: { fontSize: 14, color: COLORS.gray },
    loginLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  });

  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.header}>
              <Ionicons name="compass" size={64} color={COLORS.primary} />
              <Text style={styles.title}>Crear Cuenta</Text>
              <Text style={styles.subtitle}>Descubrí y compartí lugares increíbles</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.requiredNote}>* Campos obligatorios</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Nombre completo *" placeholderTextColor={COLORS.gray} value={name} onChangeText={setName} autoCapitalize="words" />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Email *" placeholderTextColor={COLORS.gray} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Contraseña *" placeholderTextColor={COLORS.gray} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Confirmar contraseña *" placeholderTextColor={COLORS.gray} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} autoCapitalize="none" />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                  <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="call" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Teléfono" placeholderTextColor={COLORS.gray} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={20} />
              </View>

              <View style={styles.inputContainerWithAction}>
                <View style={[styles.inputContainer, styles.inputContainerFlex]}>
                  <Ionicons name="logo-whatsapp" size={20} color="#25D366" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="WhatsApp" placeholderTextColor={COLORS.gray} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" maxLength={20} />
                </View>
                {phone.trim() && !whatsapp.trim() && (
                  <TouchableOpacity onPress={copyPhoneToWhatsapp} style={styles.copyButton}>
                    <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="location" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Dirección" placeholderTextColor={COLORS.gray} value={address} onChangeText={setAddress} maxLength={200} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="logo-instagram" size={20} color="#E4405F" style={styles.inputIcon} />
                <Text style={styles.atSymbol}>@</Text>
                <TextInput style={styles.input} placeholder="Instagram" placeholderTextColor={COLORS.gray} value={instagram} onChangeText={setInstagram} autoCapitalize="none" maxLength={50} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="logo-facebook" size={20} color="#1877F2" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Facebook" placeholderTextColor={COLORS.gray} value={facebook} onChangeText={setFacebook} autoCapitalize="none" maxLength={100} />
              </View>

              <View style={styles.termsContainer}>
                <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAcceptedTerms(!acceptedTerms)} activeOpacity={0.7}>
                  <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                    {acceptedTerms && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                  </View>
                  <Text style={styles.termsText}>
                    Acepto los{' '}
                    <Text style={styles.termsLink} onPress={() => setShowLegalModal(true)}>Términos y Condiciones</Text>
                    {' '}y la{' '}
                    <Text style={styles.termsLink} onPress={() => setShowLegalModal(true)}>Política de Privacidad</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, (loading || !acceptedTerms) && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading || !acceptedTerms}
              >
                {loading ? <ActivityIndicator color={COLORS.white} /> : (
                  <>
                    <Ionicons name="person-add" size={20} color={COLORS.white} />
                    <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>O registrate con</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.googleButton, !acceptedTerms && styles.googleButtonDisabled]}
                onPress={handleGoogleRegister}
                disabled={loading || !acceptedTerms}
              >
                <Ionicons name="logo-google" size={20} color={acceptedTerms ? COLORS.text : COLORS.gray} />
                <Text style={[styles.googleButtonText, !acceptedTerms && styles.googleButtonTextDisabled]}>Google</Text>
              </TouchableOpacity>

              {!acceptedTerms && <Text style={styles.termsHint}>Aceptá los términos para continuar</Text>}

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>¿Ya tenés cuenta? </Text>
                <TouchableOpacity onPress={onLoginPress}>
                  <Text style={styles.loginLink}>Iniciá sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showLegalModal} animationType="slide" transparent={false} onRequestClose={() => setShowLegalModal(false)}>
        <LegalScreen navigation={mockNavigation} />
      </Modal>

      <Toast />
    </>
  );
}
