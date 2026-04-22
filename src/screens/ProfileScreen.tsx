// src/screens/ProfileScreen.tsx
// GUIANDO: Sin referencias a suscripciones + Toggle de tema

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { CATEGORIES } from '../constants/categories';
import { getProfile, updateProfile, changePassword, UserProfile } from '../services/profileApi';
import { uploadImage } from '../services/api';
import { convertImageToBase64 } from '../utils/imageUtils';

const ProfileScreen = ({ navigation }: any) => {
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  infoButton: { padding: 4 },
  avatarSection: { alignItems: 'center', padding: 24 },
  avatarContainer: { position: 'relative', marginBottom: 8 },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  avatarHint: { fontSize: 12, marginBottom: 8 },
  emailText: { fontSize: 16, marginBottom: 8 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  roleBadgeText: { fontSize: 13, fontWeight: '600' },
  section: { margin: 16, marginBottom: 0, padding: 16, borderRadius: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, marginBottom: 16, fontStyle: 'italic' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  copyButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyButtonText: { fontSize: 12, fontWeight: '600' },
  input: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, fontSize: 16 },
  socialInputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 8 },
  socialPrefix: { paddingLeft: 16, fontSize: 16, fontWeight: '600' },
  socialInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 12, fontSize: 16 },
  interestsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, gap: 6 },
  interestChipText: { fontSize: 14 },
  interestsCount: { marginTop: 12, fontSize: 12, textAlign: 'right' },
  // ── Tema ──────────────────────────────────────────────────────────────────
  themeOptionsContainer: { gap: 10 },
  themeOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 2, gap: 14 },
  themeIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  themeTextContainer: { flex: 1 },
  themeLabel: { fontSize: 15, fontWeight: '600' },
  themeDesc: { fontSize: 12, marginTop: 2 },
  themeStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, padding: 10, borderRadius: 10, borderWidth: 1 },
  themeStatusText: { fontSize: 13, fontWeight: '600' },
  // ── Guardar ───────────────────────────────────────────────────────────────
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, padding: 16, borderRadius: 12, gap: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 18, fontWeight: '700' },
  // ── Contraseña ────────────────────────────────────────────────────────────
  passwordToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  passwordToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  passwordToggleText: { fontSize: 16, fontWeight: '600' },
  passwordSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 8 },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  eyeButton: { padding: 12 },
  changePasswordButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 8, gap: 8, marginTop: 8 },
  changePasswordButtonDisabled: { opacity: 0.6 },
  changePasswordButtonText: { fontSize: 16, fontWeight: '600' },
  bottomPadding: { height: 20 },
});

  const { user, updateUser } = useAuth();
  const { colors: COLORS, themeMode, isDark, setThemeMode } = useTheme();
  
  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Datos del perfil
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  
  // Cambio de contraseña
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setWhatsapp(data.whatsapp || '');
      setAddress(data.address || '');
      setInstagram(data.instagram || '');
      setFacebook(data.facebook || '');
      setInterests(data.interests || []);
      setAvatar(data.avatar || null);
    } catch (error: any) {
      console.error('Error cargando perfil:', error);
      if (user) {
        setName(user.name || '');
        setPhone((user as any).phone || '');
        setWhatsapp((user as any).whatsapp || '');
        setAddress((user as any).address || '');
        setInstagram((user as any).instagram || '');
        setFacebook((user as any).facebook || '');
        setInterests((user as any).interests || []);
        setAvatar((user as any).avatar || null);
        setProfile({
          _id: user._id || '',
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          phone: (user as any).phone || '',
          whatsapp: (user as any).whatsapp || '',
          address: (user as any).address || '',
          instagram: (user as any).instagram || '',
          facebook: (user as any).facebook || '',
          twitter: '',
          interests: (user as any).interests || [],
          avatar: (user as any).avatar,
          trusted: user.trusted || false,
          createdAt: '',
        });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar el perfil', position: 'bottom' });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({ type: 'error', text1: 'Permiso denegado', text2: 'Necesitamos acceso a tus fotos', position: 'bottom' });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        try {
          const base64 = await convertImageToBase64(result.assets[0].uri);
          const imageUrl = await uploadImage(base64);
          await updateProfile({ avatar: imageUrl } as any);
          setAvatar(imageUrl);
          if (updateUser) await updateUser({ avatar: imageUrl } as any);
          Toast.show({ type: 'success', text1: '✅ Foto actualizada', text2: 'Tu foto de perfil ha sido cambiada', position: 'bottom' });
        } catch (uploadError) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo subir la imagen', position: 'bottom' });
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      setUploadingAvatar(false);
    }
  };
  
  const toggleInterest = (category: string) => {
    setInterests(prev => {
      if (prev.includes(category)) return prev.filter(c => c !== category);
      if (prev.length >= 10) {
        Toast.show({ type: 'info', text1: 'Límite alcanzado', text2: 'Máximo 10 categorías de interés', position: 'bottom' });
        return prev;
      }
      return [...prev, category];
    });
  };
  
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'El nombre es obligatorio', position: 'bottom' });
      return;
    }
    if (name.trim().length < 2) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'El nombre debe tener al menos 2 caracteres', position: 'bottom' });
      return;
    }
    try {
      setSaving(true);
      const result = await updateProfile({
        name: name.trim(), phone: phone.trim(), whatsapp: whatsapp.trim(),
        address: address.trim(), instagram: instagram.trim(), facebook: facebook.trim(), interests,
      });
      if (updateUser && result.user) updateUser(result.user);
      Toast.show({ type: 'success', text1: '✅ Perfil actualizado', text2: 'Los cambios se guardaron correctamente', position: 'bottom' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'No se pudo guardar el perfil', position: 'bottom' });
    } finally {
      setSaving(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Completa todos los campos de contraseña', position: 'bottom' });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'La nueva contraseña debe tener al menos 6 caracteres', position: 'bottom' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Las contraseñas no coinciden', position: 'bottom' });
      return;
    }
    try {
      setChangingPassword(true);
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setShowPasswordSection(false);
      Toast.show({ type: 'success', text1: '✅ Contraseña actualizada', text2: 'Tu contraseña ha sido cambiada', position: 'bottom' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'No se pudo cambiar la contraseña', position: 'bottom' });
    } finally {
      setChangingPassword(false);
    }
  };
  
  const copyPhoneToWhatsapp = () => {
    if (phone.trim()) {
      setWhatsapp(phone.trim());
      Toast.show({ type: 'info', text1: 'Copiado', text2: 'Teléfono copiado a WhatsApp', position: 'bottom', visibilityTime: 1500 });
    }
  };

  const handleNavigateToLegal = () => navigation.navigate('Legal');

  // ── Opciones de tema ────────────────────────────────────────────────────────
  const themeOptions: { mode: ThemeMode; label: string; icon: string; desc: string }[] = [
    { mode: 'light', label: 'Claro',      icon: 'sunny',          desc: 'Siempre modo claro' },
    { mode: 'dark',  label: 'Oscuro',     icon: 'moon',           desc: 'Siempre modo oscuro' },
    { mode: 'auto',  label: 'Automático', icon: 'time-outline',   desc: 'Oscuro de 20:00 a 06:00' },
  ];
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: COLORS.gray }]}>Cargando perfil...</Text>
      </View>
    );
  }
  

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={[styles.header, { backgroundColor: COLORS.white, borderBottomColor: COLORS.grayLight }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Mi Perfil</Text>
          <TouchableOpacity onPress={handleNavigateToLegal} style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={26} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Avatar y email */}
        <View style={[styles.avatarSection, { backgroundColor: COLORS.white }]}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar} disabled={uploadingAvatar}>
            {uploadingAvatar ? (
              <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.grayLight }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.grayLight }]}>
                <Ionicons name="person" size={50} color={COLORS.gray} />
              </View>
            )}
            <View style={[styles.avatarEditBadge, { backgroundColor: COLORS.primary, borderColor: COLORS.white }]}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: COLORS.gray }]}>Toca para cambiar foto</Text>
          <Text style={[styles.emailText, { color: COLORS.gray }]}>{profile?.email}</Text>
          {user?.role === 'seeder' && (
            <View style={[styles.roleBadge, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="leaf" size={14} color={COLORS.success} />
              <Text style={[styles.roleBadgeText, { color: COLORS.success }]}>Seeder</Text>
            </View>
          )}
          {user?.trusted && user?.role !== 'seeder' && (
            <View style={[styles.roleBadge, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={[styles.roleBadgeText, { color: COLORS.success }]}>Usuario verificado</Text>
            </View>
          )}
        </View>
        
        {/* Información personal */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>👤 Información Personal</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.text }]}>Nombre *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
              placeholder="Tu nombre completo" placeholderTextColor={COLORS.gray}
              value={name} onChangeText={setName} maxLength={50}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.text }]}>Dirección</Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
              placeholder="Tu dirección" placeholderTextColor={COLORS.gray}
              value={address} onChangeText={setAddress} maxLength={200}
            />
          </View>
        </View>
        
        {/* Información de contacto */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>📱 Información de Contacto</Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.gray }]}>Estos datos se precargarán en tus publicaciones</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.text }]}>Teléfono</Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
              placeholder="Ej: 351-1234567" placeholderTextColor={COLORS.gray}
              value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={20}
            />
          </View>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: COLORS.text }]}>WhatsApp</Text>
              {phone.trim() && (
                <TouchableOpacity onPress={copyPhoneToWhatsapp} style={styles.copyButton}>
                  <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
                  <Text style={[styles.copyButtonText, { color: COLORS.primary }]}>Copiar teléfono</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
              placeholder="Número de WhatsApp" placeholderTextColor={COLORS.gray}
              value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" maxLength={20}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.text }]}>Instagram</Text>
            <View style={[styles.socialInputContainer, { backgroundColor: COLORS.inputBackground }]}>
              <Text style={[styles.socialPrefix, { color: COLORS.gray }]}>@</Text>
              <TextInput
                style={[styles.socialInput, { color: COLORS.text }]}
                placeholder="tu_usuario" placeholderTextColor={COLORS.gray}
                value={instagram} onChangeText={setInstagram} autoCapitalize="none" maxLength={50}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.text }]}>Facebook</Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
              placeholder="URL o nombre de usuario" placeholderTextColor={COLORS.gray}
              value={facebook} onChangeText={setFacebook} autoCapitalize="none" maxLength={100}
            />
          </View>
        </View>
        
        {/* Intereses */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>⭐ Mis Intereses</Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.gray }]}>
            Selecciona las categorías que te interesan. Aparecerán primero en el filtro.
          </Text>
          <View style={styles.interestsContainer}>
            {CATEGORIES.map((category) => {
              const isSelected = interests.includes(category);
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.interestChip,
                    { backgroundColor: COLORS.inputBackground, borderColor: COLORS.grayLight },
                    isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                  ]}
                  onPress={() => toggleInterest(category)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.interestChipText, { color: COLORS.text }, isSelected && { color: COLORS.white, fontWeight: '600' }]}>
                    {category}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.interestsCount, { color: COLORS.gray }]}>{interests.length}/10 seleccionados</Text>
        </View>

        {/* ── PREFERENCIAS DE TEMA ─────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>🎨 Apariencia</Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.gray }]}>
            Elegí cómo querés ver la app
          </Text>

          <View style={styles.themeOptionsContainer}>
            {themeOptions.map(({ mode, label, icon, desc }) => {
              const isActive = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeOption,
                    { borderColor: COLORS.grayLight, backgroundColor: COLORS.inputBackground },
                    isActive && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
                  ]}
                  onPress={() => setThemeMode(mode)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.themeIconContainer,
                    { backgroundColor: COLORS.grayLight },
                    isActive && { backgroundColor: COLORS.primary },
                  ]}>
                    <Ionicons name={icon as any} size={22} color={isActive ? COLORS.white : COLORS.gray} />
                  </View>
                  <View style={styles.themeTextContainer}>
                    <Text style={[styles.themeLabel, { color: COLORS.text }, isActive && { color: COLORS.primary, fontWeight: '700' }]}>
                      {label}
                    </Text>
                    <Text style={[styles.themeDesc, { color: COLORS.gray }]}>{desc}</Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Indicador del estado actual */}
          <View style={[styles.themeStatusBadge, { backgroundColor: isDark ? '#1A1A2E' : '#FFF9E6', borderColor: isDark ? COLORS.primaryLight : COLORS.accent }]}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={16} color={isDark ? COLORS.primaryLight : COLORS.secondary} />
            <Text style={[styles.themeStatusText, { color: isDark ? COLORS.primaryLight : COLORS.secondary }]}>
              {isDark ? 'Modo oscuro activo' : 'Modo claro activo'}
              {themeMode === 'auto' ? ' · automático' : ''}
            </Text>
          </View>
        </View>
        
        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: COLORS.secondary, shadowColor: COLORS.shadow }, saving && styles.saveButtonDisabled]}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={[styles.saveButtonText, { color: COLORS.white }]}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Cambiar contraseña */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPasswordSection(!showPasswordSection)}>
            <View style={styles.passwordToggleLeft}>
              <Ionicons name="lock-closed" size={24} color={COLORS.primary} />
              <Text style={[styles.passwordToggleText, { color: COLORS.text }]}>Cambiar Contraseña</Text>
            </View>
            <Ionicons name={showPasswordSection ? 'chevron-up' : 'chevron-down'} size={24} color={COLORS.gray} />
          </TouchableOpacity>
          
          {showPasswordSection && (
            <View style={[styles.passwordSection, { borderTopColor: COLORS.grayLight }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: COLORS.text }]}>Contraseña actual</Text>
                <View style={[styles.passwordInputContainer, { backgroundColor: COLORS.inputBackground }]}>
                  <TextInput
                    style={[styles.passwordInput, { color: COLORS.text }]}
                    placeholder="••••••••" placeholderTextColor={COLORS.gray}
                    value={currentPassword} onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword} autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeButton}>
                    <Ionicons name={showCurrentPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.gray} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: COLORS.text }]}>Nueva contraseña</Text>
                <View style={[styles.passwordInputContainer, { backgroundColor: COLORS.inputBackground }]}>
                  <TextInput
                    style={[styles.passwordInput, { color: COLORS.text }]}
                    placeholder="Mínimo 6 caracteres" placeholderTextColor={COLORS.gray}
                    value={newPassword} onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword} autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}>
                    <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.gray} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: COLORS.text }]}>Confirmar nueva contraseña</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
                  placeholder="Repite la nueva contraseña" placeholderTextColor={COLORS.gray}
                  value={confirmPassword} onChangeText={setConfirmPassword}
                  secureTextEntry={!showNewPassword} autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={[styles.changePasswordButton, { backgroundColor: COLORS.primary }, changingPassword && styles.changePasswordButtonDisabled]}
                onPress={handleChangePassword} disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="key" size={20} color={COLORS.white} />
                    <Text style={[styles.changePasswordButtonText, { color: COLORS.white }]}>Cambiar Contraseña</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;
