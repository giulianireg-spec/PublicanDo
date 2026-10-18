// src/navigation/navigationRef.ts
// Ref compartido del NavigationContainer para navegar desde fuera de las pantallas
// (por ejemplo, al tocar una notificación push).

import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

let pendingNavigation: (() => void) | null = null;

// Navega ahora si el contenedor está listo; si no, lo deja pendiente hasta onReady.
export const navigateWhenReady = (name: string, params?: object) => {
  const go = () => navigationRef.navigate(name, params);
  if (navigationRef.isReady()) {
    go();
  } else {
    pendingNavigation = go;
  }
};

export const flushPendingNavigation = () => {
  if (pendingNavigation && navigationRef.isReady()) {
    const go = pendingNavigation;
    pendingNavigation = null;
    go();
  }
};
