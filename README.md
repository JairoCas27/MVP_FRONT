# La Fogata - Frontend (MVP_FRONT)

Frontend del sistema de pedidos de la pollería **La Fogata**, construido con **React** + **Vite** y **React-Bootstrap**. Consume la API del backend (MVP_BACK).

## Stack
- React 18
- Vite 8
- React-Bootstrap / Bootstrap 5
- React Router
- Bootstrap Icons

## Estructura
```
MVP_FRONT/
├── src/
│   ├── App.jsx                 # rutas
│   ├── components/             # Navbar, Sidebar, ProductCard, CarritoBoton
│   ├── layouts/                # Public, Admin, Cocina, Repartidor
│   ├── pages/                  # Home, Menu, Checkout, Tracking, Cuenta, Perfil, ...
│   │   └── admin/              # Dashboard, Products, Pedidos, Repartidores, Cocinas, Deliveries, Usuarios, Metrics, Ingresos, FeedbacksList, AdminPerfil
│   ├── services/api.js         # configuración de API_HOST
│   └── hooks/                  # auth, orders, admin, etc.
├── public/
├── vercel.json
└── package.json
```

## Variables de entorno
```
VITE_API_HOST=https://mvp-back-6fof.onrender.com
```
En local, si no se define, usa `http://localhost:10000`.

## Ejecución local
```bash
cd MVP_FRONT
npm install
npm run dev
```
Disponible en `http://localhost:5173`.

## Build de producción
```bash
npm run build
```

## Despliegue (Vercel)
- Framework: Vite
- Build command: `npm run build`
- Output dir: `dist`
- Variable de entorno: `VITE_API_HOST`

## Funcionalidades
### Cliente
- Home con hero, carrusel, clásicos y CTA al menú.
- Menú y detalle de producto con opciones (salsas, marcas).
- Carrito, checkout con modalidades (mesa, recojo, delivery) y métodos de pago.
- Seguimiento de pedido por código.
- Cuenta: login/registro unificado, perfil con foto y mapa.
- Recuperación de contraseña (token 90s).
- Opiniones.

### Admin
- Dashboard con KPIs, gráficos de ingresos/pedidos, productos más vendidos, pedidos activos, estado de pedidos y resumen IA.
- Gestión de productos, pedidos, repartidores, cocinas, clientes, entregas, usuarios, métricas, ingresos, opiniones, perfil.

### Cocina
- Pedidos pendientes, preparar, listo, historial.

### Repartidor
- Entregas disponibles, activas, historial, aceptar/entregar, optimización de ruta, perfil.

## Roles y credenciales demo
- Admin: `admin@demo.com` / `admin123`
- Cliente: `cliente@demo.com` / `cliente123`
- Repartidor: `repartidor@demo.com` / `repartidor123`
- Cocina: `cocina@demo.com` / `cocina123`

## Repositorio
Rama de desarrollo: `dev`. Rama de despliegue: `main`.