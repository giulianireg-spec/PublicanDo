// src/utils/shareLinks.ts
// Links para compartir lugares y guías, y apertura de esos links dentro de la app.
// https://<backend>/l/<id> (lugar) y /g/<id> (guía): con la app instalada Android los abre acá
// (App Links); si no, muestran una página con vista previa y el botón para descargar GuianDo.
// guiando://l/<id> y guiando://g/<id> son los mismos destinos con el esquema propio de la app.

import { Linking } from 'react-native';
import { navigateWhenReady } from '../navigation/navigationRef';

// Sitio de GuianDo (Cloudflare reenvía al backend). Los links viejos del dominio de Cloud Run siguen andando.
export const SHARE_BASE_URL = 'https://guiando.com.ar';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.guiando.apparg';
// Link corto de descarga (QR de la tarjeta de sellos): el sitio redirige a la tienda que corresponda
export const DOWNLOAD_URL = 'https://guiando.com.ar/descargar';

export const placeLink = (id: string) => `${SHARE_BASE_URL}/l/${id}`;
export const guideLink = (id: string) => `${SHARE_BASE_URL}/g/${id}`;

type ShareTarget = { type: 'place' | 'guide'; id: string };

export const parseShareUrl = (url: string | null | undefined): ShareTarget | null => {
  if (!url) return null;
  const match =
    url.match(/^https?:\/\/[^/]+\/([lg])\/([a-f0-9]{24})/i) || url.match(/^guiando:\/\/([lg])\/([a-f0-9]{24})/i);
  if (!match) return null;
  return { type: match[1].toLowerCase() === 'l' ? 'place' : 'guide', id: match[2] };
};

/** Navega al lugar o guía del link. Devuelve true si el link era de GuianDo. */
export const openShareUrl = (url: string | null | undefined): boolean => {
  const target = parseShareUrl(url);
  if (!target) return false;
  if (target.type === 'place') navigateWhenReady('PlaceLink', { advertisementId: target.id });
  else navigateWhenReady('GuideDetail', { guideId: target.id });
  return true;
};

/** Atiende el link con el que se abrió la app y los que lleguen con la app abierta. */
export const listenForShareLinks = () => {
  Linking.getInitialURL()
    .then(openShareUrl)
    .catch(() => {});
  const subscription = Linking.addEventListener('url', ({ url }) => openShareUrl(url));
  return () => subscription.remove();
};
