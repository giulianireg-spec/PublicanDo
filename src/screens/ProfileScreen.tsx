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
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { CATEGORIES } from '../constants/categories';
import { categoryLabel } from '../i18n/labels';
import { LANGUAGES, setAppLanguage, currentLanguage } from '../i18n';
import { getProfile, updateProfile, changePassword, UserProfile, deleteAccount, DELETE_ACCOUNT_CONFIRMATION } from '../services/profileApi';
import { uploadImage } from '../services/api';
import { User } from '../types';
import { convertImageToBase64 } from '../utils/imageUtils';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  deleteAccountButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 10, borderWidth: 1.5 },
  deleteAccountButtonText: { fontSize: 16, fontWeight: '700' },
  deleteModalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', padding: 24 },
  deleteModalCard: { borderRadius: 16, padding: 20, gap: 12 },
  deleteModalText: { fontSize: 14, lineHeight: 20 },
  deleteModalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  deleteModalButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10 },
  deleteModalButtonText: { fontSize: 16, fontWeight: '700' },
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

  const { user, updateUser, logout } = useAuth();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const { colors: COLORS, themeMode, isDark, setThemeMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
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
        Toast.show({ type: 'error', text1: 'Error', text2: t('profile.loadError'), position: 'bottom' });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({ type: 'error', text1: t('profile.permDenied'), text2: t('profile.photosAccess'), position: 'bottom' });
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
          Toast.show({ type: 'success', text1: t('profile.photoUpdated'), text2: t('profile.photoUpdatedBody'), position: 'bottom' });
        } catch (uploadError) {
          Toast.show({ type: 'error', text1: 'Error', text2: t('profile.uploadError'), position: 'bottom' });
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
        Toast.show({ type: 'info', text1: t('profile.limitTitle'), text2: t('profile.limitBody'), position: 'bottom' });
        return prev;
      }
      return [...prev, category];
    });
  };
  
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: t('profile.nameRequired'), position: 'bottom' });
      return;
    }
    if (name.trim().length < 2) {
      Toast.show({ type: 'error', text1: 'Error', text2: t('profile.nameShort'), position: 'bottom' });
      return;
    }
    try {
      setSaving(true);
      const result = await updateProfile({
        name: name.trim(), phone: phone.trim(), whatsapp: whatsapp.trim(),
        address: address.trim(), instagram: instagram.trim(), facebook: facebook.trim(), interests,
      });
      if (updateUser && result.user) updateUser(result.user as Partial<User>);
      Toast.show({ type: 'success', text1: t('profile.saved'), text2: t('profile.savedBody'), position: 'bottom' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || t('profile.saveError'), position: 'bottom' });
    } finally {
      setSaving(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: t('profile.pwdFields'), position: 'bottom' });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Error', text2: t('profile.pwdShort'), position: 'bottom' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: t('profile.pwdMismatch'), position: 'bottom' });
      return;
    }
    try {
      setChangingPassword(true);
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setShowPasswordSection(false);
      Toast.show({ type: 'success', text1: t('profile.pwdChanged'), text2: t('profile.pwdChangedBody'), position: 'bottom' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || t('profile.pwdError'), position: 'bottom' });
    } finally {
      setChangingPassword(false);
    }
  };
  
  const copyPhoneToWhatsapp = () => {
    if (phone.trim()) {
      setWhatsapp(phone.trim());
      Toast.show({ type: 'info', text1: t('profile.copied'), text2: t('profile.phoneCopied'), position: 'bottom', visibilityTime: 1500 });
    }
  };

  const handleNavigateToLegal = () => navigation.navigate('Legal');

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== DELETE_ACCOUNT_CONFIRMATION) return;
    setDeletingAccount(true);
    try {
      await deleteAccount();
      setDeleteModalVisible(false);
      Toast.show({ type: 'success', text1: t('profile.deleted'), text2: t('profile.deletedBody'), position: 'bottom' });
      await logout();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('profile.deleteError'),
        text2: error?.response?.data?.message || t('profile.tryLater'),
        position: 'bottom',
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  // ── Opciones de tema ────────────────────────────────────────────────────────
  const themeOptions: { mode: ThemeMode; label: string; icon: string; desc: string }[] = [
    { mode: 'light', label: t('profile.themeLight'),      icon: 'sunny',          desc: t('profile.themeLightDesc') },
    { mode: 'dark',  label: t('profile.themeDark'),     icon: 'moon',           desc: t('profile.themeDarkDesc') },
    { mode: 'auto',  label: t('profile.themeAuto'), icon: 'time-outline',   desc: t('profile.themeAutoDesc') },
  ];
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primaryText} />
        <Text style={[styles.loadingText, { color: COLORS.gray }]}>{t('profile.loading')}</Text>
      </View>
    );
  }
  

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={[styles.header, { backgroundColor: COLORS.primary, borderBottomColor: COLORS.primary, paddingTop: 16 + insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.onPrimary }]}>{t('profile.title')}</Text>
          <TouchableOpacity onPress={handleNavigateToLegal} style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={26} color={COLORS.onPrimary} />
          </TouchableOpacity>
        </View>
        
        {/* Avatar y email */}
        <View style={[styles.avatarSection, { backgroundColor: COLORS.white }]}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar} disabled={uploadingAvatar}>
            {uploadingAvatar ? (
              <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.grayLight }]}>
                <ActivityIndicator size="large" color={COLORS.primaryText} />
              </View>
            ) : avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.grayLight }]}>
                <Ionicons name="person" size={50} color={COLORS.gray} />
              </View>
            )}
            <View style={[styles.avatarEditBadge, { backgroundColor: COLORS.primary, borderColor: COLORS.white }]}>
              <Ionicons name="camera" size={16} color={COLORS.onPrimary} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: COLORS.gray }]}>{t('profile.avatarHint')}</Text>
          <Text style={[styles.emailText, { color: COLORS.gray }]}>{profile?.email}</Text>
          {user?.role === 'seeder' && (
            <View style={[styles.roleBadge, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="leaf" size={14} color={COLORS.success} />
              <Text style={[styles.roleBadgeText, { color: COLORS.success }]}>{t('profile.teamBadge')}</Text>
            </View>
          )}
          {user?.trusted && user?.role !== 'seeder' && (
            <View style={[styles.roleBadge, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={[styles.roleBadgeText, { color: COLORS.success }]}>{t('profile.verified')}</Text>
            </View>
          )}
        </View>
        
        {/* Lugares visitados (sellos) */}
        <TouchableOpacity
          style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow, flexDirection: 'row', alignItems: 'center', gap: 12 }]}
          onPress={() => navigation.navigate('VisitedPlaces')}
        >
          <Ionicons name="ribbon" size={28} color={COLORS.primaryText} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: COLORS.text, marginBottom: 2 }]}>{t('profile.visited')}</Text>
            <Text style={{ color: COLORS.gray, fontSize: 13 }}>{t('profile.visitedHint')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.gray} />
        </TouchableOpacity>

        {/* Información personal */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('profile.personal')}</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.text }]}>{t('profile.name')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
              placeholder={t('profile.namePh')} placeholderTextColor={COLORS.gray}
              value={name} onChangeText={setName} maxLength={50}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.text }]}>{t('profile.address')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
              placeholder={t('profile.addressPh')} placeholderTextColor={COLORS.gray}
              value={address} onChangeText={setAddress} maxLength={200}
            />
          </View>
        </View>
        
        {/* Información de contacto */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('profile.contact')}</Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.gray }]}>{t('profile.contactHint')}</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.text }]}>{t('profile.phone')}</Text>
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
                  <Ionicons name="copy-outline" size={16} color={COLORS.primaryText} />
                  <Text style={[styles.copyButtonText, { color: COLORS.primaryText }]}>{t('profile.copyPhone')}</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
              placeholder={t('profile.whatsappPh')} placeholderTextColor={COLORS.gray}
              value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" maxLength={20}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.text }]}>Instagram</Text>
            <View style={[styles.socialInputContainer, { backgroundColor: COLORS.inputBackground }]}>
              <Text style={[styles.socialPrefix, { color: COLORS.gray }]}>@</Text>
              <TextInput
                style={[styles.socialInput, { color: COLORS.text }]}
                placeholder={t('profile.userPh')} placeholderTextColor={COLORS.gray}
                value={instagram} onChangeText={setInstagram} autoCapitalize="none" maxLength={50}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.text }]}>Facebook</Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
              placeholder={t('profile.facebookPh')} placeholderTextColor={COLORS.gray}
              value={facebook} onChangeText={setFacebook} autoCapitalize="none" maxLength={100}
            />
          </View>
        </View>
        
        {/* Intereses */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('profile.interests')}</Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.gray }]}>
            {t('profile.interestsHint')}
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
                  <Text style={[styles.interestChipText, { color: COLORS.text }, isSelected && { color: COLORS.onPrimary, fontWeight: '600' }]}>
                    {categoryLabel(category)}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color={COLORS.onPrimary} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.interestsCount, { color: COLORS.gray }]}>{t('profile.interestsCount', { count: interests.length })}</Text>
        </View>

        {/* ── PREFERENCIAS DE TEMA ─────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('profile.appearance')}</Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.gray }]}>
            {t('profile.appearanceHint')}
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
                    <Text style={[styles.themeLabel, { color: COLORS.text }, isActive && { color: COLORS.primaryText, fontWeight: '700' }]}>
                      {label}
                    </Text>
                    <Text style={[styles.themeDesc, { color: COLORS.gray }]}>{desc}</Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.primaryText} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Indicador del estado actual */}
          <View style={[styles.themeStatusBadge, { backgroundColor: isDark ? '#1A1A2E' : '#FFF9E6', borderColor: isDark ? COLORS.primaryLight : COLORS.accent }]}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={16} color={COLORS.primaryText} />
            <Text style={[styles.themeStatusText, { color: COLORS.primaryText }]}>
              {isDark ? t('profile.darkActive') : t('profile.lightActive')}
              {themeMode === 'auto' ? t('profile.autoSuffix') : ''}
            </Text>
          </View>
        </View>
        
        {/* Idioma de la app: se aplica al instante, sin guardar */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('profile.language')}</Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.gray }]}>{t('profile.languageHint')}</Text>
          {LANGUAGES.map(({ code, label }) => {
            const isActive = currentLanguage() === code;
            return (
              <TouchableOpacity
                key={code}
                style={[
                  styles.themeOption,
                  { borderColor: COLORS.grayLight, backgroundColor: COLORS.inputBackground },
                  isActive && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
                ]}
                onPress={() => setAppLanguage(code)}
                activeOpacity={0.7}
              >
                <Text style={[styles.themeLabel, { flex: 1, color: COLORS.text }, isActive && { color: COLORS.primaryText, fontWeight: '700' }]}>{label}</Text>
                {isActive && <Ionicons name="checkmark-circle" size={22} color={COLORS.primaryText} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: COLORS.secondary, shadowColor: COLORS.shadow }, saving && styles.saveButtonDisabled]}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.onPrimary} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.onPrimary} />
              <Text style={[styles.saveButtonText, { color: COLORS.onPrimary }]}>{t('profile.save')}</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Cambiar contraseña */}
        <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
          <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPasswordSection(!showPasswordSection)}>
            <View style={styles.passwordToggleLeft}>
              <Ionicons name="lock-closed" size={24} color={COLORS.primaryText} />
              <Text style={[styles.passwordToggleText, { color: COLORS.text }]}>{t('profile.changePwd')}</Text>
            </View>
            <Ionicons name={showPasswordSection ? 'chevron-up' : 'chevron-down'} size={24} color={COLORS.gray} />
          </TouchableOpacity>
          
          {showPasswordSection && (
            <View style={[styles.passwordSection, { borderTopColor: COLORS.grayLight }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: COLORS.text }]}>{t('profile.currentPwd')}</Text>
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
                <Text style={[styles.label, { color: COLORS.text }]}>{t('profile.newPwd')}</Text>
                <View style={[styles.passwordInputContainer, { backgroundColor: COLORS.inputBackground }]}>
                  <TextInput
                    style={[styles.passwordInput, { color: COLORS.text }]}
                    placeholder={t('profile.newPwdPh')} placeholderTextColor={COLORS.gray}
                    value={newPassword} onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword} autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}>
                    <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.gray} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: COLORS.text }]}>{t('profile.confirmPwd')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
                  placeholder={t('profile.confirmPwdPh')} placeholderTextColor={COLORS.gray}
                  value={confirmPassword} onChangeText={setConfirmPassword}
                  secureTextEntry={!showNewPassword} autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={[styles.changePasswordButton, { backgroundColor: COLORS.primary }, changingPassword && styles.changePasswordButtonDisabled]}
                onPress={handleChangePassword} disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color={COLORS.onPrimary} />
                ) : (
                  <>
                    <Ionicons name="key" size={20} color={COLORS.onPrimary} />
                    <Text style={[styles.changePasswordButtonText, { color: COLORS.onPrimary }]}>{t('profile.changePwd')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Eliminar cuenta (requerido por Google Play) */}
        {user?.role !== 'admin' && (
          <View style={[styles.section, { backgroundColor: COLORS.white, shadowColor: COLORS.shadow }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('profile.deleteSection')}</Text>
            <Text style={[styles.sectionSubtitle, { color: COLORS.gray }]}>
              {t('profile.deleteHint')}
            </Text>
            <TouchableOpacity
              style={[styles.deleteAccountButton, { borderColor: COLORS.error }]}
              onPress={() => {
                setDeleteConfirmText('');
                setDeleteModalVisible(true);
              }}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={[styles.deleteAccountButtonText, { color: COLORS.error }]}>{t('profile.deleteButton')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => !deletingAccount && setDeleteModalVisible(false)}>
        <View style={styles.deleteModalBackdrop}>
          <View style={[styles.deleteModalCard, { backgroundColor: COLORS.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('profile.deleteConfirmTitle')}</Text>
            <Text style={[styles.deleteModalText, { color: COLORS.textSecondary }]}>
              {t('profile.deleteConfirmBody')}
            </Text>
            <Text style={[styles.label, { color: COLORS.text }]}>
              {t('profile.typeToConfirm', { word: DELETE_ACCOUNT_CONFIRMATION })}
            </Text>
            <TextInput
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!deletingAccount}
              placeholder={DELETE_ACCOUNT_CONFIRMATION}
              placeholderTextColor={COLORS.gray}
              style={[styles.input, { backgroundColor: COLORS.inputBackground, color: COLORS.text }]}
            />
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalButton, { backgroundColor: COLORS.inputBackground }]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deletingAccount}
              >
                <Text style={[styles.deleteModalButtonText, { color: COLORS.text }]}>{t('profile.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteModalButton,
                  { backgroundColor: COLORS.error },
                  deleteConfirmText.trim().toUpperCase() !== DELETE_ACCOUNT_CONFIRMATION && styles.saveButtonDisabled,
                ]}
                onPress={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmText.trim().toUpperCase() !== DELETE_ACCOUNT_CONFIRMATION}
              >
                {deletingAccount ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.deleteModalButtonText, { color: '#FFFFFF' }]}>{t('profile.delete')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;
