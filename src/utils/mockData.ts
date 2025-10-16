import { Advertisement } from '../types';

export const mockAdvertisements: Advertisement[] = [
  {
    id: '1',
    title: 'Restaurant El Buen Sabor',
    description: 'Comida casera y parrilla. Menú del día $5000. Ambiente familiar en pleno centro de Córdoba.',
    category: 'restaurants',
    subcategory: 'Parrilla',
    type: 'service',
    images: ['https://via.placeholder.com/400x300/FF6B6B/ffffff?text=Restaurant'],
    contact: {
      phone: '+54 351 123-4567',
      whatsapp: '+5493511234567',
      instagram: '@elbuensabor',
      website: 'https://ejemplo.com'
    },
    location: {
      latitude: -31.4201,
      longitude: -64.1888,
      address: 'Av. Colón 123',
      city: 'Córdoba'
    },
    advertiser: {
      id: 'adv1',
      name: 'Juan Pérez',
      businessName: 'El Buen Sabor'
    },
    isPremium: true,
    views: 150,
    clicks: 45,
    createdAt: new Date('2025-09-15'),
    expiresAt: new Date('2025-12-15')
  },
  {
    id: '2',
    title: 'Notebook Lenovo i5 8GB RAM',
    description: 'Notebook Lenovo ThinkPad, Intel Core i5, 8GB RAM, 256GB SSD. Estado impecable, poco uso.',
    category: 'electronics',
    subcategory: 'Computadoras',
    type: 'product',
    images: ['https://via.placeholder.com/400x300/4ECDC4/ffffff?text=Notebook'],
    contact: {
      phone: '+54 351 987-6543',
      whatsapp: '+5493519876543'
    },
    location: {
      latitude: -31.4135,
      longitude: -64.1811,
      address: 'Nueva Córdoba',
      city: 'Córdoba'
    },
    advertiser: {
      id: 'adv2',
      name: 'María González'
    },
    isPremium: false,
    views: 89,
    clicks: 23,
    createdAt: new Date('2025-09-20'),
    expiresAt: new Date('2025-11-20')
  },
  {
    id: '3',
    title: 'Museo Evita - Entrada Gratuita',
    description: 'Visitá el Museo Evita este fin de semana con entrada libre y gratuita. Horarios: 10 a 18hs.',
    category: 'tourism',
    subcategory: 'Museos',
    type: 'service',
    images: ['https://via.placeholder.com/400x300/95E1D3/ffffff?text=Museo'],
    contact: {
      website: 'https://museoevita.gob.ar',
      phone: '+54 351 433-1234',
      instagram: '@museoevitacba'
    },
    location: {
      latitude: -31.4173,
      longitude: -64.1839,
      address: 'Av. Hipólito Yrigoyen 511',
      city: 'Córdoba'
    },
    advertiser: {
      id: 'adv3',
      name: 'Gobierno de Córdoba',
      businessName: 'Museo Evita'
    },
    isPremium: true,
    views: 320,
    clicks: 87,
    createdAt: new Date('2025-09-25'),
    expiresAt: new Date('2025-10-05')
  },
  {
    id: '4',
    title: 'Heladera Samsung 350L',
    description: 'Heladera Samsung No Frost, 350 litros, freezer separado. Impecable estado, 2 años de uso.',
    category: 'appliances',
    subcategory: 'Heladeras',
    type: 'product',
    images: ['https://via.placeholder.com/400x300/F38181/ffffff?text=Heladera'],
    contact: {
      phone: '+54 351 555-1234',
      whatsapp: '+5493515551234'
    },
    location: {
      latitude: -31.3897,
      longitude: -64.1706,
      address: 'Barrio Cerro de las Rosas',
      city: 'Córdoba'
    },
    advertiser: {
      id: 'adv4',
      name: 'Carlos Rodríguez'
    },
    isPremium: false,
    views: 67,
    clicks: 12,
    createdAt: new Date('2025-09-28'),
    expiresAt: new Date('2025-11-28')
  }
];

export const categories = [
  { id: 'electronics', name: 'Electrónica', icon: '📱' },
  { id: 'appliances', name: 'Electrodomésticos', icon: '🏠' },
  { id: 'food', name: 'Comidas', icon: '🍕' },
  { id: 'restaurants', name: 'Restaurantes y Bares', icon: '🍽️' },
  { id: 'entertainment', name: 'Entretenimiento', icon: '🎭' },
  { id: 'events', name: 'Eventos', icon: '🎉' },
  { id: 'services', name: 'Servicios', icon: '🔧' },
  { id: 'tourism', name: 'Turismo', icon: '🏛️' },
  { id: 'realEstate', name: 'Inmuebles', icon: '🏢' },
  { id: 'vehicles', name: 'Vehículos', icon: '🚗' },
  { id: 'education', name: 'Educación', icon: '📚' },
  { id: 'health', name: 'Salud', icon: '⚕️' }
];