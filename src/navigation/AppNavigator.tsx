// src/navigation/AppNavigator.tsx
// REEMPLAZAR TODO EL CONTENIDO DEL ARCHIVO CON ESTE CÓDIGO

import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Modal, SafeAreaView, ScrollView, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CreateAdvertisementScreen from '../screens/CreateAdvertisementScreen';
import MyAdvertisementsScreen from '../screens/MyAdvertisementsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, logout } = useAuth();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const navigationRef = React.useRef<any>(null);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            setUserMenuVisible(false);
            logout();
          },
        },
      ]
    );
  };

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 20,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'PublicanDo',
              headerRight: () => (
                <View style={styles.headerRightContainer}>
                  {/* Botón para crear publicidad (solo si está logueado) */}
                  {user && (
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={() => navigation.navigate('CreateAdvertisement')}
                    >
                      <Ionicons name="add-circle" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                  )}

                  {/* Botón de usuario */}
                  <TouchableOpacity
                    style={[
                      styles.userButton,
                      user ? styles.userButtonLoggedIn : styles.userButtonLoggedOut,
                    ]}
                    onPress={() => {
                      if (user) {
                        setUserMenuVisible(true);
                      } else {
                        setLoginModalVisible(true);
                      }
                    }}
                  >
                    <Ionicons
                      name={user ? 'person' : 'person-outline'}
                      size={20}
                      color={user ? COLORS.primary : COLORS.white}
                    />
                  </TouchableOpacity>
                </View>
              ),
            })}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{
              title: 'Detalle de Publicidad',
            }}
          />
          <Stack.Screen
            name="CreateAdvertisement"
            component={CreateAdvertisementScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="MyAdvertisements"
            component={MyAdvertisementsScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Modal de Login */}
      <Modal
        visible={loginModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setLoginModalVisible(false)}
      >
        <SafeAreaView style={styles.fullModalContainer}>
          <TouchableOpacity
            style={styles.fullModalCloseButton}
            onPress={() => setLoginModalVisible(false)}
          >
            <Ionicons name="close" size={32} color={COLORS.text} />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <LoginScreen
              onLoginSuccess={() => setLoginModalVisible(false)}
              onRegisterPress={() => {
                setLoginModalVisible(false);
                setRegisterModalVisible(true);
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal de Registro */}
      <Modal
        visible={registerModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setRegisterModalVisible(false)}
      >
        <SafeAreaView style={styles.fullModalContainer}>
          <TouchableOpacity
            style={styles.fullModalCloseButton}
            onPress={() => setRegisterModalVisible(false)}
          >
            <Ionicons name="close" size={32} color={COLORS.text} />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <RegisterScreen
              onRegisterSuccess={() => setRegisterModalVisible(false)}
              onLoginPress={() => {
                setRegisterModalVisible(false);
                setLoginModalVisible(true);
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

     {/* Modal de Menú de Usuario */}
<Modal
  visible={userMenuVisible}
  animationType="slide"
  transparent={false}
  onRequestClose={() => setUserMenuVisible(false)}
>
  <SafeAreaView style={styles.userMenuFullScreen}>
    <View style={styles.userMenuHeader}>
      <TouchableOpacity
        onPress={() => setUserMenuVisible(false)}
        style={styles.userMenuCloseButton}
      >
        <Ionicons name="close" size={28} color={COLORS.text} />
      </TouchableOpacity>
      <Ionicons name="person-circle" size={48} color={COLORS.primary} />
      <Text style={styles.userName}>{user?.name}</Text>
      <Text style={styles.userEmail}>{user?.email}</Text>
    </View>

    <View style={styles.menuOptions}>
      <TouchableOpacity
        style={styles.menuOption}
        onPress={() => {
          setUserMenuVisible(false);
          navigationRef.current?.navigate('MyAdvertisements');
        }}
      >
        <Ionicons name="newspaper" size={24} color={COLORS.primary} />
        <Text style={styles.menuOptionText}>Mis Publicidades</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuOption}
        onPress={() => {
          setUserMenuVisible(false);
        }}
      >
        <Ionicons name="settings" size={24} color={COLORS.primary} />
        <Text style={styles.menuOptionText}>Configuración</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuOption, styles.logoutOption]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={24} color={COLORS.error} />
        <Text style={[styles.menuOptionText, styles.logoutText]}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
</Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 12,
  },
  createButton: {
    padding: 4,
  },
  userButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userButtonLoggedIn: {
    backgroundColor: COLORS.white,
  },
  userButtonLoggedOut: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    margin: 20,
    paddingTop: 20,
    maxHeight: '85%',
  },
  fullModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fullModalCloseButton: {
    alignSelf: 'flex-end',
    margin: 16,
    padding: 8,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 10,
  },userMenuFullScreen: {
  flex: 1,
  backgroundColor: COLORS.background,
},
userMenuHeader: {
  alignItems: 'center',
  padding: 24,
  borderBottomWidth: 1,
  borderBottomColor: COLORS.grayLight,
},
userMenuCloseButton: {
  alignSelf: 'flex-end',
  marginBottom: 16,
  padding: 8,
},
userName: {
  fontSize: 20,
  fontWeight: '700',
  color: COLORS.text,
  marginTop: 8,
},
userEmail: {
  fontSize: 14,
  color: COLORS.gray,
  marginTop: 4,
},
menuOptions: {
  padding: 16,
},
menuOption: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
  borderRadius: 12,
  marginBottom: 8,
  backgroundColor: COLORS.white,
},
menuOptionText: {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.text,
  marginLeft: 16,
},
logoutOption: {
  marginTop: 16,
},
logoutText: {
  color: COLORS.error,
},
});

export default AppNavigator;