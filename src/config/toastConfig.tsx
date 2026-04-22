// src/config/toastConfig.tsx
// Toast config dinámica — recibe colores del ThemeContext via AppNavigator

import React from 'react';
import { StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { ThemeColors } from '../constants/colors';

export const createToastConfig = (COLORS: ThemeColors) => {
  const styles = StyleSheet.create({
    successToast: {
      borderLeftColor: '#4CAF50',
      borderLeftWidth: 5,
      backgroundColor: COLORS.white,
      height: 70,
      zIndex: 9999,
    },
    errorToast: {
      borderLeftColor: COLORS.error,
      borderLeftWidth: 5,
      backgroundColor: COLORS.white,
      height: 70,
      zIndex: 9999,
    },
    infoToast: {
      borderLeftColor: COLORS.primary,
      borderLeftWidth: 5,
      backgroundColor: COLORS.white,
      height: 70,
      zIndex: 9999,
    },
    warningToast: {
      borderLeftColor: '#F57C00',
      borderLeftWidth: 5,
      backgroundColor: COLORS.white,
      height: 70,
      zIndex: 9999,
    },
    contentContainer: {
      paddingHorizontal: 15,
    },
    text1: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.text,
    },
    text2: {
      fontSize: 13,
      fontWeight: '400',
      color: COLORS.gray,
    },
  });

  return {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={styles.successToast}
        contentContainerStyle={styles.contentContainer}
        text1Style={styles.text1}
        text2Style={styles.text2}
        text2NumberOfLines={2}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={styles.errorToast}
        contentContainerStyle={styles.contentContainer}
        text1Style={styles.text1}
        text2Style={styles.text2}
        text2NumberOfLines={2}
      />
    ),
    info: (props: any) => (
      <InfoToast
        {...props}
        style={styles.infoToast}
        contentContainerStyle={styles.contentContainer}
        text1Style={styles.text1}
        text2Style={styles.text2}
        text2NumberOfLines={2}
      />
    ),
    warning: (props: any) => (
      <BaseToast
        {...props}
        style={styles.warningToast}
        contentContainerStyle={styles.contentContainer}
        text1Style={styles.text1}
        text2Style={styles.text2}
        text2NumberOfLines={2}
      />
    ),
  };
};
