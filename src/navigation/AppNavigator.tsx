// src/navigation/AppNavigator.tsx
// GUIANDO: Sin suscripciones, sin Business, nombre actualizado + ThemeProvider

import React, { useState, useLayoutEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Modal, ScrollView, Text, Alert, Image, StatusBar, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/api';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { createToastConfig } from '../config/toastConfig';

// Screens
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CreateAdvertisementScreen from '../screens/CreateAdvertisementScreen';
import EditAdvertisementScreen from '../screens/EditAdvertisementScreen';
import MyAdvertisementsScreen from '../screens/MyAdvertisementsScreen';
import MyGuidesScreen from '../screens/MyGuidesScreen';
import SavedGuidesScreen from '../screens/SavedGuidesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EditGuideScreen from '../screens/EditGuideScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import UsersManagementScreen from '../screens/UsersManagementScreen';
import ReportsManagementScreen from '../screens/ReportsManagementScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AdvertisementStatsScreen from '../screens/AdvertisementStatsScreen';
import FAQScreen from '../screens/FAQScreen';
import LegalScreen from '../screens/LegalScreen';

// Screens de Guías
import GuidesListScreen from '../screens/GuidesListScreen';
import GuideDetailScreen from '../screens/GuideDetailScreen';
import CreateGuideScreen from '../screens/CreateGuideScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── HomeScreenWrapper ────────────────────────────────────────────────────────
// Separado en su propio componente para poder usar useTheme() como hook
const HomeScreenWrapper = ({ 
  navigation, 
  route,
  onCreatePress,
  onUserPress,
  onLoginPress,
  onFAQPress,
  onGuidesPress,
}: any) => {
  const { colors: COLORS } = useTheme();
  const { user } = useAuth();

  useLayoutEffect(() => {
    const hasAvatar = user?.avatar && user.avatar.trim() !== '';
    
    navigation.setOptions({
      headerStyle: { backgroundColor: COLORS.primary },
      headerLeft: () => (
        <TouchableOpacity style={headerStyles.guidesButton} onPress={onGuidesPress}>
          <Ionicons name="compass" size={28} color={COLORS.white} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={headerStyles.container}>
          {!user && (
            <TouchableOpacity style={headerStyles.faqButton} onPress={onFAQPress}>
              <Ionicons name="help-circle-outline" size={26} color={COLORS.white} />
            </TouchableOpacity>
          )}
          {user && (
            <TouchableOpacity style={headerStyles.createButton} onPress={() => navigation.navigate('Notifications')} >
              <View>
                <Ionicons name="notifications-outline" size={26} color={COLORS.white} />
                {unreadCount > 0 && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#F44336', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          {user && (
            <TouchableOpacity style={headerStyles.createButton} onPress={onCreatePress}>
              <Ionicons name="add-circle" size={28} color={COLORS.white} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              headerStyles.userButton,
              hasAvatar
                ? { borderWidth: 2, borderColor: COLORS.white, overflow: 'hidden' }
                : user
                  ? { backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.white }
                  : { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.white },
            ]}
            onPress={user ? onUserPress : onLoginPress}
          >
            {hasAvatar ? (
              <Image key={user.avatar} source={{ uri: user.avatar }} style={headerStyles.avatar} resizeMode="cover" />
            ) : user ? (
              <Ionicons name="person" size={24} color={COLORS.primary} />
            ) : (
              <Ionicons name="person-outline" size={22} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, user, user?.avatar, user?.email, COLORS]);

  return <HomeScreen navigation={navigation} route={route} />;
};

// ─── Estilos del header (sin COLORS porque son valores fijos de layout) ───────
const headerStyles = StyleSheet.create({
  container:    { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  guidesButton: { marginLeft: 12, padding: 4 },
  faqButton:    { marginRight: 8, padding: 4 },
  createButton: { marginRight: 12, padding: 4 },
  userButton:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatar:       { width: 36, height: 36, borderRadius: 18 },
});

// ─── AppNavigatorInner (usa useTheme, debe estar dentro de ThemeProvider) ─────

// ─── Tab Navigator (Home + Guías + Perfil) ───────────────────────────────────
const TabNavigator = ({
  onCreatePress,
  onUserPress,
  onLoginPress,
  onFAQPress,
  onGuidesPress,
}: any) => {
  const { colors: COLORS, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.grayLight,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
          ),
        }}
      >
        {(props) => (
          <HomeScreenWrapper
            {...props}
            onCreatePress={onCreatePress}
            onUserPress={onUserPress}
            onLoginPress={onLoginPress}
            onFAQPress={onFAQPress}
            onGuidesPress={onGuidesPress}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="GuidesTab"
        component={GuidesListScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={26} color={color} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => user ? onUserPress() : onLoginPress()}
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigatorInner = () => {
  const { colors: COLORS } = useTheme();
  const { user, logout } = useAuth();

  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const navigationRef = React.useRef<any>(null);

  const isSeeder = user?.role === 'seeder';

  const handleNavigateToCreate = () => navigationRef.current?.navigate('CreateAdvertisement');
  const handleNavigateToFAQ    = () => navigationRef.current?.navigate('FAQ');
  const handleNavigateToGuides = () => navigationRef.current?.navigate('GuidesList');

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que querés cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            setUserMenuVisible(false);
            logout();
            Toast.show({ type: 'success', text1: '👋 Hasta pronto', text2: 'Sesión cerrada correctamente', position: 'top', visibilityTime: 2000 });
          },
        },
      ]
    );
  };

  // Estilos dinámicos (dependen de COLORS)
  const dynStyles = StyleSheet.create({
    fullModalContainer:   { flex: 1, backgroundColor: COLORS.background },
    fullModalCloseButton: { position: 'absolute', top: 10, right: 20, zIndex: 10, padding: 8 },
    scrollContent:        { flexGrow: 1 },
    userMenuFullScreen:   { flex: 1, backgroundColor: COLORS.background },
    userMenuHeader:       { backgroundColor: COLORS.white, paddingTop: 20, paddingBottom: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
    userMenuCloseButton:  { position: 'absolute', top: 16, right: 16, padding: 8 },
    menuAvatar:           { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
    userName:             { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 8 },
    userEmail:            { fontSize: 14, color: COLORS.gray, marginTop: 4 },
    seederBadge:          { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success + '20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12, gap: 6 },
    seederText:           { fontSize: 14, fontWeight: '700', color: COLORS.success },
    trustedBadge:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success + '20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12, gap: 6 },
    trustedText:          { fontSize: 14, fontWeight: '600', color: COLORS.success },
    menuOptionsScroll:    { flex: 1 },
    menuOptions:          { padding: 16 },
    menuOption:           { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginBottom: 8, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    profileOption:        { borderLeftWidth: 4, borderLeftColor: COLORS.secondary },
    adminOption:          { borderLeftWidth: 4, borderLeftColor: COLORS.error },
    logoutOption:         { marginTop: 8, backgroundColor: COLORS.error + '10' },
    menuOptionText:       { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.text, marginLeft: 12 },
    logoutText:           { color: COLORS.error },
    menuDivider:          { height: 1, backgroundColor: COLORS.grayLight, marginVertical: 12 },
  });

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Stack.Navigator
        screenOptions={{
          headerStyle:      { backgroundColor: COLORS.primary },
          headerTintColor:  COLORS.white,
          headerTitleStyle: { fontWeight: '700', fontSize: 20 },
          contentStyle: { paddingTop: 0 },
        }}
      >
        <Stack.Screen name="Home" options={{ headerShown: false }}>
          {(props) => (
            <TabNavigator
              {...props}
              onCreatePress={handleNavigateToCreate}
              onUserPress={() => setUserMenuVisible(true)}
              onLoginPress={() => setLoginModalVisible(true)}
              onFAQPress={handleNavigateToFAQ}
              onGuidesPress={handleNavigateToGuides}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Detail"              component={DetailScreen}             options={{ title: 'Detalle' }} />
        <Stack.Screen name="CreateAdvertisement" component={CreateAdvertisementScreen} options={{ title: 'Nuevo Lugar' }} />
        <Stack.Screen name="EditAdvertisement"   component={EditAdvertisementScreen}   options={{ title: 'Editar Lugar' }} />
        <Stack.Screen name="MyAdvertisements"    component={MyAdvertisementsScreen}    options={{ headerShown: false }} />
        <Stack.Screen name="MyGuides"            component={MyGuidesScreen}            options={{ headerShown: false }} />
        <Stack.Screen name="SavedGuides"         component={SavedGuidesScreen}         options={{ headerShown: false }} />
        <Stack.Screen name="Notifications"        component={NotificationsScreen}        options={{ headerShown: false }} />
        <Stack.Screen name="EditGuide"           component={EditGuideScreen}           options={{ title: 'Editar Guía' }} />
        <Stack.Screen name="AdminDashboard"      component={AdminDashboardScreen}      options={{ headerShown: false }} />
        <Stack.Screen name="UsersManagement"     component={UsersManagementScreen}     options={{ title: 'Gestión de Usuarios' }} />
        <Stack.Screen name="ReportsManagement"   component={ReportsManagementScreen}   options={{ headerShown: false }} />
        <Stack.Screen name="Profile"             component={ProfileScreen}             options={{ title: 'Mi Perfil', headerShown: false }} />
        <Stack.Screen name="AdvertisementStats"  component={AdvertisementStatsScreen}  options={{ title: 'Estadísticas' }} />
        <Stack.Screen name="FAQ"                 component={FAQScreen}                 options={{ headerShown: false }} />
        <Stack.Screen name="Legal"               component={LegalScreen}               options={{ headerShown: false }} />
        <Stack.Screen name="GuideDetail"         component={GuideDetailScreen}         options={{ headerShown: false }} />
        <Stack.Screen name="CreateGuide"         component={CreateGuideScreen}         options={{ headerShown: false }} />
      </Stack.Navigator>

      {/* Modal Login */}
      <Modal visible={loginModalVisible} animationType="slide" transparent={false} onRequestClose={() => setLoginModalVisible(false)}>
        <SafeAreaView style={dynStyles.fullModalContainer} edges={['top', 'bottom']}>
          <TouchableOpacity style={dynStyles.fullModalCloseButton} onPress={() => setLoginModalVisible(false)}>
            <Ionicons name="close" size={32} color={COLORS.text} />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={dynStyles.scrollContent}>
            <LoginScreen
              onLoginSuccess={() => setLoginModalVisible(false)}
              onRegisterPress={() => { setLoginModalVisible(false); setRegisterModalVisible(true); }}
              onForgotPasswordPress={() => { setLoginModalVisible(false); setForgotPasswordModalVisible(true); }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Registro */}
      <Modal visible={registerModalVisible} animationType="slide" transparent={false} onRequestClose={() => setRegisterModalVisible(false)}>
        <SafeAreaView style={dynStyles.fullModalContainer} edges={['top', 'bottom']}>
          <TouchableOpacity style={dynStyles.fullModalCloseButton} onPress={() => setRegisterModalVisible(false)}>
            <Ionicons name="close" size={32} color={COLORS.text} />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={dynStyles.scrollContent}>
            <RegisterScreen
              onRegisterSuccess={() => setRegisterModalVisible(false)}
              onLoginPress={() => { setRegisterModalVisible(false); setLoginModalVisible(true); }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Recuperar Contraseña */}
      <Modal visible={forgotPasswordModalVisible} animationType="slide" transparent={false} onRequestClose={() => setForgotPasswordModalVisible(false)}>
        <SafeAreaView style={dynStyles.fullModalContainer} edges={['top', 'bottom']}>
          <TouchableOpacity style={dynStyles.fullModalCloseButton} onPress={() => setForgotPasswordModalVisible(false)}>
            <Ionicons name="close" size={32} color={COLORS.text} />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={dynStyles.scrollContent}>
            <ForgotPasswordScreen
              onSuccess={() => setForgotPasswordModalVisible(false)}
              onBackToLogin={() => { setForgotPasswordModalVisible(false); setLoginModalVisible(true); }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Menú Usuario */}
      <Modal visible={userMenuVisible} animationType="slide" transparent={false} onRequestClose={() => setUserMenuVisible(false)}>
        <SafeAreaView style={dynStyles.userMenuFullScreen} edges={['top', 'bottom']}>
          <View style={dynStyles.userMenuHeader}>
            <TouchableOpacity onPress={() => setUserMenuVisible(false)} style={dynStyles.userMenuCloseButton}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={dynStyles.menuAvatar} />
            ) : (
              <Ionicons name="person-circle" size={80} color={COLORS.primary} />
            )}
            <Text style={dynStyles.userName}>{user?.name}</Text>
            <Text style={dynStyles.userEmail}>{user?.email}</Text>
            {isSeeder && (
              <View style={dynStyles.seederBadge}>
                <Ionicons name="leaf" size={16} color={COLORS.success} />
                <Text style={dynStyles.seederText}>Seeder</Text>
              </View>
            )}
            {user?.trusted && !isSeeder && (
              <View style={dynStyles.trustedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={dynStyles.trustedText}>Usuario verificado</Text>
              </View>
            )}
          </View>

          <ScrollView style={dynStyles.menuOptionsScroll}>
            <View style={dynStyles.menuOptions}>
              <TouchableOpacity style={[dynStyles.menuOption, dynStyles.profileOption]} onPress={() => { setUserMenuVisible(false); navigationRef.current?.navigate('Profile'); }}>
                <Ionicons name="person" size={24} color={COLORS.secondary} />
                <Text style={dynStyles.menuOptionText}>Mi Perfil</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={dynStyles.menuOption} onPress={() => { setUserMenuVisible(false); navigationRef.current?.navigate('MyAdvertisements'); }}>
                <Ionicons name="list" size={24} color={COLORS.primary} />
                <Text style={dynStyles.menuOptionText}>Mis Lugares Publicados</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={dynStyles.menuOption} onPress={() => { setUserMenuVisible(false); navigationRef.current?.navigate('MyGuides'); }}>
                <Ionicons name="map" size={24} color={COLORS.primary} />
                <Text style={dynStyles.menuOptionText}>Mis Guías</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>
              <TouchableOpacity style={dynStyles.menuOption} onPress={() => { setUserMenuVisible(false); navigationRef.current?.navigate('SavedGuides'); }}>
                <Ionicons name="bookmark" size={24} color={COLORS.primary} />
                <Text style={dynStyles.menuOptionText}>Guías guardadas</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>

              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <TouchableOpacity style={[dynStyles.menuOption, dynStyles.adminOption]} onPress={() => { setUserMenuVisible(false); navigationRef.current?.navigate('AdminDashboard'); }}>
                  <Ionicons name="shield-checkmark" size={24} color={COLORS.error} />
                  <Text style={dynStyles.menuOptionText}>{user?.role === 'admin' ? 'Panel Admin' : 'Panel Moderador'}</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                </TouchableOpacity>
              )}

              {user?.role === 'admin' && (
                <TouchableOpacity style={[dynStyles.menuOption, dynStyles.adminOption]} onPress={() => { setUserMenuVisible(false); navigationRef.current?.navigate('UsersManagement'); }}>
                  <Ionicons name="people" size={24} color={COLORS.error} />
                  <Text style={dynStyles.menuOptionText}>Gestión de Usuarios</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                </TouchableOpacity>
              )}

              <View style={dynStyles.menuDivider} />

              <TouchableOpacity style={dynStyles.menuOption} onPress={() => { setUserMenuVisible(false); navigationRef.current?.navigate('FAQ'); }}>
                <Ionicons name="help-circle" size={24} color={COLORS.primary} />
                <Text style={dynStyles.menuOptionText}>Preguntas Frecuentes</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={[dynStyles.menuOption, dynStyles.logoutOption]} onPress={handleLogout}>
                <Ionicons name="log-out" size={24} color={COLORS.error} />
                <Text style={[dynStyles.menuOptionText, dynStyles.logoutText]}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Toast config={createToastConfig(COLORS)} />
    </NavigationContainer>
  );
};

// ─── AppNavigator (raíz — envuelve todo en ThemeProvider) ─────────────────────
const AppNavigator = () => (
  <ThemeProvider>
    <AppNavigatorInner />
  </ThemeProvider>
);

export default AppNavigator;