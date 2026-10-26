# Frontend — OCN Villa Urquiza

Interfaz web del **Sistema de Gestión de Ventas para OCN Villa Urquiza**, desarrollada con React + Vite y conectada a la API del Backend (Entrega 2).

## Tecnologías

- React 19 y React Router (navegación entre pantallas)
- Vite (servidor de desarrollo, build y proxy hacia la API)
- CSS con variables (sin librerías de componentes)
- ESLint (reglas recomendadas y de hooks)

## Cómo ejecutar

Se necesitan dos terminales.

```bash
# Terminal 1 — Backend (puerto 3000)
cd backend
npm install
npm start
```

```bash
# Terminal 2 — Frontend (puerto 5173)
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173

Otros scripts: `npm run build` (build de producción en `dist/`), `npm run preview` (sirve el build en el puerto 4173, también con proxy) y `npm run lint`.

## Configuración

Copiar `.env.example` a `.env` si se necesita cambiar algo:

| Variable | Uso | Valor por defecto |
| --- | --- | --- |
| `VITE_API_URL` | URL del servidor sin `/api`. Vacía = se usa el proxy de Vite. | vacía |
| `API_PROXY_TARGET` | Destino del proxy de `/api` en `dev` y `preview`. | `http://localhost:3000` |

El backend no tiene CORS habilitado, por eso el frontend llama a `/api/...` en su propio origen y Vite reenvía esas peticiones al backend. Si en el futuro se habilita CORS, se puede definir `VITE_API_URL=http://localhost:3000`.

## Pantallas

| Ruta | Pantalla | API |
| --- | --- | --- |
| `/` | Landing (hero, sobre nosotros, productos estrella, contacto) | — |
| `/productos` | Catálogo con búsqueda y filtro por categoría | `GET /api/productos` |
| `/productos/:codigo` | Ficha del producto | `GET /api/productos/:codigo` |
| `/admin/productos` | Gestión de productos (listado y eliminación) | `GET`, `DELETE /api/productos/:codigo` |
| `/admin/productos/nuevo` | Alta de producto | `POST /api/productos` |
| `/admin/productos/:codigo/editar` | Edición de producto | `GET`, `PUT /api/productos/:codigo` |
| cualquier otra | Página no encontrada | — |

La búsqueda y el filtro por categoría se aplican en el navegador sobre los productos ya obtenidos (la API no ofrece filtros).

## Estructura

```text
src/
├── components/
│   ├── forms/        ProductForm (alta y edición con validación)
│   ├── layout/       MainLayout, SiteHeader, SiteFooter
│   ├── productos/    ProductCard, ProductTable, ProductFilters, ProductImage, StockBadge
│   └── ui/           Button, FormField, Feedback (Loading/EmptyState/ErrorMessage),
│                     ConfirmDialog, ToastRegion, PageHeader, Badge, PhotoPlaceholder, Icons
├── context/          ToastProvider (notificaciones compartidas)
├── hooks/            useApiResource, useProductos/useProducto, useToast
├── pages/            Una pantalla por archivo
├── services/         apiClient (fetch + manejo de errores) y productoService (endpoints)
├── styles/           variables.css (paleta, tipografías, espacios) y global.css
├── utils/            formato de precios, validaciones, datos del local
├── App.jsx           Rutas
└── main.jsx          Punto de entrada
```

## Diseño

Se respeta el documento **"OCN Diseño Web" (Etapa 2 · UX/UI)**:

- Paleta: Charcoal Urbano `#1C1B19` (header y footer), Stone Cálido `#F3EFE7` (secciones) y Naranja Señal `#FF5A1F` (botones clave).
- Tipografías: Bebas Neue para títulos e Inter para textos.
- Landing con las 5 secciones del wireframe y los textos relevados en la Ficha Técnica. Las fotos siguen siendo los placeholders rayados del mockup hasta contar con imágenes propias del local.

Ajustes de accesibilidad respecto del mockup: el texto de los botones naranjas es charcoal (el blanco sobre naranja tiene contraste 3.1:1, insuficiente para texto normal) y los textos naranjas pequeños usan un tono más oscuro (`#B8400F`).

## Limitaciones conocidas

- El backend sólo expone el recurso **Producto**. Registro/login, carrito, pedidos y envíos no tienen endpoints todavía, por eso no se implementaron en el frontend.
- La sección de administración no tiene autenticación porque el backend no la ofrece.
- El backend guarda los datos en memoria: al reiniciarlo se pierden los productos cargados.
