// src/components/RichTextViewer.tsx
// ✅ Visor de contenido HTML para descripciones premium

import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { useTheme } from '../context/ThemeContext';

interface RichTextViewerProps {
  html: string;
}

const RichTextViewer: React.FC<RichTextViewerProps> = ({ html }) => {
  const { colors: COLORS } = useTheme();
  const { width } = useWindowDimensions();

  const tagsStyles = {
    body: {
      color: COLORS.text,
      fontSize: 16,
      lineHeight: 24,
    },
    p: {
      marginVertical: 8,
    },
    strong: {
      fontWeight: '700',
      color: COLORS.text,
    },
    b: {
      fontWeight: '700',
      color: COLORS.text,
    },
    em: {
      fontStyle: 'italic',
    },
    i: {
      fontStyle: 'italic',
    },
    u: {
      textDecorationLine: 'underline',
    },
    ul: {
      marginVertical: 8,
    },
    ol: {
      marginVertical: 8,
    },
    li: {
      marginVertical: 4,
    },
  };

  const systemFonts = ['System'];

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
});

  return (
    <View style={styles.container}>
      <RenderHTML
        contentWidth={width - 64}
        source={{ html: html || '' }}
        tagsStyles={tagsStyles}
        systemFonts={systemFonts}
      />
    </View>
  );
};

export default RichTextViewer;