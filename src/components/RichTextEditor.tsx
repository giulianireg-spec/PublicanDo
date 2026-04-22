// src/components/RichTextEditor.tsx
// CORREGIDO: 
// - Sin ScrollView envolviendo RichToolbar (evita VirtualizedLists warning)
// - Toolbar con flexWrap en lugar de scroll horizontal

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  RichEditor, 
  RichToolbar,
  actions 
} from 'react-native-pell-rich-editor';
import { useTheme } from '../context/ThemeContext';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe tu descripción detallada aquí...',
  maxLength = 5000,
}) => {
  const { colors: COLORS } = useTheme();
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  charCountWarning: {
    color: '#FF9800',
  },
  editorContainer: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    minHeight: 250,
    marginBottom: 12,
  },
  editor: {
    flex: 1,
    padding: 8,
    backgroundColor: COLORS.white,
  },
  toolbarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    padding: 8,
    marginBottom: 12,
  },
  // ✅ CORREGIDO: Wrapper simple sin ScrollView
  toolbarWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toolbar: {
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  toolbarIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  emojiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    marginRight: 8,
  },
  emojiButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 6,
    marginRight: 6,
  },
  emojiText: {
    fontSize: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },
});

  const richText = useRef<RichEditor>(null);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (html: string) => {
    // Contar caracteres (sin tags HTML)
    const textOnly = html.replace(/<[^>]*>/g, '');
    setCharCount(textOnly.length);
    
    if (textOnly.length <= maxLength) {
      onChange(html);
    }
  };

  const insertEmoji = (emoji: string) => {
    richText.current?.insertText(emoji);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="create" size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Descripción Detallada</Text>
        </View>
        <Text style={[
          styles.charCount,
          charCount > maxLength * 0.9 && styles.charCountWarning,
        ]}>
          {charCount}/{maxLength}
        </Text>
      </View>

      <View style={styles.editorContainer}>
        <RichEditor
          ref={richText}
          initialContentHTML={value}
          onChange={handleChange}
          placeholder={placeholder}
          androidHardwareAccelerationDisabled={true}
          style={styles.editor}
          initialHeight={250}
        />
      </View>

      {/* ✅ CORREGIDO: Toolbar sin ScrollView wrapper para evitar VirtualizedLists warning */}
      <View style={styles.toolbarContainer}>
        <View style={styles.toolbarWrapper}>
          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.setStrikethrough,
              actions.undo,
              actions.redo,
            ]}
            iconMap={{
              [actions.setBold]: ({ tintColor }: any) => (
                <Text style={[styles.toolbarIcon, { color: tintColor }]}>B</Text>
              ),
              [actions.setItalic]: ({ tintColor }: any) => (
                <Text style={[styles.toolbarIcon, styles.italic, { color: tintColor }]}>I</Text>
              ),
              [actions.setUnderline]: ({ tintColor }: any) => (
                <Text style={[styles.toolbarIcon, styles.underline, { color: tintColor }]}>U</Text>
              ),
            }}
            style={styles.toolbar}
            iconTint={COLORS.text}
            selectedIconTint={COLORS.primary}
            disabledIconTint={COLORS.grayLight}
          />
        </View>

        {/* Emojis rápidos - Este ScrollView horizontal es seguro porque no contiene FlatList */}
        <View style={styles.emojiRow}>
          <Text style={styles.emojiLabel}>Emojis:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
          >
            {['😊', '👍', '❤️', '⭐', '🔥', '💪', '✅', '📍', '📞', '💼'].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.emojiButton}
                onPress={() => insertEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Info box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={16} color="#2196F3" />
        <Text style={styles.infoText}>
          Usa el editor para crear una descripción detallada con formato.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RichTextEditor;