# OCN Villa Urquiza — Sistema de Gestión de Ventas

Proyecto de la materia **Desarrollo de Sistemas** (Franco Marotta, 2026). Sistema web para **OCN Villa Urquiza**, local de indumentaria urbana de marca propia en Bauness 2395 esq. Monroe, Villa Urquiza, CABA.

## Estructura

```text
marotta-franco-ocn/
├── backend/    API Express con patrón MVC (Entregas 1 y 2)
├── frontend/   Interfaz React + Vite (Entrega 3)
└── docs/       Requerimientos, diagrama de clases y boceto
```

| Carpeta / archivo | Contenido |
| --- | --- |
| `docs/Proyecto de Desarrollo de Sistema.docx` | Análisis de requerimientos (fuente de verdad del sistema) |
| `docs/diagrama-clases.md` | Diagrama de clases (Mermaid), estados del pedido y reglas de negocio |
| `docs/boceto/` | Boceto original (`ocn-diseno-web.pdf`) y propuestas de diseño |
| `backend/src/models/` | Una clase por entidad del dominio (Entrega 1) |
| `PRODUCT.md` | Contexto del producto para el trabajo de diseño |

> En la Entrega 1 las carpetas eran `Proyecto/Backend` y `Proyecto/Frontend`. Se movieron a `backend/` y `frontend/` (con `git mv`, se conserva el historial) para coincidir con la estructura que piden las Entregas 2 y 3.

## Entregas

1. **Modelo del dominio:** estructura del repositorio, diagrama de clases y modelos en `backend/src/models/`.
2. **API MVC:** controllers, services, repositories, routes, middlewares, responses, exceptions, enums y utils; CRUD en memoria y manejo centralizado de errores.
3. **Frontend React:** interfaz conectada a la API, con componentes reutilizables, notificaciones, validaciones y accesibilidad.

## Datos reales y datos de ejemplo

Son **reales**, relevados en la Ficha Técnica del local:

- Dirección, horario, WhatsApp e Instagram.
- Rating de Google (4.6 con 24 opiniones).
- Rubros que vende el local.

Son **de EJEMPLO** hasta que el dueño los reemplace:

- Logo, fotos y catálogo de productos con precios.
- Zonas y costos de envío, y monto mínimo para envío gratis.
- Métodos de pago.

## API (Entrega 2)

Express 4 con patrón MVC y datos en memoria. La estructura está en `backend/src/`:

| Carpeta | Contenido |
| --- | --- |
| `controllers/` | Reciben la petición y devuelven la respuesta |
| `services/` | Reglas de negocio y validaciones |
| `repositories/` | Arrays en memoria (`MemoryRepository`) y datos iniciales |
| `models/` | Clases del dominio |
| `routes/` | Endpoints bajo `/api` |
| `middlewares/` | Autenticación por rol, límite de intentos y manejo de errores |
| `responses/` | Formato único de respuesta |
| `exceptions/` | `AppError` y sus subclases (400, 401, 403, 404, 409, 429) |
| `enums/` | Mensajes, roles, estados del pedido, tipo de entrega y método de pago |
| `utils/` | Validadores, configuración, contraseñas, tokens y mappers |

Todas las respuestas tienen el mismo formato: `{ "success": true, "data": ... }` o `{ "success": false, "message": "..." }`. Los mensajes están centralizados en `backend/src/enums/Messages.js`.

| Método y ruta | Acceso | Qué hace |
| --- | --- | --- |
| `GET /api/productos` · `GET /api/productos/:codigo` | Público | Catálogo (solo productos activos) |
| `POST /api/productos` · `PUT /api/productos/:codigo` · `DELETE /api/productos/:codigo` | Admin | CRUD de productos (duplicado → 409) |
| `GET /api/categorias` | Público | Categorías derivadas de los productos |
| `POST /api/auth/registro` · `POST /api/auth/login` | Público | Registro de clientes e inicio de sesión (JWT) |
| `GET /api/auth/perfil` · `PUT /api/clientes/perfil` | Cliente | Ver y editar los datos propios |
| `GET /api/clientes` | Admin | Clientes con su resumen de compras |
| `POST /api/carrito/validar` | Público | Precio vigente y stock de cada línea del carrito (RN-05, RN-01) |
| `GET /api/envios/zonas` · `POST /api/envios/cotizar` | Público | Zonas, costo de envío y envío gratis (RN-04) |
| `PUT /api/envios/configuracion` | Admin | Monto mínimo para envío gratis |
| `POST /api/pedidos` · `GET /api/pedidos/mios` | Cliente | Comprar y ver el historial propio |
| `PATCH /api/pedidos/:id/cancelar` | Cliente | Cancelar, solo en estado Pendiente (RN-03) |
| `GET /api/pedidos/:id` | Cliente o admin | Detalle del pedido |
| `GET /api/pedidos?estado=` · `PATCH /api/pedidos/:id/estado` | Admin | Ver todos los pedidos y avanzar estados |
| `GET /api/reportes/ventas?desde=&hasta=` | Admin | Ventas por período, producto, estado y día |
| `GET /api/local` | Público | Datos del local |

Tests (`node:test` + `supertest`): `cd backend && npm test`.

### Variables de entorno

Ver `backend/.env.example`. En desarrollo no hace falta crear un `.env`: el administrador inicial es `admin@ocn.local` con la clave `ocn-admin-dev`. En producción, `JWT_SECRET` y `ADMIN_PASSWORD` son obligatorias. El `.env` nunca se versiona.

## Frontend (Entrega 3)

React + Vite en `frontend/`, conectado a la API. El detalle está en `frontend/README.md`:

- **Tienda:** catálogo con filtros, detalle con talle y color, carrito, checkout con envío por zona, seguimiento de pedidos y cuenta.
- **Panel de administración:** productos, pedidos, clientes, reportes y envíos.

El diseño evoluciona el boceto original (`docs/boceto/`).

## Cómo ejecutar

Se necesitan dos terminales:

```bash
# Terminal 1 — API (puerto 3000)
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
