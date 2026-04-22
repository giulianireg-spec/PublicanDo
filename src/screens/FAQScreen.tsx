// src/screens/FAQScreen.tsx
// GUIANDO: Preguntas Frecuentes actualizadas

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

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'publicar' | 'guias' | 'cuenta' | 'seguridad';
}

const FAQ_DATA: FAQItem[] = [
  // ==================== GENERAL ====================
  {
    id: '1',
    category: 'general',
    question: '¿Qué es GuianDo?',
    answer: 'GuianDo nació con una misión simple: ayudarte a descubrir el mundo que te rodea.\n\nSi viajás a un lugar nuevo, GuianDo te ayuda a planificar tu estadía: dónde comer, dónde dormir, qué visitar, qué experiencias vivir. Si ya conocés tu ciudad, GuianDo te invita a redescubrirla con ojos nuevos.\n\nSomos una comunidad de personas que comparten lugares, crean guías y construyen juntos un mapa vivo de experiencias reales.',
  },
  {
    id: '2',
    category: 'general',
    question: '¿GuianDo es gratis?',
    answer: 'Sí, GuianDo es completamente gratuito para todos. Podés buscar lugares, guardar favoritos, crear publicaciones y armar guías de viaje sin pagar nada.\n\nCreemos que descubrir y compartir no debería tener costo.',
  },
  {
    id: '3',
    category: 'general',
    question: '¿En qué ciudades está disponible?',
    answer: 'Estamos comenzando por la provincia de Córdoba: Córdoba Capital, Villa Carlos Paz, Alta Gracia, Villa María, Cosquín, La Falda, Jesús María y muchas localidades más.\n\nPero GuianDo está diseñado para crecer. Cualquier persona puede publicar lugares en cualquier punto del país. Si tu ciudad todavía tiene pocos lugares, ¡vos podés ser quien la ponga en el mapa!',
  },
  {
    id: '4',
    category: 'general',
    question: '¿Cómo funciona la búsqueda de lugares?',
    answer: 'Tenés dos modos de búsqueda:\n\n📍 Por ubicación — GuianDo usa tu GPS para mostrarte lugares cercanos. Podés ajustar el radio de búsqueda: 5km, 10km, 25km o 50km.\n\n🗺️ Por localidad — Buscás en una ciudad específica sin importar dónde estés físicamente. Ideal para planificar antes de viajar.\n\nEn ambos casos podés filtrar por categoría, subcategoría y ver solo los lugares que están abiertos ahora.',
  },
  {
    id: '5',
    category: 'general',
    question: '¿Qué tipo de lugares puedo encontrar?',
    answer: 'GuianDo tiene 8 categorías principales:\n\n🍽️ Gastronomía — restaurantes, cafés, bares, heladerías, panaderías, take away\n🏨 Alojamiento — hoteles, hostels, cabañas, apart hotels, camping\n🎭 Cultura — museos, teatros, edificios históricos, centros culturales\n🎉 Eventos — festivales, ferias, espectáculos\n🌳 Naturaleza — parques, reservas, ríos, miradores, sierras\n🎯 Experiencias — tours, aventura, talleres, actividades\n🛍️ Compras — artesanías, mercados, tiendas locales\n🌙 Vida Nocturna — boliches, pubs, peñas, bares de copas',
  },

  // ==================== PUBLICAR ====================
  {
    id: '6',
    category: 'publicar',
    question: '¿Cómo publico un lugar?',
    answer: 'Publicar es muy simple:\n\n1. Creá una cuenta o iniciá sesión\n2. Tocá el botón "+" en la pantalla principal\n3. Completá el nombre, categoría y descripción del lugar\n4. Agregá fotos (hasta 10 imágenes)\n5. Indicá la ubicación y los horarios de atención\n6. Enviá — tu publicación será revisada y aprobada en menos de 24 horas.\n\nCuantos más detalles agregues, más útil será para quienes la encuentren.',
  },
  {
    id: '7',
    category: 'publicar',
    question: '¿Cuántas publicaciones puedo crear?',
    answer: 'No hay límite. Podés publicar todos los lugares que quieras. Cada publicación puede incluir hasta 10 fotos, horarios detallados, información de contacto completa, ubicación exacta y una descripción con formato enriquecido.',
  },
  {
    id: '8',
    category: 'publicar',
    question: '¿Por qué mi publicación está "Pendiente"?',
    answer: 'Todas las publicaciones pasan por una revisión para garantizar que el contenido sea real, útil y respetuoso. Normalmente se aprueban en menos de 24 horas.\n\nSi tu publicación necesita correcciones, recibirás un comentario explicando qué ajustar. Podrás editarla y reenviarla cuantas veces necesites.',
  },
  {
    id: '9',
    category: 'publicar',
    question: '¿Qué contenido NO está permitido?',
    answer: 'No permitimos:\n\n• Contenido falso o engañoso\n• Lugares que no existen o ya cerraron\n• Spam o publicaciones duplicadas\n• Contenido ofensivo o inapropiado\n• Información de contacto incorrecta a propósito\n• Contenido que viole derechos de terceros\n\nGuianDo es una comunidad de confianza. La calidad del contenido depende de todos.',
  },
  {
    id: '10',
    category: 'publicar',
    question: '¿Puedo editar mi publicación después de publicarla?',
    answer: 'Sí, podés editar tus publicaciones en cualquier momento desde "Mis Lugares Publicados" en tu perfil. Si la publicación ya estaba aprobada y hacés cambios importantes, volverá a revisión para mantener la calidad.',
  },
  {
    id: '11',
    category: 'publicar',
    question: '¿Puedo indicar los horarios de atención?',
    answer: 'Sí, y es muy útil hacerlo. Podés cargar los horarios día por día, indicando apertura y cierre. GuianDo mostrará automáticamente si el lugar está "Abierto ahora" o "Cerrado", lo que ayuda mucho a quienes están planeando su visita.',
  },

  // ==================== GUÍAS ====================
  {
    id: '12',
    category: 'guias',
    question: '¿Qué son las guías?',
    answer: 'Las guías son itinerarios armados por personas reales, para personas reales.\n\nPodés crear una guía con hasta 10 paradas: "Los mejores cafés de Nueva Córdoba", "Un fin de semana perfecto en Carlos Paz", "Ruta gastronómica por el centro", "Qué hacer en La Falda si llegás un viernes".\n\nCada punto tiene su descripción, tiempo estimado, ubicación y tips personales. Son la diferencia entre un viaje genérico y una experiencia memorable.',
  },
  {
    id: '13',
    category: 'guias',
    question: '¿Para qué sirven las guías?',
    answer: 'Las guías sirven para dos cosas:\n\n🧳 Para viajeros — Si vas a un lugar que no conocés, una guía te da un plan concreto. No necesitás buscar en mil sitios distintos, alguien que ya estuvo ahí lo armó por vos.\n\n🏙️ Para locales — Si vivís en una ciudad, crear guías es una forma de compartir lo que amás de tu lugar con quienes llegan. Es redescubrir tu entorno con orgullo.',
  },
  {
    id: '14',
    category: 'guias',
    question: '¿Cómo creo una guía?',
    answer: 'Desde la sección "Guías" tocá el botón "+" y:\n\n1. Poné un título y descripción\n2. Elegí la categoría (gastronómica, cultural, aventura, etc.)\n3. Agregá entre 2 y 10 puntos de interés\n4. Para cada punto podés vincular un lugar ya publicado en GuianDo, o agregar uno personalizado con su propia descripción y foto\n5. Indicá el tiempo estimado en cada parada\n6. Publicá y compartí\n\nCuanto más detallada sea tu guía, más valor le dará a quienes la usen.',
  },
  {
    id: '15',
    category: 'guias',
    question: '¿Las guías pasan por moderación?',
    answer: 'Depende del contenido:\n\n✅ Si todos los puntos son lugares ya aprobados en GuianDo, la guía se publica automáticamente (si tenés cuenta verificada).\n\n⏳ Si incluís puntos personalizados con lugares que no están en la app, la guía pasará por revisión para asegurar la calidad de la información.',
  },
  {
    id: '16',
    category: 'guias',
    question: '¿Puedo valorar las guías de otros?',
    answer: 'Sí. Después de usar una guía podés puntuarla del 1 al 5. Las guías mejor valoradas aparecen destacadas para que más personas las descubran. Es la forma en que la comunidad premia el buen contenido.',
  },
  {
    id: '17',
    category: 'guias',
    question: '¿Puedo editar una guía que ya publiqué?',
    answer: 'Sí, desde "Mis Guías" en tu perfil podés editar cualquiera de tus guías: cambiar puntos, actualizar descripciones, modificar tiempos estimados o agregar nuevas paradas. Si la guía ya estaba aprobada y hacés cambios, volverá a revisión.',
  },

  // ==================== CUENTA ====================
  {
    id: '18',
    category: 'cuenta',
    question: '¿Cómo creo una cuenta?',
    answer: 'Podés registrarte de dos formas:\n\n1. Con tu email y una contraseña\n2. Con tu cuenta de Google (más rápido)\n\nCon una cuenta podés publicar lugares, crear guías, guardar favoritos y recibir notificaciones cuando tus publicaciones sean aprobadas.',
  },
  {
    id: '19',
    category: 'cuenta',
    question: '¿Olvidé mi contraseña, qué hago?',
    answer: 'En la pantalla de inicio de sesión tocá "¿Olvidaste tu contraseña?". Te enviaremos un email con instrucciones para crear una nueva. Revisá la carpeta de spam si no lo encontrás en unos minutos.',
  },
  {
    id: '20',
    category: 'cuenta',
    question: '¿Qué es un usuario "verificado"?',
    answer: 'Los usuarios verificados son personas que han demostrado publicar contenido de calidad de forma consistente. Sus publicaciones y guías se aprueban automáticamente sin revisión manual.\n\nEs un reconocimiento a la confianza ganada dentro de la comunidad. El equipo de GuianDo otorga esta distinción.',
  },
  {
    id: '21',
    category: 'cuenta',
    question: '¿Cómo elimino mi cuenta?',
    answer: 'Si querés eliminar tu cuenta, escribinos a soporte@guiando.com.ar. Tené en cuenta que:\n\n• Se eliminarán todas tus publicaciones y guías\n• Esta acción no se puede deshacer\n\nProcesamos las solicitudes en 48-72 horas hábiles.',
  },

  // ==================== SEGURIDAD ====================
  {
    id: '22',
    category: 'seguridad',
    question: '¿Cómo verifican que los lugares son reales?',
    answer: 'Cada publicación pasa por revisión manual antes de aparecer en la app. Verificamos:\n\n• Que la información sea coherente y completa\n• Que las fotos correspondan al lugar\n• Que los datos de contacto sean válidos\n\nAdemás, cualquier usuario puede reportar una publicación si detecta información incorrecta o desactualizada.',
  },
  {
    id: '23',
    category: 'seguridad',
    question: '¿Cómo reporto un lugar con información incorrecta?',
    answer: 'Muy simple:\n\n1. Abrí la publicación\n2. Tocá el ícono de bandera (⚑) en la esquina superior\n3. Elegí el motivo del reporte\n4. Opcionalmente agregá más detalles\n\nNuestro equipo revisará el reporte en menos de 24 horas. Gracias por ayudarnos a mantener GuianDo confiable.',
  },
  {
    id: '24',
    category: 'seguridad',
    question: '¿Mis datos están seguros?',
    answer: 'Sí. Tomamos la privacidad muy en serio:\n\n• Todas las conexiones son encriptadas (HTTPS)\n• Las contraseñas se almacenan con hash seguro\n• No vendemos ni compartimos tus datos con terceros\n• Cumplimos con las leyes argentinas de protección de datos personales\n\nPodés leer nuestra Política de Privacidad completa desde tu perfil.',
  },
  {
    id: '25',
    category: 'seguridad',
    question: '¿Encontré mi negocio publicado, cómo lo reclamo?',
    answer: 'Si alguien publicó tu negocio y querés gestionarlo vos mismo:\n\n1. Creá una cuenta con el email de tu negocio\n2. Escribinos a soporte@guiando.com.ar\n3. Envianos una prueba de que es tu negocio (foto, factura de servicios, etc.)\n4. Transferimos la publicación a tu cuenta en 24-48 horas\n\nEs completamente gratuito y te dará control total sobre la información.',
  },
];

const CATEGORIES_INFO = {
  general: { label: 'General', icon: 'information-circle', color: '#2196F3' },
  publicar: { label: 'Publicar', icon: 'add-circle', color: '#4CAF50' },
  guias: { label: 'Guías', icon: 'map', color: '#FF9800' },
  cuenta: { label: 'Mi Cuenta', icon: 'person', color: '#9C27B0' },
  seguridad: { label: 'Seguridad', icon: 'shield-checkmark', color: '#F44336' },
};

const FAQScreen = ({ navigation }: any) => {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
    placeholder: { width: 40 },
    introContainer: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
    introTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 12, textAlign: 'center' },
    introSubtitle: { fontSize: 14, color: COLORS.gray, marginTop: 6, textAlign: 'center', lineHeight: 20 },
    categoryFilterContainer: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight, maxHeight: 60 },
    categoryFilterContent: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
    categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.background, marginRight: 8, gap: 4, height: 32 },
    categoryChipActive: { backgroundColor: COLORS.primary },
    categoryChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
    categoryChipTextActive: { color: COLORS.white },
    resultsInfo: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.background },
    resultsText: { fontSize: 12, color: COLORS.gray, fontStyle: 'italic' },
    faqList: { flex: 1 },
    faqListContent: { padding: 16, paddingBottom: 32 },
    faqItem: { backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 12, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
    faqHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    categoryIndicator: { width: 4, height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
    faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text, marginLeft: 8, marginRight: 8 },
    faqAnswerContainer: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: COLORS.grayLight, marginTop: 8 },
    faqAnswer: { fontSize: 14, color: COLORS.gray, lineHeight: 22, paddingTop: 12 },
    supportContainer: { alignItems: 'center', padding: 24, marginTop: 16, backgroundColor: COLORS.white, borderRadius: 12 },
    supportTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    supportText: { fontSize: 14, color: COLORS.gray, marginBottom: 16, textAlign: 'center' },
    supportButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, gap: 8 },
    supportButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFAQs = selectedCategory === 'all'
    ? FAQ_DATA
    : FAQ_DATA.filter(faq => faq.category === selectedCategory);

  const handleContactSupport = () => {
    Linking.openURL('mailto:soporte@guiando.com.ar?subject=Consulta desde GuianDo');
  };

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilterContainer}
      contentContainerStyle={styles.categoryFilterContent}
    >
      <TouchableOpacity
        style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
        onPress={() => setSelectedCategory('all')}
      >
        <Ionicons name="apps" size={16} color={selectedCategory === 'all' ? COLORS.white : COLORS.gray} />
        <Text style={[styles.categoryChipText, selectedCategory === 'all' && styles.categoryChipTextActive]}>Todas</Text>
      </TouchableOpacity>

      {Object.entries(CATEGORIES_INFO).map(([key, info]) => (
        <TouchableOpacity
          key={key}
          style={[styles.categoryChip, selectedCategory === key && { backgroundColor: info.color }]}
          onPress={() => setSelectedCategory(key)}
        >
          <Ionicons name={info.icon as any} size={16} color={selectedCategory === key ? COLORS.white : info.color} />
          <Text style={[styles.categoryChipText, selectedCategory === key && styles.categoryChipTextActive]}>{info.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFAQItem = (item: FAQItem) => {
    const isExpanded = expandedId === item.id;
    const categoryInfo = CATEGORIES_INFO[item.category];

    return (
      <TouchableOpacity key={item.id} style={styles.faqItem} onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
        <View style={styles.faqHeader}>
          <View style={[styles.categoryIndicator, { backgroundColor: categoryInfo.color }]} />
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.gray} />
        </View>
        {isExpanded && (
          <View style={styles.faqAnswerContainer}>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preguntas Frecuentes</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.introContainer}>
        <Ionicons name="compass" size={40} color={COLORS.primary} />
        <Text style={styles.introTitle}>Descubrí. Compartí. GuianDo.</Text>
        <Text style={styles.introSubtitle}>
          Para quienes viajan a lo desconocido{'\n'}y para quienes redescubren lo propio
        </Text>
      </View>

      {renderCategoryFilter()}

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredFAQs.length} pregunta{filteredFAQs.length !== 1 ? 's' : ''}
          {selectedCategory !== 'all' && ` en ${CATEGORIES_INFO[selectedCategory as keyof typeof CATEGORIES_INFO]?.label}`}
        </Text>
      </View>

      <ScrollView style={styles.faqList} contentContainerStyle={styles.faqListContent} showsVerticalScrollIndicator={false}>
        {filteredFAQs.map(renderFAQItem)}

        <View style={styles.supportContainer}>
          <Text style={styles.supportTitle}>¿No encontraste lo que buscabas?</Text>
          <Text style={styles.supportText}>Nuestro equipo está listo para ayudarte</Text>
          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <Ionicons name="mail" size={20} color={COLORS.white} />
            <Text style={styles.supportButtonText}>Contactar Soporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQScreen;