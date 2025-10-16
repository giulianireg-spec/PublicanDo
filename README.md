# 📱 PublicanDo

Aplicación de publicidades locales con geolocalización, autenticación JWT y sistema dual Premium/Standard.

## 🏗️ Estructura del Proyecto
```
PublicanDo/
├── 📁 PublicanDo-Backend/          # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/           # Lógica de negocio
│   │   ├── models/                # Esquemas MongoDB
│   │   ├── routes/                # Rutas API
│   │   ├── middleware/            # Autenticación
│   │   ├── config/                # Configuraciones
│   │   └── index.ts              # Servidor principal
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                       # Variables de entorno
│
└── 📁 PublicanDo/                  # React Native + Expo
    ├── src/
    │   ├── screens/              # Pantallas (Home, Detail, etc)
    │   ├── components/           # Componentes reutilizables
    │   ├── navigation/           # Navegación (AppNavigator)
    │   ├── context/              # AuthContext
    │   ├── services/             # API calls
    │   ├── utils/                # Utilidades
    │   ├── constants/            # Colores, constantes
    │   ├── types/                # TypeScript types
    │   └── App.tsx              # Punto de entrada
    ├── app.json
    ├── package.json
    └── .env                      # Variables de entorno
```

## ✨ Features Principales

### ✅ Autenticación
- JWT (7 días de validez)
- Google OAuth 2.0
- Sesión persistente (AsyncStorage)

### ✅ Publicidades
- **Standard:** Flyer simple con imagen + título + botón de acción opcional
- **Premium:** Detalle completo con múltiples contactos
- Geolocalización automática
- Búsqueda por categoría
- Ordenamiento por cercanía

### ✅ Panel de Gestión
- Ver todas mis publicidades
- Activar/Desactivar publicidades
- Eliminar publicidades (soft delete)
- Estadísticas (vistas, clicks)
- Estado de aprobación visible

### ✅ Imágenes
- Upload a Cloudinary
- Optimización automática
- URL persistente

### ✅ Geolocalización
- Búsqueda por proximidad (km)
- Convertir dirección → coordenadas (OpenStreetMap)
- Filtro por ciudad/provincia

## 🚀 Instalación Local

### Requisitos
- Node.js 16+
- npm o yarn
- MongoDB Atlas account
- Cloudinary account
- Google OAuth credentials

### Backend Setup
```bash
cd PublicanDo-Backend

# Instalar dependencias
npm install

# Crear archivo .env
# (Copiar .env.example y llenar valores)

# Iniciar servidor
npm start
# http://localhost:3000
```

### Frontend Setup
```bash
cd PublicanDo

# Instalar dependencias
npm install

# Iniciar Expo
npm start

# Presiona 'i' para iOS o 'a' para Android
```

## 📝 Variables de Entorno

### Backend (.env)
```
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/publicando
JWT_SECRET=tu_secreto_jwt_aqui
CLOUDINARY_NAME=tu_cloudinary_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
PORT=3000
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=http://192.168.100.58:3000/api
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu_google_web_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=tu_google_android_client_id
```

## 🧪 Usuarios de Prueba
```
Email: standard@test.com
Password: password123
Rol: Advertiser (Standard)

Email: premium@test.com
Password: password123
Rol: Advertiser (Premium)

Email: gobierno@cordoba.gob.ar
Password: password123
Rol: Advertiser
```

## 🔌 API Endpoints Principales

### Públicos
```
GET    /api/advertisements              → Listar todas
GET    /api/advertisements/:id          → Detalle
POST   /api/advertisements/:id/view     → Contar vista
POST   /api/advertisements/:id/click    → Contar click
```

### Autenticados
```
POST   /api/advertisements              → Crear
GET    /api/advertisements/my/list      → Mis publicidades
PUT    /api/advertisements/:id          → Editar
PATCH  /api/advertisements/:id/toggle   → Activar/Desactivar
DELETE /api/advertisements/:id          → Eliminar
```

### Autenticación
```
POST   /api/auth/register               → Registrarse
POST   /api/auth/login                  → Loguearme
POST   /api/auth/google                 → Google OAuth
GET    /api/auth/me                     → Usuario actual
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **Base de datos:** MongoDB Atlas
- **Auth:** JWT + Google OAuth 2.0
- **Storage:** Cloudinary
- **Geolocalización:** OpenStreetMap (Nominatim)

### Frontend
- **Framework:** React Native + Expo
- **Lenguaje:** TypeScript
- **State:** Context API
- **Storage:** AsyncStorage
- **HTTP:** Axios
- **Geolocalización:** Expo Location
- **UI:** React Native built-in

## 📊 Estado del Proyecto

**MVP Completado:** 70%

### ✅ Completado
- [x] Estructura base backend/frontend
- [x] Autenticación JWT + Google OAuth
- [x] CRUD de publicidades
- [x] Sistema Premium/Standard
- [x] Upload de imágenes (Cloudinary)
- [x] Geolocalización
- [x] Panel "Mis Publicidades"
- [x] Activar/Desactivar publicidades
- [x] Estadísticas (vistas/clicks)
- [x] Ubicación automática (OpenStreetMap)
- [x] Validación flexible de campos

### 🔄 En Progreso
- [ ] Edición de publicidades
- [ ] Sistema de moderación (admin)
- [ ] Notificaciones push

### 📋 Próximas Features
- [ ] Paginación optimizada
- [ ] Sistema de planes/monetización
- [ ] Mapa interactivo completo
- [ ] Sistema de favoritos
- [ ] Chat in-app

## 📈 Tiempo Invertido

- **Chat 1:** Setup, autenticación, estructura (~5h)
- **Chat 2:** UI, Google OAuth, geolocalización (~5h)
- **Chat 3:** Sistema Premium/Standard, Cloudinary (~5h)
- **Chat 4:** Ubicación, panel de gestión (~4h)
- **Total:** ~19 horas

## 🚀 Próximos Pasos de Deploy

1. [ ] Corregir error de JSX en AppNavigator
2. [ ] Implementar edición de publicidades
3. [ ] Crear sistema de moderación
4. [ ] Deploy backend (Railway/Render)
5. [ ] Build APK/IPA
6. [ ] Submit a stores

## 📧 Contacto

- Email: giulianireg@gmail.com
- GitHub: [@giulianireg-spec](https://github.com/giulianireg-spec)

## 📄 Licencia

MIT

---

**Nota:** Este proyecto está actualmente en desarrollo activo.