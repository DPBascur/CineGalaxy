# CineGalaxy — Plataforma de Streaming Multi-Plataforma

> **AVISO LEGAL IMPORTANTE:** CineGalaxy es una aplicacion **exclusivamente frontend** (interfaz de usuario). **No aloja, almacena, distribuye ni transmite ningun tipo de contenido multimedia en sus servidores.** Toda la informacion y reproduccion de contenido proviene de **APIs de terceros** configuradas por el usuario final bajo su propia responsabilidad. Este proyecto se ofrece "tal cual" como una plantilla de interfaz lista para integrar servicios externos.

---

## Que es CineGalaxy?

CineGalaxy es un ecosistema frontend completo de streaming, disenado para tres plataformas simultaneas:

| Plataforma | Tecnologia | Estado |
|---|---|---|
| **Web** | Next.js 16 + Tailwind CSS + Framer Motion | Produccion |
| **Android / TV** | React Native + Expo | Produccion |
| **Windows / Desktop** | Electron | Produccion |

El frontend esta **100% listo para usarse**. Solo necesitas conectar tus propias claves de API para que todo funcione.

---

## Arquitectura del Proyecto

```
Peliculitas-Exoticas/
├── src/                        # App Web (Next.js)
│   ├── app/                    # Paginas y rutas
│   │   ├── page.tsx            # Home principal
│   │   ├── admin/              # Panel administrativo
│   │   ├── apps/               # Landing de descargas
│   │   └── api/admin/users/    # API de gestion de usuarios
│   ├── components/             # Componentes reutilizables
│   │   ├── auth/               # Modales de autenticacion
│   │   ├── catalog/            # MovieRow, carruseles
│   │   ├── home/               # HeroBanner
│   │   ├── layout/             # Navbar, Footer, SplashScreen, Particulas
│   │   ├── modals/             # PlayerModal
│   │   └── video/              # VideoPlayer
│   └── lib/                    # Utilidades (supabase, tmdb, mockData)
├── cinegalaxy-mobile/          # App Movil (React Native / Expo)
│   ├── app/                    # Pantallas (login, home, admin)
│   ├── components/             # MovieRow, PlayerModal, SplashScreen, PasswordModal
│   └── lib/                    # supabase.ts, tmdb.ts
├── main.js                     # Punto de entrada de Electron (Desktop)
├── public/                     # Assets estaticos (logos, imagenes)
└── package.json                # Dependencias y scripts
```

---

## Funcionalidades Implementadas

### Catalogo y Navegacion
- **Hero Banner dinamico** con rotacion automatica cada 7 segundos
- **Tendencias Globales (Top 10)** con numeracion visual estilizada
- **Categorias interactivas** (Populares, Peliculas, Series, Anime, Accion, Animacion, Terror)
- **Buscador en tiempo real** con resultados en cuadricula responsiva
- **Viaje Aleatorio** (seleccion aleatoria de contenido para descubrir)

### Reproductor
- Reproductor embebido via WebView con proteccion anti pop-ups
- Selector de temporada y episodio para series
- Boton de "Siguiente Episodio" con avance automatico entre temporadas
- Metadatos completos: elenco, genero, calificacion, ano

### Sistema de Usuarios
- Autenticacion completa (registro, login, cambio de contrasena)
- **Continuar Viendo** — historial persistente con opcion de eliminar titulos
- Sincronizacion de sesion entre dispositivos via Supabase Realtime
- Deteccion de inicio de sesion en multiples dispositivos (seguridad anti-sharing)
- Pantalla de bienvenida animada (Splash Screen) con ejecucion unica

### Resenas Galacticas
- Sistema de calificacion con 5 estrellas
- Proteccion de spoilers con revelado manual
- Actualizacion optimista de la interfaz

### Panel Administrativo
- Gestion CRUD de usuarios (crear, editar, eliminar)
- Asignacion de roles (admin/user)
- Protegido por email de administrador via variable de entorno
- API del servidor con Supabase Service Role Key (nunca expuesta al cliente)

### Electron (Desktop)
- Bloqueo nativo de ventanas emergentes y pop-ups publicitarios
- Navegacion restringida solo al dominio autorizado
- Deteccion automatica de entorno (desarrollo vs. produccion)

### App Movil (Expo)
- Drawer lateral animado con informacion de cuenta y avisos legales
- Barra de busqueda integrada en el Navbar
- Cuadricula de 3 columnas para busquedas y categorias
- Conmutador inteligente de API (DEV -> localhost / produccion -> Vercel)
- Persistencia local con AsyncStorage

---

## Configuracion

### Variables de Entorno — Web (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_TMDB_ACCESS_TOKEN=tu_token_de_tmdb
NEXT_PUBLIC_IMAGE_PREFIX=https://image.tmdb.org/t/p/original
NEXT_PUBLIC_ADMIN_EMAIL=tu_correo_admin@ejemplo.com
```

### Variables de Entorno — Movil (cinegalaxy-mobile/.env)

```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
EXPO_PUBLIC_TMDB_ACCESS_TOKEN=tu_token_de_tmdb
EXPO_PUBLIC_IMAGE_PREFIX=https://image.tmdb.org/t/p/original
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
EXPO_PUBLIC_PROD_API_URL=https://tu-dominio.vercel.app/api
EXPO_PUBLIC_ADMIN_EMAIL=tu_correo_admin@ejemplo.com
```

---

## Ejecucion

### Web (Desarrollo)
```bash
npm install
npm run dev
```

### Electron (Desarrollo)
```bash
npm run electron:dev
```

### Movil (Desarrollo)
```bash
cd cinegalaxy-mobile
npm install
npx expo start
```

---

## Builds de Produccion

### Web -> Vercel
```bash
npm run build        # Compilar para produccion
git push             # Vercel despliega automaticamente
```

### Desktop -> Instalador Windows (.exe)
```bash
npm run build              # Primero compilar el frontend
npm run electron:build     # Generar el instalador (requiere Administrador)
# Resultado: dist/CineGalaxy Setup X.X.X.exe
```

### Android -> APK
```bash
cd cinegalaxy-mobile
npm install -g eas-cli     # Solo la primera vez
eas login                  # Iniciar sesion en Expo
eas build -p android --profile preview
# Resultado: Link de descarga del APK
```

---

## APIs de Terceros Utilizadas

| Servicio | Uso | Responsabilidad |
|---|---|---|
| [TMDB](https://www.themoviedb.org/) | Metadatos de peliculas (portadas, sinopsis, elenco) | Del usuario |
| [Supabase](https://supabase.com/) | Autenticacion y base de datos de resenas | Del usuario |
| Reproductor externo | Streaming de contenido multimedia | **100% del usuario** |

> **Nota:** CineGalaxy no proporciona, recomienda ni gestiona ningun servicio de reproduccion. La configuracion del reproductor externo es decision y responsabilidad exclusiva del usuario que despliega esta aplicacion.

---

## Licencia y Responsabilidad

Este proyecto es una **interfaz de usuario de codigo abierto**. El desarrollador:

- **NO** aloja contenido multimedia de ningun tipo
- **NO** proporciona acceso a contenido protegido por derechos de autor
- **NO** se responsabiliza del uso que terceros hagan de esta interfaz
- **SI** proporciona una plantilla frontend lista para integrar APIs legales

El uso de esta aplicacion con servicios de terceros es bajo la **total y exclusiva responsabilidad del usuario final**. Asegurese de cumplir con las leyes de derechos de autor de su jurisdiccion.

---

<p align="center">
  <strong>CineGalaxy v1.0.1 - 2026</strong>
</p>