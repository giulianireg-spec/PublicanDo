// src/utils/toast.ts
// CREAR ESTE ARCHIVO NUEVO

import Toast from 'react-native-toast-message';

export const showSuccessToast = (title: string, message?: string) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showErrorToast = (title: string, message?: string) => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
  });
};

export const showInfoToast = (title: string, message?: string) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showWarningToast = (title: string, message?: string) => {
  Toast.show({
    type: 'error', // Toast message no tiene tipo 'warning', usamos 'error'
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};