# Frontend — OCN Villa Urquiza (Entrega 3)

Interfaz web del **Sistema de Gestión de Ventas para OCN Villa Urquiza**, en React + Vite, conectada a la API de la Entrega 2 (`../backend`).

## Cómo ejecutar

```bash
# Terminal 1 — API (puerto 3000)
cd backend && npm install && npm start

# Terminal 2 — Frontend (puerto 5173)
cd frontend && npm install && npm run dev
```

Abrir http://localhost:5173. Administrador de desarrollo: `admin@ocn.local` / `ocn-admin-dev` (ver `backend/.env.example`).

Otros scripts:

- `npm run build`: build de producción en `dist/`.
- `npm run preview`: sirve el build en el puerto 4173, también con proxy.
- `npm run lint`: ESLint.

## Configuración

| Variable | Uso | Por defecto |
| --- | --- | --- |
| `VITE_API_URL` | URL del servidor sin `/api`. Vacía = misma URL, con el proxy de Vite. | vacía |
| `API_PROXY_TARGET` | Destino del proxy de `/api` en `dev` y `preview`. | `http://localhost:3000` |

La API tiene CORS habilitado para `localhost:5173` y `4173`, así que también se puede usar `VITE_API_URL=http://localhost:3000`.

## Pantallas

| Ruta | Pantalla | Acceso |
| --- | --- | --- |
| `/` | Inicio: hero con un producto real, sobre nosotros, productos estrella, cómo comprar, dónde estamos | Público |
| `/productos` | Catálogo de prendas con búsqueda sin tildes, filtros (categoría, talle, color) y orden, todo en la URL | Público |
| `/productos/:codigo` | Detalle: color, talle, cantidad, stock, relacionados, consulta por WhatsApp | Público |
| `/carrito` | Carrito completo; valida precio y stock contra la API (RN-05, RN-01) | Público |
| `/checkout` | Retiro o envío, zona con costo cotizado, envío gratis (RN-04), método de pago | Cliente |
| `/pedidos/:id` | Confirmación y seguimiento (se actualiza cada 20 s); cancelar solo en Pendiente (RN-03) | Cliente o admin |
| `/mis-pedidos` | Historial, estado y "pedir de nuevo" | Cliente |
| `/mi-cuenta` | Editar datos personales | Cliente |
| `/ingresar` · `/registrarse` | Inicio de sesión y registro | Público |
| `/admin/productos` | Tabla con stock rápido, alta, edición, desactivar y baja con confirmación | Admin |
| `/admin/pedidos` | Pedidos por estado y botones para avanzar el flujo | Admin |
| `/admin/clientes` · `/admin/reportes` · `/admin/envios` | Clientes, reportes de ventas con gráfico y monto de envío gratis | Admin |

## Estructura de `src/`

```text
src/
├── components/
│   ├── admin/       GraficoBarras
│   ├── carrito/     CartDrawer, LineaCarrito, BarraEnvioGratis
│   ├── forms/       ProductForm, CuentaForm
│   ├── layout/      MainLayout, SiteHeader, SiteFooter, AdminLayout, RequireAuth
│   ├── pedidos/     SeguimientoPedido, DetallePedido, EstadoBadge
│   ├── productos/   PrendaCard, EtiquetaProducto, SelectorVariante, ProductoArte, ProductTable, ...
│   └── ui/          Button, FormField, Feedback, ConfirmDialog, ToastRegion, QuantityStepper, Icons, ...
├── context/         Toast, Auth, Cart y Confirm (un único sistema de avisos y un único diálogo)
├── hooks/           useApiResource, useProductos, useSumarAlCarrito, useValidacionCarrito, ...
├── pages/           Una pantalla por archivo (admin/ aparte, cargado bajo demanda)
├── services/        apiClient (fetch, token y errores) + un servicio por recurso de la API
├── styles/          variables.css (tokens) y global.css
├── utils/           prendas (agrupar variantes), format, validation, storage, negocio
├── App.jsx          Providers y rutas
└── main.jsx         Punto de entrada y fuentes
```

Ningún componente hace `fetch`: todas las peticiones pasan por `src/services/`. Las prendas se dibujan en SVG (`ProductoArte`) porque el local todavía no tiene fotos propias.

## Diseño

El diseño evoluciona el **boceto de Franco** (`docs/boceto/ocn-diseno-web.pdf`). Es la opción 1 de las tres propuestas en `docs/boceto/propuestas/`:

- **Paleta:** charcoal `#1C1B19`, stone `#F3EFE7` y naranja `#FF5A1F`.
- **Tipografías:** Bebas Neue para títulos e Inter para textos, autohospedadas.
- **Estructura:** las secciones del wireframe.
- **Lenguaje gráfico:** parches bordados (puntada punteada), etiquetas colgantes y bordes festoneados.

Mejoras de accesibilidad respecto del boceto:

- Los botones naranjas llevan texto charcoal: el contraste del texto blanco era 3.1:1.
- Los textos naranjas chicos usan `#B8400F`.

Verificado con axe-core: 0 violaciones en 15 pantallas, a 390 y 1440 px.

## Datos

Son reales los datos del local: dirección, horario, WhatsApp, Instagram y rating. El catálogo, los precios, las zonas de envío y el monto de envío gratis son de **ejemplo** hasta que el local cargue los reales.
