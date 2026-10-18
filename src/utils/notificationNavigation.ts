// src/utils/notificationNavigation.ts
// Decide a qué pantalla llevar al usuario según los datos de una notificación
// (push tocada o item de la bandeja de notificaciones).

import { navigateWhenReady } from '../navigation/navigationRef';

const GUIDE_TYPES = ['guide_approved', 'guide_rejected', 'guide_reported', 'guide_deleted'];

// Devuelve true si la notificación tenía un destino y se navegó.
export const navigateFromNotificationData = (data: any): boolean => {
  if (!data) return false;

  if (GUIDE_TYPES.includes(data.type) || data.targetType === 'guide') {
    if (data.type === 'guide_deleted' || data.screen === 'MyGuides' || !data.guideId) {
      navigateWhenReady('MyGuides');
    } else {
      navigateWhenReady('GuideDetail', { guideId: String(data.guideId) });
    }
    return true;
  }

  if (data.type === 'approved' || data.type === 'rejected') {
    navigateWhenReady('MyAdvertisements');
    return true;
  }

  if (data.type === 'new_pending') {
    navigateWhenReady('AdminDashboard');
    return true;
  }

  return false;
};
