// src/services/geoService.ts
// NUEVO ARCHIVO - Servicios de geolocalización

import axios from 'axios';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface ReverseGeocodeResult {
  province: string;
  locality: string;
  fullAddress: string;
}

/**
 * Obtener provincia y localidad desde coordenadas GPS
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> => {
  try {
    const response = await axios.get<NominatimResult>(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          format: 'json',
          lat: latitude,
          lon: longitude,
          addressdetails: 1,
          'accept-language': 'es',
        },
        headers: {
          'User-Agent': 'GuianDo/1.0',
        },
      }
    );

    const address = response.data.address;
    
    // Extraer provincia (state)
    const province = address.state || 'Córdoba';
    
    // Extraer localidad (priorizar city > town > village)
    const locality = address.city || address.town || address.village || 'Córdoba';

    console.log('✅ Reverse Geocoding exitoso:', { province, locality });

    return {
      province,
      locality,
      fullAddress: response.data.display_name,
    };
  } catch (error) {
    console.error('❌ Error en reverse geocoding:', error);
    
    // Valores por defecto en caso de error
    return {
      province: 'Córdoba',
      locality: 'Córdoba',
      fullAddress: 'Córdoba, Argentina',
    };
  }
};

/**
 * Buscar localidades que coincidan con query dentro de una provincia
 */
export const searchLocalities = async (
  query: string,
  province: string
): Promise<string[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    const searchQuery = `${query}, ${province}, Argentina`;
    
    const response = await axios.get<NominatimResult[]>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          format: 'json',
          q: searchQuery,
          addressdetails: 1,
          limit: 10,
          'accept-language': 'es',
        },
        headers: {
          'User-Agent': 'GuianDo/1.0',
        },
      }
    );

    // Extraer nombres únicos de localidades
    const localities = response.data
      .map(result => {
        const address = result.address;
        return address.city || address.town || address.village || null;
      })
      .filter((locality): locality is string => locality !== null)
      .filter((locality, index, self) => self.indexOf(locality) === index); // Únicos

    console.log(`✅ Encontradas ${localities.length} localidades para "${query}" en ${province}`);

    return localities;
  } catch (error) {
    console.error('❌ Error buscando localidades:', error);
    return [];
  }
};

/**
 * Obtener coordenadas desde dirección completa (geocoding directo)
 */
export const geocodeAddress = async (
  address: string,
  locality: string,
  province: string
): Promise<{ lat: number; lon: number } | null> => {
  try {
    const fullAddress = `${address}, ${locality}, ${province}, Argentina`;
    
    const response = await axios.get<NominatimResult[]>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          format: 'json',
          q: fullAddress,
          limit: 1,
          'accept-language': 'es',
        },
        headers: {
          'User-Agent': 'GuianDo/1.0',
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      
      console.log('✅ Geocoding exitoso:', { lat, lon });
      
      return { lat, lon };
    }

    console.warn('⚠️ No se encontraron coordenadas para:', fullAddress);
    return null;
  } catch (error) {
    console.error('❌ Error en geocoding:', error);
    return null;
  }
};