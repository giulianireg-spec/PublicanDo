// src/screens/LegalScreen.tsx
// Pantalla para mostrar Términos y Condiciones / Política de Privacidad

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type LegalTab = 'terms' | 'privacy';

interface LegalScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialTab?: LegalTab;
    };
  };
}

const LegalScreen: React.FC<LegalScreenProps> = ({ navigation, route }) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 10,
    marginBottom: 20,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  footer: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

  const initialTab = route?.params?.initialTab || 'terms';
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  const handleContactSupport = () => {
    Linking.openURL('mailto:soporte@guiando.com.ar?subject=Consulta legal');
  };

  const renderTerms = () => (
    <View style={styles.content}>
      <Text style={styles.lastUpdated}>Última actualización: Enero 2026</Text>
      
      <Text style={styles.paragraph}>
        Bienvenido a <Text style={styles.bold}>GuianDo</Text>. Al utilizar nuestra aplicación móvil, aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no deberías usar la aplicación.
      </Text>

      <Text style={styles.sectionTitle}>1. Definiciones</Text>
      <Text style={styles.paragraph}>
        • <Text style={styles.bold}>"GuianDo"</Text>, "nosotros" o "la aplicación": Se refiere a la aplicación móvil GuianDo y sus servicios asociados.{'\n'}
        • <Text style={styles.bold}>"Usuario"</Text> o "vos": Se refiere a cualquier persona que acceda o utilice la aplicación.{'\n'}
        • <Text style={styles.bold}>"Contenido"</Text>: Incluye publicaciones, imágenes, textos, videos y cualquier otro material subido por los usuarios.
      </Text>

      <Text style={styles.sectionTitle}>2. Descripción del Servicio</Text>
      <Text style={styles.paragraph}>
        GuianDo es una plataforma de clasificados geolocalizados que permite a usuarios y negocios publicar anuncios de productos, servicios y eventos en la provincia de Córdoba, Argentina y zonas aledañas.
      </Text>
      <Text style={styles.paragraph}>
        La aplicación ofrece un servicio gratuito con funcionalidades básicas, y planes premium de pago con beneficios adicionales. Los detalles de cada plan están disponibles en la sección "Planes Premium" dentro de la aplicación.
      </Text>

      <Text style={styles.sectionTitle}>3. Registro y Cuenta</Text>
      <Text style={styles.paragraph}>
        Para crear una cuenta debés:{'\n\n'}
        • Ser mayor de 18 años o contar con autorización de un tutor legal{'\n'}
        • Proporcionar información veraz y actualizada{'\n'}
        • Mantener la confidencialidad de tu contraseña{'\n\n'}
        Sos responsable de todas las actividades que ocurran bajo tu cuenta.
      </Text>

      <Text style={styles.sectionTitle}>4. Contenido Prohibido</Text>
      <Text style={styles.paragraph}>
        Está terminantemente prohibido publicar:{'\n\n'}
        • Contenido ilegal o que promueva actividades ilegales{'\n'}
        • Productos falsificados o robados{'\n'}
        • Armas, drogas o sustancias controladas{'\n'}
        • Contenido para adultos o pornográfico{'\n'}
        • Material que infrinja derechos de autor{'\n'}
        • Información falsa o fraudulenta{'\n'}
        • Contenido discriminatorio u ofensivo{'\n'}
        • Spam o publicaciones duplicadas
      </Text>

      <Text style={styles.sectionTitle}>5. Servicios Profesionales</Text>
      <Text style={styles.paragraph}>
        Algunas categorías (Plomería, Electricidad, Climatización, Albañilería) requieren matrícula profesional. GuianDo no garantiza la idoneidad de los profesionales. Es tu responsabilidad verificar credenciales antes de contratar.
      </Text>

      <Text style={styles.sectionTitle}>6. Pagos y Suscripciones</Text>
      <Text style={styles.paragraph}>
        • Los pagos se procesan a través de MercadoPago{'\n'}
        • Las suscripciones se renuevan automáticamente{'\n'}
        • Podés cancelar en cualquier momento desde tu perfil{'\n'}
        • No se realizan reembolsos por períodos parciales
      </Text>

      <Text style={styles.sectionTitle}>7. Limitación de Responsabilidad</Text>
      <Text style={styles.paragraph}>
        GuianDo es una plataforma de conexión. No somos parte de las transacciones entre usuarios y no nos responsabilizamos por la calidad de productos/servicios, cumplimiento de acuerdos o disputas entre usuarios.
      </Text>

      <Text style={styles.sectionTitle}>8. Modificaciones</Text>
      <Text style={styles.paragraph}>
        Podemos modificar estos términos en cualquier momento. Los cambios significativos serán notificados por email o mediante un aviso en la app.
      </Text>

      <Text style={styles.sectionTitle}>9. Legislación Aplicable</Text>
      <Text style={styles.paragraph}>
        Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será sometida a los tribunales de la ciudad de Córdoba, Argentina.
      </Text>

      <Text style={styles.sectionTitle}>10. Contacto</Text>
      <Text style={styles.paragraph}>
        Para consultas: soporte@guiando.com.ar{'\n'}
        Ubicación: Córdoba, Argentina
      </Text>
    </View>
  );

  const renderPrivacy = () => (
    <View style={styles.content}>
      <Text style={styles.lastUpdated}>Última actualización: Enero 2026</Text>
      
      <Text style={styles.paragraph}>
        En <Text style={styles.bold}>GuianDo</Text> nos tomamos muy en serio la privacidad de nuestros usuarios. Esta Política describe cómo recopilamos, usamos y protegemos tu información personal.
      </Text>

      <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
      
      <Text style={styles.subsectionTitle}>Información que nos proporcionás:</Text>
      <Text style={styles.paragraph}>
        • Datos de cuenta: Nombre, email, contraseña, foto de perfil{'\n'}
        • Datos de contacto: Teléfono, WhatsApp, dirección (opcionales){'\n'}
        • Redes sociales: Instagram, Facebook (opcionales){'\n'}
        • Contenido de publicaciones: Textos, imágenes, videos
      </Text>

      <Text style={styles.subsectionTitle}>Información automática:</Text>
      <Text style={styles.paragraph}>
        • Datos de ubicación (con tu permiso){'\n'}
        • Información del dispositivo{'\n'}
        • Datos de uso de la aplicación
      </Text>

      <Text style={styles.sectionTitle}>2. Cómo Usamos Tu Información</Text>
      <Text style={styles.paragraph}>
        • Crear y gestionar tu cuenta{'\n'}
        • Publicar y mostrar tus anuncios{'\n'}
        • Personalizar contenido según tu ubicación{'\n'}
        • Enviarte notificaciones sobre tus publicaciones{'\n'}
        • Procesar pagos y suscripciones{'\n'}
        • Detectar y prevenir fraudes
      </Text>

      <Text style={styles.sectionTitle}>3. Cómo Compartimos Tu Información</Text>
      
      <Text style={styles.subsectionTitle}>Información pública:</Text>
      <Text style={styles.paragraph}>
        El contenido de tus publicaciones y la información de contacto que elijas mostrar son visibles para todos los usuarios.
      </Text>

      <Text style={styles.subsectionTitle}>Proveedores de servicios:</Text>
      <Text style={styles.paragraph}>
        • MercadoPago: Procesamiento de pagos{'\n'}
        • Cloudinary: Almacenamiento de imágenes{'\n'}
        • MongoDB Atlas: Base de datos{'\n'}
        • Google: Autenticación y mapas
      </Text>

      <Text style={styles.subsectionTitle}>Lo que NO hacemos:</Text>
      <Text style={styles.paragraph}>
        • NO vendemos tu información personal{'\n'}
        • NO compartimos datos con fines publicitarios de terceros
      </Text>

      <Text style={styles.sectionTitle}>4. Seguridad</Text>
      <Text style={styles.paragraph}>
        Implementamos medidas de seguridad:{'\n\n'}
        • Encriptación de contraseñas{'\n'}
        • Conexiones seguras (HTTPS){'\n'}
        • Tokens de autenticación{'\n'}
        • Acceso restringido a datos sensibles
      </Text>

      <Text style={styles.sectionTitle}>5. Tus Derechos</Text>
      <Text style={styles.paragraph}>
        Tenés derecho a:{'\n\n'}
        • <Text style={styles.bold}>Acceso:</Text> Solicitar copia de tus datos{'\n'}
        • <Text style={styles.bold}>Rectificación:</Text> Corregir tu información{'\n'}
        • <Text style={styles.bold}>Eliminación:</Text> Solicitar borrar tu cuenta{'\n'}
        • <Text style={styles.bold}>Oposición:</Text> Rechazar comunicaciones promocionales{'\n'}
        • <Text style={styles.bold}>Portabilidad:</Text> Obtener tus datos en formato estándar
      </Text>

      <Text style={styles.sectionTitle}>6. Ubicación</Text>
      <Text style={styles.paragraph}>
        • La ubicación es necesaria para mostrar publicaciones cercanas{'\n'}
        • Podés permitir o denegar el acceso en cualquier momento{'\n'}
        • Solo accedemos cuando usás la app (no en segundo plano){'\n'}
        • No rastreamos tu historial de ubicaciones
      </Text>

      <Text style={styles.sectionTitle}>7. Menores de Edad</Text>
      <Text style={styles.paragraph}>
        GuianDo no está dirigida a menores de 18 años. No recopilamos intencionalmente información de menores.
      </Text>

      <Text style={styles.sectionTitle}>8. Cambios a Esta Política</Text>
      <Text style={styles.paragraph}>
        Podemos actualizar esta política periódicamente. Te notificaremos sobre cambios significativos mediante un aviso en la app o por email.
      </Text>

      <Text style={styles.sectionTitle}>9. Legislación Aplicable</Text>
      <Text style={styles.paragraph}>
        Esta política se rige por la Ley de Protección de Datos Personales N° 25.326 de Argentina.
      </Text>

      <Text style={styles.sectionTitle}>10. Contacto</Text>
      <Text style={styles.paragraph}>
        Para consultas sobre privacidad:{'\n'}
        Email: soporte@guiando.com.ar{'\n'}
        Ubicación: Córdoba, Argentina{'\n\n'}
        Responderemos en un plazo máximo de 10 días hábiles.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Información Legal</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
          onPress={() => setActiveTab('terms')}
        >
          <Ionicons 
            name="document-text" 
            size={18} 
            color={activeTab === 'terms' ? COLORS.primary : COLORS.gray} 
          />
          <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>
            Términos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
          onPress={() => setActiveTab('privacy')}
        >
          <Ionicons 
            name="shield-checkmark" 
            size={18} 
            color={activeTab === 'privacy' ? COLORS.primary : COLORS.gray} 
          />
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>
            Privacidad
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'terms' ? renderTerms() : renderPrivacy()}

        {/* Contact Button */}
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContactSupport}
        >
          <Ionicons name="mail" size={20} color={COLORS.white} />
          <Text style={styles.contactButtonText}>¿Tenés dudas? Contactanos</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          GuianDo © 2026 - Todos los derechos reservados
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LegalScreen;